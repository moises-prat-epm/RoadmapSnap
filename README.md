## RoadmapSnap: A Project Roadmap Dashboard

A self-contained, interactive **roadmap dashboard** you can reuse for any project to track items (deliverables, features, workstreams, epics, etc.) across milestones. It runs entirely in the browser with **no backend** and **no build step**.

- **Dashboard file**: `roadmap_dashboard.html`
- **Configuration file**: `js/config.js`

---

### Preview

This repo is intended to include a generic preview image:

- `docs/preview.png` (see `docs/preview.md` for how to generate it)

---

### What you get

- **Executive summary dashboard**: KPIs by status (NS/DEV/M0/M1/M2/M3), risk count, and overall completion.
- **Compact timeline**: one row per item with milestone markers across months.
- **Risk visibility**: items with `atRisk: true` get a warning indicator.
- **PNG exports**:
  - Full roadmap
  - Summary-only view
  - Timeline-only view

---

### Quick start (use the generic template)

1. Clone the repo:

```bash
git clone <PUBLIC_TEMPLATE_REPO_URL>
cd <REPO_FOLDER>
```

2. Open `roadmap_dashboard.html` in your browser (double-click it, or use `File → Open`).
3. Edit `js/config.js`.
4. Refresh the browser tab to see updates.

---

### Configuration (edit `js/config.js`)

All customization lives in **one place**: `js/config.js`.

The file defines a global `CONFIG` object used by `roadmap_dashboard.html`:

```javascript
const CONFIG = {
  TIMELINE: { TODAY: "DD/MM/YYYY", START_MONTH: "MM/YYYY", END_MONTH: "MM/YYYY" },
  ENTITY_LABELS: { singular: "Deliverable", plural: "Deliverables", columnHeader: "Deliverable", scopeLabel: "deliverables" },
  DASHBOARD_TEXT: { title: "Project Roadmap Dashboard", totalSubtitleSuffix: "in roadmap scope" },
  MILESTONE_TEXT: { M0: {...}, M1: {...}, M2: {...}, M3: {...} },
  STATUS_LABELS: { NS: "...", DEV: "...", M0: "...", M1: "...", M2: "...", M3: "..." },
  STATUS_DESCRIPTIONS: { NS: "...", DEV: "...", M0: "...", M1: "...", M2: "...", M3: "..." },
  DELIVERABLES: [ /* your items */ ]
};
```

#### Item shape (in `CONFIG.DELIVERABLES`)

Each item looks like:

```javascript
{
  name: "Deliverable name",
  startDate: "DD/MM/YYYY" | null,
  atRisk: false,
  showInTimeline: true,
  milestones: {
    M0: "DD/MM/YYYY",
    M1: "DD/MM/YYYY",
    M2: "DD/MM/YYYY",
    M3: "DD/MM/YYYY"
  }
}
```

Notes:

- **Dates** must be `DD/MM/YYYY`.
- **`showInTimeline: false`** hides the item from the timeline but it will still count in totals.
- Status is computed automatically from milestone dates vs `TIMELINE.TODAY`.

---

### Exporting PNGs

Use the buttons at the top of the page:

- **Export Full Roadmap**
- **Export Summary Only**
- **Export Timeline Only**

This uses `html2canvas` (loaded from a CDN). If your environment blocks external CDNs, exports may fail unless you vendor that library locally.

---

### Create a private copy for your project (recommended)

Use the public template repo as a starting point, but keep real project data in a **private repo**.

#### Option A: clone → re-point to a private repo

```bash
# 1) Clone the public template
git clone <PUBLIC_TEMPLATE_REPO_URL> my-project-roadmap
cd my-project-roadmap

# 2) Keep a link to the template for future updates (optional but recommended)
git remote rename origin template

# 3) Add your new private repo as "origin"
git remote add origin <YOUR_PRIVATE_REPO_URL>

# 4) Push the template content into your private repo
git push -u origin main
```

Then customize privately:

```bash
# edit configuration
$EDITOR js/config.js

git add js/config.js
git commit -m "Configure roadmap for <My Project>"
git push
```

#### Option B: “Use this template” (Git hosting UI)

