# RoadmapSnap Evolution Roadmap

> Evolving RoadmapSnap from a static Gantt chart into a fully AI-Powered PMO platform for managing complex programs.

**Visualise this roadmap in the tool itself:** copy `js/config_roadmap_evolution.js` to `js/config.js` and refresh.

---

## Phase Dependencies

```
Phase 0: Close open stubs (RBAC, org resolution, user provisioning)   ← unblocks everything
Phase 1: React migration + in-browser editor                           ← parallel with Phase 0
Phase 2: SaaS API — CRUD, RBAC, multi-tenancy                         ← after Phase 0
Phase 3: Program intelligence — analytics, portfolio, real-time        ← after Phase 2
Phase 4: AI Layer 1 — risk scoring, forecasting, NL chat, reports      ← after Phase 3
Phase 5: AI Layer 2 — NL mutations, integrations                       ← after Phase 4
Phase 6: Predictive portfolio — historical mining, proactive AI        ← after Phase 5
```

Phases 0 and 1 start immediately and run in parallel.

---

## Phase 0 — Close Open Stubs
**Timeline:** ~2–3 weeks | **Starts:** immediately

Unblocks all subsequent API work by replacing the two stubs explicitly marked `TODO Epic 2` in the codebase.

| Initiative | File | Change |
|---|---|---|
| Real RBAC Enforcement | `packages/api/src/plugins/rbac.js` | Replace warn-and-pass stub with `org_members` role lookup; store `request.orgRole` |
| Org Resolution | `packages/api/src/plugins/context.js` | Replace `DEFAULT_ORG_ID` env hardcode with `x-org-id` header resolution |
| User Provisioning on Login | `packages/api/src/plugins/auth.js` | Upsert user on `/auth/me` instead of silently ignoring missing rows |
| Route Plugin Registry | `packages/api/src/server.js` | Register domain route plugins under `/api/v1/` prefix |

**Verification:** `packages/api/tests/rls.test.js` must pass with real org context.

---

## Phase 1 — React Migration + In-Browser Editor
**Timeline:** ~6–8 weeks | **Starts:** immediately (parallel with Phase 0)

Modernise the Lite frontend and add CRUD editing without a backend. All existing features preserved.

| Initiative | Details |
|---|---|
| `packages/web` Scaffold | Vite + React 19 + TypeScript + React Router v7 + TanStack Query v5 |
| React 19 Migration | Convert all `js/ui/*.js` modules to React components; `js/core/*.js` kept as-is (pure logic), re-exported as `@roadmapsnap/core` internal package |
| Remove `window.*` Globals | Eliminate the 50+ `window.*` assignments catalogued in `docs/phase0-window-audit.md` |
| In-Browser Config Editor | Sidebar/modal to add/edit/delete deliverables, milestones, groups, workflow — React Hook Form + real-time `configValidator.js` validation |
| LocalStorage Persistence | Config edits survive page refresh; "Reset to file" button reverts to original `config.js` |
| Config Import/Export v2 | Load full CONFIG from JSON file; save to JSON; extends existing `js/export/json.js` |

**Stack additions:** React 19, TypeScript, React Router v7, TanStack Query v5, React Hook Form

**Verification:** All 5 root test suites pass after migration. Load `js/config_roadmap_evolution.js` to verify meta-config renders correctly.

---

## Phase 2 — SaaS API: Domain Entities, CRUD, Multi-Tenancy
**Timeline:** ~6–8 weeks | **Starts:** after Phase 0

Replace the static `config.js` with a real Postgres backend. Teams can collaborate on workspaces with proper access control.

