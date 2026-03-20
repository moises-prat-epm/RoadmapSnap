import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDependencyColorForDates } from '../../js/core/dependencies.js';
import { getCurrentStatus } from '../../js/core/workflow.js';

const TODAY = '20/02/2026';
const WORKFLOW = [
  { type: 'state', key: 'NS', short: 'NS', title: 'Not Started' },
  { type: 'milestone', key: 'START', short: 'START', title: 'Start' },
  { type: 'state', key: 'DEV', short: 'DEV', title: 'In Development' },
  { type: 'milestone', key: 'M1', short: 'M1', title: 'Milestone 1' },
  { type: 'state', key: 'DONE', short: 'DONE', title: 'Done' },
];

function colorFromDependencyEdge(fromSource, toSource, dep, todayStr = TODAY) {
  const fromKey = dep.from || 'M3';
  const toKey = dep.to || 'START';
  const fromDate = fromSource.milestones?.[fromKey] || null;
  const toDate = toSource.milestones?.[toKey] || null;
  return getDependencyColorForDates(fromDate, toDate, todayStr);
}

test('green: finished dependency milestone (before today)', () => {
  assert.equal(getDependencyColorForDates('19/02/2026', '28/02/2026', TODAY), 'green');
});

test('green: finished dependency milestone (exactly today)', () => {
  assert.equal(getDependencyColorForDates('20/02/2026', '25/02/2026', TODAY), 'green');
});

test('green precedence: finished dependency stays green even if from > to', () => {
  assert.equal(getDependencyColorForDates('10/02/2026', '05/02/2026', TODAY), 'green');
});

test('orange: non-finished dependency with 1 day buffer', () => {
  assert.equal(getDependencyColorForDates('21/02/2026', '22/02/2026', TODAY), 'orange');
});

test('orange: non-finished dependency with 5 days buffer', () => {
  assert.equal(getDependencyColorForDates('21/02/2026', '26/02/2026', TODAY), 'orange');
});

test('orange: non-finished dependency with exactly 10 days buffer', () => {
  assert.equal(getDependencyColorForDates('21/02/2026', '03/03/2026', TODAY), 'orange');
});

test('green: non-finished dependency with 11 days buffer', () => {
  assert.equal(getDependencyColorForDates('21/02/2026', '04/03/2026', TODAY), 'green');
});

test('green: non-finished dependency with large buffer', () => {
  assert.equal(getDependencyColorForDates('01/03/2026', '30/04/2026', TODAY), 'green');
});

test('red: non-finished dependency behind schedule by 1 day', () => {
  assert.equal(getDependencyColorForDates('25/02/2026', '24/02/2026', TODAY), 'red');
});

test('red: non-finished dependency behind schedule by many days', () => {
  assert.equal(getDependencyColorForDates('10/03/2026', '20/02/2026', TODAY), 'red');
});

test('orange: non-finished dependency and target same day (0 days)', () => {
  assert.equal(getDependencyColorForDates('25/02/2026', '25/02/2026', TODAY), 'orange');
});

test('green: finished dependency and target same day in past', () => {
  assert.equal(getDependencyColorForDates('10/02/2026', '10/02/2026', TODAY), 'green');
});

test('green: null/invalid today still resolves by schedule rules (>10 days)', () => {
  assert.equal(getDependencyColorForDates('25/02/2026', '15/03/2026', null), 'green');
});

test('orange: null/invalid today still resolves by schedule rules (<=10 days)', () => {
  assert.equal(getDependencyColorForDates('25/02/2026', '03/03/2026', undefined), 'orange');
});

test('green fallback: missing dates return green', () => {
  assert.equal(getDependencyColorForDates('', '03/03/2026', TODAY), 'green');
  assert.equal(getDependencyColorForDates('25/02/2026', '', TODAY), 'green');
});

test('state-based: DONE source deliverable dependency renders green', () => {
  const finishedSource = {
    name: 'Finished Source',
    milestones: { START: '01/01/2026', M1: '05/02/2026' },
  };
  const target = {
    name: 'Blocked Target',
    milestones: { START: '25/02/2026', M1: '01/03/2026' },
  };
  assert.equal(getCurrentStatus(finishedSource, WORKFLOW, TODAY), 'DONE');
  assert.equal(
    colorFromDependencyEdge(finishedSource, target, { from: 'M1', to: 'START' }),
    'green'
  );
});

test('state-based: non-finished source with <=10 days to target renders orange', () => {
  const inProgressSource = {
    name: 'In Progress Source',
    milestones: { START: '19/02/2026', M1: '24/02/2026' },
  };
  const target = {
    name: 'Blocked Target',
    milestones: { START: '01/03/2026', M1: '10/03/2026' },
  };
  assert.equal(getCurrentStatus(inProgressSource, WORKFLOW, TODAY), 'DEV');
  assert.equal(
    colorFromDependencyEdge(inProgressSource, target, { from: 'M1', to: 'START' }),
    'orange'
  );
});

test('state-based: non-finished source behind target renders red', () => {
  const inProgressSource = {
    name: 'In Progress Source',
    milestones: { START: '19/02/2026', M1: '28/02/2026' },
  };
  const target = {
    name: 'Blocked Target',
    milestones: { START: '25/02/2026', M1: '10/03/2026' },
  };
  assert.equal(getCurrentStatus(inProgressSource, WORKFLOW, TODAY), 'DEV');
  assert.equal(
    colorFromDependencyEdge(inProgressSource, target, { from: 'M1', to: 'START' }),
    'red'
  );
});