If your Git hosting supports **template repositories**, you can create a new private repo from this one via the UI, then clone your private repo and edit `js/config.js`.

---

### Keeping your private repo up to date with the public template

If you used “template” as a remote name (Option A above), you can pull improvements from the public template later:

```bash
git fetch template
git merge template/main
```

Resolve conflicts carefully (keep your project data in `js/config.js`).

---

### Why the config file is JavaScript (vs JSON/YAML)

For this type of “open the HTML by double-clicking” tool, **JavaScript config is the most reliable**:

- **Works over `file://`** without needing a local server.
- Supports **comments** and trailing commas (friendlier for editing).
- No parsing step (the browser just loads `js/config.js`).

Alternatives:

- **JSON**: good for strict “data-only” config, but usually requires `fetch()` + parsing; `fetch()` from `file://` is often blocked, so you’d typically need a local HTTP server.
- **YAML**: human-friendly, but requires a YAML parser library in the browser and has the same `file://` loading constraints as JSON.

## Project Roadmap Dashboard

A self-contained, interactive **roadmap dashboard** that you can use for any project to track deliverables across milestones. Everything runs client-side in the browser; there is no backend and no build step.

The main artifact is a single HTML file:

- `roadmap_dashboard.html`

Open it, adjust the `CONFIG` section, and you have a tailored roadmap for your project.

---

### 🎯 What this tool gives you

- **Executive summary dashboard**: KPIs by status (NS/DEV/M0/M1/M2/M3), risk count, and overall completion.
- **Compact roadmap timeline**: One row per deliverable (or feature, workstream, epic, etc.) with milestone markers across months.
- **Risk visibility**: Items flagged as `atRisk: true` get a warning icon and visual emphasis.
- **PNG exports**: One-click export of:
  - Full roadmap
  - Summary-only view
  - Timeline-only view

All calculations (status, percentages, upcoming milestones) are derived from the `CONFIG` object inside the HTML file.

---

### 🚀 Quick start

1. **Get the file**  
   Ensure you have `roadmap_dashboard.html` on your machine.

2. **Open in a browser**  
   Double-click the file, or open it via `File → Open` in any modern browser.  
   Recommended: Chrome, Edge, Firefox, or Safari.

3. **Review the default roadmap**  
   The page will render immediately using the built-in configuration:
   - Summary dashboard at the top
   - Legend and compact timeline below

4. **Export images (optional)**  
   Use the buttons at the top:
   - **Export Full Roadmap**
   - **Export Summary Only**
   - **Export Timeline Only**  
   Each click generates a PNG and downloads it locally (filename includes the configured `TODAY` date).

5. **Customize the data**  
   - Open `roadmap_dashboard.html` in a text editor (VS Code, Cursor, etc.).
   - Locate the `CONFIG` object near the top of the `<script>` block:

   ```javascript
   const CONFIG = {
       TIMELINE: { ... },
       STATUS_LABELS: { ... },
       STATUS_DESCRIPTIONS: { ... },
       DATA_SOURCES: [ ... ]
   };
   ```

   - Adjust values as needed (see sections below), save the file, then refresh the browser.

No installation, dependencies, or build tooling required.

---

### 🧠 How the configuration works

All behavior is driven by the `CONFIG` object in the `<script>` block of `roadmap_dashboard.html`.

#### 1. `TIMELINE`

Defines the date window for the horizontal axis and the “today” reference used for status calculations.

```javascript
TIMELINE: {
    TODAY: "11/02/2026",   // Current date (DD/MM/YYYY)
    START_MONTH: "01/2026", // First month shown (MM/YYYY)
    END_MONTH: "07/2026"    // Last month shown (MM/YYYY)
},
```

- **`TODAY`**:
  - Drives status (NS/DEV/M0/M1/M2/M3) per data source.
  - Drives “upcoming milestone” cards (only future or same-day dates are shown).
  - Included in the PNG filename (e.g. `Full-Roadmap-11-02-2026.png`).
- **`START_MONTH` / `END_MONTH`**:
  - Control which months appear in the compact timeline.
  - Milestones outside this range are **not drawn**, but still counted in stats.

#### 2. `STATUS_LABELS`

