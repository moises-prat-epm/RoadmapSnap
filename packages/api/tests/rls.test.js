import '../src/loadEnv.js';
import pg from 'pg';
import { before, after, beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
const APP_DATABASE_URL =
  process.env.APP_DATABASE_URL ??
  (DATABASE_URL
    ? DATABASE_URL.replace(
        /postgresql:\/\/[^:]+:[^@]+@/,
        'postgresql://roadmapsnap_app:apppassword@'
      )
    : null);

const runRlsTests = Boolean(DATABASE_URL && APP_DATABASE_URL);

let adminClient;
let appClient;

let orgAId, orgBId;
let orgAProjectId, orgBProjectId;
let testUserId, workspaceAId, workspaceBId;

async function queryAs(orgId, sql, params = []) {
  const client = await appClient.connect();
  try {
    await client.query('BEGIN');
    if (orgId) {
      await client.query(`SET LOCAL app.current_org_id = '${orgId}'`);
    } else {
      await client.query(`SET LOCAL app.current_org_id = '00000000-0000-0000-0000-000000000000'`);
    }
    const result = await client.query(sql, params);
    await client.query('ROLLBACK');
    return result.rows;
  } finally {
    client.release();
  }
}

before(async () => {
  if (!runRlsTests) return;
  adminClient = new Pool({ connectionString: DATABASE_URL });
  appClient = new Pool({ connectionString: APP_DATABASE_URL });
});

after(async () => {
  if (adminClient) await adminClient.end();
  if (appClient) await appClient.end();
});

beforeEach(async () => {
  if (!runRlsTests) return;

  const userRes = await adminClient.query(
    `INSERT INTO users (auth0_id, email, display_name) VALUES ('test|rls-user', 'rls-test@example.com', 'RLS Test User') RETURNING id`
  );
  testUserId = userRes.rows[0].id;

  const orgARes = await adminClient.query(
    `INSERT INTO organizations (name, slug, plan) VALUES ('RLS Test Org Alpha', 'rls-org-alpha-test', 'trial') RETURNING id`
  );
  orgAId = orgARes.rows[0].id;

  const orgBRes = await adminClient.query(
    `INSERT INTO organizations (name, slug, plan) VALUES ('RLS Test Org Beta', 'rls-org-beta-test', 'trial') RETURNING id`
  );
  orgBId = orgBRes.rows[0].id;

  const wsARes = await adminClient.query(
    `INSERT INTO workspaces (org_id, name, slug, created_by) VALUES ($1, 'Workspace Alpha', 'ws-alpha-test', $2) RETURNING id`,
    [orgAId, testUserId]
  );
  workspaceAId = wsARes.rows[0].id;

  const wsBRes = await adminClient.query(
    `INSERT INTO workspaces (org_id, name, slug, created_by) VALUES ($1, 'Workspace Beta', 'ws-beta-test', $2) RETURNING id`,
    [orgBId, testUserId]
  );
  workspaceBId = wsBRes.rows[0].id;

  const projARes = await adminClient.query(
    `INSERT INTO projects (workspace_id, org_id, name) VALUES ($1, $2, 'Project Alpha') RETURNING id`,
    [workspaceAId, orgAId]
  );
  orgAProjectId = projARes.rows[0].id;

  const projBRes = await adminClient.query(
    `INSERT INTO projects (workspace_id, org_id, name) VALUES ($1, $2, 'Project Beta') RETURNING id`,
    [workspaceBId, orgBId]
  );
  orgBProjectId = projBRes.rows[0].id;
});

afterEach(async () => {
  if (!runRlsTests || !adminClient) return;

  await adminClient.query(`DELETE FROM projects WHERE name IN ('Project Alpha', 'Project Beta')`);
  await adminClient.query(`DELETE FROM workspaces WHERE slug LIKE '%-test'`);
  await adminClient.query(`DELETE FROM audit_events WHERE org_id IN (SELECT id FROM organizations WHERE slug LIKE '%-test')`);
  await adminClient.query(`DELETE FROM org_members WHERE org_id IN (SELECT id FROM organizations WHERE slug LIKE '%-test')`);
  await adminClient.query(`DELETE FROM organizations WHERE slug LIKE '%-test'`);
  await adminClient.query(`DELETE FROM users WHERE auth0_id = 'test|rls-user'`);
});

test('Org A sees only its own projects', { skip: !runRlsTests }, async () => {
  const rows = await queryAs(orgAId, 'SELECT * FROM projects');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].org_id, orgAId);
  assert.equal(rows[0].name, 'Project Alpha');
});

test('Org B sees only its own projects', { skip: !runRlsTests }, async () => {
  const rows = await queryAs(orgBId, 'SELECT * FROM projects');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].org_id, orgBId);
  assert.equal(rows[0].name, 'Project Beta');
});

test('Org A cannot read Org B project by explicit ID', { skip: !runRlsTests }, async () => {
  const rows = await queryAs(orgAId, 'SELECT * FROM projects WHERE id = $1', [orgBProjectId]);
  assert.equal(rows.length, 0);
});

test('Org B cannot read Org A project by explicit ID', { skip: !runRlsTests }, async () => {
  const rows = await queryAs(orgBId, 'SELECT * FROM projects WHERE id = $1', [orgAProjectId]);
  assert.equal(rows.length, 0);
});

test('No org context set — appClient sees zero projects', { skip: !runRlsTests }, async () => {
  const rows = await queryAs(null, 'SELECT * FROM projects');
  assert.equal(rows.length, 0);
});

test('Org A sees only its own workspaces', { skip: !runRlsTests }, async () => {
  const rows = await queryAs(orgAId, 'SELECT * FROM workspaces');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].org_id, orgAId);
});

test('Org B cannot read Org A workspace by explicit ID', { skip: !runRlsTests }, async () => {
  const rows = await queryAs(orgBId, 'SELECT * FROM workspaces WHERE id = $1', [workspaceAId]);
  assert.equal(rows.length, 0);
});

test('audit_events are scoped by org_id', { skip: !runRlsTests }, async () => {
  await adminClient.query(
    `INSERT INTO audit_events (org_id, action, entity_type) VALUES ($1, 'TEST', 'project')`,
    [orgAId]
  );

  const rows = await queryAs(orgAId, 'SELECT * FROM audit_events');
  assert.ok(rows.length >= 1);
  rows.forEach((row) => assert.equal(row.org_id, orgAId));

  const rows2 = await queryAs(orgBId, 'SELECT * FROM audit_events');
  rows2.forEach((row) => assert.equal(row.org_id, orgBId));
  assert.equal(rows2.filter((r) => r.org_id === orgAId).length, 0, 'org_b must not see org_a audit events');
});
