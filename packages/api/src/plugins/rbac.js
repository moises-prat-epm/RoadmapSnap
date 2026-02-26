/**
 * Role-based access control plugin.
 * Adds fastify.requireRole(minimumRole) returning a preHandler that checks org_members role.
 * TODO Epic 2: implement real org context lookup (workspaces + org context middleware).
 */

const ROLE_ORDER = { viewer: 0, editor: 1, admin: 2 };

async function rbacPlugin(fastify) {
  fastify.decorate('requireRole', function requireRole(minimumRole) {
    const minLevel = ROLE_ORDER[minimumRole];
    if (minLevel === undefined) {
      throw new Error(`requireRole: invalid role "${minimumRole}". Use viewer | editor | admin.`);
    }

    return async function rbacPreHandler(request, reply) {
      // TODO Epic 2: implement real org context lookup
      // - Read current org from request (e.g. request.orgId set by middleware)
      // - Query org_members for request.user.sub and org_id
      // - Compare role hierarchy and return 403 if insufficient
      fastify.log.warn('requireRole: stub in place; org lookup not implemented (Epic 2). Passing through.');
      return;
    };
  });
}

export default rbacPlugin;
