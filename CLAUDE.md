# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server on port 3000 (auto-opens browser)
npm run build        # Production build to dist/
npm test             # Node.js built-in test runner
npm run test:watch   # Watch mode for tests
npm run validate     # Validate js/config.js against schema/config.schema.json
npm run docs         # Generate markdown config reference
npm run build:check  # Full CI check: build + docs + validation
```

To run a single test file:
```bash
node --test tests/core/timeline.test.js
```

## Architecture

RoadmapSnap is a **dual-product** repo:

1. **Lite** (root `/js/`, `css/`) — the primary product. A static, configuration-driven roadmap dashboard. No backend, no framework, pure vanilla ES modules. Deployed as static files.
2. **SaaS** (`packages/api/`, `packages/app/`) — under development. Fastify + PostgreSQL + Auth0 backend; React + TanStack Query frontend.

### Lite Architecture

**Data flow:**
```
js/config.js (CONFIG object, gitignored)
    → configValidator.js (AJV + schema/config.schema.json)
    → AppState (observer-pattern state: filters, sort, zoom, theme, dependencies)
    → Core modules (workflow, timeline, dependencies, stats, viewModel)
    → UI renderers (dashboard, filterBar, timelineGrid, dependencyArrows)
    → DOM (full re-render on each state change)
```

**Layer responsibilities:**
- `js/core/` — Pure functions: date/position math, workflow state logic, dependency graph, KPI stats, view model construction
- `js/state/appState.js` — Singleton observer (`get()`, `set(patch)`, `subscribe(fn)`). State changes trigger full `renderRoadmap()` re-render
- `js/ui/` — HTML string builders using the `html`` ` tagged template helper and `raw()` for unescaped content
- `js/export/` — CSV, JSON, PNG (via html2canvas)
- `css/` + `packages/tokens/` — CSS custom properties as design tokens; themes applied via `[data-theme]` attribute on `<html>`

**Config system:**
- `js/config.js` is gitignored (user data). Copy a sample (`js/config_base.js`, `js/config_roadmapsnap.js`, etc.) to create it.
- All configs export a `CONFIG` object and must conform to `schema/config.schema.json` (JSON Schema draft-07).
- Build copies `js/config.js` to `dist/js/config.js` (not bundled by Vite).
- `js/config_base.js` is the minimal template; `js/config_*.js` files are named samples for different projects.

**Key CONFIG fields:**
```javascript
CONFIG.TIMELINE       // START_MONTH, END_MONTH (MM/YYYY), TODAY (DD/MM/YYYY or "")
CONFIG.WORKFLOW       // Alternating state/milestone objects defining the pipeline
CONFIG.DELIVERABLES   // Array of tasks with milestones, group, tags, dependencies, atRisk, descoped
CONFIG.NON_FILTERABLE_GROUPS  // Groups excluded from status filtering
```

### Themes

Available themes in `css/roadmap.css`: `light` (default), `dark`, `professional`, `colorful`, `blank`, `monochrome`, `papallona`. Applied via `data-theme` attribute; persisted in localStorage.

### Testing

Tests live in `tests/` and use the Node.js built-in test runner (no Jest/Vitest for Lite). Test fixtures are in `tests/fixtures/`. Tests cover core logic modules only — no UI tests.

---

### SaaS Architecture

**Dev commands (run from each package dir):**
```bash
# API — packages/api/
npm run dev        # Fastify on port 4000 (node --watch)
npm run migrate    # Apply pending SQL migrations
npm test           # Node.js built-in test runner

# App — packages/app/
npm run dev        # Vite on port 3001
npm test           # Vitest
npm run build      # tsc --noEmit + vite build
```

**Multi-tenant data model:**
```
organizations → workspaces → projects → milestones / dependencies
             → org_members (user + role per org)
```
RBAC roles: `viewer < editor < admin`. Enforced by the `rbacPlugin` preHandler via `fastify.requireRole('editor')`.

**Request lifecycle (API):**
1. `auth.js` plugin validates Auth0 JWT → sets `request.user`
2. `context.js` plugin resolves DB user (auto-provisions on first login), resolves `orgId` from `X-Org-Id` header → `?orgId` query → first membership, sets `request.dbUser` and `request.orgId`
3. PostgreSQL session vars `app.current_org_id` / `app.current_user_id` are set per-request for Row-Level Security policies
4. Route handlers use `request.dbClient` (dedicated pg connection released on response close)

**API env** (`packages/api/.env`): `AUTH0_DOMAIN`, `AUTH0_AUDIENCE` are required. `DATABASE_URL` defaults to `postgresql://postgres:postgres@localhost:5432/roadmapsnap_dev`.

**App (packages/app) patterns:**
- `src/api/client.ts` — typed `ApiClient` class; instantiated via `useApi()` hook (injects Auth0 bearer token)
- `src/hooks/` — TanStack Query wrappers: `useWorkspaces()`, `useWorkspaceProjects(id)`, `useProjectMutations()`
- `src/lib/` — pure TS utilities mirroring Lite core: timeline math, stats, dependency graph, filters
- Themes applied as CSS classes (mirrors Lite's `data-theme`); last theme persisted via `themeStorage.ts`
- Routes: `/login` → `/callback` (Auth0) → `/dashboard` (AuthGuard-wrapped)
