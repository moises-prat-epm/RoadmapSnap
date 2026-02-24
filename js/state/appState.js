const AppState = (() => {
  const DEFAULT_STATE = {
    filter: { status: 'ALL', riskOnly: false, search: '' },
    sort: { by: 'm3date', order: 'asc' },
    zoom: 'all',
    showGantt: true,
    groupCollapsed: {},
    activeDependencyGraph: null,
    theme: localStorage.getItem('roadmapsnap-theme') || 'light',
    timelineStart: null,
    timelineEnd: null,
  };
  let _state = { ...DEFAULT_STATE };
  let _prevState = null;
  const _listeners = new Set();

  return {
    get() { return _state; },
    set(patch) {
      _prevState = _state;
      _state = { ..._state, ...patch };
      _listeners.forEach(fn => fn(_state, _prevState));
    },
    reset() {
      const theme = _state.theme;
      _prevState = _state;
      _state = { ...DEFAULT_STATE, theme };
      _listeners.forEach(fn => fn(_state, _prevState));
    },
    subscribe(fn) { _listeners.add(fn); return () => _listeners.delete(fn); },
  };
})();

window.AppState = AppState;

export default AppState;
