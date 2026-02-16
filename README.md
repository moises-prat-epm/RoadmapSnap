# 🚀 RoadmapSnap

A powerful, fully client-side roadmap dashboard for executive
visibility, delivery governance, and dependency management.

**No backend. No database. No build step.**\
Edit a config file → refresh the page → done.

![RoadmapSnap Preview](docs/preview.png)

------------------------------------------------------------------------

## 🌟 What Makes RoadmapSnap Different?

RoadmapSnap is more than a static Gantt chart. It includes:

-   Executive KPI dashboard
-   Workflow-driven state engine
-   Milestone-based timeline
-   Recursive dependency graph
-   Risk filtering
-   Grouping with expand/collapse
-   Non-filterable foundation groups
-   Dark mode
-   Timeline zoom controls
-   CSV / JSON / PNG export
-   Descope support (visual + logical)

Everything is defined in `js/config.js`.

------------------------------------------------------------------------

# 🧠 Core Architecture

RoadmapSnap is driven by a single global configuration object:

``` js
CONFIG = {
  TIMELINE: {...},
  ENTITY_LABELS: {...},
  DASHBOARD_TEXT: {...},
  WORKFLOW: [...],
  DELIVERABLES: [...]
}
```

The UI dynamically renders everything from this structure.

------------------------------------------------------------------------

# 📊 Executive Dashboard

The summary section includes:

-   Total in-scope count
-   KPI cards per state (click to filter)
-   Risk summary (click to filter at-risk only)
-   Overall progress bar segmented by state
-   Upcoming milestone highlights
-   Today reference indicator

State counts dynamically respect:

-   Filters
-   Non-filterable groups
-   Descope logic
-   Risk toggling

------------------------------------------------------------------------

# 🗺 Timeline View

Each deliverable renders as:

Left column: - Name - Status badge - Dependency icon - Risk indicator

Right column: - Timeline track - Month grid - Today vertical guide -
Milestone markers - Gantt progress segments (past solid, future faded) -
Dependency arrows (when active)

Zoom options: - 3 months - 6 months - 12 months - Full range

------------------------------------------------------------------------

# 🔄 Workflow Engine (State Machine)

Workflow alternates:

state → milestone → state → milestone → final state

Example:

``` js
WORKFLOW: [
  { type: 'state', key: 'NS', short: 'NS', title: 'Not Started' },

  { type: 'milestone', key: 'DES', short: 'DES', title: 'Design Complete', color: '#6c5ce7' },
  { type: 'state', key: 'DEV', short: 'DEV', title: 'Development' },

  { type: 'milestone', key: 'TEST', short: 'TST', title: 'Testing Complete', color: '#fdcb6e' },
  { type: 'state', key: 'UAT', short: 'UAT', title: 'User Acceptance' },

  { type: 'milestone', key: 'LIVE', short: 'LIVE', title: 'Go Live', color: '#00b894' },
  { type: 'state', key: 'DONE', short: 'DONE', title: 'Completed' }
]
```

The system:

-   Reads milestone dates
-   Compares to TODAY
-   Determines current state
-   Updates KPIs automatically

------------------------------------------------------------------------

# 📦 Deliverables Structure

Example:

``` js
{
  name: "Mobile App Revamp",
  group: "Digital Products",
  atRisk: true,
  descoped: false,
  showInTimeline: true,
  tags: ["frontend", "critical"],
  link: "https://example.com/task-123",
  dependencies: [
    { task: "API Refactoring", from: "TEST", to: "DES" }
  ],
  milestones: {
    DES: "15/01/2026",
    TEST: "20/02/2026",
    LIVE: "15/03/2026"
  }
}
```

Supported properties:

  Field            Description
  ---------------- -----------------------------------
  name             Display name
  group            Optional grouping
  atRisk           Highlights risk
  descoped         Strikethrough + greyed timeline
  showInTimeline   Hide from grid but keep in totals
  link             External link
  tags             Searchable tags
  dependencies     Advanced dependency config
  milestones       Dates per workflow milestone

------------------------------------------------------------------------

# ⚠ Descope Support

If:

``` js
descoped: true
```

Then:

-   Deliverable name is struck through
-   Timeline is greyed
-   Status badge hidden
-   Still participates in dependency graph

------------------------------------------------------------------------

# 🔎 Filtering System

Includes:

-   Search (name + tags)
-   Status filter via KPI cards
-   Risk-only toggle
-   Sorting (name, status, final date, risk)
-   Gantt toggle
-   Clear filters

Non-filterable groups:

-   Visible in timeline
-   Excluded from KPI totals
-   Hidden during status filtering
-   Included during risk filtering

------------------------------------------------------------------------

# 🔗 Dependency Graph

Supports:

Simple format:

``` js
dependencies: ["Authentication Service"]
```

Milestone-specific format:

``` js
dependencies: [
  { task: "Authentication Service", from: "TEST", to: "DES" }
]
```

When activated:

-   Full recursive graph computed
-   Groups auto-expanded
-   Related nodes highlighted
-   Non-related nodes dimmed
-   Milestone-to-milestone arrows drawn
-   Tooltip shows relationship details

------------------------------------------------------------------------

# 📤 Export Capabilities

-   PNG export
-   CSV export (flattened milestone data)
-   JSON export (full enriched dataset)

CSV includes:

-   Name
-   Group
-   Current state
-   Risk
-   Tags
-   Link
-   Milestone dates

------------------------------------------------------------------------

# 🌙 Dark Mode

-   Toggle in header
-   Persisted in localStorage

------------------------------------------------------------------------

# 🧱 Project Structure

    index.html
    js/config.js

No frameworks. No build tools.

------------------------------------------------------------------------

# 🚀 Deployment

Deploy to any static host:

-   GitHub Pages
-   Cloudflare Pages
-   Netlify
-   Azure Static Web Apps
-   Amazon S3
-   Internal intranet

------------------------------------------------------------------------

# 🔐 Security

-   No API calls
-   No server communication
-   Fully client-side rendering

------------------------------------------------------------------------

# 📜 License

MIT License
