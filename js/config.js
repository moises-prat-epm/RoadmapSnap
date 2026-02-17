const CONFIG = {
    
    // Timeline Configuration
    TIMELINE: {
        TODAY: "",
        START_MONTH: "01/2026",
        END_MONTH: "08/2026",
    },
    
    // Entity & dashboard labels
    ENTITY_LABELS: {
        singular: "CDS Data Source",
        plural: "CDS Data Sources",
        columnHeader: "Upgrade Streams",
        scopeLabel: "Data Sources"
    },
    
    DASHBOARD_TEXT: {
        title: "OneHouse Upgrade Program Roadmap Dashboard",
        totalSubtitleSuffix: "in roadmap scope"
    },
    
    // Groups that are excluded from filters and KPI totals
    // These groups are shown in the timeline but don't affect statistics
    NON_FILTERABLE_GROUPS: [" OneSource 2.0"],
    
    // ============================================
    // WORKFLOW CONFIGURATION
    // ============================================
    // Defines the sequence of states and milestones.
    // Workflow: Not Started -> START -> Development -> M0 (Dev Complete) -> 
    //           Prod Deployment -> M1 (Deployed) -> Prod Validation -> 
    //           M2 (Production Ready) -> Parallel Running -> M3 (Switch Complete) -> Complete
    //
    WORKFLOW: [
        // Initial state (before any milestone)
        { type: 'state', key: 'NS', short: 'NST', title: 'Not Started', description: 'Not yet started' },
        
        // START milestone transitions to Development
        { type: 'milestone', key: 'START', short: 'GO', title: 'Start', subtitle: 'Project Kickoff', color: '#6554c0' },
        { type: 'state', key: 'DEV', short: 'DEV', title: 'Development', description: 'In development' },
        
        // M0 milestone (Dev Complete) transitions to Prod Deployment
        { type: 'milestone', key: 'M0', short: 'M0', title: 'Dev Complete', subtitle: 'Development Finished', color: '#8993a4' },
        { type: 'state', key: 'VAL', short: 'VAL', title: 'Validation', description: 'Under Validation' },
        
        // M1 milestone (DepVal Complete) transitions to Prod Deployment
        { type: 'milestone', key: 'M1', short: 'M1', title: 'Val Complete', subtitle: 'Validation Done', color: '#ffab00' },
        { type: 'state', key: 'DPL', short: 'DPL', title: 'Prod Deployment', description: 'Deployment in Production' },
        
        // M2 milestone (Production Deployment) transitions to Switch Preparation
        { type: 'milestone', key: 'M2', short: 'M2', title: 'Production Ready', subtitle: 'Ready for DTU consumption', color: '#36b37e' },
        { type: 'state', key: 'PRD', short: 'PRD', title: 'Production Ready', description: 'Ready for DTU consumption' },
        
        // M3 milestone (Switch Complete) transitions to Complete
        { type: 'milestone', key: 'M3', short: 'M3', title: 'Switch Complete', subtitle: 'OneSource 1.0 Switch', color: '#0065ff' },
        { type: 'state', key: 'DONE', short: 'DONE', title: 'Switch Complete', description: 'Fully migrated' },
    ],

    // Data Sources Configuration
    // START: When development starts (use startDate value)
    // atRisk: true = show warning indicator
    // showInTimeline: true = visible in timeline, false = hidden but counted in totals
    DELIVERABLES: [
        // ========================================
        // OneSource 2.0 - Platform Prerequisites
        // (Non-filterable group - excluded from KPI totals)
        // ========================================
        {
            name: "Network Global Peering",
            atRisk: false,
            link: "https://danone-commercial-it.atlassian.net/browse/O20-6127",
            showInTimeline: true,
            group: " OneSource 2.0",
            milestones: { 
                START: "09/02/2026",
                M0: "20/02/2026", 
                M1: "20/02/2026", 
                M2: "20/02/2026", 
                M3: "20/02/2026" 
            }
        },
        {
            name: "Processing cost optimisation",
            atRisk: false,
            showInTimeline: true,
            link: "https://danone-commercial-it.atlassian.net/browse/O20-6270",
            group: " OneSource 2.0",
            milestones: { 
                START: "09/02/2026",
                M0: "27/02/2026", 
                M1: "27/02/2026", 
                M2: "27/02/2026", 
                M3: "27/02/2026" 
            }
        },
        {
            name: "Pull: Partial Snapshot Ingestion",
            atRisk: false,
            showInTimeline: true,
            group: " OneSource 2.0",
            milestones: { 
                START: "20/02/2026",
                M0: "11/03/2026", 
                M1: "11/03/2026", 
                M2: "11/03/2026", 
                M3: "11/03/2026" 
            }
        },
        {
            name: "Cross-regional data sharing V3 (RLS/CLS)",
            atRisk: false,
            showInTimeline: true,
            link: "https://danone-commercial-it.atlassian.net/browse/O20-4659",
            group: " OneSource 2.0",
            milestones: { 
                START: "09/02/2026",
                M0: "11/03/2026", 
                M1: "11/03/2026", 
                M2: "11/03/2026", 
                M3: "11/03/2026" 
            }
        },
        {
            name: "Network Extension +DTUs in Regions",
            atRisk: false,
            showInTimeline: true,
            group: " OneSource 2.0",
            milestones: { 
                START: "01/05/2026",
                M0: "21/05/2026", 
                M1: "21/05/2026", 
                M2: "21/05/2026", 
                M3: "21/05/2026" 
            }
        },
        {
            name: "Selective Data Replication",
            atRisk: false,
            showInTimeline: true,
            group: " OneSource 2.0",
            milestones: { 
                START: "10/05/2026",
                M0: "06/06/2026", 
                M1: "06/06/2026", 
                M2: "06/06/2026", 
                M3: "06/06/2026" 
            }
        },
        {
            name: "RLS/CLS for Gold Layer",
            atRisk: false,
            showInTimeline: true,
            group: " OneSource 2.0",
            milestones: { 
                START: "10/06/2026",
                M0: "20/06/2026", 
                M1: "20/06/2026", 
                M2: "20/06/2026", 
                M3: "20/06/2026" 
            }
        },     
        {
            name: "Historical Data load to DTU",
            atRisk: false,
            showInTimeline: true,
            group: " OneSource 2.0",
            milestones: { 
                START: "15/06/2026",
                M0: "20/07/2026", 
                M1: "20/07/2026", 
                M2: "20/07/2026", 
                M3: "20/07/2026" 
            }
        },     
        {
            name: "Tables Deletions Process",
            atRisk: false,
            showInTimeline: true,
            group: " OneSource 2.0",
            milestones: { 
                START: "05/07/2026",
                M0: "15/07/2026", 
                M1: "15/07/2026", 
                M2: "15/07/2026", 
                M3: "15/07/2026" 
            }
        },     
        {
            name: "Hard Deletions",
            atRisk: false,
            showInTimeline: true,
            group: " OneSource 2.0",
            milestones: { 
                START: "20/07/2026",
                M0: "20/08/2026", 
                M1: "20/08/2026", 
                M2: "20/08/2026", 
                M3: "20/08/2026" 
            }
        },        
        // ========================================
        // Transversal Data Sources
        // ========================================
        {
            name: "SAP Themis B1-B3",
            atRisk: true,
            showInTimeline: true,
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-91",
            group: " Transversal",
            // Blocked by Bronze Batch Processing M3 and Global Peering M3
            dependencies: [
                { task: "Bronze Batch Processing", from: "M3", to: "M2" },
                { task: "Network Global Peering", from: "M3", to: "M3" },
                { task: "Processing cost optimisation", from: "M3", to: "M2" }
            ],
            milestones: { 
                START: "01/07/2025",
                M0: "05/09/2025", 
                M1: "12/01/2026", 
                M2: "11/03/2026", 
                M3: "15/04/2026" 
            }
        },
        {
            name: "SAP Themis B4-B6",
            atRisk: true,
            showInTimeline: true,
            group: " Transversal",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-91",
            // Blocked by Bronze Batch Processing M3 and Global Peering M3
            dependencies: [
                { task: "Bronze Batch Processing", from: "M3", to: "M2" },
                { task: "Network Global Peering", from: "M3", to: "M3" },
                { task: "Processing cost optimisation", from: "M3", to: "M2" }
            ],
            milestones: { 
                START: "01/07/2025",
                M0: "05/09/2025", 
                M1: "12/01/2026", 
                M2: "25/03/2026", 
                M3: "22/04/2026" 
            }
        },
        {
            name: "SAP Themis B7-B10",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-91",
            atRisk: true,
            group: " Transversal",
            showInTimeline: true,
            // Blocked by Bronze Batch Processing M3 and Global Peering M3
            dependencies: [
                { task: "Bronze Batch Processing", from: "M3", to: "M2" },
                { task: "Network Global Peering", from: "M3", to: "M3" },
                { task: "Processing cost optimisation", from: "M3", to: "M2" }
            ],
            milestones: { 
                START: "01/07/2025",
                M0: "05/09/2025", 
                M1: "12/01/2026", 
                M2: "08/04/2026", 
                M3: "06/05/2026" 
            }
        },
        {
            name: "CFIN DS",
            atRisk: false,
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-2003",
            showInTimeline: true,
            group: "SF",
            milestones: { 
                START: "01/07/2025",
                M0: "05/09/2025", 
                M1: "12/12/2025", 
                M2: "12/12/2025", 
                M3: "15/03/2026" 
            }
        },
        {
            name: "MasterMind",
            atRisk: false,
            showInTimeline: true,
            group: "SF",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-250",
            milestones: { 
                START: "01/10/2025",
                M0: "15/11/2025",
                M1: "20/11/2025",
                M2: "15/12/2025",
                M3: "15/04/2026"
            }
        },
        {
            name: "Bamboo",
            atRisk: false,            
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-248",
            showInTimeline: true,
            group: "D2D",
            milestones: { 
                START: "01/07/2025",
                M0: "05/09/2025", 
                M1: "12/01/2026", 
                M2: "02/02/2026", 
                M3: "20/05/2026" 
            }
        },
        {
            name: "Sievo",
            atRisk: false,
            showInTimeline: true,
            group: "D2D",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-978",
            milestones: { 
                START: "15/01/2026",
                M0: "30/01/2026", 
                M1: "06/02/2026", 
                M2: "01/03/2026", 
                M3: "06/05/2026" 
            }
        },
        {
            name: "Coupa",
            atRisk: false,
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-979",
            showInTimeline: true,
            group: "SF",
            milestones: { 
                START: "15/01/2026",
                M0: "30/01/2026", 
                M1: "06/02/2026", 
                M2: "20/02/2026", 
                M3: "06/05/2026" 
            }
        },
        {
            name: "Basware",
            atRisk: false,
            showInTimeline: true,
            group: "SF",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-264",
            milestones: { 
                START: "15/01/2026",
                M0: "10/02/2026", 
                M1: "16/02/2026", 
                M2: "23/02/2026", 
                M3: "13/05/2026" 
            }
        },
        {
            name: "Service Now",
            atRisk: false,
            showInTimeline: true,
            group: "SF",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-266",
            milestones: { 
                START: "15/01/2026",
                M0: "10/02/2026", 
                M1: "16/02/2026", 
                M2: "23/02/2026", 
                M3: "13/05/2026" 
            }
        },
        {
            name: "Magnitude",
            atRisk: true,
            showInTimeline: true,
            group: "SF",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-252",
            // M2 blocked by Partial Snapshot M3
            dependencies: [{ task: "Pull: Partial Snapshot Ingestion", from: "M3", to: "M2" }],
            milestones: { 
                START: "01/02/2025",
                M0: "05/09/2025", 
                M1: "11/03/2026", 
                M2: "18/03/2026", 
                M3: "22/04/2026" 
            }
        },
        {
            name: "Gigya",
            atRisk: false,
            showInTimeline: true,
            group: "Commercial",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-1648",
            milestones: { 
                START: "01/11/2025",
                M0: "15/12/2025",
                M1: "27/02/2026",
                M2: "10/04/2026",
                M3: "20/05/2026"
            }
        },
        {
            name: "Tagetik",
            atRisk: true,
            showInTimeline: true,
            group: "SF",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-980",
            milestones: { 
                START: "01/03/2026",
                M0: "01/06/2026",
                M1: "15/06/2026",
                M2: "30/06/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "SFMC",
            atRisk: false,
            showInTimeline: true,
            group: "Commercial",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-1650",
            milestones: { 
                START: "02/02/2026",
                M0: "27/02/2026",
                M1: "20/03/2026",
                M2: "10/04/2026",
                M3: "03/06/2026"
            }
        },
        {
            name: "GA4",
            atRisk: true,
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-1851",
            showInTimeline: true,
            group: "Commercial",
            milestones: { 
                START: "02/02/2026",
                M0: "27/02/2026",
                M1: "20/03/2026",
                M2: "17/04/2026",
                M3: "03/06/2026"
            }
        },
        {
            name: "TTM",
            atRisk: false,
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-218",
            showInTimeline: true,
            group: "Commercial",
            // M2 blocked by Partial Snapshot M3
            dependencies: [{ task: "Pull: Partial Snapshot Ingestion", from: "M3", to: "M2" }],
            milestones: { 
                START: "15/01/2026",
                M0: "11/02/2026",
                M1: "20/03/2026",
                M2: "24/04/2026",
                M3: "10/06/2026"
            }
        },
        {
            name: "Commerce Tools",
            atRisk: false,
            showInTimeline: true,
            group: "Commercial",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-1855",
            milestones: { 
                START: "02/02/2026",
                M0: "13/02/2026",
                M1: "20/03/2026",
                M2: "07/05/2026",
                M3: "10/06/2026"
            }
        },
        {
            name: "ChargeBee",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-1849",
            atRisk: false,
            showInTimeline: true,
            group: "Commercial",
            milestones: { 
                START: "02/02/2026",
                M0: "13/02/2026",
                M1: "20/03/2026",
                M2: "07/05/2026",
                M3: "10/06/2026"
            }
        },
        {
            name: "SEED SF CG Cloud",
            atRisk: false,
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-350",
            showInTimeline: true,
            group: "Commercial",
            milestones: { 
                START: "02/02/2026",
                M0: "17/02/2026",
                M1: "01/04/2026",
                M2: "15/04/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "Pitcher",
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-260",
            showInTimeline: true,
            group: "Commercial",
            milestones: { 
                START: "14/02/2026",
                M0: "27/03/2026",
                M1: "13/04/2026",
                M2: "27/04/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "OCE",
            atRisk: false,
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-262",
            showInTimeline: true,
            group: "Commercial",
            milestones: { 
                START: "16/02/2026",
                M0: "01/04/2026",
                M1: "10/05/2026",
                M2: "24/05/2026",
                M3: "17/06/2026"
            }
        },
        {
            name: "Acumen JPN",
            atRisk: true,
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-1646",
            showInTimeline: true,
            group: "Commercial",
            // M2 blocked by Partial Snapshot M3
            dependencies: [{ task: "Pull: Partial Snapshot Ingestion", from: "M3", to: "M2" }],
            milestones: { 
                START: "01/11/2025",
                M0: "31/12/2025",
                M1: "11/03/2026",
                M2: "18/03/2026",
                M3: "24/03/2026"
            }
        },
        {
            name: "Tekdan",
            atRisk: true,
            link: "https://danone-commercial-it.atlassian.net/browse/MTO-254",
            showInTimeline: true,
            group: "D2D",
            milestones: { 
                START: "05/01/2026",
                M0: "20/01/2026",
                M1: "20/03/2026",
                M2: "20/04/2026",
                M3: "24/05/2026"
            }
        },
        {
            name: "Zycus",
            atRisk: false,
            showInTimeline: true,
            descoped: true,
            group: "D2D",
            milestones: { 
                START: "01/05/2026",
                M0: "20/05/2026",
                M1: "27/05/2026",
                M2: "04/06/2026",
                M3: "17/06/2026"
            }
        },
        {
            name: "SF Customer Voice",
            atRisk: false,
            showInTimeline: true,
            group: "D2D",
            descoped: false,
            milestones: { 
                START: "01/06/2026",
                M0: "15/06/2026",
                M1: "23/06/2026",
                M2: "04/07/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "SAP ATTP",
            atRisk: false,
            showInTimeline: true,
            group: "D2D",
            milestones: { 
                START: "01/06/2026",
                M0: "15/06/2026",
                M1: "23/06/2026",
                M2: "04/07/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "Xtel Kantar",
            atRisk: true,
            showInTimeline: true,
            group: "Commercial",
            // M2 blocked by Partial Snapshot M3
            dependencies: [{ task: "Pull: Partial Snapshot Ingestion", from: "M3", to: "M2" }],
            milestones: { 
                START: "01/12/2025",
                M0: "20/12/2025",
                M1: "11/03/2026",
                M2: "18/03/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "Kantar (Drone)",
            atRisk: false,
            showInTimeline: true,
            group: "Commercial",
            milestones: { 
                START: "15/03/2026",
                M0: "20/04/2026",
                M1: "04/05/2026",
                M2: "18/06/2026",
                M3: "15/07/2026"
            }
        },
        {
            name: "Dan Performance",
            atRisk: false,
            showInTimeline: true,
            group: "D2D",
            milestones: { 
                START: "01/04/2026",
                M0: "01/05/2026",
                M1: "15/05/2026",
                M2: "24/05/2026",
                M3: "22/07/2026"
            }
        },
        {
            name: "HH Panels Drone",
            atRisk: false,
            showInTimeline: true,
            group: "D2D",
            milestones: { 
                START: "01/04/2026",
                M0: "01/05/2026",
                M1: "15/05/2026",
                M2: "24/05/2026",
                M3: "22/07/2026"
            }
        },

        // Hidden data sources (completed long ago)
        {
            name: "Artemis",
            atRisk: false,
            showInTimeline: false,
            milestones: { 
                START: "01/05/2025",
                M0: "20/07/2025", 
                M1: "01/08/2025", 
                M2: "15/09/2025", 
                M3: "20/10/2025" 
            }
        },
        {
            name: "CFIN SLT",
            atRisk: false,
            showInTimeline: false,
            milestones: { 
                START: "01/05/2025",
                M0: "20/07/2025", 
                M1: "01/08/2025", 
                M2: "15/09/2025", 
                M3: "20/10/2025" 
            }
        },
        
        /* Template for new data source:
        {
            name: "New Source Name",
            atRisk: false,            // Set to true to show risk warning
            showInTimeline: true,     // Set to false to hide from timeline
            link: "https://...",      // Optional - shows info icon, opens in new tab
            tags: [],                 // Optional - tags for filtering
            group: "",                // Optional - group name for grouping
            milestones: { 
                START: "DD/MM/YYYY",  // Development start date
                M0: "DD/MM/YYYY",     // Dev Complete date
                M1: "DD/MM/YYYY",     // Prod Deployed date
                M2: "DD/MM/YYYY",     // Prod Ready date
                M3: "DD/MM/YYYY"      // Switch Complete date
            }
        },
        */
    ]
};
