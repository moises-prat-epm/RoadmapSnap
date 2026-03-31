/**
 * Project API routes. Scoped by RLS (app.current_org_id set by context.js).
 * All routes require authenticate + setRequestContext. Mutations require editor role.
 */

const ROLE_LEVEL = { viewer: 1, editor: 2, admin: 3 };

function requireRole(minimumRole) {
  const minLevel = ROLE_LEVEL[minimumRole];
  if (minLevel === undefined) {
    throw new Error(`requireRole: invalid role "${minimumRole}". Use viewer | editor | admin.`);
  }
  return async function rbacPreHandler(request, reply) {
    if (request.orgId == null) {
      return reply.status(403).send({ error: 'Forbidden', message: 'No organization context' });
    }
    if (request.dbUser == null) {
      return reply.status(403).send({ error: 'Forbidden', message: 'User not found' });
    }
    const userLevel = request.dbUser.role ? ROLE_LEVEL[request.dbUser.role] : 0;
    if (userLevel < minLevel) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
  };
}

function projectRowToJson(row) {
  if (!row) return null;
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    org_id: row.org_id,
    program_id: row.program_id ?? null,
    name: row.name,
    group_name: row.group_name ?? null,
    at_risk: row.at_risk ?? false,
    descoped: row.descoped ?? false,
    show_in_timeline: row.show_in_timeline ?? true,
    tags: row.tags ?? [],
    external_link: row.external_link ?? null,
    display_order: row.display_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    milestones: {},
    dependencies: [],
  };
}

