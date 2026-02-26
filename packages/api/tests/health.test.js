import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../src/server.js';

// Required by @fastify/env schema when loading server
process.env.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'test.auth0.com';
process.env.AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://test.api';

let app;

test('GET /health returns 200 with status ok', async () => {
  app = await build();
  const res = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.status, 'ok');
});

after(async () => {
  if (app) await app.close();
});
