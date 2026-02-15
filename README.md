# RoadmapSnap

A powerful, simple roadmap dashboard that gives clear visibility of project progress to any stakeholder—collaborators, third parties, and executive leadership. Runs entirely in the browser: no backend, no build step.

Check out the live demo [here](https://roadmapsnap.pages.dev) with a sample project 

![RoadmapSnap Preview](docs/preview.png)

---

## Features

| Feature | Description |
|---------|-------------|
| **Executive summary** | KPIs by state with clickable filters, risk count, overall completion |
| **Flexible workflow** | Define custom states and milestones in sequence (e.g., Not Started → Design → Dev → QA → UAT → Staging → Production) |
| **Compact timeline** | One row per deliverable with milestone markers and Gantt bars across months |
| **State indicators** | Each deliverable shows its current state with color-coded badge |
| **Risk visibility** | `atRisk: true` items show a warning indicator; clickable to filter |
| **PNG export** | Export full roadmap, summary-only, or timeline-only views |
| **CSV/JSON export** | Export deliverable data for reporting and integration |
| **Customizable labels** | Entity names, dashboard title, state descriptions—all configurable |
| **Hidden items** | `showInTimeline: false` hides items from the chart but keeps them in totals |
| **Filtering & Sorting** | Filter by state (via KPI cards), risk; sort by name, status, date |
| **Grouping** | Group deliverables with expand/collapse functionality |
| **Dark mode** | Toggle between light and dark themes (persisted in localStorage) |
| **Date zoom** | Quick buttons to zoom timeline to 3/6/12 months or full range |
| **Info links** | Optional link per deliverable opens in new tab |

---

## Quick Start

1. **Clone** the repository.
2. **Copy** `js/config_base.js` to `js/config.js` and customize with your own deliverables and workflow.
3. **Open** `index.html` in a browser to view. No server needed—refresh the page after editing the config to see changes.
4. **Host** on any static hosting service (GitHub Pages, Cloudflare Pages, Netlify, etc.)

---

## Configuration

All settings live in `js/config.js`. The file contains sample data you can adjust. It defines a global `CONFIG` object with the following parameters:

### `TIMELINE`

| Parameter | Format | Meaning |
|-----------|--------|---------|
| `TODAY` | `"DD/MM/YYYY"` or `""` | Reference date for status calculation and "today" marker. **Leave empty to use current date automatically.** |
| `START_MONTH` | `"MM/YYYY"` | First month shown on the timeline |
| `END_MONTH` | `"MM/YYYY"` | Last month shown on the timeline |

### `ENTITY_LABELS`

How items are named in the UI (e.g. Deliverable, Feature, Workstream).

| Parameter | Meaning |
|-----------|---------|
| `singular` | Single item label (e.g. "Feature") |
| `plural` | Multiple items label (e.g. "Features") |
| `columnHeader` | Header for the first column in the timeline grid |
| `scopeLabel` | Used in phrases like "46 features in scope" |

### `DASHBOARD_TEXT`

| Parameter | Meaning |
|-----------|---------|
| `title` | Main dashboard title |
| `totalSubtitleSuffix` | Subtitle under the Total KPI card (e.g. "in project scope") |

### `WORKFLOW`

Defines the sequence of **states** and **milestones** for your project. The workflow alternates: `state → milestone → state → milestone → ... → final state`.

Each **state** represents a phase a deliverable is in. Each **milestone** is a date marker that transitions to the next state.

```javascript
WORKFLOW: [
    // Initial state (before any milestone)
    { type: 'state', key: 'NS', short: 'NS', title: 'Not Started', description: 'Pending kickoff' },
    
    // START milestone transitions to next state
    { type: 'milestone', key: 'START', short: 'GO', title: 'Start', subtitle: 'Project Kickoff', color: '#6554c0' },
    { type: 'state', key: 'UX', short: 'UX', title: 'In Design', description: 'UX/UI design phase' },
    
    // M0 milestone transitions to DEV state
    { type: 'milestone', key: 'M0', short: 'M0', title: 'Design Approved', subtitle: 'UX/UI Sign-off', color: '#9b59b6' },
    { type: 'state', key: 'DEV', short: 'DEV', title: 'In Development', description: 'Active development' },
    
    // Continue adding milestones and states...
    { type: 'milestone', key: 'M1', short: 'M1', title: 'Dev Complete', subtitle: 'Code Ready', color: '#3498db' },
    { type: 'state', key: 'QA', short: 'QA', title: 'Under QA', description: 'Quality assurance testing' },
    
    // Final milestone and state
    { type: 'milestone', key: 'M4', short: 'END', title: 'Production', subtitle: 'Live in Prod', color: '#229954' },
    { type: 'state', key: 'PRD', short: 'PRD', title: 'In Production', description: 'Live in production' },
]
```

**State properties:**
| Property | Meaning |
|----------|---------|
| `type` | Must be `'state'` |
| `key` | Internal identifier (used in code) |
| `short` | Display abbreviation (max 3 chars recommended) |
| `title` | Full name shown in KPI cards and legend |
| `description` | Description shown under KPI cards |

**Milestone properties:**
| Property | Meaning |
|----------|---------|
| `type` | Must be `'milestone'` |
| `key` | Internal identifier (matches keys in deliverable's `milestones` object) |
| `short` | Display abbreviation for timeline markers |
| `title` | Full name shown in upcoming milestone cards |
| `subtitle` | Description shown in milestone cards |
| `color` | Hex color for the milestone marker and associated state |

### `DELIVERABLES`

Array of items to track. Each item:

| Parameter | Type | Meaning |
|-----------|------|---------|
| `name` | string | Display name |
| `atRisk` | boolean | Shows warning indicator when `true` |
| `showInTimeline` | boolean | `false` = hidden from timeline, still counted in totals |
| `link` | string *(optional)* | URL shown as info icon; opens in new tab when clicked |
| `tags` | array *(optional)* | Tags for categorization (e.g. `["backend", "critical"]`) |
| `group` | string *(optional)* | Group name for grouping with expand/collapse |
| `milestones` | object | Date for each milestone defined in WORKFLOW |

**Example deliverable:**
```javascript
{
    name: "User Authentication",
    atRisk: false,
    showInTimeline: true,
    tags: ["security", "backend"],
    group: "Core Features",
    link: "https://jira.example.com/browse/PROJ-123",
    milestones: {
        START: "01/01/2026",
        M0: "15/01/2026",
        M1: "01/02/2026",
        M2: "15/02/2026",
        M3: "01/03/2026",
        M4: "15/03/2026"
    }
}
```

The system calculates the current state based on which milestone dates have passed relative to TODAY:
- If no milestone has passed → first state (e.g., "Not Started")
- If START passed but not M0 → second state (e.g., "In Design")
- If all milestones passed → final state (e.g., "In Production")

---

## How It Works

1. **State Calculation**: The system looks at today's date and compares it against each deliverable's milestone dates. The current state is determined by the last milestone that has passed.

2. **Color Coding**: Each state inherits the color of the *next* milestone (what you're working towards). The final state uses a darker shade of the last milestone's color.

3. **Gantt Bars**: Show the full timeline with colored segments. Past portions have full opacity; future portions are faded.

4. **KPI Cards**: Click any state card to filter the view. Click "At Risk" label to filter risky items.

---

## Project Structure

```
index.html           # Main dashboard (open in browser or host)
js/config_base.js    # Template configuration (copy to config.js)
js/config.js         # Your configuration (customize this)
docs/preview.png     # Preview screenshot
```

---

## Hosting

Since RoadmapSnap is a static site with no backend:

1. **GitHub Pages**: Push to a repo, enable Pages in settings
2. **Cloudflare Pages**: Connect repo, deploy automatically
3. **Netlify**: Drag & drop the folder or connect repo
4. **Any static host**: Just upload the files

The `index.html` file will be served as the default page.

---

## License

MIT License - feel free to use and modify for your projects.