export default async function projectsRoutes(fastify) {
  const commonPreHandler = [fastify.authenticate, fastify.setRequestContext];

  // POST /workspaces/:workspaceId/projects — create project (editor+)
  fastify.post('/workspaces/:workspaceId/projects', {
    preHandler: [...commonPreHandler, requireRole('editor')],
    schema: {
      params: {
        type: 'object',
        properties: { workspaceId: { type: 'string', format: 'uuid' } },
        required: ['workspaceId'],
      },
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          group_name: { type: 'string' },
          at_risk: { type: 'boolean' },
          descoped: { type: 'boolean' },
          show_in_timeline: { type: 'boolean' },
          tags: { type: 'array', items: { type: 'string' } },
          external_link: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    if (request.orgId == null) {
      return reply.status(403).send({ error: 'Forbidden', message: 'No organization context' });
    }
    const { workspaceId } = request.params;
    const { name, group_name, at_risk, descoped, show_in_timeline, tags, external_link } = request.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return reply.status(400).send({ error: 'Bad Request', message: 'name must be a non-empty string' });
    }

    const client = request.dbClient;

    // Verify workspace exists and belongs to this org
    const wsCheck = await client.query(
      'SELECT id FROM workspaces WHERE id = $1',
      [workspaceId]
    );
    if (wsCheck.rowCount === 0) {
      return reply.status(404).send({ error: 'Not Found', message: 'Workspace not found' });
    }

    // Auto display_order: append to end
    const orderResult = await client.query(
      'SELECT COALESCE(MAX(display_order), 0) + 10 AS next_order FROM projects WHERE workspace_id = $1',
      [workspaceId]
    );
    const displayOrder = orderResult.rows[0].next_order;

    let insert;
    try {
      insert = await client.query(
        `INSERT INTO projects
           (workspace_id, org_id, name, group_name, at_risk, descoped, show_in_timeline, tags, external_link, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, workspace_id, org_id, program_id, name, group_name, at_risk, descoped,
                   show_in_timeline, tags, external_link, display_order, created_at, updated_at`,
        [
          workspaceId,
          request.orgId,
          name.trim(),
          group_name?.trim() ?? null,
          at_risk ?? false,
          descoped ?? false,
          show_in_timeline ?? true,
          tags ?? [],
          external_link?.trim() || null,
          displayOrder,
        ]
      );
    } catch (err) {
      if (err.code === '23505') {
        return reply.status(409).send({
          error: 'Conflict',
          message: 'A project with this name already exists in this workspace',
        });
      }
      throw err;
    }

    return reply.status(201).send({ project: projectRowToJson(insert.rows[0]) });
  });

  // PATCH /projects/:projectId — update project (editor+)
  fastify.patch('/projects/:projectId', {
    preHandler: [...commonPreHandler, requireRole('editor')],
    schema: {
      params: {
        type: 'object',
        properties: { projectId: { type: 'string', format: 'uuid' } },
        required: ['projectId'],
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          group_name: { type: 'string', nullable: true },
          at_risk: { type: 'boolean' },
          descoped: { type: 'boolean' },
          show_in_timeline: { type: 'boolean' },
          tags: { type: 'array', items: { type: 'string' } },
          external_link: { type: 'string', nullable: true },
        },
      },
    },
  }, async (request, reply) => {
    if (request.orgId == null) {
      return reply.status(403).send({ error: 'Forbidden', message: 'No organization context' });
    }
    const { projectId } = request.params;
    const body = request.body || {};
    const client = request.dbClient;

    const before = await client.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );
    if (before.rowCount === 0) {
      return reply.status(404).send({ error: 'Not Found', message: 'Project not found' });
    }
    const existing = before.rows[0];

    // Validate name if provided
    if (body.name !== undefined) {
      if (!String(body.name).trim()) {
        return reply.status(400).send({ error: 'Bad Request', message: 'name must be non-empty' });
      }
      // Check uniqueness within workspace (excluding self)
      const nameCheck = await client.query(
        'SELECT id FROM projects WHERE workspace_id = $1 AND name = $2 AND id != $3',
        [existing.workspace_id, body.name.trim(), projectId]
      );
      if (nameCheck.rowCount > 0) {
        return reply.status(409).send({
          error: 'Conflict',
          message: 'A project with this name already exists in this workspace',
        });
      }
    }

    const updates = [];
    const values = [];
    let i = 1;

    if (body.name !== undefined) {
      updates.push(`name = $${i++}`);
      values.push(body.name.trim());
    }
    if (body.group_name !== undefined) {
      updates.push(`group_name = $${i++}`);
      values.push(body.group_name?.trim() || null);
    }
    if (body.at_risk !== undefined) {
      updates.push(`at_risk = $${i++}`);
      values.push(body.at_risk);
    }
    if (body.descoped !== undefined) {
      updates.push(`descoped = $${i++}`);
      values.push(body.descoped);
    }
    if (body.show_in_timeline !== undefined) {
      updates.push(`show_in_timeline = $${i++}`);
      values.push(body.show_in_timeline);
    }
    if (body.tags !== undefined) {
      updates.push(`tags = $${i++}`);
      values.push(body.tags);
    }
    if (body.external_link !== undefined) {
      updates.push(`external_link = $${i++}`);
      values.push(body.external_link?.trim() || null);
    }

    if (updates.length === 0) {
      return { project: projectRowToJson(existing) };
    }

    values.push(projectId);
    const result = await client.query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = $${i}
       RETURNING id, workspace_id, org_id, program_id, name, group_name, at_risk, descoped,
                 show_in_timeline, tags, external_link, display_order, created_at, updated_at`,
      values
    );
    return { project: projectRowToJson(result.rows[0]) };
  });

  // DELETE /projects/:projectId — delete project (editor+); cascades milestones/budget/risks
  fastify.delete('/projects/:projectId', {
    preHandler: [...commonPreHandler, requireRole('editor')],
    schema: {
      params: {
        type: 'object',
        properties: { projectId: { type: 'string', format: 'uuid' } },
        required: ['projectId'],
      },
    },
  }, async (request, reply) => {
    if (request.orgId == null) {
      return reply.status(403).send({ error: 'Forbidden', message: 'No organization context' });
    }
    const client = request.dbClient;
    const exists = await client.query(
      'SELECT id FROM projects WHERE id = $1',
      [request.params.projectId]
    );
    if (exists.rowCount === 0) {
      return reply.status(404).send({ error: 'Not Found', message: 'Project not found' });
    }
    await client.query('DELETE FROM projects WHERE id = $1', [request.params.projectId]);
    return reply.status(204).send();
  });
}
