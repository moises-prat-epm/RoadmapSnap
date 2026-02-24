import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// AppState uses localStorage (theme) and assigns to window; provide mocks so the module loads in Node
globalThis.window = globalThis.window || {};
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
const { default: AppState } = await import('../../js/state/appState.js');

const EXPECTED_DEFAULT_KEYS = [
  'filter',
  'sort',
  'zoom',
  'showGantt',
  'groupCollapsed',
  'activeDependencyGraph',
  'theme',
  'timelineStart',
  'timelineEnd',
];

beforeEach(() => {
  AppState.reset();
});

// --- Initial state ---
test('AppState.get() returns an object with expected default keys', () => {
  const state = AppState.get();
  assert.equal(typeof state, 'object');
  EXPECTED_DEFAULT_KEYS.forEach(key => {
    assert.ok(Object.prototype.hasOwnProperty.call(state, key), `missing key: ${key}`);
  });
  assert.equal(Object.keys(state).length, EXPECTED_DEFAULT_KEYS.length);
});

test('filter.status is "ALL" by default', () => {
  const state = AppState.get();
  assert.equal(state.filter.status, 'ALL');
});

test('theme is "light" by default when localStorage returns null', () => {
  const state = AppState.get();
  assert.equal(state.theme, 'light');
});

// --- AppState.set() ---
test('set() merging partial state: set({ zoom: "3mo" }) updates zoom without touching other keys', () => {
  const before = AppState.get();
  AppState.set({ zoom: '3mo' });
  const after = AppState.get();
  assert.equal(after.zoom, '3mo');
  assert.equal(after.filter.status, before.filter.status);
  assert.equal(after.theme, before.theme);
  assert.equal(after.showGantt, before.showGantt);
});

test('set() nested merge for filter: updating filter.status via spread updates only status', () => {
  AppState.set({ filter: { ...AppState.get().filter, status: 'DEV' } });
  const state = AppState.get();
  assert.equal(state.filter.status, 'DEV');
  assert.equal(state.filter.riskOnly, false);
  assert.equal(state.filter.search, '');
});

test('get() reflects the new state after set()', () => {
  AppState.set({ activeDependencyGraph: 'Task Alpha', showGantt: false });
  const state = AppState.get();
  assert.equal(state.activeDependencyGraph, 'Task Alpha');
  assert.equal(state.showGantt, false);
});

// --- AppState.subscribe() ---
test('subscribe(): subscriber function is called when state changes', () => {
  let called = false;
  AppState.subscribe(() => { called = true; });
  AppState.set({ zoom: '6mo' });
  assert.equal(called, true);
});

test('subscribe(): subscriber receives (newState, prevState) arguments', () => {
  let receivedNew = null;
  let receivedPrev = null;
  AppState.subscribe((newState, prevState) => {
    receivedNew = newState;
    receivedPrev = prevState;
  });
  const before = AppState.get();
  AppState.set({ zoom: '3mo' });
  assert.ok(receivedNew);
  assert.ok(receivedPrev);
  assert.equal(receivedPrev.zoom, before.zoom);
  assert.equal(receivedNew.zoom, '3mo');
});

test('subscribe(): prevState reflects the state before the change', () => {
  AppState.set({ zoom: '6mo' });
  let prevZoom = null;
  AppState.subscribe((_, prev) => { prevZoom = prev.zoom; });
  AppState.set({ zoom: '3mo' });
  assert.equal(prevZoom, '6mo');
});

test('subscribe(): newState reflects the state after the change', () => {
  let newZoom = null;
  AppState.subscribe((newState) => { newZoom = newState.zoom; });
  AppState.set({ zoom: '3mo' });
  assert.equal(newZoom, '3mo');
});

test('subscribe(): multiple subscribers all get called', () => {
  let count = 0;
  AppState.subscribe(() => { count++; });
  AppState.subscribe(() => { count++; });
  AppState.subscribe(() => { count++; });
  AppState.set({ zoom: '6mo' });
  assert.equal(count, 3);
});

test('subscribe(): unsubscribe stops future calls', () => {
  let count = 0;
  const unsub = AppState.subscribe(() => { count++; });
  AppState.set({ zoom: '6mo' });
  assert.equal(count, 1);
  unsub();
  AppState.set({ zoom: '3mo' });
  assert.equal(count, 1);
});

// --- AppState.reset() ---
test('After reset(), get() returns the default state', () => {
  AppState.set({ zoom: '3mo', filter: { status: 'DEV', riskOnly: true, search: 'x' }, activeDependencyGraph: 'X' });
  AppState.reset();
  const state = AppState.get();
  assert.equal(state.zoom, 'all');
  assert.equal(state.filter.status, 'ALL');
  assert.equal(state.filter.riskOnly, false);
  assert.equal(state.filter.search, '');
  assert.equal(state.activeDependencyGraph, null);
});

test('reset() preserves theme', () => {
  AppState.set({ theme: 'dark' });
  AppState.reset();
  const state = AppState.get();
  assert.equal(state.theme, 'dark');
});

test('reset(): subscribers are called with the reset state', () => {
  let receivedNew = null;
  AppState.subscribe((newState) => { receivedNew = newState; });
  AppState.set({ zoom: '3mo' });
  AppState.reset();
  assert.ok(receivedNew);
  assert.equal(receivedNew.zoom, 'all');
  assert.equal(receivedNew.filter.status, 'ALL');
});
