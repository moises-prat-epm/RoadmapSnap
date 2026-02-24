import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getWorkflow,
  getStates,
  getMilestones,
  getStateByKey,
  getMilestoneByKey,
  getStateAfterMilestone,
  getFirstState,
  getLastState,
  getFirstMilestoneKey,
  getLastMilestoneKey,
  getCurrentStatus,
  getNextMilestone,
  getMilestoneDate,
  getNonFilterableGroups,
  isGroupNonFilterable,
  isDeliverableNonFilterable,
  getFilterableDeliverables,
} from '../../js/core/workflow.js';
import { minimalWorkflow, minimalDeliverables, minimalConfig } from '../fixtures/config.minimal.js';

const wf = minimalWorkflow;

// --- CONFIG-backed tests: set CONFIG so getWorkflow/getStates/getMilestones use minimal workflow ---
function withMinimalConfig(fn) {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = minimalConfig;
  try {
    fn();
  } finally {
    globalThis.CONFIG = prev;
  }
}

// --- getWorkflow ---
test('getWorkflow returns CONFIG.WORKFLOW when set', () => {
  withMinimalConfig(() => {
    const workflow = getWorkflow();
    assert.equal(Array.isArray(workflow), true);
    assert.equal(workflow.length, minimalWorkflow.length);
    assert.deepEqual(workflow, minimalWorkflow);
  });
});

// --- getStates ---
test('getStates returns only items with type === "state"', () => {
  withMinimalConfig(() => {
    const states = getStates();
    assert.equal(states.length, 3);
    states.forEach(s => assert.equal(s.type, 'state'));
  });
});

test('getStates returns states in workflow order', () => {
  withMinimalConfig(() => {
    const states = getStates();
    assert.equal(states[0].key, 'NS');
    assert.equal(states[1].key, 'DEV');
    assert.equal(states[2].key, 'DONE');
  });
});

test('getStates count matches expected number of states', () => {
  withMinimalConfig(() => {
    const states = getStates();
    const expectedCount = minimalWorkflow.filter(i => i.type === 'state').length;
    assert.equal(states.length, expectedCount);
  });
});

// --- getMilestones ---
test('getMilestones returns only items with type === "milestone"', () => {
  withMinimalConfig(() => {
    const milestones = getMilestones();
    assert.equal(milestones.length, 2);
    milestones.forEach(m => assert.equal(m.type, 'milestone'));
    assert.equal(milestones[0].key, 'START');
    assert.equal(milestones[1].key, 'M1');
  });
});

// --- getFirstState / getLastState ---
test('getFirstState returns the first state item', () => {
  assert.equal(getFirstState(wf).key, 'NS');
  assert.equal(getFirstState(wf).title, 'Not Started');
});

test('getLastState returns the last state item', () => {
  assert.equal(getLastState(wf).key, 'DONE');
  assert.equal(getLastState(wf).title, 'Done');
});

// --- getStateAfterMilestone ---
test('getStateAfterMilestone given milestone key START returns state immediately after it', () => {
  const state = getStateAfterMilestone('START', wf);
  assert.ok(state);
  assert.equal(state.key, 'DEV');
});

test('getStateAfterMilestone given last milestone key M1 returns last state', () => {
  const state = getStateAfterMilestone('M1', wf);
  assert.ok(state);
  assert.equal(state.key, 'DONE');
});

test('getStateAfterMilestone given unknown milestone returns null', () => {
  assert.equal(getStateAfterMilestone('UNKNOWN', wf), null);
});

// --- getCurrentStatus ---
test('getCurrentStatus: deliverable where no milestone date has passed returns first state (NS)', () => {
  const source = { milestones: { START: '01/01/2027', M1: '01/06/2027' } };
  assert.equal(getCurrentStatus(source, wf, '15/04/2026'), 'NS');
});

test('getCurrentStatus: deliverable where START passed but M1 has not returns middle state (DEV)', () => {
  const source = { milestones: { START: '01/01/2026', M1: '01/09/2026' } };
  assert.equal(getCurrentStatus(source, wf, '15/04/2026'), 'DEV');
});

test('getCurrentStatus: deliverable where all milestone dates have passed returns last state (DONE)', () => {
  const source = { milestones: { START: '01/01/2026', M1: '01/02/2026' } };
  assert.equal(getCurrentStatus(source, wf, '01/06/2026'), 'DONE');
});

test('getCurrentStatus: deliverable with no milestones object returns first state and does not throw', () => {
  const source = { name: 'No milestones' };
  assert.doesNotThrow(() => getCurrentStatus(source, wf, '15/04/2026'));
  assert.equal(getCurrentStatus(source, wf, '15/04/2026'), 'NS');
});

test('getCurrentStatus: today exactly on a milestone date returns the state AFTER that milestone', () => {
  const source = { milestones: { START: '01/01/2026', M1: '01/06/2026' } };
  assert.equal(getCurrentStatus(source, wf, '01/06/2026'), 'DONE');
});

test('getCurrentStatus: today exactly on START returns DEV', () => {
  const source = { milestones: { START: '15/04/2026', M1: '01/12/2026' } };
  assert.equal(getCurrentStatus(source, wf, '15/04/2026'), 'DEV');
});

