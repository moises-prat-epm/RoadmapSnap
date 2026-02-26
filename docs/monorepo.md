# Monorepo layout

This repository contains two products:

| Product | Location | Description |
|--------|----------|-------------|
| **RoadmapSnap Lite** | Repository root | Backend-free, client-side roadmap dashboard |
| **RoadmapSnap SaaS** | `packages/api/` | Multi-tenant API and backend (under development) |

---

## RoadmapSnap Lite (root)

Lite is **backend-free and always will be**. It runs from `index.html` and `js/config.js`. No server, no database. Edit config → refresh → done.

- **Root `package.json`** — Scripts (`dev`, `build`, `test`, `validate`, etc.) always refer to Lite.
- **No changes** to `index.html`, `js/`, `css/`, `tests/`, or any existing root files are made for the SaaS product.

---

## RoadmapSnap SaaS (`packages/api/`)

The SaaS backend lives **entirely under** `packages/api/`:

- Its own **`package.json`** and **`node_modules`**
- Its own **tests** and **CI pipeline** (e.g. workflow under `packages/api/.github/` or a separate job in the root CI)
- Auth0, PostgreSQL, multi-tenant APIs — all developed and run from this package

**To work on the API:**

```bash
cd packages/api && npm run dev
```

---

## Directory tree

```
RoadmapSnap/
├── index.html
├── package.json          # Lite: dev, build, test
├── vite.config.js
├── js/
│   ├── app.js
│   ├── config.js
│   └── ...
├── css/
├── tests/
├── docs/
│   ├── monorepo.md
│   └── ...
├── schema/
├── scripts/
├── packages/
│   └── api/               # RoadmapSnap SaaS
│       ├── package.json   # API’s own scripts & deps
│       ├── node_modules/
│       ├── (source, tests, CI)
│       └── ...
└── .github/
    └── workflows/
        └── ci.yml        # Root CI: Lite only
```

Root tooling (Vite, tests, validate) applies only to Lite. The API is self-contained under `packages/api/`.
