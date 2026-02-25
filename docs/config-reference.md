# RoadmapSnap Configuration Reference

Auto-generated from `schema/config.schema.json` — do not edit manually.

---

## Quick Start

Minimal valid config (copy and adapt):

```javascript
const CONFIG = {
  TIMELINE: { TODAY: '15/04/2026', START_MONTH: '01/2026', END_MONTH: '12/2026' },
  WORKFLOW: [
    { type: 'state', key: 'NS', short: 'NS', title: 'Not Started', description: '' },
    { type: 'milestone', key: 'START', short: 'GO', title: 'Start', color: '#6554c0' },
    { type: 'state', key: 'DEV', short: 'DEV', title: 'In Development', description: '' },
    { type: 'milestone', key: 'M1', short: 'M1', title: 'Done', color: '#229954' },
    { type: 'state', key: 'DONE', short: 'DONE', title: 'Done', description: '' },
  ],
  DELIVERABLES: [
    { name: 'Task Alpha', atRisk: false, showInTimeline: true, group: 'Group A', milestones: { START: '01/01/2026', M1: '01/06/2026' } },
    { name: 'Task Beta', atRisk: true, showInTimeline: true, group: 'Group A', dependencies: ['Task Alpha'], milestones: { START: '01/03/2026', M1: '01/09/2026' } },
    { name: 'Task Gamma', atRisk: false, showInTimeline: false, milestones: { START: '01/06/2026', M1: '01/12/2026' } },
  ],
};
```


---

## VERSION

| | |
| --- | --- |
| **Type** | string |
| **Required** | Optional |
| **Description** | Build or app version string. |

## BUILD_DATE

| | |
| --- | --- |
| **Type** | string |
| **Required** | Optional |
| **Description** | Build date string. |

## TIMELINE

| | |
| --- | --- |
| **Type** | object |
| **Required** | Required |
| **Description** | Timeline range and current date. |

### TIMELINE properties

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `TODAY` | string | Optional | Current date for 'today' line; DD/MM/YYYY or empty string. |
| `START_MONTH` | string | Yes | Start of timeline range (MM/YYYY). |
| `END_MONTH` | string | Yes | End of timeline range (MM/YYYY). |

## WORKFLOW

| | |
| --- | --- |
| **Type** | array (min 3 items) |
| **Required** | Required |
| **Description** | Items must alternate: index 0,2,4,... type 'state'; index 1,3,5,... type 'milestone'. Enforced by configValidator. |

### WORKFLOW item properties (state vs milestone)

| Property | State | Milestone | Description |
| --- | --- | --- | --- |
| `color` | — | ✓ | Hex color for milestone. |
| `description` | ✓ | — |  |
| `key` | ✓ | ✓ |  |
| `short` | ✓ | ✓ |  |
| `subtitle` | — | ✓ |  |
| `title` | ✓ | ✓ |  |
| `type` | ✓ | ✓ |  |

## ENTITY_LABELS

| | |
| --- | --- |
| **Type** | object |
| **Required** | Optional |

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `singular` | string |  |
| `plural` | string |  |
| `columnHeader` | string |  |
| `scopeLabel` | string |  |

## DASHBOARD_TEXT

| | |
| --- | --- |
| **Type** | object |
| **Required** | Optional |

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `title` | string |  |
| `totalSubtitleSuffix` | string |  |

## NON_FILTERABLE_GROUPS

| | |
| --- | --- |
| **Type** | array |
| **Required** | Optional |

## GROUP_ORDER

| | |
| --- | --- |
| **Type** | array |
| **Required** | Optional |

## DELIVERABLES

| | |
| --- | --- |
| **Type** | array (min 1 item) |
| **Required** | Required |
| **Description** | Deliverable names must be unique (enforced by configValidator). First milestone key from WORKFLOW must appear in each deliverable's milestones. |

### DELIVERABLES item properties

| Property | Type | Required | Description | Default |
| --- | --- | --- | --- | --- |
| `name` | string | Yes | Must be unique across DELIVERABLES. | — |
| `group` | string | Optional |  | — |
| `atRisk` | boolean | Optional |  | false |
| `descoped` | boolean | Optional |  | false |
| `showInTimeline` | boolean | Optional |  | true |
| `tags` | array | Optional |  | — |
| `link` | string | Optional |  | — |
| `startDate` | string | Optional | Legacy: used as START date when milestones.START is absent (getMilestoneDate). | — |
| `dependencies` | array | Optional |  | — |
| `milestones` | object | Yes | Keys are milestone keys (e.g. START, M1); values must be DD/MM/YYYY or empty. First milestone key from WORKFLOW is required. | — |

