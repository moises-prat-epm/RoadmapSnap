# 🚀 RoadmapSnap

[![CI](https://github.com/moises-prat-epm/RoadmapSnap/actions/workflows/ci.yml/badge.svg)](https://github.com/moises-prat-epm/RoadmapSnap/actions/workflows/ci.yml)

A powerful, client-side roadmap dashboard for project and program management.

**No backend. No database.** Edit `js/config.js` → refresh → done.  
Built with **Vite** for fast development and production builds.

Try it with a [sample project](https://roadmapsnapweb.pages.dev)

![RoadmapSnap Preview](docs/preview.png)

-----

## 📖 Description

RoadmapSnap is a single-page roadmap visualization tool that runs entirely in your browser. Built for teams who need powerful tracking without infrastructure complexity.

**Key capabilities:**

- Executive KPI dashboard with automatic status tracking
- Workflow-driven state management
- Interactive dependency visualization
- Risk tracking and filtering (by name, status, risk; KPIs refresh only when filtering by name)
- Timeline zoom (3/6/12 months, or full range)
- Export to PNG, CSV, JSON
- Multiple themes (light, dark, professional, colorful, blank)

-----

## 🎯 Use Cases

- **Executive Reporting** — Auto-calculated KPIs and progress metrics
- **Dependency Management** — Visual graph showing blocking relationships
- **Sprint/Release Tracking** — Track multiple workstreams with timeline zoom
- **Stakeholder Communication** — Export presentation-ready roadmap snapshots

-----

## ✨ Features

- Dynamic KPI cards (click to filter by status)
- Gantt timeline with milestone markers
- Recursive dependency graphs with arrows
- Group/ungroup deliverables
- Search by name or tag; filter by status and risk
- Risk indicators
- Descope support
- Multi-format export (PNG / CSV / JSON)

-----

## 🔧 Installation

**Requirements:** Node.js 18+ and npm (for development and production build).

**Clone and install:**

```bash
git clone https://github.com/moises-prat-epm/RoadmapSnap.git
cd RoadmapSnap
npm install
```

**Create your config:**

The app loads `js/config.js`. This file is **gitignored** so you can keep your own data out of version control. Create it from one of the provided templates:

```bash
# Full sample (e-commerce program, 150 deliverables)
cp js/config_sample.js js/config.js

# Or minimal template (10 deliverables, blank workflow)
cp js/config_base.js js/config.js
```

Then edit `js/config.js` to match your roadmap.

-----

## 🏃 Running the app

**Development (recommended):**

```bash
npm run dev
```

Starts the Vite dev server (default: http://localhost:3000) with hot reload. Use this while editing config or code.

**Production build:**

```bash
npm run build
```

Output goes to `dist/`. The build also copies `js/config.js` into `dist/js/`, so ensure `js/config.js` exists before building. To preview the built site locally:

```bash
npm run preview
```

**Opening `index.html` directly** (e.g. `open index.html`) is not recommended: the app uses ES modules, which many browsers block over `file://`. Use the dev server or a static server (e.g. `npx serve dist` after build) instead.

-----

## ✅ Validation and tests

**Validate config (before build or deploy):**

```bash
npm run validate
```

Runs `scripts/validate-config.mjs`: loads `js/config.js`, extracts the `CONFIG` object, and validates it against `schema/config.schema.json` using AJV. Fix any reported errors so the app and build behave correctly.

**Run tests:**

```bash
npm test
npm run test:watch   # watch mode
```

Uses the Node.js built-in test runner. Tests live under `tests/` (e.g. `tests/core/configValidator.test.js`, `tests/core/workflow.test.js`, `tests/state/appState.test.js`).

**Generate config reference docs:**

```bash
npm run docs
```

Generates `docs/config-reference.md` from `schema/config.schema.json` (human-readable config reference with Quick Start and property tables). The file is intended to be committed. Docs are also generated when you run `npm run build:check`.

-----

## ⚙️ Configuration

All configuration is in **`js/config.js`**: a single JavaScript file that must define a global `CONFIG` object. Use **`config_sample.js`** or **`config_base.js`** as a starting point.

### Config file layout

| File | Purpose |
|------|--------|
| `js/config.js` | **Your config** (gitignored). Required for run and build. |
| `js/config_sample.js` | Full sample (e-commerce program). Copy to `config.js` to explore. |
| `js/config_base.js` | Minimal template. Copy to `config.js` to start from scratch. |

### Quick reference

**Timeline dates:**

```javascript
TIMELINE: {
    TODAY: "16/02/2026",        // DD/MM/YYYY, or "" for auto (current date)
    START_MONTH: "01/2026",     // MM/YYYY
    END_MONTH: "12/2026"        // MM/YYYY
}
```

**Custom labels:**

```javascript
ENTITY_LABELS: {
    singular: "Feature",
    plural: "Features",
    columnHeader: "Feature",
    scopeLabel: "features"
}

DASHBOARD_TEXT: {
    title: "Q2 Product Roadmap",
    totalSubtitleSuffix: "in scope"
}
```

**Workflow (states and milestones):**

The workflow must **alternate**: state → milestone → state → … and **end with a state**. Each item needs a non-empty `key`. Status is computed from which milestone dates have passed.

```javascript
WORKFLOW: [
    { type: 'state', key: 'NS', short: 'NS', title: 'Not Started', description: '' },
    { type: 'milestone', key: 'START', short: 'GO', title: 'Start' },
    { type: 'state', key: 'DEV', short: 'DEV', title: 'In Development', description: '' },
    { type: 'milestone', key: 'M1', short: 'M1', title: 'Complete' },
    { type: 'state', key: 'DONE', short: 'DONE', title: 'Done', description: '' }
]
```

**Non-filterable groups** (e.g. infrastructure; excluded from some counts):

```javascript
NON_FILTERABLE_GROUPS: ["Infrastructure", "Planning"]
```

**Group order** (optional): order of groups in the timeline. Unlisted groups appear after, sorted alphabetically.

```javascript
GROUP_ORDER: ["FrontEnd", "Backend", "Database", "Infrastructure"]
// GROUP_ORDER: []   // default: alphabetical
```

**Deliverables:**

```javascript
DELIVERABLES: [
    {
        name: "User Authentication",           // required, unique
        group: "Backend",                       // optional
        atRisk: false,                           // optional
        descoped: false,                        // optional, strike-through
        showInTimeline: true,                   // optional, default true
        tags: ["security", "P0"],               // optional, for search
        link: "https://jira.com/PROJ-123",      // optional, info icon
        dependencies: [                         // optional
            "Database Setup",
            { task: "API Gateway", from: "M2", to: "M1" }
        ],
        milestones: {                           // required; first workflow milestone key required
            START: "01/03/2026",
            M1: "30/03/2026"
        }
    }
]
```

### Config parameters

| Parameter        | Type    | Required | Description |
|------------------|---------|----------|-------------|
| `name`           | string  | ✅       | Unique deliverable name |
| `group`          | string  | ⬜       | Group name for organization |
| `atRisk`         | boolean | ⬜       | Show risk indicator (default: false) |
| `descoped`       | boolean | ⬜       | Strike through and grey out (default: false) |
| `showInTimeline` | boolean | ⬜       | Show in timeline (default: true) |
| `tags`           | array   | ⬜       | Search tags (name/tag filter) |
| `link`           | string  | ⬜       | External link URL |
| `dependencies`   | array   | ⬜       | Simple strings or `{ task, from, to }` objects |
| `milestones`     | object  | ✅       | `{ KEY: "DD/MM/YYYY" }`; first workflow milestone key required |

### Schema and validation

- **JSON Schema:** `schema/config.schema.json` describes the CONFIG shape. See `schema/README.md` for VS Code integration and AJV usage.
- **Runtime validation:** The app uses `js/core/configValidator.js` on load; invalid config shows an error page listing issues.
- **CLI:** `npm run validate` checks `js/config.js` against the schema before you build or deploy.

-----

## 🌐 Publication

After `npm run build`, deploy the **`dist/`** folder to any static host. The build includes your `js/config.js` in `dist/js/`.

### Quick deploy options

**GitHub Pages:** Push to GitHub → Settings → Pages → select branch. Site at `https://username.github.io/RoadmapSnap/`.

**Netlify / Vercel:** Connect the repo, set build command to `npm run build` and publish directory to `dist`.

**Cloudflare Pages:** Connect repo, build command `npm run build`, output directory `dist`.

**Internal / static:** Copy `dist/` to a shared drive or intranet web server.

### Sensitive data

- Use a private repo and/or a host with access control.
- Keep `js/config.js` out of the repo (it is gitignored). For public demos, use a separate config (e.g. copy from `config_sample.js`) or a sanitized `config.public.js` and adjust the build if needed.

-----

## 📄 License

**MIT License** — Use freely for personal or commercial projects.

-----

**Questions?** Open an issue on [GitHub](https://github.com/moises-prat-epm/RoadmapSnap)  
Author: [Moises Prat](https://moisesprat.github.io)
