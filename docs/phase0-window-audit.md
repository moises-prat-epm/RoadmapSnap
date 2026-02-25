# Phase 0 — Window global audit

This document tracks every `window.X = X` assignment in the RoadmapSnap codebase and classifies it as **INTENTIONAL** (must stay on window until Phase 1 / React) or **DEBT** (to remove when moving to React).

---

## Criteria

**INTENTIONAL (must stay on window for now):**
- Functions called via **inline `onclick` / `onchange` / `oninput`** in HTML template strings (no way to attach handlers without globals in current setup).
- **Global state** objects used across module boundaries: `AppState`, `CONFIG`.
- **Third-party globals** we rely on: `html2canvas` (CDN; we don’t assign it).

**DEBT (remove in Phase 1 with React):**
- Functions **only called from other JS modules** (can be replaced by imports / props).
- **Duplicate assignments**: function is both exported and on `window`, but callers already use imports.

---

## Full table of `window.X` assignments

| Assignment | File | Category | Callers | Remove in Phase 1? |
|------------|------|----------|---------|--------------------|
| `window.exportToPNG` | js/export/png.js | INTENTIONAL | exportControls (onclick) | Yes (use React handler) |
| `window.exportToCSV` | js/export/csv.js | INTENTIONAL | exportControls (onclick) | Yes (use React handler) |
| `window.exportToJSON` | js/export/json.js | INTENTIONAL | exportControls (onclick) | Yes (use React handler) |
| `window.downloadFile` | js/export/csv.js | DEBT | csv.js (same file), json.js (window.downloadFile) | Yes (import in json.js) |
| `window.toggleDependencyGraph` | js/ui/dependencyArrows.js | INTENTIONAL | timelineGrid (onclick on dependency icon) | Yes (use React handler) |
| `window.clearDependencyGraphOnClickOutside` | js/ui/dependencyArrows.js | DEBT | app.js (addEventListener) | Yes (import in app.js) |
| `window.drawDependencyArrows` | js/ui/dependencyArrows.js | DEBT | dependencyArrows.js, filterBar.js (window) | Yes (import where needed) |
| `window.clearDependencyArrows` | js/ui/dependencyArrows.js | DEBT | dependencyArrows.js only | Yes (internal to module) |
| `window.closeDependencyGraph` | js/ui/dependencyArrows.js | DEBT | filterBar.js (window) | Yes (import in filterBar) |
| `window.renderExportControls` | js/ui/exportControls.js | DEBT | app.js (renderRoadmap) | Yes (import in app.js) |
| `window.calculateStats` | js/core/stats.js | DEBT | app.js (renderRoadmap) | Yes (already imported in app via stats) |
| `window.getUpcomingMilestones` | js/core/stats.js | DEBT | app.js (renderRoadmap) | Yes (import in app.js) |
| `window.getVisibleDataSources` | js/core/stats.js | DEBT | app.js (renderRoadmap) | Yes (import in app.js) |
| `window.getAllVisibleDataSources` | js/core/stats.js | DEBT | app.js, filterBar.js, timelineGrid (via getAllVisibleDataSources) | Yes (import where needed) |
| `window.validateConfig` | js/core/configValidator.js | DEBT | app.js (DOMContentLoaded) | Yes (import in app.js) |
| `window.parseDate` | js/core/timeline.js | DEBT | workflow, stats, viewModel, etc. use via import or global | Yes (all callers can import) |
| `window.formatDateDisplay` | js/core/timeline.js | DEBT | timelineGrid, dependencyArrows, viewModel use via import | Yes (duplicate) |
| `window.formatShortDate` | js/core/timeline.js | DEBT | dashboard uses global | Yes (import in dashboard) |
| `window.darkenColor` | js/core/timeline.js | DEBT | Not used in current codebase? | Yes |
| `window.getTodayDate` | js/core/timeline.js | DEBT | app, workflow, viewModel, dashboard, etc. use import or global | Yes (duplicate) |
| `window.parseMonthYear` | js/core/timeline.js | DEBT | configValidator, timeline (internal) | Yes |
| `window.getMonthName` | js/core/timeline.js | DEBT | timeline (internal) | Yes |
| `window.generateMonths` | js/core/timeline.js | DEBT | app.js (renderRoadmap) | Yes (already imported in app) |
| `window.calculatePosition` | js/core/timeline.js | DEBT | app.js, viewModel use import | Yes (duplicate) |
| `window.isDateInRange` | js/core/timeline.js | DEBT | viewModel, dependencyArrows use import | Yes (duplicate) |
| `window.buildDeliverableViewModel` | js/core/viewModel.js | DEBT | timelineGrid uses import | Yes (duplicate) |
| `window.resolveStateColor` | js/core/viewModel.js | DEBT | viewModel (internal), possibly others via global | Yes |
| `window.resolveStateTextColor` | js/core/viewModel.js | DEBT | viewModel (internal) | Yes |
| `window.parseDate` (duplicate) | js/roadmap.utils.js | DEBT | Duplicate of timeline (guarded by window check) | Yes (remove roadmap.utils or dedupe) |
| `window.formatDateDisplay` (duplicate) | js/roadmap.utils.js | DEBT | Same | Yes |
| `window.formatShortDate` (duplicate) | js/roadmap.utils.js | DEBT | Same | Yes |
| `window.darkenColor` (duplicate) | js/roadmap.utils.js | DEBT | Same | Yes |
| `window.getTodayDate` (duplicate) | js/roadmap.utils.js | DEBT | Same | Yes |
| `window.getWorkflow` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getStates` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getMilestones` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getStateByKey` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getMilestoneByKey` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getStateAfterMilestone` | js/core/workflow.js | DEBT | workflow, viewModel use import | Yes (duplicate) |
| `window.getFirstState` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getLastState` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getFirstMilestoneKey` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getLastMilestoneKey` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getCurrentStatus` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getNextMilestone` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getMilestoneDate` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getNonFilterableGroups` | js/core/workflow.js | DEBT | workflow (internal), stats | Yes |
| `window.isGroupNonFilterable` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.isDeliverableNonFilterable` | js/core/workflow.js | DEBT | Various use import | Yes (duplicate) |
| `window.getFilterableDeliverables` | js/core/workflow.js | DEBT | workflow (internal) | Yes |
| `window.escapeHtml` | js/ui/renderer.js | DEBT | renderer (internal), timelineGrid via html | Yes |
| `window.html` | js/ui/renderer.js | DEBT | dashboard, filterBar, timelineGrid, exportControls use import | Yes (duplicate) |
| `window.raw` | js/ui/renderer.js | DEBT | Same | Yes (duplicate) |
| `window.renderIf` | js/ui/renderer.js | DEBT | Same | Yes (duplicate) |
| `window.AppState` | js/state/appState.js | INTENTIONAL | Global state; app.js imports default but others may use window | No (keep as global/context in React) |
| `window.renderDashboard` | js/ui/dashboard.js | DEBT | app.js (renderRoadmap) | Yes (import in app.js) |
| `window.groupDeliverables` | js/ui/grouping.js | DEBT | timelineGrid uses import | Yes (duplicate) |
| `window.hasAnyGroups` | js/ui/grouping.js | DEBT | filterBar, timelineGrid use import | Yes (duplicate) |
| `window.toggleGroup` | js/ui/grouping.js | INTENTIONAL | timelineGrid (onclick on group header) | Yes (use React handler) |
| `window.expandAllGroups` | js/ui/grouping.js | INTENTIONAL | filterBar (onclick) | Yes (use React handler) |
| `window.collapseAllGroups` | js/ui/grouping.js | INTENTIONAL | filterBar (onclick) | Yes (use React handler) |
| `window.getGroupStats` | js/ui/grouping.js | DEBT | timelineGrid uses import | Yes (duplicate) |
| `window.expandGroupsForDependencyGraph` | js/ui/grouping.js | DEBT | dependencyArrows uses import | Yes (duplicate) |
| `window.renderTimelineGrid` | js/ui/timelineGrid.js | DEBT | app.js (renderRoadmap) | Yes (import in app.js) |
| `window.searchDebounceTimer` | js/ui/filterBar.js | DEBT | filterBar (internal clearTimeout) | Yes (module-level variable) |
| `window.filterDeliverables` | js/ui/filterBar.js | DEBT | stats.js (getVisibleDataSources), app uses getVisibleDataSources | Yes (import in stats) |
| `window.filterBySearchOnly` | js/ui/filterBar.js | DEBT | app.js (renderRoadmap) | Yes (import in app.js) |
| `window.sortDeliverables` | js/ui/filterBar.js | DEBT | stats (getVisibleDataSources), filterBar (sortDeliverables) | Yes (import where needed) |
| `window.updateFilter` | js/ui/filterBar.js | INTENTIONAL | filterBar (oninput/onchange in templates) | Yes (use React handler) |
| `window.clearFilters` | js/ui/filterBar.js | INTENTIONAL | filterBar (onclick) | Yes (use React handler) |
| `window.filterByStatus` | js/ui/filterBar.js | INTENTIONAL | dashboard (onclick on KPI cards) | Yes (use React handler) |
| `window.clearStatusFilterOnOutsideClick` | js/ui/filterBar.js | DEBT | app.js (addEventListener) | Yes (import in app.js) |
| `window.toggleRiskFilter` | js/ui/filterBar.js | INTENTIONAL | dashboard (onclick on risk summary) | Yes (use React handler) |
| `window.toggleGanttBars` | js/ui/filterBar.js | INTENTIONAL | filterBar (onclick) | Yes (use React handler) |
| `window.renderFilterBar` | js/ui/filterBar.js | DEBT | app.js (renderRoadmap) | Yes (import in app.js) |
| `window.setDateRange` | js/app.js | INTENTIONAL | filterBar (onclick zoom buttons) | Yes (use React handler) |
| `window.escapeHtmlAttr` | js/app.js | DEBT | filterBar, timelineGrid (templates) | Yes (pass as prop or import) |
| `window.infoIconSVG` | js/app.js | DEBT | dashboard, timelineGrid (templates) | Yes (shared asset / import) |
| `window.riskIconSVG` | js/app.js | DEBT | dashboard, timelineGrid (templates) | Yes (shared asset / import) |
| `window.getAllDataSources` | js/core/dependencies.js | DEBT | dependencyArrows, timelineGrid use import | Yes (duplicate) |
| `window.normalizeDependency` | js/core/dependencies.js | DEBT | dependencies, configValidator use import | Yes (duplicate) |
| `window.getDependencyTaskName` | js/core/dependencies.js | DEBT | configValidator uses import | Yes (duplicate) |
| `window.getInboundDependencies` | js/core/dependencies.js | DEBT | viewModel uses import | Yes (duplicate) |
| `window.getInboundDependencyNames` | js/core/dependencies.js | DEBT | — | Yes |
| `window.getOutboundDependencies` | js/core/dependencies.js | DEBT | viewModel uses import | Yes (duplicate) |
| `window.getOutboundDependencyNames` | js/core/dependencies.js | DEBT | — | Yes |
| `window.hasDependencies` | js/core/dependencies.js | DEBT | — | Yes |
| `window.getDependencyType` | js/core/dependencies.js | DEBT | viewModel, filterBar use import | Yes (duplicate) |
| `window.getDependencyGraph` | js/core/dependencies.js | DEBT | dependencyArrows uses import | Yes (duplicate) |

**Note:** `CONFIG` is set by `js/config.js` (loaded as a classic script in `index.html`). It is not assigned via `window.CONFIG =` in the repo but is a global; treat as INTENTIONAL global state. `html2canvas` is loaded from CDN and not assigned in our code.

---

## Summary

- **INTENTIONAL (must stay until React):** All handlers referenced from inline `onclick` / `onchange` / `oninput` in generated HTML (`exportToPNG`, `exportToCSV`, `exportToJSON`, `toggleDependencyGraph`, `toggleGroup`, `filterByStatus`, `toggleRiskFilter`, `setDateRange`, `updateFilter`, `clearFilters`, `toggleGanttBars`, `expandAllGroups`, `collapseAllGroups`), plus **AppState** (and CONFIG/html2canvas as above).
- **DEBT:** All other `window.X` assignments. They can be removed in Phase 1 by: (1) importing where used instead of relying on globals, (2) replacing inline handlers with React event props, (3) using React state/context instead of `AppState`/CONFIG where appropriate.

---

## Phase 0 Completion Checklist

- [ ] Vite dev server configured (Step 1)
- [ ] Environment variable bridge (Step 2)
- [ ] Production build verified (Step 3)
- [ ] JSON Schema created (Step 4)
- [ ] Validation script (Step 5)
- [ ] Named imports in app.js (Step 6)
- [ ] Named imports in stats.js (Step 7)
- [ ] Named imports in viewModel.js (Step 8)
- [ ] Named imports in dashboard.js + renderer.js (Step 9)
- [ ] Named imports in filterBar.js + grouping.js (Step 10)
- [ ] Named imports in exports + timelineGrid (Step 11)
- [ ] Timeline tests (Step 12)
- [ ] Workflow tests (Step 13)
- [ ] AppState tests (Step 14)
- [ ] ConfigValidator edge cases (Step 15)
- [ ] Auto-generated docs (Step 16)
- [ ] GitHub Actions CI (Step 17)
- [ ] Window audit (Step 18 — this step)
