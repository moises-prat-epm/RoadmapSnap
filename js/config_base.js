const CONFIG = {
    
    // Timeline Configuration
    TIMELINE: {
        TODAY: "11/02/2026",
        START_MONTH: "01/2026",
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
    
    // Milestone text (generic descriptions per status)
    MILESTONE_TEXT: {
        M0: { short: "M0", title: "M0 - Dev Complete",     subtitle: "Development Finished" },
        M1: { short: "M1", title: "M1 - QA Validated",       subtitle: "QA validations Passed" },
        M2: { short: "M2", title: "M2 - UAT OK",          subtitle: "User Acceptance Testing Passed" },
        M3: { short: "M3", title: "M3 - Production Release",           subtitle: "Production Release" }
    },
    
    // Status Labels
    STATUS_LABELS: {
        NS: "Not Started",
        DEV: "In Development",
        M0: "Dev Complete",
        M1: "QA Completed",
        M2: "UAT Ready",
        M3: "PROD Complete"
    },
    
    // Status Descriptions (for KPI cards)
    STATUS_DESCRIPTIONS: {
        NS: "Not yet started",
        DEV: "In development",
        M0: "Development done",
        M1: "In validation",
        M2: "Production ready",
        M3: "Fully migrated"
    },
    
    // Data Sources Configuration
    // startDate: When development starts (null if already started long ago)
    // atRisk: true = show warning indicator
    // showInTimeline: true = visible in timeline, false = hidden but counted in totals
    DELIVERABLES: [
        {
            name: "Deliverable 1",
            startDate: null,
            atRisk: false,
            showInTimeline: true,
            link: "https://example.com/docs/deliverable-1",  // optional - opens in new tab
            milestones: { 
                M0: "15/11/2025",
                M1: "20/11/2025",
                M2: "15/12/2025",
                M3: "15/04/2026"
            }
        },
        {
            name: "Deliverable 2",
            startDate: null,
            atRisk: true,
            showInTimeline: true,
            milestones: { 
                M0: "05/09/2025", 
                M1: "12/01/2026", 
                M2: "11/03/2026", 
                M3: "15/04/2026" 
            }
        },
        {
            name: "Deliverable 3",
            startDate: null,
            atRisk: true,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "05/09/2025", 
                M1: "12/01/2026", 
                M2: "25/03/2026", 
                M3: "22/04/2026" 
            }
        },
        {
            name: "Deliverable 4",
            startDate: null,
            atRisk: true,
            showInTimeline: true,
            milestones: { 
                M0: "05/09/2025", 
                M1: "12/01/2026", 
                M2: "08/04/2026", 
                M3: "06/05/2026" 
            }
        },
        {
            name: "Deliverable 5",
            startDate: null,
            atRisk: false,
            showInTimeline: true,
            milestones: { 
                M0: "05/09/2025", 
                M1: "12/12/2025", 
                M2: "12/12/2025", 
                M3: "15/03/2026" 
            }
        },
        {
            name: "Deliverable 6",
            startDate: null,
            atRisk: false,
            showInTimeline: true,
            milestones: { 
                M0: "05/09/2025", 
                M1: "12/01/2026", 
                M2: "02/02/2026", 
                M3: "20/05/2026" 
            }
        },
 
        // Hidden data sources (completed long ago)
        {
            name: "Deliverable 7",
            startDate: null,
            atRisk: false,
            showInTimeline: false,
            milestones: { 
                M0: "20/07/2025", 
                M1: "01/08/2025", 
                M2: "15/09/2025", 
                M3: "20/10/2025" 
            }
        },
        {
            name: "Deliverable 8",
            startDate: null,
            atRisk: false,
            showInTimeline: false,
            milestones: { 
                M0: "20/07/2025", 
                M1: "01/08/2025", 
                M2: "15/09/2025", 
                M3: "20/10/2025" 
            }
        },
        
        /* Template for new data source:
        {
            name: "New Source Name",
            startDate: "DD/MM/YYYY",  // When dev starts, null if already started
            atRisk: false,            // Set to true to show risk warning
            showInTimeline: true,     // Set to false to hide from timeline
            link: "https://...",      // Optional - shows info icon, opens in new tab
            milestones: { 
                M0: "DD/MM/YYYY",      // Dev Complete date
                M1: "DD/MM/YYYY",      // Prod Deployment date
                M2: "DD/MM/YYYY",      // Prod Ready date
                M3: "DD/MM/YYYY"       // Switch date
            }
        },
        */
    ]
};