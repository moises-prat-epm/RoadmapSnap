import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getInboundDependencies, getOutboundDependencies,
         getDependencyType, getDependencyGraph,
         normalizeDependency } from '../../js/core/dependencies.js';
import { minimalDeliverables } from '../fixtures/config.minimal.js';

const alpha = minimalDeliverables[0]; // no deps
const beta  = minimalDeliverables[1]; // depends on Alpha
const gamma = minimalDeliverables[2]; // no deps, hidden

// 1. Empty deps returns empty array
test('getInboundDependencies returns [] for source with no dependencies', () => {
  assert.deepEqual(getInboundDependencies(alpha), []);
});

// 2. String dep normalized to object
test('normalizeDependency converts string to object', () => {
  const result = normalizeDependency('Task Alpha');
  assert.deepEqual(result, { task: 'Task Alpha', from: null, to: null });
});

// 3. Object dep normalized correctly
test('normalizeDependency passes through object with from/to', () => {
  const result = normalizeDependency({ task: 'Task Alpha', from: 'M1', to: 'START' });
  assert.deepEqual(result, { task: 'Task Alpha', from: 'M1', to: 'START' });
});

// 4. Inbound deps for Beta contains Alpha
test('getInboundDependencies finds Alpha as inbound dep of Beta', () => {
  const deps = getInboundDependencies(beta);
  assert.equal(deps.length, 1);
  assert.equal(deps[0].task, 'Task Alpha');
});

// 5. Outbound deps for Alpha contains Beta
test('getOutboundDependencies finds Beta as outbound dep of Alpha', () => {
  const deps = getOutboundDependencies(alpha, minimalDeliverables);
  assert.equal(deps.length, 1);
  assert.equal(deps[0].task, 'Task Beta');
});

// 6. getDependencyType for Beta is 'inbound'
test('getDependencyType returns inbound for Beta', () => {
  assert.equal(getDependencyType(beta, minimalDeliverables), 'inbound');
});

// 7. getDependencyType for Alpha is 'outbound'
test('getDependencyType returns outbound for Alpha', () => {
  assert.equal(getDependencyType(alpha, minimalDeliverables), 'outbound');
});

// 8. getDependencyType for Gamma is 'none'
test('getDependencyType returns none for Gamma', () => {
  assert.equal(getDependencyType(gamma, minimalDeliverables), 'none');
});

// 9. Circular dependency does NOT infinite loop
test('getDependencyGraph handles circular dependencies without hanging', () => {
  const circular = [
    { name: 'A', dependencies: ['B'], milestones: { START: '01/01/2026' } },
    { name: 'B', dependencies: ['A'], milestones: { START: '01/01/2026' } },
  ];
  // This must complete within the test timeout (no infinite loop)
  const graph = getDependencyGraph('A', circular);
  assert.ok(graph.nodes.includes('A'));
  assert.ok(graph.nodes.includes('B'));
});
