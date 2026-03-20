/**
 * Role-based access control plugin.
 * fastify.requireRole(minimumRole) returns a preHandler that enforces role hierarchy.
 * Role levels: viewer=1, editor=2, admin=3.
 */

const ROLE_LEVEL = { viewer: 1, editor: 2, admin: 3 };

async function rbacPlugin(fastify) {
  fastify.decorate('requireRole', function requireRole(minimumRole) {
    const minLevel = ROLE_LEVEL[minimumRole];
    if (minLevel === undefined) {
      throw new Error(`requireRole: invalid role "${minimumRole}". Use viewer | editor | admin.`);
    }

    return async function rbacPreHandler(request, reply) {
      if (request.orgId == null) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'No organization context',
        });
      }
      if (request.dbUser == null) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'User not found',
        });
      }

      const userRole = request.dbUser.role;
      const userLevel = userRole ? ROLE_LEVEL[userRole] : 0;
      if (userLevel < minLevel) {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Insufficient permissions',
        });
      }

      return;
    };
  });
}

export default rbacPlugin;
