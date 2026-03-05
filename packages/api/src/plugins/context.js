/**
 * Request context plugin: resolves DB user, org context, sets PostgreSQL session vars for RLS/audit.
 * Runs only on authenticated requests (skips /health).
 * Resolves org in order: X-Org-Id header → ?orgId query → org_members lookup by user.
 * User provisioning: INSERT user from JWT if not present (Auth0 post-login sync).
 */

import { pool } from '../db/client.js';
import authPlugin from './auth.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value) {
  return value != null && UUID_REGEX.test(String(value));
}

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

    // User provisioning: insert if not exists (Auth0 post-login sync)
    let userRow;
    try {
      userRow = await client.query(
        'SELECT id, email, display_name, preferences FROM users WHERE auth0_id = $1',
        [auth0Id]
      );
    } catch (err) {
      if (err.code === '42703' && err.message && err.message.includes('preferences')) {
        userRow = await client.query(
          'SELECT id, email, display_name FROM users WHERE auth0_id = $1',
          [auth0Id]
        );
      } else {
        release();
        throw err;
      }
    }
    if (userRow.rowCount === 0) {
      await client.query(
        `INSERT INTO users (auth0_id, email, display_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (auth0_id) DO NOTHING`,
        [
          auth0Id,
          request.user.email ?? null,
          request.user.name ?? null,
        ]
      );
      try {
        userRow = await client.query(
          'SELECT id, email, display_name, preferences FROM users WHERE auth0_id = $1',
          [auth0Id]
        );
      } catch (err) {
        if (err.code === '42703' && err.message && err.message.includes('preferences')) {
          userRow = await client.query(
            'SELECT id, email, display_name FROM users WHERE auth0_id = $1',
            [auth0Id]
          );
        } else {
          throw err;
        }
      }
    }

    if (userRow.rowCount === 0) {
      release();
      return;
    }

    const row = userRow.rows[0];
    const preferences = row.preferences && typeof row.preferences === 'object'
      ? row.preferences
      : { theme: 'light' };

    // Resolve org context (priority: X-Org-Id → ?orgId → first org_members row)
    let resolvedOrgId = null;
    let role = null;

    const headerOrgId = request.headers['x-org-id'];
    const queryOrgId = request.query?.orgId;
    if (headerOrgId && isValidUuid(headerOrgId)) {
      resolvedOrgId = headerOrgId;
    } else if (queryOrgId && isValidUuid(queryOrgId)) {
      resolvedOrgId = queryOrgId;
    }

    if (resolvedOrgId) {
      const memberRow = await client.query(
        'SELECT role FROM org_members WHERE user_id = $1 AND org_id = $2',
        [row.id, resolvedOrgId]
      );
      if (memberRow.rowCount > 0) {
        role = memberRow.rows[0].role;
      } else {
        resolvedOrgId = null;
      }
    }

    if (!resolvedOrgId) {
      const firstOrg = await client.query(
        'SELECT org_id, role FROM org_members WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1',
        [row.id]
      );
      if (firstOrg.rowCount > 0) {
        resolvedOrgId = firstOrg.rows[0].org_id;
        role = firstOrg.rows[0].role;
      }
    }

    request.dbUser = {
      id: row.id,
      email: row.email,
      display_name: row.display_name,
      role: role ?? null,
      preferences,
    };
    request.orgId = resolvedOrgId ?? null;

    if (resolvedOrgId && isValidUuid(resolvedOrgId) && isValidUuid(row.id)) {
      await client.query(`SET LOCAL app.current_org_id = '${resolvedOrgId}'`);
      await client.query(`SET LOCAL app.current_user_id = '${row.id}'`);
    }
  });

  await fastify.register(authPlugin);
}

export default contextPlugin;
