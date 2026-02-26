import { build } from '../src/server.js';
import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
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

test('GET /auth/me without any Authorization header returns 401', async () => {
  const res = await app.inject({ method: 'GET', url: '/auth/me', headers: {} });
  assert.equal(res.statusCode, 401);
  const body = res.json();
  assert.equal(body.error, 'Unauthorized');
  assert.ok(body.message.includes('Missing'));
});

test('GET /auth/me with malformed Bearer token returns 401', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { authorization: 'Bearer thisisnotavalidtoken' },
  });
  assert.equal(res.statusCode, 401);
  const body = res.json();
  assert.equal(body.error, 'Unauthorized');
});

test('GET /auth/me with empty Bearer value returns 401', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { authorization: 'Bearer ' },
  });
  assert.equal(res.statusCode, 401);
});

test('GET /auth/me with wrong auth scheme returns 401', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { authorization: 'Basic dXNlcjpwYXNz' },
  });
  assert.equal(res.statusCode, 401);
});

test('GET /auth/me with valid test token returns 200', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { 'x-test-user-sub': 'test-user-abc123' },
  });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.sub, 'test-user-abc123');
  assert.equal(body.email, 'test@example.com');
});

test('GET /auth/me response contains required user fields', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { 'x-test-user-sub': 'test-user-abc123' },
  });
  const body = res.json();
  assert.ok('sub' in body);
  assert.ok('email' in body);
  assert.ok('name' in body);
  assert.equal(typeof body.sub, 'string');
  assert.equal(typeof body.email, 'string');
  assert.equal(typeof body.name, 'string');
});

test('GET /auth/me correctly reflects the sub from the test header', async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/auth/me',
    headers: { 'x-test-user-sub': 'unique-user-xyz-999' },
  });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.sub, 'unique-user-xyz-999');
});
