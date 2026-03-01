/**
 * Request context plugin: resolves DB user and org, sets PostgreSQL session vars for RLS/audit.
 * Use fastify.setRequestContext as a preHandler after authenticate.
 * Skip context setup for /health (do not add this preHandler to /health).
 *
 * Org resolution order:
 *   1. x-org-id request header (explicit, used by SaaS frontend)
 *   2. org claim in JWT payload (set by Auth0 organisation feature)
 *   3. DEFAULT_ORG_ID env var (dev/test fallback only)
 */

import { pool } from '../db/client.js';
import authPlugin from './auth.js';

async function contextPlugin(fastify) {
  fastify.decorate('setRequestContext', async function setRequestContext(request, reply) {
    if (request.routerPath === '/health') return;
    if (!request.user?.sub) return;

    // TEST MODE: no real database in the test environment; authenticate already
    // set request.user from the x-test-user-sub header bypass.
    if (process.env.NODE_ENV === 'test') return;

    const client = await pool.connect();
    request.dbClient = client;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      try { client.release(); } catch (_) {}
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

    // Resolve org: header → JWT claim → env fallback
    const orgId =
      request.headers['x-org-id'] ||
      request.user['https://roadmapsnap.io/org_id'] ||
      fastify.config.DEFAULT_ORG_ID ||
      process.env.DEFAULT_ORG_ID ||
      null;

    if (orgId) {
      request.orgId = orgId;
      await client.query('SET LOCAL app.current_org_id = $1', [orgId]);
      await client.query('SET LOCAL app.current_user_id = $1', [row.id]);
    }
  });

  await fastify.register(authPlugin);
}

export default contextPlugin;
