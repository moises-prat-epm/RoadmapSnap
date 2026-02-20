import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateStats } from '../../js/core/stats.js';
import { minimalWorkflow, minimalDeliverables } from '../fixtures/config.minimal.js';

// 1. State counts correct with known today date
test('calculateStats counts DEV state correctly', () => {
  // TODAY = 15/04/2026: Alpha START=01/01 (past), M1=01/06 (future) → DEV
  //                     Beta  START=01/03 (past), M1=01/09 (future) → DEV
  //                     Gamma showInTimeline:false but still counted
  const stats = calculateStats(minimalDeliverables, minimalWorkflow, '15/04/2026');
  assert.equal(stats.total, 3);
  assert.ok(stats.DEV >= 2);
});

// 2. atRisk counted correctly
test('calculateStats counts atRisk items correctly', () => {
  const stats = calculateStats(minimalDeliverables, minimalWorkflow, '15/04/2026');
  assert.equal(stats.atRisk, 1); // only Beta is atRisk
});

// 3. 0% completion when nothing in final state
test('calculateStats completionPercentage is 0 when nothing done', () => {
  const stats = calculateStats(minimalDeliverables, minimalWorkflow, '01/01/2025');
  assert.equal(stats.completionPercentage, 0);
});

// 4. 100% completion when all in final state
test('calculateStats completionPercentage is 100 when all done', () => {
  const allDone = minimalDeliverables.map(d => ({
    ...d, milestones: { START: '01/01/2025', M1: '01/02/2025' }
  }));
  const stats = calculateStats(allDone, minimalWorkflow, '01/06/2026');
  assert.equal(stats.completionPercentage, 100);
});

// 5. NON_FILTERABLE_GROUPS excluded from counts
test('calculateStats excludes non-filterable groups from totals', () => {
  const withInfra = [
    ...minimalDeliverables,
    { name: 'Infra Task', group: 'Infrastructure', showInTimeline: true,
      milestones: { START: '01/01/2026', M1: '01/06/2026' } }
  ];
  const config = { NON_FILTERABLE_GROUPS: ['Infrastructure'] };
  const stats = calculateStats(withInfra, minimalWorkflow, '15/04/2026', config);
  assert.equal(stats.total, 3); // Infra Task excluded
});

// 6. Empty DELIVERABLES array does not throw
test('calculateStats handles empty deliverables without throwing', () => {
  assert.doesNotThrow(() => calculateStats([], minimalWorkflow, '15/04/2026'));
});
