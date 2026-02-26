import { build } from '../src/server.js';
import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';

process.env.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'test.auth0.com';
process.env.AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://test.api';

let app;

before(async () => {
  app = await build();
  await app.ready();
});

after(async () => {
  await app.close();
});

test('GET /health returns status 200', async () => {
  const res = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(res.statusCode, 200);
});

test('GET /health returns correct JSON shape', async () => {
  const res = await app.inject({ method: 'GET', url: '/health' });
  const body = res.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'roadmapsnap-api');
  assert.equal(body.version, '0.1.0');
  assert.equal(typeof body.timestamp, 'string');
  assert.equal(Number.isNaN(new Date(body.timestamp).getTime()), false);
});

test('GET /health is public — no Authorization header required', async () => {
  const res = await app.inject({ method: 'GET', url: '/health', headers: {} });
  assert.equal(res.statusCode, 200);
});

test('GET /health responds in under 200ms', async () => {
  const start = Date.now();
  await app.inject({ method: 'GET', url: '/health' });
  assert.ok(Date.now() - start < 200, `Expected < 200ms, got ${Date.now() - start}ms`);
});
