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
const runTests = Boolean(DATABASE_URL);

let app;
let adminClient;
let testOrgId;
let testWorkspaceId;
let editorUserId;
let viewerUserId;
let createdProjectId;

function authHeaders(sub, orgId) {
  const h = { 'x-test-user-sub': sub };
  if (orgId) h['x-org-id'] = orgId;
  return h;
}

before(async () => {
  app = await build();
  await app.ready();
  if (runTests) {
    adminClient = new Pool({ connectionString: DATABASE_URL });

    const editorRes = await adminClient.query(
      `INSERT INTO users (auth0_id, email, display_name)
       VALUES ('test-proj-editor', 'proj-editor@example.com', 'Proj Editor')
       ON CONFLICT (auth0_id) DO UPDATE SET email = EXCLUDED.email RETURNING id`
    );
    editorUserId = editorRes.rows[0].id;

    const viewerRes = await adminClient.query(
      `INSERT INTO users (auth0_id, email, display_name)
       VALUES ('test-proj-viewer', 'proj-viewer@example.com', 'Proj Viewer')
       ON CONFLICT (auth0_id) DO UPDATE SET email = EXCLUDED.email RETURNING id`
    );
    viewerUserId = viewerRes.rows[0].id;

    const uniqueSlug = `proj-test-org-${process.pid}-${Date.now()}`;
    const orgRes = await adminClient.query(
      `INSERT INTO organizations (name, slug, plan) VALUES ('Project Test Org', $1, 'trial') RETURNING id`,
      [uniqueSlug]
    );
    testOrgId = orgRes.rows[0].id;

    await adminClient.query(
      `INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'editor') ON CONFLICT (org_id, user_id) DO UPDATE SET role = 'editor'`,
      [testOrgId, editorUserId]
    );
    await adminClient.query(
      `INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'viewer') ON CONFLICT (org_id, user_id) DO UPDATE SET role = 'viewer'`,
      [testOrgId, viewerUserId]
    );

    // Create a workspace to attach projects to
    const wsRes = await adminClient.query(
      `INSERT INTO workspaces (org_id, name, slug, created_by)
       VALUES ($1, 'Test Workspace', 'test-ws-${process.pid}', $2)
       RETURNING id`,
      [testOrgId, editorUserId]
    );
    testWorkspaceId = wsRes.rows[0].id;
  }
});

after(async () => {
  if (app) await app.close();
  if (runTests && adminClient) {
    if (testOrgId) {
      const client = await adminClient.connect();
      try {
        try {
          await client.query('SET LOCAL row_security = off');
        } catch (_) {
          await client.query(`SET LOCAL app.current_org_id = '${testOrgId}'`);
        }
        await client.query('DELETE FROM projects WHERE workspace_id = $1', [testWorkspaceId]);
        await client.query('DELETE FROM workspaces WHERE id = $1', [testWorkspaceId]);
        await client.query('DELETE FROM org_members WHERE org_id = $1', [testOrgId]);
        await client.query('DELETE FROM audit_events WHERE org_id = $1', [testOrgId]);
        await client.query('DELETE FROM organizations WHERE id = $1', [testOrgId]);
      } finally {
        client.release();
      }
    }
    await adminClient.query(
      `DELETE FROM users WHERE auth0_id IN ('test-proj-editor', 'test-proj-viewer')`
    );
    await adminClient.end();
  }
});

// POST /api/v1/workspaces/:workspaceId/projects

test('POST /projects — creates project as editor', { skip: !runTests }, async () => {
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/workspaces/${testWorkspaceId}/projects`,
    headers: authHeaders('test-proj-editor', testOrgId),
    payload: { name: 'My First Project', group_name: 'Group A', tags: ['beta'] },
  });
  assert.equal(res.statusCode, 201);
  const body = JSON.parse(res.body);
  assert.ok(body.project.id);
  assert.equal(body.project.name, 'My First Project');
  assert.equal(body.project.group_name, 'Group A');
  assert.deepEqual(body.project.tags, ['beta']);
  assert.equal(body.project.at_risk, false);
  assert.equal(body.project.show_in_timeline, true);
  assert.deepEqual(body.project.milestones, {});
  createdProjectId = body.project.id;
});

test('POST /projects — 409 on duplicate name', { skip: !runTests }, async () => {
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/workspaces/${testWorkspaceId}/projects`,
    headers: authHeaders('test-proj-editor', testOrgId),
    payload: { name: 'My First Project' },
  });
  assert.equal(res.statusCode, 409);
  const body = JSON.parse(res.body);
  assert.equal(body.error, 'Conflict');
});

