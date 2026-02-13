# RoadmapSnap

A powerful, simple roadmap dashboard that gives clear visibility of project progress to any stakeholder—collaborators, third parties, and executive leadership. Runs entirely in the browser: no backend, no build step.

![RoadmapSnap Preview](docs/preview.png)

---

## Features

| Feature | Description |
|---------|-------------|
| **Executive summary** | KPIs by status (NS/DEV/M0/M1/M2/M3), risk count, overall completion |
| **Compact timeline** | One row per deliverable with milestone markers across months |
| **Risk visibility** | `atRisk: true` items show a warning indicator |
| **PNG export** | Export full roadmap, summary-only, or timeline-only views |
| **CSV/JSON export** | Export deliverable data for reporting and integration |
| **Customizable labels** | Entity names, milestone text, status labels—all configurable |
| **Hidden items** | `showInTimeline: false` hides items from the chart but keeps them in totals |
| **Filtering & Sorting** | Filter by status, risk, search text; sort by name, status, date |
| **Dynamic milestones** | Define custom milestone tracks beyond the default M0-M3 |
| **Grouping** | Group deliverables with expand/collapse functionality |
| **Dark mode** | Toggle between light and dark themes (persisted in localStorage) |
| **Date zoom** | Quick buttons to zoom timeline to 3/6/12 months or full range |
| **Info links** | Optional link per deliverable opens in new tab |

---

## Quick Start

1. **Clone** the repository.
2. **Rename** `js/config_base.js` to `js/config.js` (this is the template; your `config.js` stays local and is not committed).
3. **Edit** `js/config.js` to customize your roadmap.
4. **Open** `roadmap_dashboard.html` in a browser to view. No server needed—refresh the page after editing the config to see changes.

---

## Configuration

All settings live in `js/config.js`. **Start by renaming `js/config_base.js` to `js/config.js`** — the template contains sample data you can adjust. The file defines a global `CONFIG` object. Parameters:

### `TIMELINE`

| Parameter | Format | Meaning |
|-----------|--------|---------|
| `TODAY` | `"DD/MM/YYYY"` | Reference date for status calculation and "today" marker |
| `START_MONTH` | `"MM/YYYY"` | First month shown on the timeline |
| `END_MONTH` | `"MM/YYYY"` | Last month shown on the timeline |

### `ENTITY_LABELS`

How items are named in the UI (e.g. Deliverable, Feature, Workstream).

| Parameter | Meaning |
|-----------|---------|
| `singular` | Single item label (e.g. "Deliverable") |
| `plural` | Multiple items label (e.g. "Deliverables") |
| `columnHeader` | Header for the first column in the timeline grid |
| `scopeLabel` | Used in phrases like "total deliverables in scope" |

### `DASHBOARD_TEXT`

| Parameter | Meaning |
|-----------|---------|
| `title` | Main dashboard title |
| `totalSubtitleSuffix` | Subtitle under the Total KPI card (e.g. "in roadmap scope") |

### `MILESTONE_TEXT`

For each milestone (`M0`, `M1`, `M2`, `M3`):

| Parameter | Meaning |
|-----------|---------|
| `short` | Short label (e.g. "M0") |
| `title` | Title shown in legend and upcoming-milestone cards |
| `subtitle` | Subtitle description |

### `STATUS_LABELS`

Short labels for status chips (NS, DEV, M0, M1, M2, M3). Example: `NS: "Not Started"`, `DEV: "In Development"`.

### `STATUS_DESCRIPTIONS`

Descriptions under each KPI card. Example: `NS: "Not yet started"`, `M3: "Fully migrated"`.

### `MILESTONES` *(optional)*

Define custom milestones beyond the default M0-M3. If omitted, defaults to M0-M3 using `MILESTONE_TEXT` values.

```javascript
MILESTONES: [
    { key: "M0", short: "M0", title: "Dev Complete", subtitle: "...", color: "#8993a4" },
    { key: "M1", short: "M1", title: "Deployed", subtitle: "...", color: "#ffab00" },
    // Add more as needed
]
```

### `DELIVERABLES`

Array of items to track. Each item:

| Parameter | Type | Meaning |
|-----------|------|---------|
| `name` | string | Display name |
| `startDate` | `"DD/MM/YYYY"` or `null` | When development starts; `null` if already in progress |
| `atRisk` | boolean | Shows warning indicator when `true` |
| `showInTimeline` | boolean | `false` = hidden from timeline, still counted in totals |
| `link` | string *(optional)* | URL shown as info icon; opens in new tab when clicked |
| `tags` | array *(optional)* | Tags for filtering (e.g. `["backend", "critical"]`) |
| `group` | string *(optional)* | Group name for grouping with expand/collapse |
| `milestones` | object | `{ M0, M1, M2, M3, ... }` — each date as `"DD/MM/YYYY"` |

---

## Project Structure

```
roadmap_dashboard.html   # Main dashboard (open in browser)
js/config_base.js        # Config template — rename to config.js
js/config.js             # Your config (create by renaming config_base.js; not committed)
docs/preview.png         # Preview screenshot
```

---

## License

MIT License — see [LICENSE](LICENSE). Feel free to improve the tool under these terms.