// --- getStateByKey / getMilestoneByKey ---
test('getStateByKey returns state when key exists', () => {
  withMinimalConfig(() => {
    const state = getStateByKey('DEV');
    assert.ok(state);
    assert.equal(state.key, 'DEV');
    assert.equal(state.title, 'In Development');
  });
});

test('getStateByKey returns null for unknown key', () => {
  withMinimalConfig(() => {
    assert.equal(getStateByKey('UNKNOWN'), null);
  });
});

test('getMilestoneByKey returns milestone when key exists', () => {
  withMinimalConfig(() => {
    const m = getMilestoneByKey('M1');
    assert.ok(m);
    assert.equal(m.key, 'M1');
  });
});

test('getMilestoneByKey returns null for unknown key', () => {
  withMinimalConfig(() => {
    assert.equal(getMilestoneByKey('UNKNOWN'), null);
  });
});

// --- getFirstMilestoneKey / getLastMilestoneKey ---
test('getFirstMilestoneKey returns first milestone key', () => {
  withMinimalConfig(() => {
    assert.equal(getFirstMilestoneKey(), 'START');
  });
});

test('getLastMilestoneKey returns last milestone key', () => {
  withMinimalConfig(() => {
    assert.equal(getLastMilestoneKey(), 'M1');
  });
});

// --- getMilestoneDate ---
test('getMilestoneDate returns correct date from milestones object', () => {
  const source = { milestones: { START: '01/01/2026', M1: '15/03/2026' } };
  assert.equal(getMilestoneDate(source, 'M1'), '15/03/2026');
});

test('getMilestoneDate falls back to source.startDate for START key', () => {
  const source = { startDate: '01/01/2026', milestones: {} };
  assert.equal(getMilestoneDate(source, 'START'), '01/01/2026');
});

test('getMilestoneDate returns null for missing milestone key', () => {
  const source = { milestones: { START: '01/01/2026' } };
  assert.equal(getMilestoneDate(source, 'M1'), null);
});

// --- getNextMilestone ---
test('getNextMilestone returns null when all milestones have passed', () => {
  const source = { milestones: { START: '01/01/2026', M1: '01/02/2026' } };
  assert.equal(getNextMilestone(source, wf, '01/06/2026'), null);
});

test('getNextMilestone returns first future milestone when START has passed', () => {
  const source = { milestones: { START: '01/01/2026', M1: '01/12/2026' } };
  const next = getNextMilestone(source, wf, '01/06/2026');
  assert.ok(next);
  assert.equal(next.key, 'M1');
});

test('getNextMilestone returns START when no milestones have passed', () => {
  const source = { milestones: { START: '01/06/2026', M1: '01/12/2026' } };
  const next = getNextMilestone(source, wf, '01/01/2026');
  assert.ok(next);
  assert.equal(next.key, 'START');
});

// --- getNonFilterableGroups / isGroupNonFilterable / isDeliverableNonFilterable / getFilterableDeliverables ---
test('getNonFilterableGroups returns empty array when CONFIG.NON_FILTERABLE_GROUPS not set', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { WORKFLOW: minimalWorkflow, DELIVERABLES: minimalDeliverables };
  try {
    assert.deepEqual(getNonFilterableGroups(), []);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('getNonFilterableGroups returns CONFIG.NON_FILTERABLE_GROUPS when set', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { ...minimalConfig, NON_FILTERABLE_GROUPS: ['Infrastructure'] };
  try {
    assert.deepEqual(getNonFilterableGroups(), ['Infrastructure']);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('isGroupNonFilterable returns true for group in NON_FILTERABLE_GROUPS', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { ...minimalConfig, NON_FILTERABLE_GROUPS: ['Infrastructure'] };
  try {
    assert.equal(isGroupNonFilterable('Infrastructure'), true);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('isGroupNonFilterable returns false for group not in list', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { ...minimalConfig, NON_FILTERABLE_GROUPS: ['Infrastructure'] };
  try {
    assert.equal(isGroupNonFilterable('Group A'), false);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('isDeliverableNonFilterable returns true when source.group is non-filterable', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { ...minimalConfig, NON_FILTERABLE_GROUPS: ['Infrastructure'] };
  try {
    assert.equal(isDeliverableNonFilterable({ group: 'Infrastructure' }), true);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('isDeliverableNonFilterable returns falsy when source has no group', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { ...minimalConfig, NON_FILTERABLE_GROUPS: ['Infrastructure'] };
  try {
    assert.ok(!isDeliverableNonFilterable({ name: 'Task' }));
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('getFilterableDeliverables excludes deliverables in NON_FILTERABLE_GROUPS', () => {
  const prev = globalThis.CONFIG;
  const deliverables = [
    ...minimalDeliverables,
    { name: 'Infra Task', group: 'Infrastructure', milestones: { START: '01/01/2026', M1: '01/06/2026' } },
  ];
  globalThis.CONFIG = { ...minimalConfig, DELIVERABLES: deliverables, NON_FILTERABLE_GROUPS: ['Infrastructure'] };
  try {
    const filterable = getFilterableDeliverables();
    assert.equal(filterable.length, 3);
    assert.equal(filterable.some(d => d.name === 'Infra Task'), false);
  } finally {
    globalThis.CONFIG = prev;
  }
});
