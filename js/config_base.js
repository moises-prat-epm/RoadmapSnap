const CONFIG = {
    VERSION: "1.0.1",
    BUILD_DATE: "2026-02-19",
    TIMELINE: {
        TODAY: "18/02/2026",
        START_MONTH: "05/2025",
        END_MONTH: "07/2026",
    },

    ENTITY_LABELS: {
        singular: "Deliverable",
        plural: "Deliverables",
        columnHeader: "Deliverable",
        scopeLabel: "deliverables"
    },

    DASHBOARD_TEXT: {
        title: "Project Roadmap Dashboard",
        totalSubtitleSuffix: "in roadmap scope"
    },

    WORKFLOW: [
        { type: 'state', key: 'NS', short: 'NS', title: 'Not Started', description: 'Pending kickoff' },
        { type: 'milestone', key: 'START', short: 'STR', title: 'Start', subtitle: 'Project Kickoff' },
        { type: 'state', key: 'DSN', short: 'UX', title: 'In Design', description: 'Design phase' },
        { type: 'milestone', key: 'A0', short: 'A0', title: 'Design Complete', subtitle: 'Design Phase Done' },
        { type: 'state', key: 'DEV', short: 'DEV', title: 'In Development', description: 'Active development' },
        { type: 'milestone', key: 'A1', short: 'A1', title: 'Dev Complete', subtitle: 'Development Finished' },
        { type: 'state', key: 'QA', short: 'QA', title: 'Under QA', description: 'Quality assurance testing' },
        { type: 'milestone', key: 'A2', short: 'A2', title: 'QA Validated', subtitle: 'Testing Passed' },
        { type: 'state', key: 'UAT', short: 'UAT', title: 'Under UAT', description: 'User acceptance testing' },
        { type: 'milestone', key: 'A3', short: 'A3', title: 'UAT Approved', subtitle: 'User Acceptance' },
        { type: 'state', key: 'STG', short: 'STG', title: 'In Staging', description: 'Staging environment' },
        { type: 'milestone', key: 'A4', short: 'A4', title: 'Staging Ready', subtitle: 'Pre-Production' },
        { type: 'state', key: 'DPL', short: 'DPL', title: 'Deploying', description: 'Deploying to production' },
        { type: 'milestone', key: 'A5', short: 'A5', title: 'Production Live', subtitle: 'Released to Prod' },
        { type: 'state', key: 'PRD', short: 'PRD', title: 'In Production', description: 'Live in production' },
    ],

    // 10 deliverables, same milestone keys (START, A0..A5). Dates spread so tasks sit in different stages.
    DELIVERABLES: [
        { name: "Deliverable 1", atRisk: false, showInTimeline: true, group: "Team A", milestones: { START: "01/06/2025", A0: "15/06/2025", A1: "01/08/2025", A2: "15/09/2025", A3: "01/11/2025", A4: "15/12/2025", A5: "01/02/2026" } },
        { name: "Deliverable 2", atRisk: false, showInTimeline: true, group: "Team A", milestones: { START: "01/06/2025", A0: "15/06/2025", A1: "01/08/2025", A2: "15/09/2025", A3: "01/11/2025", A4: "15/12/2025", A5: "01/02/2026" } },
        { name: "Deliverable 3", atRisk: true, showInTimeline: true, group: "Team A", milestones: { START: "01/08/2025", A0: "15/09/2025", A1: "01/11/2025", A2: "15/12/2025", A3: "01/02/2026", A4: "15/03/2026", A5: "01/05/2026" } },
        { name: "Deliverable 4", atRisk: false, showInTimeline: true, group: "Team A", milestones: { START: "01/08/2025", A0: "15/09/2025", A1: "01/11/2025", A2: "15/12/2025", A3: "01/02/2026", A4: "15/03/2026", A5: "01/05/2026" } },
        { name: "Deliverable 5", atRisk: false, showInTimeline: true, group: "Team B", milestones: { START: "01/10/2025", A0: "15/11/2025", A1: "01/01/2026", A2: "15/02/2026", A3: "01/04/2026", A4: "15/05/2026", A5: "01/06/2026" } },
        { name: "Deliverable 6", atRisk: false, showInTimeline: true, group: "Team B", milestones: { START: "01/10/2025", A0: "15/11/2025", A1: "01/01/2026", A2: "15/02/2026", A3: "01/04/2026", A4: "15/05/2026", A5: "01/06/2026" } },
        { name: "Deliverable 7", atRisk: true, showInTimeline: true, group: "Team B", milestones: { START: "01/12/2025", A0: "15/01/2026", A1: "01/03/2026", A2: "15/04/2026", A3: "01/05/2026", A4: "15/06/2026", A5: "01/07/2026" } },
        { name: "Deliverable 8", atRisk: false, showInTimeline: true, group: "Team B", milestones: { START: "01/12/2025", A0: "15/01/2026", A1: "01/03/2026", A2: "15/04/2026", A3: "01/05/2026", A4: "15/06/2026", A5: "01/07/2026" } },
        { name: "Deliverable 9", atRisk: false, showInTimeline: true, group: "Team B", milestones: { START: "01/02/2026", A0: "15/03/2026", A1: "01/05/2026", A2: "15/05/2026", A3: "01/06/2026", A4: "15/06/2026", A5: "01/07/2026" } },
        { name: "Deliverable 10", atRisk: false, showInTimeline: true, group: "Team B", milestones: { START: "01/02/2026", A0: "15/03/2026", A1: "01/05/2026", A2: "15/05/2026", A3: "01/06/2026", A4: "15/06/2026", A5: "01/07/2026" } },
    ]
};