| Initiative | Details |
|---|---|
| Workspace CRUD | `POST/GET/PATCH/DELETE /api/v1/workspaces`; `workflow_definition JSONB` maps to `CONFIG.WORKFLOW` |
| Projects & Milestones API | `/api/v1/workspaces/:id/projects` and `/api/v1/projects/:id/milestones` |
| Dependencies API | Read/write project-to-project dependencies; server-side PostgreSQL recursive CTE mirrors `getDependencyGraph()` |
| Live Gantt from API | Frontend fetches workspace data via TanStack Query; renders using migrated Lite components |
| Full RBAC Enforcement | `viewer` / `editor` / `admin` enforced on every route via `preHandler` |
| Member Invitation Flow | `POST /api/v1/orgs/:id/members`; transactional email via Resend |
| Audit Log UI | Surface existing PostgreSQL trigger audit trail; no new infrastructure required |
| Config Migration Import | `POST /api/v1/workspaces/import` accepts a Lite JSON export; migration path for existing users |

**Stack additions:** `@fastify/swagger` + `@fastify/swagger-ui` (OpenAPI 3.1), Resend (email)

**Verification:** Auth, health, and RLS tests pass. Manual flow: create workspace → add project → set milestone → export JSON → re-import.

---

## Phase 3 — Program Intelligence: Analytics, Portfolio, Real-Time
**Timeline:** ~8–10 weeks | **Starts:** after Phase 2

Deterministic PMO analytics that don't require AI but produce the historical data Phase 4's AI needs.

| Initiative | Details |
|---|---|
| Risk Register | Full CRUD for `risks` table; probability × impact matrix; auto-propagates `at_risk` on projects |
| Budget Tracking | Read/write `budget_periods`; actuals decrypted for `admin` role only (via `pgcrypto`); variance alerts |
| KPI Dashboards | Manual or webhook KPI values; sparkline time-series; delivery velocity, schedule adherence, risk burn-down |
| Portfolio View | Cross-workspace summary: completion %, at-risk counts, upcoming milestones; org-level PMO command centre |
| Schedule Variance Engine | Per-milestone `planned_date - actual_date`; "days ahead/behind"; average variance per workspace |
| Critical Path Analysis | PostgreSQL recursive CTE over `dependencies` table; downstream impact modelling |
| Real-Time Collaboration | WebSocket via `@fastify/websocket`; broadcast `project_updated`, `milestone_updated` events per workspace |
| Weekly KPI Snapshots | Nightly worker job writes `kpis` rows; creates the time-series Phase 4 AI needs |

**Stack additions:** `@fastify/websocket`, `node-cron` (worker service), Redis (WebSocket pub/sub), Recharts or Chart.js

**Verification:** Two workspaces, two users — real-time changes propagate via WebSocket; RLS blocks cross-org reads.

---

## Phase 4 — AI Layer 1: Risk Scoring, Forecasting, NL Chat, Reports
**Timeline:** ~8–10 weeks | **Starts:** after Phase 3

AI-powered features grounded in the historical data accumulated in Phase 3.

| Initiative | Model | Details |
|---|---|---|
| AI Risk Scoring Engine | `claude-haiku-4-5` | Per-project score (0–100); input: milestone slip, open risks, budget variance, dependency depth; stored as `ai_risk_assessment JSONB` |
| Deadline Forecasting | `claude-sonnet-4-6` | Per-upcoming-milestone probability; context: historical slip rate, dependency chain, days remaining |
| PMO Chat Interface | `claude-sonnet-4-6` | NL queries answered via tool-calling against pre-defined parameterised SQL tools; no raw SQL generation |
| Status Report Generator | `claude-sonnet-4-6` | Weekly/on-demand executive narrative; input: stats, top risks, `audit_events` diff, budget alerts; exportable as Markdown/PDF |
| Anomaly Detection Alerts | `claude-haiku-4-5` | Nightly job; detects completion regression, milestone push >2 weeks, budget threshold crossing; AI explanation + recommended action |
| AI-Assisted Risk Entry | `claude-haiku-4-5` | Real-time suggestions as user types: probability/impact, mitigation text, similar past risks |

**New migrations:**
```sql
ALTER TABLE projects ADD COLUMN ai_risk_assessment JSONB;
ALTER TABLE milestones ADD COLUMN ai_deadline_forecast JSONB;
CREATE TABLE reports (id, workspace_id, org_id, report_type, generated_by, content_md, metadata JSONB, created_at);
CREATE TABLE notifications (id, org_id, user_id, type, payload JSONB, read_at, created_at);
```

