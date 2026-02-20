import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCurrentStatus, getMilestoneDate, getFirstState,
         getLastState, getNextMilestone } from '../../js/core/workflow.js';
import { minimalWorkflow, minimalDeliverables } from '../fixtures/config.minimal.js';

const wf = minimalWorkflow;

// 1. Returns first state when no milestones have passed
test('getCurrentStatus returns NS when no milestones have passed', () => {
  const source = { milestones: { START: '01/01/2099', M1: '01/06/2099' } };
  assert.equal(getCurrentStatus(source, wf, '01/01/2024'), 'NS');
});

// 2. Returns DEV after START passes but before M1
test('getCurrentStatus returns DEV after START passes', () => {
  const source = { milestones: { START: '01/01/2026', M1: '01/12/2099' } };
  assert.equal(getCurrentStatus(source, wf, '15/06/2026'), 'DEV');
});

// 3. Returns last state when all milestones have passed
test('getCurrentStatus returns DONE when all milestones passed', () => {
  const source = { milestones: { START: '01/01/2026', M1: '01/02/2026' } };
  assert.equal(getCurrentStatus(source, wf, '01/06/2026'), 'DONE');
});

// 4. getMilestoneDate reads from milestones object
test('getMilestoneDate returns correct date from milestones', () => {
  const source = { milestones: { START: '01/01/2026', M1: '15/03/2026' } };
  assert.equal(getMilestoneDate(source, 'M1'), '15/03/2026');
});

// 5. getMilestoneDate falls back to legacy startDate
test('getMilestoneDate falls back to source.startDate for START key', () => {
  const source = { startDate: '01/01/2026', milestones: {} };
  assert.equal(getMilestoneDate(source, 'START'), '01/01/2026');
});

// 6. getFirstState returns the first state
test('getFirstState returns NS', () => {
  assert.equal(getFirstState(wf).key, 'NS');
});

// 7. getLastState returns the last state
test('getLastState returns DONE', () => {
  assert.equal(getLastState(wf).key, 'DONE');
});

// 8. getNextMilestone returns null when all milestones passed
test('getNextMilestone returns null when all milestones have passed', () => {
  const source = { milestones: { START: '01/01/2026', M1: '01/02/2026' } };
  assert.equal(getNextMilestone(source, wf, '01/06/2026'), null);
});

// 9. getNextMilestone returns the first future milestone
test('getNextMilestone returns M1 when START has passed', () => {
  const source = { milestones: { START: '01/01/2026', M1: '01/12/2026' } };
  const next = getNextMilestone(source, wf, '01/06/2026');
  assert.equal(next.key, 'M1');
});
