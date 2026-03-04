/**
 * Request context plugin: resolves DB user, sets PostgreSQL session vars for RLS/audit.
 * Use fastify.setRequestContext as a preHandler after authenticate (e.g. on /auth/me).
 * Skip context setup for /health (do not add this preHandler to /health).
 * TODO Epic 2: resolve org from JWT claims or workspace param
 */

import { pool } from '../db/client.js';
import authPlugin from './auth.js';

async function contextPlugin(fastify) {
  fastify.decorate('setRequestContext', async function setRequestContext(request, reply) {
    if (request.routerPath === '/health') return;
    if (!request.user?.sub) return;

    const client = await pool.connect();
    request.dbClient = client;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      try {
        client.release();
      } catch (_) {}
    };
    reply.raw.once('finish', release);
    reply.raw.once('close', release);

    const auth0Id = request.user.sub;
    const userRow = await client.query(
      'SELECT id, email, display_name FROM users WHERE auth0_id = $1',
      [auth0Id]
    );
    if (userRow.rowCount === 0) {
      release();
      return;
    }

    const row = userRow.rows[0];
    request.dbUser = {
      id: row.id,
      email: row.email,
      display_name: row.display_name,
    };

    // Epic 1 stub: use hardcoded org from env; skip if not set
    const defaultOrgId = fastify.config.DEFAULT_ORG_ID || process.env.DEFAULT_ORG_ID;
    if (defaultOrgId) {
      // SET LOCAL does not support bound parameters ($1); values must be literal.
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const orgIdSafe = uuidRegex.test(String(defaultOrgId)) ? defaultOrgId : null;
      const userIdSafe = row.id != null && uuidRegex.test(String(row.id)) ? row.id : null;
      if (orgIdSafe) await client.query(`SET LOCAL app.current_org_id = '${orgIdSafe}'`);
      if (userIdSafe) await client.query(`SET LOCAL app.current_user_id = '${userIdSafe}'`);
    }
  });

  await fastify.register(authPlugin);
}

export default contextPlugin;