Defines the short labels shown inside the status chips (NS/DEV/M0/M1/M2/M3).

```javascript
STATUS_LABELS: {
    NS: "Not Started",
    DEV: "In Development",
    M0: "Dev Complete",
    M1: "Prod Deployed",
    M2: "Production Ready",
    M3: "Switch Complete"
},
```

Usually you only change these if you want different wording.

#### 3. `STATUS_DESCRIPTIONS`

Descriptions used under the KPI cards in the summary dashboard.

```javascript
STATUS_DESCRIPTIONS: {
    NS: "Not yet started",
    DEV: "In development",
    M0: "Development done",
    M1: "In validation",
    M2: "Production ready",
    M3: "Fully migrated"
},
```

These are explanatory only and don’t affect logic.

#### 2. `DATA_SOURCES`

Array of all **items** in scope (deliverables, features, workstreams, epics, etc. — you decide via labels).

Each entry has this shape:

```javascript
{
    name: "MasterMind",
    startDate: null,      // "DD/MM/YYYY" or null
    atRisk: false,        // true = highlight and show risk icon
    showInTimeline: true, // false = hidden from chart, still counted in stats
    milestones: {
        M0: "15/11/2025", // Dev Complete
        M1: "20/11/2025", // Prod Deployed
        M2: "15/12/2025", // Production Ready
        M3: "15/04/2026"  // Switch Complete
    }
},
```

**Status calculation** is automatic based on `TODAY` and milestone dates:

- If `M3` date passed → status `M3`
- Else if `M2` date passed → `M2`
- Else if `M1` date passed → `M1`
- Else if `M0` date passed → `M0`
- Else if `startDate` passed → `DEV`
- Else if `startDate` in future → `NS`
- If no `startDate` but `M0` is in the future → `DEV`

**Other flags:**

- **`atRisk: true`**
  - Shows a red warning triangle next to the data source name.
  - Contributes to the “X At Risk” summary badge.
- **`showInTimeline: false`**
  - Source is excluded from the compact timeline view.
  - Still included in all counts and percentages (KPI cards and progress bar).
  - Useful for legacy/completed sources you don’t want shown in the chart.

At the bottom of the array there is a commented **template** you can copy to add new items:

```javascript
/* Template for new data source:
{
    name: "New Source Name",
    startDate: "DD/MM/YYYY",  // When dev starts, null if already started
    atRisk: false,            // Set to true to show risk warning
    showInTimeline: true,     // Set to false to hide from timeline
    milestones: {
        M0: "DD/MM/YYYY",     // Dev Complete
        M1: "DD/MM/YYYY",     // Prod Deployment
        M2: "DD/MM/YYYY",     // Prod Ready
        M3: "DD/MM/YYYY"      // Switch
    }
},
*/
```

---

### 🧩 Generic labels: entities & text

This tool is intentionally generic. Each entry in `DATA_SOURCES` can represent whatever you want to track (deliverable, feature, workstream, epic, integration, etc.). The UI text is driven by labels in `CONFIG`.

#### 3. `ENTITY_LABELS`

Controls how your main entities are named in the UI:

```javascript
ENTITY_LABELS: {
    singular: "Deliverable",
    plural: "Deliverables",
    columnHeader: "Deliverable",
    scopeLabel: "deliverables"
},
```

The dashboard will then show labels like:

- “Total Deliverables”
- “Overall Progress (All 15 Deliverables)”
- “Showing 10 of 15 deliverables”
- Column header: “Deliverable”

#### 4. `DASHBOARD_TEXT`

Controls high-level titles and subtitles:

```javascript
DASHBOARD_TEXT: {
    title: "Project Roadmap Dashboard",
    totalSubtitleSuffix: "in roadmap scope"
},
```

#### 5. `MILESTONE_TEXT`

Customizes how each milestone is named in the **upcoming milestones cards** and compact legend:

```javascript
MILESTONE_TEXT: {
    M0: { short: "M0", title: "Design Complete",   subtitle: "Specs & design approved" },
    M1: { short: "M1", title: "Build Complete",    subtitle: "Implementation finished" },
    M2: { short: "M2", title: "UAT Complete",      subtitle: "User testing passed" },
    M3: { short: "M3", title: "Released",          subtitle: "Live in production" }
},
```

