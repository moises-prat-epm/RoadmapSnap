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
    
    // Milestone text (generic descriptions per status) - LEGACY FORMAT
    // If MILESTONES array below is defined, this section is ignored
    MILESTONE_TEXT: {
        M0: { short: "M0", title: "M0 - Dev Complete",     subtitle: "Development Finished" },
        M1: { short: "M1", title: "M1 - QA Validated",       subtitle: "QA validations Passed" },
        M2: { short: "M2", title: "M2 - UAT OK",          subtitle: "User Acceptance Testing Passed" },
        M3: { short: "M3", title: "M3 - Production Release",           subtitle: "Production Release" }
    },
    
    // Dynamic milestones array - 6 custom milestones for testing
    // When defined, this replaces the default M0-M3 with your own milestone structure
    // Deliverables should have matching milestone keys in their milestones object
    MILESTONES: [
        { key: "A0", short: "A0", title: "Design Complete", subtitle: "Design Phase Done", color: "#e74c3c" },       // Red
        { key: "A1", short: "A1", title: "Dev Complete", subtitle: "Development Finished", color: "#f39c12" },       // Orange
        { key: "A2", short: "A2", title: "QA Validated", subtitle: "Testing Passed", color: "#9b59b6" },             // Purple
        { key: "A3", short: "A3", title: "UAT Approved", subtitle: "User Acceptance", color: "#3498db" },            // Blue
        { key: "A4", short: "A4", title: "Staging Ready", subtitle: "Pre-Production", color: "#1abc9c" },            // Teal
        { key: "A5", short: "A5", title: "Production Live", subtitle: "Released to Prod", color: "#2ecc71" }         // Green
    ],
    
    // Status Labels (matching A0-A5 milestones)
    STATUS_LABELS: {
        NS: "Not Started",
        DEV: "In Development",
        A0: "Design Done",
        A1: "Dev Complete",
        A2: "QA Validated",
        A3: "UAT Approved",
        A4: "Staging Ready",
        A5: "Production Live"
    },
    
    // Status Descriptions (for KPI cards)
    STATUS_DESCRIPTIONS: {
        NS: "Not yet started",
        DEV: "In development",
        A0: "Design phase complete",
        A1: "Development finished",
        A2: "Testing passed",
        A3: "User acceptance done",
        A4: "Pre-production ready",
        A5: "Released to production"
    },
    
    // Data Sources Configuration
    // startDate: When development starts (null if already started long ago)
    // atRisk: true = show warning indicator
    // showInTimeline: true = visible in timeline, false = hidden but counted in totals
    // tags: Optional array of tags for filtering (e.g., ["backend", "critical"])
    DELIVERABLES: [
        {
            name: "Deliverable 1",
            startDate: "01/10/2025",
            atRisk: false,
            showInTimeline: true,
            link: "https://example.com/docs/deliverable-1",
            tags: ["core"],
            group: "Group 1",
            milestones: { 
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
            startDate: "15/08/2025",
            atRisk: true,
            showInTimeline: true,
            tags: ["backend"],
            group: "Group 1",
            milestones: { 
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
            startDate: "01/07/2025",
            atRisk: true,
            showInTimeline: true,
            group: "Group 2",
            milestones: { 
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
            startDate: "15/06/2025",
            atRisk: true,
            showInTimeline: true,
            group: "Group 2",
            milestones: { 
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
            startDate: "01/06/2025",
            atRisk: false,
            group: "Group 3",
            showInTimeline: true,
            milestones: { 
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
            startDate: "01/07/2025",
            atRisk: false,
            group: "Group 3",
            showInTimeline: true,
            milestones: { 
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
            startDate: "01/03/2026",
            atRisk: false,
            showInTimeline: true,
            group: "Group 4",
            milestones: { 
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
            startDate: "01/05/2025",
            atRisk: false,
            showInTimeline: true,
            group: "Group 4",
            milestones: { 
                A0: "15/05/2025", 
                A1: "01/06/2025", 
                A2: "15/06/2025", 
                A3: "01/07/2025", 
                A4: "15/07/2025", 
                A5: "01/08/2025" 
            }
        },
        
        /* Template for new data source with A0-A5 milestones:
        {
            name: "New Source Name",
            startDate: "DD/MM/YYYY",  // When dev starts, null if already started
            atRisk: false,            // Set to true to show risk warning
            showInTimeline: true,     // Set to false to hide from timeline
            link: "https://...",      // Optional - shows info icon, opens in new tab
            tags: [],                 // Optional - tags for filtering
            group: "",                // Optional - group name for grouping
            milestones: { 
                A0: "DD/MM/YYYY",      // Design Complete
                A1: "DD/MM/YYYY",      // Dev Complete
                A2: "DD/MM/YYYY",      // QA Validated
                A3: "DD/MM/YYYY",      // UAT Approved
                A4: "DD/MM/YYYY",      // Staging Ready
                A5: "DD/MM/YYYY"       // Production Live
            }
        },
        */
    ]
};