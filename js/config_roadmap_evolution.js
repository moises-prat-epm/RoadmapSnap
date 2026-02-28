/**
 * RoadmapSnap Evolution Roadmap
 *
 * A self-referential config: load this file in place of js/config.js to visualise
 * the 7-phase plan for evolving RoadmapSnap from a Gantt chart into a
 * fully AI-Powered PMO platform.
 *
 * To use: copy/rename this file to js/config.js and refresh.
 */

const CONFIG = {
    VERSION: "1.0.1",
    BUILD_DATE: "2026-02-28",

    TIMELINE: {
        TODAY: "28/02/2026",
        START_MONTH: "02/2026",
        END_MONTH: "09/2027",
    },

    ENTITY_LABELS: {
        singular: "Initiative",
        plural: "Initiatives",
        columnHeader: "Initiative",
        scopeLabel: "initiatives",
    },

    DASHBOARD_TEXT: {
        title: "RoadmapSnap Evolution Roadmap",
        totalSubtitleSuffix: "across 7 phases",
    },

    // Workflow: Not Started → Kickoff → In Dev → Beta → Testing → Live → Done
    WORKFLOW: [
        { type: 'state',     key: 'NS',   short: 'NS',   title: 'Not Started',     description: 'Planned, not yet kicked off' },
        { type: 'milestone', key: 'KO',   short: 'KO',   title: 'Kickoff',         subtitle: 'Development Begins' },
        { type: 'state',     key: 'DEV',  short: 'DEV',  title: 'In Development',  description: 'Active development' },
        { type: 'milestone', key: 'BETA', short: 'β',    title: 'Beta',            subtitle: 'Feature Complete' },
        { type: 'state',     key: 'TST',  short: 'TST',  title: 'Testing',         description: 'Integration testing & review' },
        { type: 'milestone', key: 'LIVE', short: 'GO',   title: 'Live',            subtitle: 'Released to Production' },
        { type: 'state',     key: 'DONE', short: 'DONE', title: 'Done',            description: 'Shipped and stable' },
    ],

    GROUP_ORDER: [
        "Phase 0 — Foundation",
        "Phase 1 — React Migration",
        "Phase 2 — SaaS API",
        "Phase 3 — Program Intelligence",
        "Phase 4 — AI Layer 1",
        "Phase 5 — AI Layer 2",
        "Phase 6 — Predictive Portfolio",
    ],

    DELIVERABLES: [

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 0 — Close Open Stubs (2–3 weeks, starts immediately)
        // Goal: Unblock all API work by fixing the two stubs in the codebase
        // ─────────────────────────────────────────────────────────────────────

        {
            name: "Real RBAC Enforcement",
            group: "Phase 0 — Foundation",
            tags: ["api", "security"],
            milestones: { KO: "01/03/2026", BETA: "10/03/2026", LIVE: "21/03/2026" },
        },
        {
            name: "Org Resolution",
            group: "Phase 0 — Foundation",
            tags: ["api", "multi-tenancy"],
            milestones: { KO: "01/03/2026", BETA: "10/03/2026", LIVE: "21/03/2026" },
        },
        {
            name: "User Provisioning on Login",
            group: "Phase 0 — Foundation",
            tags: ["api", "auth"],
            milestones: { KO: "01/03/2026", BETA: "08/03/2026", LIVE: "21/03/2026" },
        },
        {
            name: "Route Plugin Registry",
            group: "Phase 0 — Foundation",
            tags: ["api", "architecture"],
            milestones: { KO: "01/03/2026", BETA: "08/03/2026", LIVE: "21/03/2026" },
        },

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 1 — React Migration + In-Browser Editor (6–8 weeks, parallel)
        // Goal: Modernise the Lite frontend; add CRUD editing without a backend
        // ─────────────────────────────────────────────────────────────────────

        {
            name: "packages/web Scaffold",
            group: "Phase 1 — React Migration",
            tags: ["frontend", "architecture"],
            milestones: { KO: "01/03/2026", BETA: "01/04/2026", LIVE: "01/05/2026" },
        },
        {
            name: "React 19 Migration",
            group: "Phase 1 — React Migration",
            tags: ["frontend"],
            milestones: { KO: "01/03/2026", BETA: "15/04/2026", LIVE: "16/05/2026" },
        },
        {
            name: "Remove window.* Globals",
            group: "Phase 1 — React Migration",
            tags: ["frontend", "refactor"],
            milestones: { KO: "01/04/2026", BETA: "20/04/2026", LIVE: "01/05/2026" },
            dependencies: [{ task: "packages/web Scaffold", from: "BETA", to: "KO" }],
        },
        {
            name: "In-Browser Config Editor",
            group: "Phase 1 — React Migration",
            tags: ["frontend", "ux"],
            milestones: { KO: "15/03/2026", BETA: "01/05/2026", LIVE: "16/05/2026" },
        },
        {
            name: "LocalStorage Persistence",
            group: "Phase 1 — React Migration",
            tags: ["frontend"],
            milestones: { KO: "15/03/2026", BETA: "25/04/2026", LIVE: "16/05/2026" },
        },
        {
            name: "Config Import/Export v2",
            group: "Phase 1 — React Migration",
            tags: ["frontend", "export"],
            milestones: { KO: "15/03/2026", BETA: "25/04/2026", LIVE: "16/05/2026" },
        },

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 2 — SaaS API: Domain Entities, CRUD, Multi-Tenancy (6–8 weeks)
        // Goal: Replace config.js with a real Postgres backend
        // ─────────────────────────────────────────────────────────────────────

        {
            name: "Workspace CRUD",
            group: "Phase 2 — SaaS API",
            tags: ["api", "core"],
            milestones: { KO: "22/03/2026", BETA: "10/05/2026", LIVE: "01/06/2026" },
            dependencies: ["Real RBAC Enforcement", "Org Resolution"],
        },
        {
            name: "Projects & Milestones API",
            group: "Phase 2 — SaaS API",
            tags: ["api", "core"],
            milestones: { KO: "01/04/2026", BETA: "15/05/2026", LIVE: "05/06/2026" },
            dependencies: [{ task: "Workspace CRUD", from: "BETA", to: "BETA" }],
        },
        {
            name: "Dependencies API",
            group: "Phase 2 — SaaS API",
            tags: ["api", "graph"],
            atRisk: true,
            milestones: { KO: "01/04/2026", BETA: "25/05/2026", LIVE: "20/06/2026" },
            dependencies: [{ task: "Projects & Milestones API", from: "BETA", to: "BETA" }],
        },
        {
            name: "Live Gantt from API",
            group: "Phase 2 — SaaS API",
            tags: ["frontend", "core"],
            milestones: { KO: "20/05/2026", BETA: "10/06/2026", LIVE: "30/06/2026" },
            dependencies: ["React 19 Migration", { task: "Projects & Milestones API", from: "LIVE", to: "KO" }],
        },
        {
            name: "Full RBAC Enforcement",
            group: "Phase 2 — SaaS API",
            tags: ["api", "security"],
            milestones: { KO: "22/03/2026", BETA: "20/05/2026", LIVE: "10/06/2026" },
            dependencies: ["Real RBAC Enforcement"],
        },
        {
            name: "Member Invitation Flow",
            group: "Phase 2 — SaaS API",
            tags: ["api", "ux"],
            milestones: { KO: "01/05/2026", BETA: "10/06/2026", LIVE: "25/06/2026" },
            dependencies: [{ task: "Workspace CRUD", from: "LIVE", to: "KO" }],
        },
        {
            name: "Audit Log UI",
            group: "Phase 2 — SaaS API",
            tags: ["frontend", "compliance"],
            milestones: { KO: "10/06/2026", BETA: "25/06/2026", LIVE: "10/07/2026" },
            dependencies: [{ task: "Live Gantt from API", from: "BETA", to: "KO" }],
        },
        {
            name: "Config Migration Import",
            group: "Phase 2 — SaaS API",
            tags: ["api", "migration"],
            milestones: { KO: "15/04/2026", BETA: "10/06/2026", LIVE: "10/07/2026" },
        },

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 3 — Program Intelligence: Analytics, Portfolio, Real-Time
        // Goal: Deterministic PMO analytics; produce historical data for Phase 4 AI
        // ─────────────────────────────────────────────────────────────────────

        {
            name: "Risk Register",
            group: "Phase 3 — Program Intelligence",
            tags: ["pmo", "risk"],
            milestones: { KO: "01/07/2026", BETA: "10/08/2026", LIVE: "25/08/2026" },
            dependencies: ["Projects & Milestones API"],
        },
        {
            name: "Budget Tracking",
            group: "Phase 3 — Program Intelligence",
            tags: ["pmo", "finance"],
            milestones: { KO: "01/07/2026", BETA: "15/08/2026", LIVE: "01/09/2026" },
            dependencies: [{ task: "Workspace CRUD", from: "LIVE", to: "KO" }],
        },
        {
            name: "KPI Dashboards",
            group: "Phase 3 — Program Intelligence",
            tags: ["pmo", "analytics"],
            milestones: { KO: "15/07/2026", BETA: "25/08/2026", LIVE: "10/09/2026" },
        },
        {
            name: "Portfolio View",
            group: "Phase 3 — Program Intelligence",
            tags: ["pmo", "ux"],
            milestones: { KO: "15/07/2026", BETA: "01/09/2026", LIVE: "20/09/2026" },
            dependencies: [{ task: "Live Gantt from API", from: "LIVE", to: "KO" }],
        },
        {
            name: "Schedule Variance Engine",
            group: "Phase 3 — Program Intelligence",
            tags: ["analytics", "core"],
            milestones: { KO: "01/07/2026", BETA: "10/08/2026", LIVE: "25/08/2026" },
            dependencies: ["Projects & Milestones API"],
        },
        {
            name: "Critical Path Analysis",
            group: "Phase 3 — Program Intelligence",
            tags: ["analytics", "graph"],
            milestones: { KO: "15/07/2026", BETA: "01/09/2026", LIVE: "20/09/2026" },
            dependencies: [{ task: "Dependencies API", from: "LIVE", to: "KO" }],
        },
        {
            name: "Real-Time Collaboration",
            group: "Phase 3 — Program Intelligence",
            tags: ["collaboration", "websocket"],
            atRisk: true,
            milestones: { KO: "01/08/2026", BETA: "20/09/2026", LIVE: "10/10/2026" },
            dependencies: ["Projects & Milestones API"],
        },
        {
            name: "Weekly KPI Snapshots",
            group: "Phase 3 — Program Intelligence",
            tags: ["analytics", "automation"],
            milestones: { KO: "01/08/2026", BETA: "25/09/2026", LIVE: "15/10/2026" },
            dependencies: [{ task: "KPI Dashboards", from: "LIVE", to: "KO" }],
        },

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 4 — AI Layer 1: Risk Scoring, Forecasting, NL Chat, Reports
        // Goal: AI features grounded in Phase 3 historical data
        // ─────────────────────────────────────────────────────────────────────

        {
            name: "AI Risk Scoring Engine",
            group: "Phase 4 — AI Layer 1",
            tags: ["ai", "risk"],
            milestones: { KO: "01/11/2026", BETA: "01/12/2026", LIVE: "15/12/2026" },
            dependencies: ["Risk Register", "Schedule Variance Engine"],
        },
        {
            name: "Deadline Forecasting",
            group: "Phase 4 — AI Layer 1",
            tags: ["ai", "analytics"],
            milestones: { KO: "01/11/2026", BETA: "10/12/2026", LIVE: "20/12/2026" },
            dependencies: ["Schedule Variance Engine"],
        },
        {
            name: "PMO Chat Interface",
            group: "Phase 4 — AI Layer 1",
            tags: ["ai", "ux", "nlp"],
            atRisk: true,
            milestones: { KO: "15/11/2026", BETA: "20/12/2026", LIVE: "10/01/2027" },
            dependencies: ["Projects & Milestones API"],
        },
        {
            name: "Status Report Generator",
            group: "Phase 4 — AI Layer 1",
            tags: ["ai", "reporting"],
            milestones: { KO: "01/12/2026", BETA: "15/01/2027", LIVE: "01/02/2027" },
            dependencies: [{ task: "PMO Chat Interface", from: "BETA", to: "KO" }],
        },
        {
            name: "Anomaly Detection Alerts",
            group: "Phase 4 — AI Layer 1",
            tags: ["ai", "automation"],
            milestones: { KO: "01/12/2026", BETA: "20/01/2027", LIVE: "05/02/2027" },
            dependencies: ["Weekly KPI Snapshots"],
        },
        {
            name: "AI-Assisted Risk Entry",
            group: "Phase 4 — AI Layer 1",
            tags: ["ai", "ux", "risk"],
            milestones: { KO: "01/12/2026", BETA: "20/01/2027", LIVE: "10/02/2027" },
            dependencies: [{ task: "Risk Register", from: "LIVE", to: "KO" }],
        },

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 5 — AI Layer 2: NL Mutations + Integrations
        // Goal: AI takes actions; integrations with Jira, GitHub, Slack
        // ─────────────────────────────────────────────────────────────────────

        {
            name: "Conversational Updates",
            group: "Phase 5 — AI Layer 2",
            tags: ["ai", "nlp", "ux"],
            milestones: { KO: "15/02/2027", BETA: "25/03/2027", LIVE: "10/04/2027" },
            dependencies: ["PMO Chat Interface"],
        },
        {
            name: "What-If Scenario Analysis",
            group: "Phase 5 — AI Layer 2",
            tags: ["ai", "planning"],
            atRisk: true,
            milestones: { KO: "15/02/2027", BETA: "01/04/2027", LIVE: "20/04/2027" },
            dependencies: ["Critical Path Analysis", "PMO Chat Interface"],
        },
        {
            name: "Jira/GitHub/Linear Sync",
            group: "Phase 5 — AI Layer 2",
            tags: ["integration"],
            milestones: { KO: "01/03/2027", BETA: "10/04/2027", LIVE: "01/05/2027" },
        },
        {
            name: "Slack & Teams Bot",
            group: "Phase 5 — AI Layer 2",
            tags: ["integration", "collaboration"],
            milestones: { KO: "01/03/2027", BETA: "15/04/2027", LIVE: "05/05/2027" },
            dependencies: [{ task: "PMO Chat Interface", from: "LIVE", to: "KO" }],
        },
        {
            name: "AI Onboarding Briefing",
            group: "Phase 5 — AI Layer 2",
            tags: ["ai", "ux"],
            milestones: { KO: "15/03/2027", BETA: "20/04/2027", LIVE: "10/05/2027" },
            dependencies: [{ task: "Status Report Generator", from: "LIVE", to: "KO" }],
        },
        {
            name: "Feature Gating & Billing",
            group: "Phase 5 — AI Layer 2",
            tags: ["infrastructure", "billing"],
            milestones: { KO: "15/03/2027", BETA: "25/04/2027", LIVE: "15/05/2027" },
        },

        // ─────────────────────────────────────────────────────────────────────
        // PHASE 6 — Predictive Portfolio Intelligence
        // Goal: Use accumulated history to build intelligence that improves over time
        // ─────────────────────────────────────────────────────────────────────

        {
            name: "Historical Pattern Mining",
            group: "Phase 6 — Predictive Portfolio",
            tags: ["ai", "analytics"],
            milestones: { KO: "01/05/2027", BETA: "25/05/2027", LIVE: "10/06/2027" },
            dependencies: ["Anomaly Detection Alerts"],
        },
        {
            name: "Cross-Portfolio Analysis",
            group: "Phase 6 — Predictive Portfolio",
            tags: ["pmo", "analytics"],
            milestones: { KO: "01/05/2027", BETA: "01/06/2027", LIVE: "20/06/2027" },
            dependencies: ["Portfolio View"],
        },
        {
            name: "Scenario Planning",
            group: "Phase 6 — Predictive Portfolio",
            tags: ["ai", "planning"],
            atRisk: true,
            milestones: { KO: "15/05/2027", BETA: "10/06/2027", LIVE: "01/07/2027" },
            dependencies: ["What-If Scenario Analysis"],
        },
        {
            name: "OKR Tracking",
            group: "Phase 6 — Predictive Portfolio",
            tags: ["pmo", "okr"],
            milestones: { KO: "15/05/2027", BETA: "15/06/2027", LIVE: "05/07/2027" },
            dependencies: ["KPI Dashboards"],
        },
        {
            name: "Proactive AI Copilot",
            group: "Phase 6 — Predictive Portfolio",
            tags: ["ai", "nlp"],
            milestones: { KO: "15/06/2027", BETA: "15/07/2027", LIVE: "01/08/2027" },
            dependencies: ["Historical Pattern Mining"],
        },
        {
            name: "Audit Archive",
            group: "Phase 6 — Predictive Portfolio",
            tags: ["compliance", "infrastructure"],
            milestones: { KO: "01/06/2027", BETA: "05/07/2027", LIVE: "20/07/2027" },
        },
    ],
};
