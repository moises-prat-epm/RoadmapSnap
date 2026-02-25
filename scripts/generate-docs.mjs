/**
 * Generate docs/config-reference.md from schema/config.schema.json.
 * Run: node scripts/generate-docs.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const schemaPath = join(projectRoot, 'schema', 'config.schema.json');
const outPath = join(projectRoot, 'docs', 'config-reference.md');

function getType(schema) {
  if (!schema) return '—';
  if (schema.type) return schema.type;
  if (schema.oneOf) {
    const types = schema.oneOf.map(s => getType(s));
    const unique = [...new Set(types)];
    return unique.length === 1 ? unique[0] : unique.join(' or ');
  }
  if (schema.const !== undefined) return `"${schema.const}"`;
  return '—';
}

function getDescription(schema) {
  if (!schema || !schema.description) return '';
  return schema.description;
}

function getDefault(schema) {
  if (!schema || schema.default === undefined) return '';
  return String(JSON.stringify(schema.default));
}

function buildQuickStart() {
  return `\`\`\`javascript
const CONFIG = {
  TIMELINE: { TODAY: '15/04/2026', START_MONTH: '01/2026', END_MONTH: '12/2026' },
  WORKFLOW: [
    { type: 'state', key: 'NS', short: 'NS', title: 'Not Started', description: '' },
    { type: 'milestone', key: 'START', short: 'GO', title: 'Start' },
    { type: 'state', key: 'DEV', short: 'DEV', title: 'In Development', description: '' },
    { type: 'milestone', key: 'M1', short: 'M1', title: 'Done' },
    { type: 'state', key: 'DONE', short: 'DONE', title: 'Done', description: '' },
  ],
  DELIVERABLES: [
    { name: 'Task Alpha', atRisk: false, showInTimeline: true, group: 'Group A', milestones: { START: '01/01/2026', M1: '01/06/2026' } },
    { name: 'Task Beta', atRisk: true, showInTimeline: true, group: 'Group A', dependencies: ['Task Alpha'], milestones: { START: '01/03/2026', M1: '01/09/2026' } },
    { name: 'Task Gamma', atRisk: false, showInTimeline: false, milestones: { START: '01/06/2026', M1: '01/12/2026' } },
  ],
};
\`\`\`
`;
}

function sectionTopLevel(name, schema, required) {
  const req = required ? 'Required' : 'Optional';
  const type = getType(schema);
  const desc = getDescription(schema);
  let body = `| | |\n| --- | --- |\n| **Type** | ${type} |\n| **Required** | ${req} |\n`;
  if (desc) body += `| **Description** | ${desc} |\n`;
  return `## ${name}\n\n${body}\n`;
}

function sectionTimeline(schema, required) {
  const req = required ? 'Required' : 'Optional';
  const desc = getDescription(schema) || 'Timeline range and current date.';
  let body = `| | |\n| --- | --- |\n| **Type** | object |\n| **Required** | ${req} |\n| **Description** | ${desc} |\n\n`;
  if (schema.properties) {
    body += '### TIMELINE properties\n\n| Property | Type | Required | Description |\n| --- | --- | --- | --- |\n';
    const props = schema.properties;
    const reqList = schema.required || [];
    for (const [key, val] of Object.entries(props)) {
      const r = reqList.includes(key) ? 'Yes' : 'Optional';
      const d = getDescription(val) || '';
      const t = getType(val);
      body += `| \`${key}\` | ${t} | ${r} | ${d} |\n`;
    }
    body += '\n';
  }
  return `## TIMELINE\n\n${body}`;
}

function sectionWorkflow(schema, required) {
  const req = required ? 'Required' : 'Optional';
  const desc = getDescription(schema) || 'Alternating state and milestone items. Index 0,2,4,... must be state; 1,3,5,... must be milestone. Last item must be a state.';
  let body = `| | |\n| --- | --- |\n| **Type** | array (min 3 items) |\n| **Required** | ${req} |\n| **Description** | ${desc} |\n\n`;
  const items = schema.items;
  if (items && items.oneOf && items.oneOf.length >= 2) {
    const stateSchema = items.oneOf.find(s => s.properties && s.properties.type && s.properties.type.const === 'state');
    const milestoneSchema = items.oneOf.find(s => s.properties && s.properties.type && s.properties.type.const === 'milestone');
    const stateProps = stateSchema ? stateSchema.properties || {} : {};
    const milestoneProps = milestoneSchema ? milestoneSchema.properties || {} : {};
    const allKeys = new Set([...Object.keys(stateProps), ...Object.keys(milestoneProps)]);
    body += '### WORKFLOW item properties (state vs milestone)\n\n| Property | State | Milestone | Description |\n| --- | --- | --- | --- |\n';
    for (const key of [...allKeys].sort()) {
      const inState = key in stateProps ? '✓' : '—';
      const inMilestone = key in milestoneProps ? '✓' : '—';
      const s = stateProps[key] || milestoneProps[key];
      const d = getDescription(s) || '';
      body += `| \`${key}\` | ${inState} | ${inMilestone} | ${d} |\n`;
    }
    body += '\n';
  }
  return `## WORKFLOW\n\n${body}`;
}

function sectionDeliverables(schema, required) {
  const req = required ? 'Required' : 'Optional';
  const desc = getDescription(schema) || 'List of deliverables. Names must be unique. First milestone key from WORKFLOW must appear in each milestones object.';
  let body = `| | |\n| --- | --- |\n| **Type** | array (min 1 item) |\n| **Required** | ${req} |\n| **Description** | ${desc} |\n\n`;
  const items = schema.items;
  if (items && items.properties) {
    const props = items.properties;
    const reqList = items.required || [];
    body += '### DELIVERABLES item properties\n\n| Property | Type | Required | Description | Default |\n| --- | --- | --- | --- | --- |\n';
    for (const [key, val] of Object.entries(props)) {
      const r = reqList.includes(key) ? 'Yes' : 'Optional';
      const d = getDescription(val) || '';
      const t = getType(val);
      const def = getDefault(val);
      body += `| \`${key}\` | ${t} | ${r} | ${d} | ${def || '—'} |\n`;
    }
    body += '\n';
  }
  return `## DELIVERABLES\n\n${body}`;
}

function sectionNestedObject(name, schema, required) {
  const req = required ? 'Required' : 'Optional';
  const type = getType(schema);
  const desc = getDescription(schema);
  let body = `| | |\n| --- | --- |\n| **Type** | ${type} |\n| **Required** | ${req} |\n`;
  if (desc) body += `| **Description** | ${desc} |\n`;
  if (schema.properties) {
    body += '\n### Properties\n\n| Property | Type | Description |\n| --- | --- | --- |\n';
    for (const [key, val] of Object.entries(schema.properties)) {
      const d = getDescription(val) || '';
      const t = getType(val);
      body += `| \`${key}\` | ${t} | ${d} |\n`;
    }
    body += '\n';
  }
  return `## ${name}\n\n${body}`;
}

function main() {
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
  const required = new Set(schema.required || []);
  const props = schema.properties || {};
  const order = ['VERSION', 'BUILD_DATE', 'TIMELINE', 'WORKFLOW', 'ENTITY_LABELS', 'DASHBOARD_TEXT', 'NON_FILTERABLE_GROUPS', 'GROUP_ORDER', 'DELIVERABLES'];

  let md = `# RoadmapSnap Configuration Reference

Auto-generated from \`schema/config.schema.json\` — do not edit manually.

---

## Quick Start

Minimal valid config (copy and adapt):

${buildQuickStart()}

---

`;

  for (const name of order) {
    const s = props[name];
    if (!s) continue;
    const req = required.has(name);
    if (name === 'TIMELINE') {
      md += sectionTimeline(s, req);
    } else if (name === 'WORKFLOW') {
      md += sectionWorkflow(s, req);
    } else if (name === 'DELIVERABLES') {
      md += sectionDeliverables(s, req);
    } else if (s.properties && !s.items) {
      md += sectionNestedObject(name, s, req);
    } else {
      md += sectionTopLevel(name, s, req);
    }
  }

  mkdirSync(join(projectRoot, 'docs'), { recursive: true });
  writeFileSync(outPath, md, 'utf8');
  console.log('Generated docs/config-reference.md');
}

main();