test('POST /projects — 400 on empty name', { skip: !runTests }, async () => {
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/workspaces/${testWorkspaceId}/projects`,
    headers: authHeaders('test-proj-editor', testOrgId),
    payload: { name: '   ' },
  });
  assert.equal(res.statusCode, 400);
});

test('POST /projects — 403 for viewer', { skip: !runTests }, async () => {
  const res = await app.inject({
    method: 'POST',
    url: `/api/v1/workspaces/${testWorkspaceId}/projects`,
    headers: authHeaders('test-proj-viewer', testOrgId),
    payload: { name: 'Viewer Project' },
  });
  assert.equal(res.statusCode, 403);
});

test('POST /projects — 404 for unknown workspace', { skip: !runTests }, async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/v1/workspaces/00000000-0000-0000-0000-000000000000/projects',
    headers: authHeaders('test-proj-editor', testOrgId),
    payload: { name: 'Orphan Project' },
  });
  assert.equal(res.statusCode, 404);
});

// PATCH /api/v1/projects/:projectId

test('PATCH /projects — updates name and at_risk', { skip: !runTests }, async () => {
  assert.ok(createdProjectId, 'need a created project from earlier test');
  const res = await app.inject({
    method: 'PATCH',
    url: `/api/v1/projects/${createdProjectId}`,
    headers: authHeaders('test-proj-editor', testOrgId),
    payload: { name: 'Renamed Project', at_risk: true },
  });
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.equal(body.project.name, 'Renamed Project');
  assert.equal(body.project.at_risk, true);
});

test('PATCH /projects — no-op if no fields', { skip: !runTests }, async () => {
  const res = await app.inject({
    method: 'PATCH',
    url: `/api/v1/projects/${createdProjectId}`,
    headers: authHeaders('test-proj-editor', testOrgId),
    payload: {},
  });
  assert.equal(res.statusCode, 200);
});

test('PATCH /projects — 404 for missing project', { skip: !runTests }, async () => {
  const res = await app.inject({
    method: 'PATCH',
    url: '/api/v1/projects/00000000-0000-0000-0000-000000000000',
    headers: authHeaders('test-proj-editor', testOrgId),
    payload: { name: 'Ghost' },
  });
  assert.equal(res.statusCode, 404);
});

test('PATCH /projects — 403 for viewer', { skip: !runTests }, async () => {
  const res = await app.inject({
    method: 'PATCH',
    url: `/api/v1/projects/${createdProjectId}`,
    headers: authHeaders('test-proj-viewer', testOrgId),
    payload: { name: 'Viewer Rename' },
  });
  assert.equal(res.statusCode, 403);
});

// DELETE /api/v1/projects/:projectId

test('DELETE /projects — 403 for viewer', { skip: !runTests }, async () => {
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/v1/projects/${createdProjectId}`,
    headers: authHeaders('test-proj-viewer', testOrgId),
  });
  assert.equal(res.statusCode, 403);
});

test('DELETE /projects — deletes project as editor', { skip: !runTests }, async () => {
  assert.ok(createdProjectId, 'need a created project from earlier test');
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/v1/projects/${createdProjectId}`,
    headers: authHeaders('test-proj-editor', testOrgId),
  });
  assert.equal(res.statusCode, 204);
});

test('DELETE /projects — 404 after deletion', { skip: !runTests }, async () => {
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/v1/projects/${createdProjectId}`,
    headers: authHeaders('test-proj-editor', testOrgId),
  });
  assert.equal(res.statusCode, 404);
});
