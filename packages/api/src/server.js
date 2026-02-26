import './loadEnv.js';
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyEnv from '@fastify/env';
import { pathToFileURL } from 'node:url';
import rbacPlugin from './plugins/rbac.js';
import contextPlugin from './plugins/context.js';

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
    dotenv: true,
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

  return fastify;
}

async function start() {
  const fastify = await build();
  const port = Number(fastify.config.PORT) || 4000;
  await fastify.listen({ port, host: '0.0.0.0' });
  return fastify;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