The underlying **status logic and dates do not change**; only the labels and descriptions shown in the UI become project-specific.

---

### ➕ Adding or editing items

#### Add a new item

1. Copy the template block above (without the comment markers).
2. Paste it inside the `DATA_SOURCES` array.
3. Fill in:
   - `name`
   - `startDate` (or `null` if already in progress)
   - `atRisk`
   - `showInTimeline`
   - Milestone dates (`M0`–`M3`) in `DD/MM/YYYY` format.
4. Save the file and refresh the browser.

#### Update an existing item

1. Find the existing object in `DATA_SOURCES` by its `name`.
2. Adjust any of:
   - `startDate`
   - `atRisk`
   - `showInTimeline`
   - Milestone dates in `milestones`.
3. Save and refresh the page.

---

### 📤 Exporting PNGs for presentations

At the top of the page there are three buttons:

- **Export Full Roadmap** – Entire dashboard (summary + legend + compact timeline).
- **Export Summary Only** – KPI cards + progress bar + upcoming milestones.
- **Export Timeline Only** – Legend and compact timeline grid.

On click:

1. Buttons are temporarily disabled to avoid double-clicks.
2. `html2canvas` renders the target section into a canvas.
3. A PNG is generated and automatically downloaded.
4. Buttons are re-enabled.

You can then paste these PNGs into slide decks, documents, or emails.

---

### 🌐 Browser & environment notes

- Works best on **desktop browsers** (Chrome/Edge recommended).
- The only external dependency is `html2canvas` loaded from a CDN.  
  If you need fully offline behavior, download the script and reference it locally.
- All processing is done in the browser:
  - Updating dates and refreshing is instantaneous.
  - No data is sent to any server.

---

### ✅ Summary

- **Open** `roadmap_dashboard.html` in a modern browser.
- **Configure** `TIMELINE`, `ENTITY_LABELS`, `DASHBOARD_TEXT`, `MILESTONE_TEXT`, and `DATA_SOURCES` in the `CONFIG` object.
- **Refresh** the page to recompute statuses and redraw the roadmap.
- **Export** PNGs for reporting using the built-in buttons.

That’s all you need to maintain and share a project roadmap using this single HTML file.

---

### 🧭 How to use this project in your organization

This repository is intended as a **generic roadmap template** that teams can clone and adapt.

#### 1. As a public, generic template (organization-wide)

In your shared/public repo:

- Keep `roadmap_dashboard.html` **generic**:
  - Neutral labels in `ENTITY_LABELS` (e.g. “Deliverable” / “Workstream”).
  - Fictional/sample data in `DATA_SOURCES` (no sensitive information).
- Keep this repo as the **reference template**; do not put project-specific secrets or timelines here.

Teams can:

- Clone this repo.
- Edit `roadmap_dashboard.html` in their own fork/clone or private repo.

#### 2. Create a private project from the template

From your machine:

```bash
# 1) Clone the public template
git clone <PUBLIC_TEMPLATE_REPO_URL> my-project-roadmap
cd my-project-roadmap

# 2) Point this clone at your new private repo
git remote remove origin
git remote add origin <YOUR_PRIVATE_REPO_URL>

# 3) Push the generic template into the private repo
git push -u origin main
```

You now have a **private copy** of the generic roadmap project.

#### 3. Customize roadmap in your private repo

In your private repo:

1. Open `roadmap_dashboard.html` in a code editor.
2. Update:
   - `TIMELINE` – your project’s dates.
   - `ENTITY_LABELS` – what you call your items (Deliverables, Features, Workstreams, etc.).
   - `DASHBOARD_TEXT` – project-specific title and subtitles.
   - `MILESTONE_TEXT` – what M0–M3 mean for your project.
   - `DATA_SOURCES` – your real deliverables and milestone dates.
3. Open `roadmap_dashboard.html` in a browser to validate the view.
4. Commit and push:

```bash
git add roadmap_dashboard.html
git commit -m "Configure roadmap for <My Project>"
git push
```

Going forward, you only need to:

- Edit `roadmap_dashboard.html` when your plan changes.
- Re-export PNGs as needed for reporting.
