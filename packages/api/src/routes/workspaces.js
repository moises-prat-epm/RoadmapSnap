/**
 * Workspace API routes. All scoped by RLS (app.current_org_id set by context.js).
 * All routes require authenticate + setRequestContext. Mutations require editor or admin role.
 */

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
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

function formatPlannedDate(date) {
  if (date == null) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function workspaceRowToJson(row) {
  if (!row) return null;
  return {
    id: row.id,
    org_id: row.org_id,
    name: row.name,
    slug: row.slug,
    workflow_definition: row.workflow_definition ?? [],
    entity_labels: row.entity_labels ?? {},
    dashboard_text: row.dashboard_text ?? {},
    settings: row.settings ?? {},
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export default async function workspacesRoutes(fastify) {
  const commonPreHandler = [fastify.authenticate, fastify.setRequestContext];

  // GET /workspaces — all workspaces for current org
  fastify.get('/workspaces', {
    preHandler: commonPreHandler,
  }, async (request, reply) => {
    if (request.orgId == null) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'No organization context',
      });
    }
    const client = request.dbClient;
    const result = await client.query(
      `SELECT id, org_id, name, slug, workflow_definition, entity_labels, dashboard_text, settings, created_by, created_at, updated_at
       FROM workspaces
       WHERE org_id = $1
       ORDER BY name`,
      [request.orgId]
    );
    return { workspaces: result.rows.map(workspaceRowToJson) };
  });

  // GET /workspaces/:workspaceId — single workspace
  fastify.get('/workspaces/:workspaceId', {
    preHandler: commonPreHandler,
    schema: {
      params: {
        type: 'object',
        properties: { workspaceId: { type: 'string', format: 'uuid' } },
        required: ['workspaceId'],
      },
    },
  }, async (request, reply) => {
    if (request.orgId == null) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'No organization context',
      });
    }
    const client = request.dbClient;
    const result = await client.query(
      `SELECT id, org_id, name, slug, workflow_definition, entity_labels, dashboard_text, settings, created_by, created_at, updated_at
       FROM workspaces WHERE id = $1`,
      [request.params.workspaceId]
    );
    if (result.rowCount === 0) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Workspace not found',
      });
    }
    return { workspace: workspaceRowToJson(result.rows[0]) };
  });

  // POST /workspaces — create (editor+)
  fastify.post('/workspaces', {
    preHandler: [...commonPreHandler, requireRole('editor')],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          name: { type: 'string' },
          slug: { type: 'string' },
          workflow_definition: { type: 'array' },
          entity_labels: { type: 'object' },
          dashboard_text: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    if (request.orgId == null || !request.dbUser?.id) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'No organization context',
      });
    }
    const { name, slug, workflow_definition, entity_labels, dashboard_text } = request.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'name must be a non-empty string',
      });
    }
    const slugNorm = typeof slug === 'string' ? slug.trim().toLowerCase() : '';
    if (!SLUG_REGEX.test(slugNorm)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'slug must be lowercase, alphanumeric and hyphens only',
      });
    }
    const client = request.dbClient;
    const conflict = await client.query(
      'SELECT id FROM workspaces WHERE org_id = $1 AND slug = $2',
      [request.orgId, slugNorm]
    );
    if (conflict.rowCount > 0) {
      return reply.status(409).send({
        error: 'Conflict',
        message: 'A workspace with this slug already exists in this organization',
      });
    }
    const insert = await client.query(
      `INSERT INTO workspaces (org_id, name, slug, created_by, workflow_definition, entity_labels, dashboard_text)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb)
       RETURNING id, org_id, name, slug, workflow_definition, entity_labels, dashboard_text, settings, created_by, created_at, updated_at`,
      [
        request.orgId,
        name.trim(),
        slugNorm,
        request.dbUser.id,
        JSON.stringify(workflow_definition ?? []),
        JSON.stringify(entity_labels ?? {}),
        JSON.stringify(dashboard_text ?? {}),
      ]
    );
    const row = insert.rows[0];
    return reply.status(201).send({ workspace: workspaceRowToJson(row) });
  });

  // PATCH /workspaces/:workspaceId — update (editor+)
  fastify.patch('/workspaces/:workspaceId', {
    preHandler: [...commonPreHandler, requireRole('editor')],
    schema: {
      params: {
        type: 'object',
        properties: { workspaceId: { type: 'string', format: 'uuid' } },
        required: ['workspaceId'],
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          slug: { type: 'string' },
          workflow_definition: { type: 'array' },
          entity_labels: { type: 'object' },
          dashboard_text: { type: 'object' },
          settings: { type: 'object' },
        },
      },
    },
  }, async (request, reply) => {
    if (request.orgId == null) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'No organization context',
      });
    }
    const { workspaceId } = request.params;
    const body = request.body || {};
    const client = request.dbClient;

    const before = await client.query(
      'SELECT * FROM workspaces WHERE id = $1',
      [workspaceId]
    );
    if (before.rowCount === 0) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Workspace not found',
      });
    }
    const row = before.rows[0];
    if (body.slug !== undefined) {
      const slugNorm = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
      if (!SLUG_REGEX.test(slugNorm)) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'slug must be lowercase, alphanumeric and hyphens only',
        });
      }
      const conflict = await client.query(
        'SELECT id FROM workspaces WHERE org_id = $1 AND slug = $2 AND id != $3',
        [request.orgId, slugNorm, workspaceId]
      );
      if (conflict.rowCount > 0) {
        return reply.status(409).send({
          error: 'Conflict',
          message: 'A workspace with this slug already exists in this organization',
        });
      }
    }

    const updates = [];
    const values = [];
    let i = 1;
    if (body.name !== undefined) {
      if (!String(body.name).trim()) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'name must be non-empty',
        });
      }
      updates.push(`name = $${i++}`);
      values.push(body.name.trim());
    }
    if (body.slug !== undefined) {
      updates.push(`slug = $${i++}`);
      values.push(typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : body.slug);
    }
    if (body.workflow_definition !== undefined) {
      updates.push(`workflow_definition = $${i++}::jsonb`);
      values.push(JSON.stringify(body.workflow_definition));
    }
    if (body.entity_labels !== undefined) {
      updates.push(`entity_labels = $${i++}::jsonb`);
      values.push(JSON.stringify(body.entity_labels));
    }
    if (body.dashboard_text !== undefined) {
      updates.push(`dashboard_text = $${i++}::jsonb`);
      values.push(JSON.stringify(body.dashboard_text));
    }
    if (body.settings !== undefined) {
      updates.push(`settings = $${i++}::jsonb`);
      values.push(JSON.stringify(body.settings));
    }
    if (updates.length === 0) {
      return { workspace: workspaceRowToJson(row) };
    }
    values.push(workspaceId);
    const result = await client.query(
      `UPDATE workspaces SET ${updates.join(', ')} WHERE id = $${i}
       RETURNING id, org_id, name, slug, workflow_definition, entity_labels, dashboard_text, settings, created_by, created_at, updated_at`,
      values
    );
    return { workspace: workspaceRowToJson(result.rows[0]) };
  });

  // DELETE /workspaces/:workspaceId — admin only; 409 if has projects
  fastify.delete('/workspaces/:workspaceId', {
    preHandler: [...commonPreHandler, requireRole('admin')],
    schema: {
      params: {
        type: 'object',
        properties: { workspaceId: { type: 'string', format: 'uuid' } },
        required: ['workspaceId'],
      },
    },
  }, async (request, reply) => {
    if (request.orgId == null) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'No organization context',
      });
    }
    const client = request.dbClient;
    const exists = await client.query('SELECT id FROM workspaces WHERE id = $1', [request.params.workspaceId]);
    if (exists.rowCount === 0) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Workspace not found',
      });
    }
    const projects = await client.query(
      'SELECT id FROM projects WHERE workspace_id = $1 LIMIT 1',
      [request.params.workspaceId]
    );
    if (projects.rowCount > 0) {
      return reply.status(409).send({
        error: 'Conflict',
        message: 'Cannot delete workspace that has projects',
      });
    }
    await client.query('DELETE FROM workspaces WHERE id = $1', [request.params.workspaceId]);
    return reply.status(204).send();
  });

  // GET /workspaces/:workspaceId/projects — workspace + projects in Lite CONFIG shape
  fastify.get('/workspaces/:workspaceId/projects', {
    preHandler: commonPreHandler,
    schema: {
      params: {
        type: 'object',
        properties: { workspaceId: { type: 'string', format: 'uuid' } },
        required: ['workspaceId'],
      },
    },
  }, async (request, reply) => {
    if (request.orgId == null) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'No organization context',
      });
    }
    const client = request.dbClient;
    const wsResult = await client.query(
      `SELECT id, name, slug, workflow_definition, entity_labels, dashboard_text, settings
       FROM workspaces WHERE id = $1`,
      [request.params.workspaceId]
    );
    if (wsResult.rowCount === 0) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Workspace not found',
      });
    }
    const workspace = wsResult.rows[0];
    const workspacePayload = {
      id: workspace.id,
      name: workspace.name,
      workflow_definition: workspace.workflow_definition ?? [],
      entity_labels: workspace.entity_labels ?? {},
      dashboard_text: workspace.dashboard_text ?? {},
      settings: workspace.settings ?? {},
    };
    const projResult = await client.query(
      `SELECT p.id, p.name, p.group_name, p.at_risk, p.descoped, p.show_in_timeline, p.tags, p.external_link, p.display_order,
              m.milestone_key, m.planned_date
       FROM projects p
       LEFT JOIN milestones m ON m.project_id = p.id
       WHERE p.workspace_id = $1
       ORDER BY p.display_order, p.name, m.milestone_key`,
      [request.params.workspaceId]
    );
    const byProject = new Map();
    for (const r of projResult.rows) {
      if (!byProject.has(r.id)) {
        byProject.set(r.id, {
          id: r.id,
          name: r.name,
          group_name: r.group_name ?? null,
          at_risk: r.at_risk ?? false,
          descoped: r.descoped ?? false,
          show_in_timeline: r.show_in_timeline ?? true,
          tags: r.tags ?? [],
          external_link: r.external_link ?? null,
          display_order: r.display_order ?? 0,
          milestones: {},
          dependencies: [],
        });
      }
      const proj = byProject.get(r.id);
      if (r.milestone_key != null) {
        proj.milestones[r.milestone_key] = formatPlannedDate(r.planned_date) ?? '';
      }
    }
    const projectsList = Array.from(byProject.values());
    return {
      workspace: workspacePayload,
      projects: projectsList,
    };
  });
}
