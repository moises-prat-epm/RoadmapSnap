import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig } from '../../js/core/configValidator.js';
import { minimalConfig } from '../fixtures/config.minimal.js';

// 1. Valid config produces no errors or warnings
test('valid minimal config produces no errors', () => {
  const { errors, warnings } = validateConfig(minimalConfig);
  assert.equal(errors.length, 0);
});

// 2. Missing TIMELINE produces error
test('missing TIMELINE produces error containing "TIMELINE"', () => {
  const { errors } = validateConfig({ ...minimalConfig, TIMELINE: undefined });
  assert.ok(errors.some(e => e.includes('TIMELINE')));
});

// 3. Missing WORKFLOW produces error
test('missing WORKFLOW produces error', () => {
  const { errors } = validateConfig({ ...minimalConfig, WORKFLOW: undefined });
  assert.ok(errors.some(e => e.includes('WORKFLOW')));
});

// 4. Wrong workflow alternation produces error
test('consecutive state items in WORKFLOW produce error', () => {
  const badWorkflow = [
    { type: 'state', key: 'NS', short: 'NS', title: 'Not Started' },
    { type: 'state', key: 'DEV', short: 'DEV', title: 'Dev' }, // two states in a row
    { type: 'milestone', key: 'M1', short: 'M1', title: 'Done', color: '#000' },
    { type: 'state', key: 'DONE', short: 'DONE', title: 'Done' },
  ];
  const { errors } = validateConfig({ ...minimalConfig, WORKFLOW: badWorkflow });
  assert.ok(errors.length > 0);
});

// 5. Duplicate deliverable names produce error
test('duplicate deliverable names produce error containing "Duplicate"', () => {
  const duped = [
    { name: 'Task Alpha', milestones: { START: '01/01/2026' } },
    { name: 'Task Alpha', milestones: { START: '01/02/2026' } },
  ];
  const { errors } = validateConfig({ ...minimalConfig, DELIVERABLES: duped });
  assert.ok(errors.some(e => e.toLowerCase().includes('duplicate')));
});

// 6. Unknown dependency target produces warning (not error)
test('dependency referencing unknown task produces warning not error', () => {
  const withBadDep = [
    { name: 'Task A', dependencies: ['Ghost Task'],
      milestones: { START: '01/01/2026', M1: '01/06/2026' } }
  ];
  const { errors, warnings } = validateConfig({ ...minimalConfig, DELIVERABLES: withBadDep });
  assert.equal(errors.length, 0);
  assert.ok(warnings.some(w => w.includes('Ghost Task')));
});

// 7. Invalid date format produces warning
test('invalid milestone date format produces warning', () => {
  const badDate = [
    { name: 'Task A', milestones: { START: '2026-01-15', M1: '2026-06-01' } }
  ];
  const { warnings } = validateConfig({ ...minimalConfig, DELIVERABLES: badDate });
  assert.ok(warnings.length > 0);
});

// 8. Invalid TIMELINE.TODAY format produces warning
test('invalid TIMELINE.TODAY format produces warning', () => {
  const { warnings } = validateConfig({
    ...minimalConfig,
    TIMELINE: { ...minimalConfig.TIMELINE, TODAY: '2026-04-15' }
  });
  assert.ok(warnings.some(w => w.includes('TODAY')));
});

// 9. Empty DELIVERABLES produces error
test('empty DELIVERABLES array produces error', () => {
  const { errors } = validateConfig({ ...minimalConfig, DELIVERABLES: [] });
  assert.ok(errors.length > 0);
});

// 10. Multiple issues produce multiple errors simultaneously
test('multiple config issues produce multiple errors', () => {
  const { errors } = validateConfig({
    TIMELINE: undefined,
    WORKFLOW: undefined,
    DELIVERABLES: []
  });
  assert.ok(errors.length >= 3);
});

// --- Workflow edge cases ---
test('workflow with only 3 items (state-milestone-state) produces no errors', () => {
  const minimalWorkflow3 = [
    { type: 'state', key: 'NS', short: 'NS', title: 'Not Started' },
    { type: 'milestone', key: 'START', short: 'GO', title: 'Start' },
    { type: 'state', key: 'DONE', short: 'DONE', title: 'Done' },
  ];
  const config = { ...minimalConfig, WORKFLOW: minimalWorkflow3 };
  const { errors } = validateConfig(config);
  assert.equal(errors.length, 0);
});

test('workflow where the last item is a milestone (not a state) produces an error', () => {
  const workflowEndsWithMilestone = [
    { type: 'state', key: 'NS', short: 'NS', title: 'Not Started' },
    { type: 'milestone', key: 'START', short: 'GO', title: 'Start' },
    { type: 'state', key: 'DEV', short: 'DEV', title: 'Dev' },
    { type: 'milestone', key: 'M1', short: 'M1', title: 'Done' },
  ];
  const config = { ...minimalConfig, WORKFLOW: workflowEndsWithMilestone };
  const { errors } = validateConfig(config);
  assert.ok(errors.some(e => e.includes('end with a state') || e.includes('last')));
});

test('workflow item missing the "key" property produces an error', () => {
  const workflowMissingKey = [
    { type: 'state', short: 'NS', title: 'Not Started' },
    { type: 'milestone', key: 'START', short: 'GO', title: 'Start' },
    { type: 'state', key: 'DONE', short: 'DONE', title: 'Done' },
  ];
  const config = { ...minimalConfig, WORKFLOW: workflowMissingKey };
  const { errors } = validateConfig(config);
  assert.ok(errors.some(e => e.includes('key') && e.includes('index')));
});

