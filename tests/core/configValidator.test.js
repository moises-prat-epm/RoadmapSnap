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
