import '../src/loadEnv.js';
import pg from 'pg';
import { build } from '../src/server.js';
import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';

const { Pool } = pg;

process.env.NODE_ENV = 'test';
process.env.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'test.auth0.com';
process.env.AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://test.api';

const DATABASE_URL = process.env.DATABASE_URL;
const runWorkspaceTests = Boolean(DATABASE_URL);

let app;
let adminClient;
let testOrgId;
let adminUserId;
let viewerUserId;
let createdWorkspaceId;

function authHeaders(sub, orgId) {
  const h = { 'x-test-user-sub': sub };
  if (orgId) h['x-org-id'] = orgId;
  return h;
}

before(async () => {
  app = await build();
  await app.ready();
  if (runWorkspaceTests) {
    adminClient = new Pool({ connectionString: DATABASE_URL });
    const userRes = await adminClient.query(
      `INSERT INTO users (auth0_id, email, display_name) VALUES ('test-ws-admin', 'ws-admin@example.com', 'WS Admin') ON CONFLICT (auth0_id) DO UPDATE SET email = EXCLUDED.email RETURNING id`
    );
    adminUserId = userRes.rows[0].id;
    const viewerRes = await adminClient.query(
      `INSERT INTO users (auth0_id, email, display_name) VALUES ('test-ws-viewer', 'ws-viewer@example.com', 'WS Viewer') ON CONFLICT (auth0_id) DO UPDATE SET email = EXCLUDED.email RETURNING id`
    );
    viewerUserId = viewerRes.rows[0].id;
    const uniqueSlug = `ws-test-org-${process.pid}-${Date.now()}`;
    const orgRes = await adminClient.query(
      `INSERT INTO organizations (name, slug, plan) VALUES ('Workspace Test Org', $1, 'trial') RETURNING id`,
      [uniqueSlug]
    );
    testOrgId = orgRes.rows[0].id;
    await adminClient.query(
      `INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'admin') ON CONFLICT (org_id, user_id) DO UPDATE SET role = 'admin'`,
      [testOrgId, adminUserId]
    );
    await adminClient.query(
      `INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'viewer') ON CONFLICT (org_id, user_id) DO UPDATE SET role = 'viewer'`,
      [testOrgId, viewerUserId]
    );
  }
});

after(async () => {
  if (app) await app.close();
  if (runWorkspaceTests && adminClient) {
    const orgId = testOrgId;
    if (orgId) {
      const client = await adminClient.connect();
      try {
        try {
          await client.query('SET LOCAL row_security = off');
        } catch (_) {
          await client.query(`SET LOCAL app.current_org_id = '${orgId}'`);
        }
        await client.query('DELETE FROM workspaces WHERE org_id = $1', [orgId]);
        await client.query('DELETE FROM org_members WHERE org_id = $1', [orgId]);
        await client.query('DELETE FROM audit_events WHERE org_id = $1', [orgId]);
        await client.query('DELETE FROM organizations WHERE id = $1', [orgId]);
      } finally {
        client.release();
      }
    }
    await adminClient.query(`DELETE FROM users WHERE auth0_id IN ('test-ws-admin', 'test-ws-viewer')`);
    await adminClient.end();
  }
});

test('GET /api/v1/workspaces without auth returns 401', { skip: !runWorkspaceTests }, async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/workspaces',
    headers: {},
  });
  assert.equal(res.statusCode, 401);
});

test('GET /api/v1/workspaces returns workspaces scoped to current org', { skip: !runWorkspaceTests }, async () => {
  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/workspaces',
    headers: authHeaders('test-ws-admin', testOrgId),
  });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.ok(Array.isArray(body.workspaces));
  assert.ok(
    body.workspaces.every((w) => w.org_id === testOrgId),
    'all workspaces must belong to test org'
  );
});

test('POST /api/v1/workspaces creates workspace and returns 201', { skip: !runWorkspaceTests }, async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/workspaces',
    headers: authHeaders('test-ws-admin', testOrgId),
    payload: { name: 'Test Workspace', slug: 'test-workspace' },
  });
  assert.equal(res.statusCode, 201);
  const body = res.json();
  assert.ok(body.workspace);
  assert.ok(body.workspace.id);
  assert.equal(body.workspace.org_id, testOrgId);
  assert.equal(body.workspace.name, 'Test Workspace');
  assert.equal(body.workspace.slug, 'test-workspace');
  createdWorkspaceId = body.workspace.id;
});

test('POST /api/v1/workspaces with duplicate slug returns 409', { skip: !runWorkspaceTests }, async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/workspaces',
    headers: authHeaders('test-ws-admin', testOrgId),
    payload: { name: 'Another', slug: 'test-workspace' },
  });
  assert.equal(res.statusCode, 409);
  const body = res.json();
  assert.equal(body.error, 'Conflict');
});

test('GET /api/v1/workspaces/:id returns the created workspace', { skip: !runWorkspaceTests }, async () => {
  const res = await app.inject({
    method: 'GET',
    url: `/api/v1/workspaces/${createdWorkspaceId}`,
    headers: authHeaders('test-ws-admin', testOrgId),
  });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.workspace.id, createdWorkspaceId);
  assert.equal(body.workspace.name, 'Test Workspace');
  assert.ok(Array.isArray(body.workspace.workflow_definition));
  assert.ok(typeof body.workspace.entity_labels === 'object');
  assert.ok(typeof body.workspace.dashboard_text === 'object');
});

test('PATCH /api/v1/workspaces/:id updates name', { skip: !runWorkspaceTests }, async () => {
  const res = await app.inject({
    method: 'PATCH',
    url: `/api/v1/workspaces/${createdWorkspaceId}`,
    headers: authHeaders('test-ws-admin', testOrgId),
    payload: { name: 'Test Workspace Updated' },
  });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.workspace.name, 'Test Workspace Updated');
  assert.equal(body.workspace.slug, 'test-workspace');
});

test('GET /api/v1/workspaces/:id/projects returns workspace + empty projects array', { skip: !runWorkspaceTests }, async () => {
  const res = await app.inject({
    method: 'GET',
    url: `/api/v1/workspaces/${createdWorkspaceId}/projects`,
    headers: authHeaders('test-ws-admin', testOrgId),
  });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.ok(body.workspace);
  assert.equal(body.workspace.id, createdWorkspaceId);
  assert.ok(Array.isArray(body.projects));
  assert.equal(body.projects.length, 0);
});

test('Viewer role cannot POST /api/v1/workspaces (returns 403)', { skip: !runWorkspaceTests }, async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/workspaces',
    headers: authHeaders('test-ws-viewer', testOrgId),
    payload: { name: 'Viewer Workspace', slug: 'viewer-workspace' },
  });
  assert.equal(res.statusCode, 403);
  const body = res.json();
  assert.equal(body.error, 'Forbidden');
});
