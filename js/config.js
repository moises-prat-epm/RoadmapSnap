const CONFIG = {
    
    // Timeline Configuration
    TIMELINE: {
        TODAY: "11/02/2026",
        START_MONTH: "01/2026",
        END_MONTH: "07/2026",
    },
    
    // Entity & dashboard labels (generic, can be customized)
    ENTITY_LABELS: {
        singular: "CDS Data Source",     // e.g. "Feature", "Workstream"
        plural: "CDS Data Sources",      // e.g. "Features", "Workstreams"
        columnHeader: "Data Source", // Header for the first column in the grid
        scopeLabel: "Data Sources"   // Used in phrases like "total deliverables"
    },
    
    DASHBOARD_TEXT: {
        title: "Project Roadmap Dashboard",
        totalSubtitleSuffix: "in roadmap scope" // Subtitle under the Total card
    },
    
    // Milestone text (generic descriptions per status)
    MILESTONE_TEXT: {
        M0: { short: "M0", title: "M0 - Dev Complete",     subtitle: "Development Finished" },
        M1: { short: "M1", title: "M1 - Prod Deployment",       subtitle: "Production Deployment Done" },
        M2: { short: "M2", title: "M2 - Production Ready",          subtitle: "Production Ready for DTU consumption" },
        M3: { short: "M3", title: "M3 - Switch Complete",           subtitle: "OneSource 1.0 Switch" }
    },
    
    // Status Labels
    STATUS_LABELS: {
        NS: "Not Started",
        DEV: "In Development",
        M0: "Dev Complete",
        M1: "Prod Deployed",
        M2: "Production Ready",
        M3: "Switch Complete"
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
            name: "MasterMind",
            startDate: null,
            atRisk: false,
            showInTimeline: true,
            milestones: { 
                M0: "15/11/2025",
                M1: "20/11/2025",
                M2: "15/12/2025",
                M3: "15/04/2026"
            }
        },
        {
            name: "SAP Themis B1-B3",
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
            name: "SAP Themis B4-B6",
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
            name: "SAP Themis B7-B10",
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
            name: "CFIN DS",
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
            name: "Bamboo",
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
        {
            name: "Sievo",
            startDate: null,
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "30/01/2026", 
                M1: "06/02/2026", 
                M2: "01/03/2026", 
                M3: "06/05/2026" 
            }
        },
        {
            name: "Coupa",
            startDate: null,
            atRisk: false,
            showInTimeline: true,
            milestones: { 
                M0: "30/01/2026", 
                M1: "06/02/2026", 
                M2: "20/02/2026", 
                M3: "06/05/2026" 
            }
        },
        {
            name: "Basware",
            startDate: "15/01/2026",
            atRisk: false,
            showInTimeline: true,
            milestones: { 
                M0: "10/02/2026", 
                M1: "16/02/2026", 
                M2: "23/02/2026", 
                M3: "13/05/2026" 
            }
        },
        {
            name: "Service Now",
            startDate: "15/01/2026",
            atRisk: false,
            showInTimeline: true,
            milestones: { 
                M0: "10/02/2026", 
                M1: "16/02/2026", 
                M2: "23/02/2026", 
                M3: "13/05/2026" 
            }
        },
        {
            name: "Magnitude",
            startDate: "01/02/2025",
            atRisk: true,
            showInTimeline: true,
            milestones: { 
                M0: "05/09/2025", 
                M1: "11/03/2026", 
                M2: "18/03/2026", 
                M3: "22/04/2026" 
            }
        },
        {
            name: "Gigya",
            startDate: "01/11/2025",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "15/12/2025",
                M1: "27/02/2026",
                M2: "10/04/2026",
                M3: "20/05/2026"
            }
        },
        {
            name: "Tagetik",
            startDate: "01/03/2026",  // Development starts
            atRisk: true,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "01/06/2026",
                M1: "15/06/2026",
                M2: "30/06/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "SFMC",
            startDate: "02/02/2026",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "27/02/2026",
                M1: "20/03/2026",
                M2: "10/04/2026",
                M3: "03/06/2026"
            }
        },
        {
            name: "GA4",
            startDate: "02/02/2026",  // Development starts
            atRisk: true,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "27/02/2026",
                M1: "20/03/2026",
                M2: "17/04/2026",
                M3: "03/06/2026"
            }
        },
        {
            name: "TTM",
            startDate: "15/01/2026",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "11/02/2026",
                M1: "20/03/2026",
                M2: "24/04/2026",
                M3: "10/06/2026"
            }
        },
        {
            name: "Commerce Tools",
            startDate: "02/02/2026",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "13/02/2026",
                M1: "20/03/2026",
                M2: "07/05/2026",
                M3: "10/06/2026"
            }
        },
        {
            name: "ChargeBee",
            startDate: "02/02/2026",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "13/02/2026",
                M1: "20/03/2026",
                M2: "07/05/2026",
                M3: "10/06/2026"
            }
        },
        {
            name: "SEED SF CG Cloud",
            startDate: "02/02/2026",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "20/02/2026",
                M1: "01/04/2026",
                M2: "15/04/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "Pitcher",
            startDate: "14/02/2026",  // Development starts
            atRisk: true,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "27/03/2026",
                M1: "13/04/2026",
                M2: "27/04/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "OCE",
            startDate: "28/02/2026",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "01/04/2026",
                M1: "10/05/2026",
                M2: "24/05/2026",
                M3: "17/06/2026"
            }
        },
        {
            name: "Acumen JPN",
            startDate: "01/11/2025",  // Development starts
            atRisk: true,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "31/12/2025",
                M1: "11/03/2026",
                M2: "18/03/2026",
                M3: "24/03/2026"
            }
        },
        {
            name: "Tekdan",
            startDate: "05/01/2026",  // Development starts
            atRisk: true,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "20/01/2026",
                M1: "20/03/2026",
                M2: "20/04/2026",
                M3: "24/05/2026"
            }
        },
        {
            name: "Zycus",
            startDate: "01/05/2026",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "20/05/2026",
                M1: "27/05/2026",
                M2: "04/06/2026",
                M3: "17/06/2026"
            }
        },
        {
            name: "SF Customer Voice",
            startDate: "01/06/2026",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "15/06/2026",
                M1: "23/06/2026",
                M2: "04/07/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "SAP ATTP",
            startDate: "01/06/2026",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "15/06/2026",
                M1: "23/06/2026",
                M2: "04/07/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "Xtel Kantar",
            startDate: "01/12/2025",  // Development starts
            atRisk: true,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "20/12/2025",
                M1: "11/03/2026",
                M2: "18/03/2026",
                M3: "15/07/2026"
            }
        },        {
            name: "Kantar (Drone)",
            startDate: "15/03/2026",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "20/04/2026",
                M1: "04/05/2026",
                M2: "18/06/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "Dan Performance",
            startDate: "01/04/2026",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "01/05/2026",
                M1: "15/05/2026",
                M2: "24/05/2026",
                M3: "22/07/2026"
            }
        },
        {
            name: "C&P Forecast",
            startDate: "16/02/2026",  // Development starts
            atRisk: false,  // AT RISK
            showInTimeline: true,
            milestones: { 
                M0: "27/02/2026",
                M1: "07/04/2026",
                M2: "17/05/2026",
                M3: "22/07/2026"
            }
        },
        // Hidden data sources (completed long ago)
        {
            name: "Artemis",
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
            name: "CFIN SLT",
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