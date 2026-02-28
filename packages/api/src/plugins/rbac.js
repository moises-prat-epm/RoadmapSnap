/**
 * Role-based access control plugin.
 * Adds fastify.requireRole(minimumRole) returning a preHandler that checks org_members role.
 *
 * Depends on:
 *   - request.dbUser   (set by setRequestContext: { id, email, display_name })
 *   - request.orgId    (set by setRequestContext from x-org-id header or JWT claim)
 *   - request.dbClient (pg PoolClient for the duration of the request)
 */

import { pool } from '../db/client.js';

const ROLE_ORDER = { viewer: 0, editor: 1, admin: 2 };

async function rbacPlugin(fastify) {
  fastify.decorate('requireRole', function requireRole(minimumRole) {
    const minLevel = ROLE_ORDER[minimumRole];
    if (minLevel === undefined) {
      throw new Error(`requireRole: invalid role "${minimumRole}". Use viewer | editor | admin.`);
    }

    return async function rbacPreHandler(request, reply) {
      if (!request.dbUser) {
        return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
      }
      if (!request.orgId) {
        return reply.status(400).send({ error: 'Bad Request', message: 'Organization context required (x-org-id header)' });
      }

      const client = request.dbClient || pool;
      const result = await client.query(
        'SELECT role FROM org_members WHERE org_id = $1 AND user_id = $2 AND accepted_at IS NOT NULL',
        [request.orgId, request.dbUser.id]
      );

      if (result.rowCount === 0) {
        return reply.status(403).send({ error: 'Forbidden', message: 'Not a member of this organisation' });
      }

      const userRole = result.rows[0].role;
      const userLevel = ROLE_ORDER[userRole];
      if (userLevel === undefined || userLevel < minLevel) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: `Role '${userRole}' is insufficient; '${minimumRole}' or above required`,
        });
      }

      request.orgRole = userRole;
    };
  });
}

export default rbacPlugin;
