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
      await client.query('SET LOCAL app.current_org_id = $1', [defaultOrgId]);
      await client.query('SET LOCAL app.current_user_id = $1', [row.id]);
    }
  });

  await fastify.register(authPlugin);
}

export default contextPlugin;
