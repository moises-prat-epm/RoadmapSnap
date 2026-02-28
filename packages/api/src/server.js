import './loadEnv.js';
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import rbacPlugin from './plugins/rbac.js';
import contextPlugin from './plugins/context.js';

// Domain route plugins — add imports here as Phase 2 routes are implemented.
// Each module must export a default Fastify plugin registered under /api/v1/.
// Example (Phase 2):
//   import workspacesRoutes from './routes/workspaces.js';
//   import projectsRoutes   from './routes/projects.js';
const domainRoutes = [
  // workspacesRoutes,
  // projectsRoutes,
];

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

const envSchema = {
  type: 'object',
  required: ['AUTH0_DOMAIN', 'AUTH0_AUDIENCE'],
  properties: {
    NODE_ENV: { type: 'string', default: 'development' },
    PORT: { type: 'integer', default: 4000 },
    DATABASE_URL: { type: 'string', default: 'postgresql://postgres:postgres@localhost:5432/roadmapsnap_dev' },
    AUTH0_DOMAIN: { type: 'string' },
    AUTH0_AUDIENCE: { type: 'string' },
    CORS_ORIGIN: { type: 'string', default: 'http://localhost:3000' },
    DEFAULT_ORG_ID: { type: 'string', default: '' },
  },
};

const version = '0.1.0';

export async function build() {
  const fastify = Fastify({ logger: true });

  await fastify.register(fastifyEnv, {
    schema: envSchema,
    dotenv: { path: envPath },
  });

  await fastify.register(fastifyCors, {
    origin: fastify.config.CORS_ORIGIN,
  });

  await fastify.register(contextPlugin);
  await fastify.register(rbacPlugin);

  fastify.get('/health', async () => ({
    status: 'ok',
    service: 'roadmapsnap-api',
    version,
    timestamp: new Date().toISOString(),
  }));

  // Register all domain route plugins under /api/v1/
  for (const routePlugin of domainRoutes) {
    await fastify.register(routePlugin, { prefix: '/api/v1' });
  }

  return fastify;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    const app = await build();
    await app.listen({ port: Number(process.env.PORT) || 4000, host: '0.0.0.0' });
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
