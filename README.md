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

## Clone, Customize & Manage in Your Own Repo

### 1. Clone

```bash
git clone https://github.com/<username>/RoadmapSnap.git my-project-roadmap
cd my-project-roadmap
```

### 2. Customize

Edit `js/config.js` to set your timeline, entity labels, and deliverables. Key sections:

- **`TIMELINE`** — `TODAY`, `START_MONTH`, `END_MONTH`
- **`ENTITY_LABELS`** — Singular/plural names (e.g. Deliverable, Feature, Workstream)
- **`DELIVERABLES`** — Array of items with `name`, `startDate`, `atRisk`, `milestones` (M0–M3)

Open `roadmap_dashboard.html` in a browser to view. No server needed.

### 3. Use as a Separate Repo

**Option A — Clone and re-point:**

```bash
git clone https://github.com/<username>/RoadmapSnap.git my-project-roadmap
cd my-project-roadmap
git remote rename origin template
git remote add origin <YOUR_PRIVATE_REPO_URL>
git push -u origin main
```

Customize privately, then commit and push:

```bash
$EDITOR js/config.js
git add js/config.js
git commit -m "Configure roadmap for My Project"
git push
```

**Option B — Use “Use this template”** on GitHub (or equivalent) to create a new repo, then clone and edit.

### 4. Keep in Sync with Template

```bash
git fetch template
git merge template/main
```

Resolve conflicts, keeping your project data in `js/config.js`.

---

## Project Structure

```
roadmap_dashboard.html   # Main dashboard (open in browser)
js/config.js             # All configuration
docs/preview.png         # Preview screenshot
```

---

## License

MIT License — see [LICENSE](LICENSE).
