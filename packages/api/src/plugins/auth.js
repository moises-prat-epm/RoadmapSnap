/**
 * Auth0 JWT verification plugin for Fastify 5.
 * Uses jose to verify JWTs against Auth0 JWKS and adds fastify.authenticate preHandler.
 */

import { createRemoteJWKSet, jwtVerify } from 'jose';

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
    // Test / dev: allow X-Test-User-Sub to bypass JWT (never active when NODE_ENV=production)
    const allowTestHeader = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
    if (allowTestHeader) {
      const testSub = request.headers['x-test-user-sub'];
      if (testSub != null && testSub !== '') {
        // Unique email per sub — users.email is UNIQUE; tests use many different subs in one process.
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

  const { registerAuthRoutes } = await import('../routes/auth.js');
  await registerAuthRoutes(fastify);
  const workspacesRoutes = (await import('../routes/workspaces.js')).default;
  await fastify.register(workspacesRoutes, { prefix: '/api/v1' });
  const projectsRoutes = (await import('../routes/projects.js')).default;
  await fastify.register(projectsRoutes, { prefix: '/api/v1' });
}

export default authPlugin;
