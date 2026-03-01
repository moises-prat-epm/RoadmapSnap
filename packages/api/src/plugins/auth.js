/**
 * Auth0 JWT verification plugin for Fastify 5.
 * Uses jose to verify JWTs against Auth0 JWKS and adds fastify.authenticate preHandler.
 */

import { createRemoteJWKSet, jwtVerify } from 'jose';
import { pool } from '../db/client.js';

async function authPlugin(fastify) {
  const domain = fastify.config.AUTH0_DOMAIN;
  const audience = fastify.config.AUTH0_AUDIENCE;

  if (!domain || !audience) {
    throw new Error('AUTH0_DOMAIN and AUTH0_AUDIENCE must be set');
  }

  const issuer = `https://${domain}/`;
  const jwksUrl = `https://${domain}/.well-known/jwks.json`;
  const JWKS = createRemoteJWKSet(new URL(jwksUrl));

  fastify.decorate('authenticate', async function authenticate(request, reply) {
    // TEST MODE ONLY — never active in production
    if (process.env.NODE_ENV === 'test') {
      const testSub = request.headers['x-test-user-sub'];
      if (testSub != null && testSub !== '') {
        request.user = {
          sub: testSub,
          email: `${testSub}@test.example.com`,
          name: 'Test User',
        };
        return;
      }
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing Authorization header',
      });
    }

    const token = authHeader.slice(7);
    if (!token) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Missing or invalid token',
      });
    }

    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer,
        audience,
      });
      request.user = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        ...payload,
      };
    } catch (err) {
      fastify.log.warn({ err }, 'JWT verification failed');
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }
  });

  fastify.get('/auth/me', {
    preHandler: [fastify.authenticate, fastify.setRequestContext],
  }, async (request, reply) => {
    // Upsert the user row so first-time logins are automatically provisioned.
    // setRequestContext populates request.dbClient and request.dbUser if the row
    // already exists; if dbUser is absent the row needs to be created now.
    if (!request.dbUser) {
      // No database configured: fall back to the JWT/mock user data directly.
      if (!process.env.DATABASE_URL) {
        return { sub: request.user.sub, email: request.user.email, name: request.user.name };
      }
      // DB is available but context couldn't find the user (first login).
      // context.js released its client early; open a dedicated one for the upsert.
      const client = await pool.connect();
      try {
        const email = request.user.email || `${request.user.sub}@unknown`;
        const displayName = request.user.name || request.user.nickname || null;

        const upsert = await client.query(
          `INSERT INTO users (auth0_id, email, display_name)
           VALUES ($1, $2, $3)
           ON CONFLICT (auth0_id) DO UPDATE
             SET email        = EXCLUDED.email,
                 display_name = COALESCE(EXCLUDED.display_name, users.display_name),
                 updated_at   = NOW()
           RETURNING id, email, display_name`,
          [request.user.sub, email, displayName]
        );
        const row = upsert.rows[0];
        request.dbUser = { id: row.id, email: row.email, display_name: row.display_name };
      } finally {
        client.release();
      }
    }

    return {
      sub: request.user.sub,
      email: request.dbUser.email,
      name: request.user.name || request.dbUser.display_name || null,
      display_name: request.dbUser.display_name,
      id: request.dbUser.id,
    };
  });
}

export default authPlugin;
