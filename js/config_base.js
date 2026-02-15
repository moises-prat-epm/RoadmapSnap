const CONFIG = {
    
    // Timeline Configuration
    TIMELINE: {
        TODAY: "",  // Leave empty to use current date automatically, or set "DD/MM/YYYY" to override
        START_MONTH: "05/2025",
        END_MONTH: "07/2026",
    },
    
    // Entity & dashboard labels (generic, can be customized)
    ENTITY_LABELS: {
        singular: "Deliverable",     // e.g. "Feature", "Workstream"
        plural: "Deliverables",      // e.g. "Features", "Workstreams"
        columnHeader: "Deliverable", // Header for the first column in the grid
        scopeLabel: "deliverables"   // Used in phrases like "total deliverables"
    },
    
    DASHBOARD_TEXT: {
        title: "Project Roadmap Dashboard",
        totalSubtitleSuffix: "in roadmap scope" // Subtitle under the Total card
    },
    
    // ============================================
    // WORKFLOW CONFIGURATION
    // ============================================
    // Defines the sequence of STATES and MILESTONES.
    // 
    // The workflow alternates: state -> milestone -> state -> milestone -> ... -> final state
    // - STATE: Current status of a deliverable (what phase it's in)
    // - MILESTONE: A date marker that transitions to the next state
    //
    // The system calculates the current state based on which milestones have passed:
    // - If no milestone date has passed: first state
    // - If milestone X date passed but not milestone Y: state after X
    //
    // KPI cards filter by STATE. Timeline shows MILESTONES as date markers.
    // Each deliverable shows the state abbreviation (3 chars max).
    //
    WORKFLOW: [
        // Initial state (before any milestone)
        // Each state has: key (internal), short (3 chars max for display), title (full name)
        { type: 'state', key: 'NS', short: 'NS', title: 'Not Started', description: 'Pending kickoff' },
        
        // START milestone transitions to DSN state
        { type: 'milestone', key: 'START', short: 'STR', title: 'Start', subtitle: 'Project Kickoff', color: '#6554c0' },
        { type: 'state', key: 'DSN', short: 'UX', title: 'In Design', description: 'Design phase' },
        
        // A0 milestone transitions to DEV state
        { type: 'milestone', key: 'A0', short: 'A0', title: 'Design Complete', subtitle: 'Design Phase Done', color: '#e74c3c' },
        { type: 'state', key: 'DEV', short: 'DEV', title: 'In Development', description: 'Active development' },
        
        // A1 milestone transitions to QA state
        { type: 'milestone', key: 'A1', short: 'A1', title: 'Dev Complete', subtitle: 'Development Finished', color: '#f39c12' },
        { type: 'state', key: 'QA', short: 'QA', title: 'Under QA', description: 'Quality assurance testing' },
        
        // A2 milestone transitions to UAT state
        { type: 'milestone', key: 'A2', short: 'A2', title: 'QA Validated', subtitle: 'Testing Passed', color: '#9b59b6' },
        { type: 'state', key: 'UAT', short: 'UAT', title: 'Under UAT', description: 'User acceptance testing' },
        
        // A3 milestone transitions to STG state
        { type: 'milestone', key: 'A3', short: 'A3', title: 'UAT Approved', subtitle: 'User Acceptance', color: '#3498db' },
        { type: 'state', key: 'STG', short: 'STG', title: 'In Staging', description: 'Staging environment' },
        
        // A4 milestone transitions to DPL state
        { type: 'milestone', key: 'A4', short: 'A4', title: 'Staging Ready', subtitle: 'Pre-Production', color: '#1abc9c' },
        { type: 'state', key: 'DPL', short: 'DPL', title: 'Deploying', description: 'Deploying to production' },
        
        // A5 milestone transitions to PRD state (final)
        { type: 'milestone', key: 'A5', short: 'A5', title: 'Production Live', subtitle: 'Released to Prod', color: '#229954' },
        { type: 'state', key: 'PRD', short: 'PRD', title: 'In Production', description: 'Live in production' },
    ],
    
    // ============================================
    // DELIVERABLES CONFIGURATION
    // ============================================
    // Each deliverable defines milestone dates. The system calculates
    // the current STATE based on which milestones have passed.
    //
    // Milestone dates should include START and all other milestones defined in WORKFLOW.
    // The state is automatically determined from today's date vs milestone dates.
    //
    DELIVERABLES: [
        {
            name: "Deliverable 1",
            atRisk: false,
            showInTimeline: true,
            link: "https://example.com/docs/deliverable-1",
            tags: ["core"],
            group: "Group 1",
            milestones: { 
                START: "01/10/2025",
                A0: "15/11/2025",
                A1: "20/12/2025",
                A2: "15/01/2026",
                A3: "01/02/2026",
                A4: "15/03/2026",
                A5: "15/04/2026"
            }
        },
        {
            name: "Deliverable 2",
            atRisk: true,
            showInTimeline: true,
            tags: ["backend"],
            group: "Group 1",
            milestones: { 
                START: "15/08/2025",
                A0: "05/09/2025", 
                A1: "15/10/2025", 
                A2: "12/01/2026", 
                A3: "11/02/2026", 
                A4: "11/03/2026", 
                A5: "15/04/2026" 
            }
        },
        {
            name: "Deliverable 3",
            atRisk: true,
            showInTimeline: true,
            group: "Group 2",
            milestones: { 
                START: "01/07/2025",
                A0: "01/08/2025", 
                A1: "05/09/2025", 
                A2: "12/11/2025", 
                A3: "12/01/2026", 
                A4: "25/03/2026", 
                A5: "22/04/2026" 
            }
        },
        {
            name: "Deliverable 4",
            atRisk: true,
            showInTimeline: true,
            group: "Group 2",
            milestones: { 
                START: "15/06/2025",
                A0: "15/07/2025", 
                A1: "05/09/2025", 
                A2: "12/11/2025", 
                A3: "12/01/2026", 
                A4: "08/04/2026", 
                A5: "06/05/2026" 
            }
        },
        {
            name: "Deliverable 5",
            atRisk: false,
            group: "Group 3",
            showInTimeline: true,
            milestones: { 
                START: "01/06/2025",
                A0: "01/07/2025", 
                A1: "05/08/2025", 
                A2: "05/09/2025", 
                A3: "12/10/2025", 
                A4: "12/12/2025", 
                A5: "15/03/2026" 
            }
        },
        {
            name: "Deliverable 6",
            atRisk: false,
            group: "Group 3",
            showInTimeline: true,
            milestones: { 
                START: "01/07/2025",
                A0: "01/08/2025", 
                A1: "05/09/2025", 
                A2: "12/10/2025", 
                A3: "12/01/2026", 
                A4: "02/03/2026", 
                A5: "20/05/2026" 
            }
        },
        {
            name: "Deliverable 7 - Not Started",
            atRisk: false,
            showInTimeline: true,
            group: "Group 4",
            milestones: { 
                START: "01/03/2026",
                A0: "15/03/2026", 
                A1: "01/04/2026", 
                A2: "15/04/2026", 
                A3: "01/05/2026", 
                A4: "15/05/2026", 
                A5: "01/06/2026" 
            }
        },
        {
            name: "Deliverable 8 - Completed",
            atRisk: false,
            showInTimeline: true,
            group: "Group 4",
            milestones: { 
                START: "01/05/2025",
                A0: "15/05/2025", 
                A1: "01/06/2025", 
                A2: "15/06/2025", 
                A3: "01/07/2025", 
                A4: "15/07/2025", 
                A5: "01/08/2025" 
            }
        },
        
        /* Template for new deliverable:
        {
            name: "New Deliverable Name",
            atRisk: false,            // Set to true to show risk warning
            showInTimeline: true,     // Set to false to hide from timeline
            link: "https://...",      // Optional - shows info icon, opens in new tab
            tags: [],                 // Optional - tags for filtering
            group: "",                // Optional - group name for grouping
            milestones: { 
                START: "DD/MM/YYYY",  // Project kickoff
                A0: "DD/MM/YYYY",     // Design Complete
                A1: "DD/MM/YYYY",     // Dev Complete
                A2: "DD/MM/YYYY",     // QA Validated
                A3: "DD/MM/YYYY",     // UAT Approved
                A4: "DD/MM/YYYY",     // Staging Ready
                A5: "DD/MM/YYYY"      // Production Live
            }
        },
        */
    ]
};