// --- Deliverable edge cases ---
test('deliverable with an empty milestones object produces an error about the first milestone key', () => {
  const withEmptyMilestones = [
    { name: 'Task A', milestones: {} },
  ];
  const config = { ...minimalConfig, DELIVERABLES: withEmptyMilestones };
  const { errors } = validateConfig(config);
  assert.ok(errors.some(e => e.includes('first milestone') || e.includes('START')));
});

test('deliverable with a valid link URL produces no error', () => {
  const withLink = [
    { name: 'Task A', link: 'https://example.com/page', milestones: { START: '01/01/2026', M1: '01/06/2026' } },
  ];
  const config = { ...minimalConfig, DELIVERABLES: withLink };
  const { errors } = validateConfig(config);
  assert.equal(errors.length, 0);
});

test('deliverable with dependencies as array of objects with task/from/to produces no error', () => {
  const withObjDeps = [
    { name: 'Task A', milestones: { START: '01/01/2026', M1: '01/06/2026' } },
    { name: 'Task B', dependencies: [{ task: 'Task A', from: 'START', to: 'M1' }], milestones: { START: '01/03/2026', M1: '01/09/2026' } },
  ];
  const config = { ...minimalConfig, DELIVERABLES: withObjDeps };
  const { errors } = validateConfig(config);
  assert.equal(errors.length, 0);
});

test('deliverable where showInTimeline is missing (undefined) produces no error', () => {
  const noShowInTimeline = [
    { name: 'Task A', milestones: { START: '01/01/2026', M1: '01/06/2026' } },
  ];
  const config = { ...minimalConfig, DELIVERABLES: noShowInTimeline };
  const { errors } = validateConfig(config);
  assert.equal(errors.length, 0);
});

test('deliverable with empty name produces error', () => {
  const config = { ...minimalConfig, DELIVERABLES: [{ name: '  ', milestones: { START: '01/01/2026', M1: '01/06/2026' } }] };
  const { errors } = validateConfig(config);
  assert.ok(errors.some(e => e.includes('name')));
});

// --- TIMELINE edge cases ---
test('START_MONTH after END_MONTH produces a warning', () => {
  const config = {
    ...minimalConfig,
    TIMELINE: { ...minimalConfig.TIMELINE, START_MONTH: '12/2026', END_MONTH: '01/2026' },
  };
  const { errors, warnings } = validateConfig(config);
  assert.equal(errors.length, 0);
  assert.ok(warnings.some(w => w.includes('START_MONTH') && w.includes('END_MONTH')));
});

test('TODAY set to an invalid date format produces a warning', () => {
  const config = { ...minimalConfig, TIMELINE: { ...minimalConfig.TIMELINE, TODAY: '2026-04-15' } };
  const { warnings } = validateConfig(config);
  assert.ok(warnings.some(w => w.includes('TODAY') || w.includes('DD/MM/YYYY')));
});

test('empty TODAY string is valid (auto-detect mode)', () => {
  const config = { ...minimalConfig, TIMELINE: { ...minimalConfig.TIMELINE, TODAY: '' } };
  const { errors, warnings } = validateConfig(config);
  assert.equal(errors.length, 0);
  const todayWarnings = warnings.filter(w => w.includes('TODAY'));
  assert.equal(todayWarnings.length, 0);
});

test('TODAY null is valid (auto-detect)', () => {
  const config = { ...minimalConfig, TIMELINE: { ...minimalConfig.TIMELINE, TODAY: null } };
  const { errors, warnings } = validateConfig(config);
  assert.equal(errors.length, 0);
  const todayWarnings = warnings.filter(w => w.includes('TODAY'));
  assert.equal(todayWarnings.length, 0);
});

// --- GROUP_ORDER edge cases ---
test('GROUP_ORDER containing a group name not present in any deliverable produces a warning', () => {
  const config = {
    ...minimalConfig,
    GROUP_ORDER: ['Group A', 'NonExistentGroup', 'Group B'],
  };
  const { errors, warnings } = validateConfig(config);
  assert.equal(errors.length, 0);
  assert.ok(warnings.some(w => w.includes('GROUP_ORDER') && w.includes('NonExistentGroup')));
});

test('empty GROUP_ORDER array is valid', () => {
  const config = { ...minimalConfig, GROUP_ORDER: [] };
  const { errors, warnings } = validateConfig(config);
  assert.equal(errors.length, 0);
  const groupWarnings = warnings.filter(w => w.includes('GROUP_ORDER'));
  assert.equal(groupWarnings.length, 0);
});

test('GROUP_ORDER undefined is valid', () => {
  const config = { ...minimalConfig };
  const { errors } = validateConfig(config);
  assert.equal(errors.length, 0);
});

test('deliverable with milestones as null produces error', () => {
  const config = { ...minimalConfig, DELIVERABLES: [{ name: 'Task A', milestones: null }] };
  const { errors } = validateConfig(config);
  assert.ok(errors.some(e => e.includes('milestones')));
});

test('workflow with fewer than 3 items produces an error', () => {
  const shortWorkflow = [
    { type: 'state', key: 'NS', short: 'NS', title: 'Not Started' },
    { type: 'milestone', key: 'START', short: 'GO', title: 'Start' },
  ];
  const config = { ...minimalConfig, WORKFLOW: shortWorkflow };
  const { errors } = validateConfig(config);
  assert.ok(errors.some(e => e.includes('at least 3') || e.includes('WORKFLOW')));
});