**Architecture notes:**
- Never call LLM from the Fastify request path for slow operations — queue via `pg-boss` (Postgres-backed, no Redis needed)
- Context window: targeted DB query objects, not raw table dumps
- Prompt security: user text injected as JSON data fields, never concatenated into instruction sections

**Stack additions:** `@anthropic-ai/sdk`, `pg-boss`, `@react-pdf/renderer`

---

## Phase 5 — AI Layer 2: NL Mutations + Integrations
**Timeline:** ~10–12 weeks | **Starts:** after Phase 4

Extend AI from answering questions to taking actions; connect to tools teams already use.

| Initiative | Details |
|---|---|
| Conversational Updates | "Mark M1 for Project Atlas as complete" — LLM proposes action → user confirms → executes; mutations tagged `ai_initiated: true` in audit trail |
| What-If Scenario Analysis | "What if Data Migration slips 3 weeks?" — critical path re-run with hypothetical delay; revised dates and risk score changes; named snapshots |
| Jira/GitHub/Linear Sync | Webhook receivers translate external events to milestone/risk updates; workspace-level mapping configured by admin |
| Slack & Teams Bot | Outbound: anomaly alerts and weekly reports to channels. Inbound: `/pmo status [workspace]` slash command |
| AI Onboarding Briefing | Personalised first-login summary (program state, assigned items, risks, milestones); uses report generation infrastructure |
| Feature Gating & Billing | Enforce `organizations.plan` (`trial \| starter \| professional \| enterprise`); AI features at `professional+`; token usage metered |

**Stack additions:** `@slack/bolt`, `@octokit/webhooks`, Stripe SDK

---

## Phase 6 — Predictive Portfolio Intelligence
**Timeline:** ~12+ weeks | **Starts:** after Phase 5

Use the accumulated historical corpus to build intelligence that improves over time.

| Initiative | Details |
|---|---|
| Historical Pattern Mining | Mine `audit_events` for average milestone slip, risk resolution time, budget variance patterns; retrieved as few-shot examples via `pgvector` similarity |
| Cross-Portfolio Analysis | Systemic blockers across workspaces: teams that are dependencies in many programs, high-risk periods |
| Scenario Planning | Formal descope workflow; recomputed critical path; named comparison snapshots |
| OKR Tracking | Workspace OKRs mapped to KPI time-series; AI quarterly retrospectives |
| Proactive AI Copilot | Surfaces insights unprompted: "3 projects likely to miss Q3 — here's what resolved similar situations historically" |
| Audit Archive | Monthly partitioning of `audit_events`; archive to S3 after 2 years; monthly aggregates for trend queries |

**Stack additions:** `pgvector` PostgreSQL extension, `@aws-sdk/client-s3`

**Prerequisite:** 12+ months of accumulated audit trail data for meaningful pattern mining.

---

## Tech Stack Summary

| Layer | Current | Added by Phase |
|---|---|---|
| Frontend | Vanilla JS + Vite | React 19 + TypeScript + React Router + TanStack Query *(Phase 1)* |
| API | Fastify 5 skeleton | Domain routes + `@fastify/swagger` *(Phase 2)*, WebSocket *(Phase 3)* |
| Database | PostgreSQL 16 + RLS | `pgvector` *(Phase 6)* |
| Auth | Auth0 JWT | — |
| AI | — | `@anthropic-ai/sdk` (Haiku + Sonnet) *(Phase 4)* |
| Jobs | — | `pg-boss` *(Phase 4)*, `node-cron` worker service *(Phase 3)* |
| Email | — | Resend *(Phase 2)* |
| Integrations | — | `@slack/bolt`, `@octokit/webhooks`, Stripe *(Phase 5)* |
| Storage | — | `@aws-sdk/client-s3` audit archive *(Phase 6)* |
