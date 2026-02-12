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