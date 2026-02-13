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
| **Customizable labels** | Entity names, milestone text, status labels—all configurable |
| **Hidden items** | `showInTimeline: false` hides items from the chart but keeps them in totals |

---

## Quick Start

You are free to clone the repository and adjust `js/config.js` to customize the roadmap. Open `roadmap_dashboard.html` in a browser to view. No server needed—refresh the page after editing the config to see changes.

---

## Configuration (`js/config.js`)

All settings live in `js/config.js`. The file defines a global `CONFIG` object. Parameters:

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

### `DELIVERABLES`

Array of items to track. Each item:

| Parameter | Type | Meaning |
|-----------|------|---------|
| `name` | string | Display name |
| `startDate` | `"DD/MM/YYYY"` or `null` | When development starts; `null` if already in progress |
| `atRisk` | boolean | Shows warning indicator when `true` |
| `showInTimeline` | boolean | `false` = hidden from timeline, still counted in totals |
| `link` | string *(optional)* | URL shown as info icon; opens in new tab when clicked |
| `milestones` | object | `{ M0, M1, M2, M3 }` — each date as `"DD/MM/YYYY"` |

---

## Project Structure

```
roadmap_dashboard.html   # Main dashboard (open in browser)
js/config.js             # All configuration
docs/preview.png         # Preview screenshot
```

---

## License

MIT License — see [LICENSE](LICENSE). Feel free to improve the tool under these terms.
