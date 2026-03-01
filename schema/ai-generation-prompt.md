# AI Roadmap Generation Prompt Template

Use this prompt with Claude (claude.ai or any Claude API call) to generate a complete, valid `config.js` for RoadmapSnap from a description of your project.

---

## How to use

1. Copy the **Full Prompt** section below.
2. Replace the `[YOUR PROJECT BRIEF]` section at the bottom with your requirements.
3. Paste into [Claude.ai](https://claude.ai) or any Claude API call.
4. Copy the returned JavaScript block into `js/config.js`.
5. Refresh RoadmapSnap — your roadmap renders immediately.
6. Iterate conversationally: Claude retains context, so follow-up instructions like "make the backend phase 3 weeks shorter" or "add a QA milestone after Dev Complete" work without re-pasting the schema.

---

## Input signals to include

The more detail you provide, the better the generated roadmap. Useful inputs:

| Signal | Example |
|---|---|
| **Program / project name** | "Payments Platform v2" |
| **Overall deadline** | "Go-live by 30 September 2026" |
| **Teams and sizes** | "Backend (5 devs), Frontend (3 devs), QA (2), DevOps (1)" |
| **Effort estimates** | "Backend API: ~10 weeks. Frontend: ~8 weeks. Integration testing: ~3 weeks." |
| **Deliverable list** | Any granularity — bullet points, epics, or just a paragraph description |
| **Dependencies** | "Frontend can't start until the core API is stable" |
| **Contract type** | Fixed-price, T&M, milestone-based, hybrid — shapes milestone names (e.g. "Contract Sign", "Invoice Milestone 1") |
| **Hard milestone dates** | "Contract payment due on 30 June 2026" |
| **Known risk areas** | "Third-party API stability, PCI DSS certification, team availability in August" |
| **Items to flag at-risk** | "The data migration is high-risk — please mark it" |
| **Items to exclude from filters** | "The executive steering group should not appear in status filters" |
| **Preferred workflow stages** | Or just let Claude choose appropriate stages for your domain |

---

## Full Prompt

```
You are an expert project manager and PMO analyst. Your task is to generate a valid RoadmapSnap configuration object based on the project brief below.

## Output requirements

Return ONLY a JavaScript block in this exact format:

const CONFIG = {
  // ... full config object
};

Do not include any explanation, markdown, or text outside the JavaScript block.

## Schema

The CONFIG object must conform exactly to this JSON Schema:

{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RoadmapSnap Configuration",
  "type": "object",
  "required": ["TIMELINE", "WORKFLOW", "DELIVERABLES"],
  "properties": {
    "VERSION": { "type": "string" },
    "BUILD_DATE": { "type": "string" },
    "TIMELINE": {
      "type": "object",
      "required": ["START_MONTH", "END_MONTH"],
      "properties": {
        "TODAY": { "type": "string", "description": "DD/MM/YYYY or empty string" },
        "START_MONTH": { "type": "string", "pattern": "^(0?[1-9]|1[0-2])/\\d{4}$", "description": "MM/YYYY" },
        "END_MONTH": { "type": "string", "pattern": "^(0?[1-9]|1[0-2])/\\d{4}$", "description": "MM/YYYY" }
      }
    },
    "WORKFLOW": {
      "type": "array",
      "minItems": 3,
      "items": {
        "oneOf": [
          {
            "type": "object",
            "required": ["type", "key", "short", "title"],
            "properties": {
              "type": { "const": "state" },
              "key": { "type": "string" },
              "short": { "type": "string", "maxLength": 4 },
              "title": { "type": "string" },
              "description": { "type": "string" }
            },
            "additionalProperties": false
          },
          {
            "type": "object",
            "required": ["type", "key", "short", "title"],
            "properties": {
              "type": { "const": "milestone" },
              "key": { "type": "string" },
              "short": { "type": "string", "maxLength": 4 },
              "title": { "type": "string" },
              "subtitle": { "type": "string" }
            },
            "additionalProperties": false
          }
        ]
      }
    },
    "ENTITY_LABELS": {
      "type": "object",
      "properties": {
        "singular": { "type": "string" },
        "plural": { "type": "string" },
        "columnHeader": { "type": "string" },
        "scopeLabel": { "type": "string" }
      },
      "additionalProperties": false
    },
    "DASHBOARD_TEXT": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "totalSubtitleSuffix": { "type": "string" }
      },
      "additionalProperties": false
    },
    "NON_FILTERABLE_GROUPS": { "type": "array", "items": { "type": "string" } },
    "GROUP_ORDER": { "type": "array", "items": { "type": "string" } },
    "DELIVERABLES": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["name", "milestones"],
        "properties": {
          "name": { "type": "string", "minLength": 1, "description": "Must be unique" },
          "group": { "type": "string" },
          "atRisk": { "type": "boolean", "default": false },
          "descoped": { "type": "boolean", "default": false },
          "showInTimeline": { "type": "boolean", "default": true },
          "tags": { "type": "array", "items": { "type": "string" } },
          "link": { "type": "string", "format": "uri" },
          "dependencies": {
            "type": "array",
            "items": {
              "oneOf": [
                { "type": "string" },
                {
                  "type": "object",
                  "required": ["task"],
                  "properties": {
                    "task": { "type": "string" },
                    "from": { "type": "string", "description": "Milestone key in the source deliverable" },
                    "to": { "type": "string", "description": "Milestone key in this deliverable" }
                  },
                  "additionalProperties": false
                }
              ]
            }
          },
          "milestones": {
            "type": "object",
            "description": "Keys are milestone keys from WORKFLOW; values are DD/MM/YYYY or empty string",
            "additionalProperties": {
              "oneOf": [
                { "type": "null" },
                { "type": "string", "const": "" },
                { "type": "string", "pattern": "^(0?[1-9]|[12][0-9]|3[01])/(0?[1-9]|1[0-2])/\\d{4}$" }
              ]
            }
          }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
}

## Runtime rules (enforced by the app, not the schema)

These rules MUST be satisfied or the app will refuse to render:

1. **WORKFLOW alternation**: WORKFLOW items at even indices (0, 2, 4, ...) must have type "state"; odd indices (1, 3, 5, ...) must have type "milestone". The array must start with a "state" and end with a "state". Minimum 3 items (state → milestone → state).

2. **First milestone key present in all deliverables**: Identify the first item in WORKFLOW with type "milestone" — call its key the "first milestone key". Every deliverable in DELIVERABLES must have this key present in its `milestones` object (even if the value is an empty string).

3. **Unique deliverable names**: All `name` values in DELIVERABLES must be distinct strings.

4. **Date formats**:
   - TIMELINE.TODAY, TIMELINE.START_MONTH, TIMELINE.END_MONTH, and all milestone date values use DD/MM/YYYY for dates and MM/YYYY for month ranges.
   - All milestone dates in all deliverables must fall within the TIMELINE range, otherwise they render outside the visible timeline.

5. **Dependencies**: The `task` field in dependency objects must match the `name` of another deliverable exactly. A simple string dependency `"Task Name"` means the last milestone of that task must be reached before the first milestone of this deliverable.

## Design guidance

- Choose a WORKFLOW that reflects the lifecycle of the project domain. For software: design → dev → QA → UAT → release. For infrastructure: planning → procurement → installation → testing → cutover. For consulting: discovery → proposal → delivery → sign-off.
- Use `group` to represent teams, workstreams, or project phases — this enables grouping and filtering in the UI.
- Use `tags` for cross-cutting concerns (e.g. "risk", "backend", "compliance") to enable tag-based filtering.
- Set `atRisk: true` on deliverables where there are dependencies on third parties, tight deadlines, or known risk factors.
- For fixed-price contracts, use milestone names that align with payment events (e.g. "Contract Sign", "Phase 1 Complete", "Final Delivery").
- For milestone-based contracts, set hard dates on the milestone keys that correspond to payment events.
- Spread milestones realistically based on effort estimates. If the brief gives effort in weeks, convert to calendar dates accounting for team size and any holidays mentioned.
- Use `NON_FILTERABLE_GROUPS` for governance bodies or cross-program items that should appear in the timeline but not in the status filter panel.
- Use `GROUP_ORDER` to control the visual order of groups in the timeline.

---

## [YOUR PROJECT BRIEF]

Replace this section with your project description. Include as much of the following as is relevant:

- Program / project name
- Overall timeline and hard deadlines
- Teams involved and their sizes
- Deliverables (any level of detail — bullet list, epics, or paragraph)
- Effort estimates per team or deliverable
- Dependencies between deliverables
- Contract type and any payment milestones
- Known risks and which deliverables are most exposed
- Any items that should be excluded from status filters
- Any specific workflow stages you want (or leave blank to let Claude choose)

Example:

> We are building a Customer Data Platform for our retail client. Go-live is 31 December 2026.
>
> Teams: Data Engineering (4), Backend API (3), Frontend (2), QA (2), Cloud Infra (1).
>
> Deliverables: data ingestion pipelines, customer profile API, segmentation engine, analytics dashboard, admin portal, data governance tooling, user acceptance testing, production cutover.
>
> The contract is fixed-price with three milestone payments: contract sign (already done), mid-delivery (30 June 2026), and final go-live.
>
> Dependencies: the customer profile API must be stable before frontend work starts; the segmentation engine depends on the ingestion pipelines being complete.
>
> Risks: the data governance tooling depends on legal sign-off which is outside our control — please flag it as at-risk. August has reduced capacity across all teams.
>
> Please use groups to represent the teams. Add tags for compliance-related deliverables.
```

---

## What to expect

Claude will return a `const CONFIG = { ... };` block containing:

- A `TIMELINE` covering the project dates
- A `WORKFLOW` with states and milestones appropriate for your domain
- `DELIVERABLES` with one entry per workstream/epic, grouped by team, with:
  - Dates spread according to your effort estimates
  - Dependencies represented as dependency arrays
  - `atRisk: true` on the items you flagged
  - `tags` for cross-cutting concerns
- `ENTITY_LABELS` and `DASHBOARD_TEXT` customised for your domain
- `GROUP_ORDER` ordering teams logically

Copy the returned block into `js/config.js` and refresh RoadmapSnap.

---

## Iterating after initial generation

Claude retains context within the same conversation. You can refine without re-pasting the schema:

- "Make the QA phase 2 weeks shorter."
- "Add a 'Security Review' milestone between UAT and go-live for the backend deliverables."
- "Flag the data governance workstream as at-risk."
- "Split the frontend deliverable into two: one for the customer portal and one for the admin portal."
- "Move all dates 6 weeks later to account for a delayed project start."
- "Add a dependency: the analytics dashboard can't start until the customer profile API is in QA."
- "The contract has an additional payment milestone on 15 August 2026 — add it to all delivery teams."
