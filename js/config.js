const CONFIG = {
    
    // Timeline Configuration
    TIMELINE: {
        TODAY: "10/01/2026",  // Leave empty to use current date automatically
        START_MONTH: "01/2026",
        END_MONTH: "12/2026",
    },
    
    // Entity & dashboard labels
    ENTITY_LABELS: {
        singular: "Feature",
        plural: "Features",
        columnHeader: "Feature",
        scopeLabel: "features"
    },
    
    DASHBOARD_TEXT: {
        title: "E-Commerce Platform Roadmap",
        totalSubtitleSuffix: "in project scope"
    },
    
    // ============================================
    // WORKFLOW CONFIGURATION
    // ============================================
    // Defines the sequence of states and milestones.
    // The workflow alternates: state -> milestone -> state -> milestone -> ... -> final state
    // Each milestone marks the transition FROM the previous state TO the next state.
    // 
    // State: Current status of a deliverable (what phase it's in)
    // Milestone: A date marker that transitions to the next state
    //
    // The system calculates the current state based on which milestones have passed.
    // - If no milestone date has passed: first state (NS)
    // - If milestone X date passed but not milestone Y: state after X
    //
    WORKFLOW: [
        // Initial state (before any milestone)
        // Each state has: key (internal), short (3 chars max for display), title (full name)
        { type: 'state', key: 'NS', short: 'NS', title: 'Not Started', description: 'Pending kickoff' },
        
        // START milestone transitions to UX state
        { type: 'milestone', key: 'START', short: 'GO', title: 'Start', subtitle: 'Project Kickoff'},
        { type: 'state', key: 'UX', short: 'UX', title: 'In Design', description: 'UX/UI design phase' },
        
        // M0 milestone transitions to DEV state
        { type: 'milestone', key: 'M0', short: 'M0', title: 'Design Approved', subtitle: 'UX/UI Sign-off'},
        { type: 'state', key: 'DEV', short: 'DEV', title: 'In Development', description: 'Active development' },
        
        // M1 milestone transitions to QA state
        { type: 'milestone', key: 'M1', short: 'M1', title: 'Dev Complete', subtitle: 'Code Ready'},
        { type: 'state', key: 'QA', short: 'QA', title: 'Under QA', description: 'Quality assurance testing' },
        
        // M2 milestone transitions to UAT state
        { type: 'milestone', key: 'M2', short: 'M2', title: 'QA Passed', subtitle: 'Testing Done'},
        { type: 'state', key: 'UAT', short: 'UAT', title: 'Under UAT', description: 'User acceptance testing' },
        
        // M3 milestone transitions to STG state
        { type: 'milestone', key: 'M3', short: 'M3', title: 'UAT Approved', subtitle: 'Business Sign-off'},
        { type: 'state', key: 'STG', short: 'STG', title: 'In Staging', description: 'Staging environment' },
        
        // M4 milestone transitions to PRD state (final)
        { type: 'milestone', key: 'M4', short:'M4', title: 'Production', subtitle: 'Live in Prod'},
        { type: 'state', key: 'PRD', short: 'PRD', title: 'In Production', description: 'Live in production' },
    ],
    
    // ============================================
    // E-COMMERCE PLATFORM FEATURES (46 Total)
    // ============================================
    // Features distributed across all states based on TODAY = 11/02/2026
    // States: NS (Not Started), UX (Design), DEV (Development), QA, UAT, STAGE, PROD
    DELIVERABLES: [
        
        // ========================================
        // PROD STATE - Already in Production (6)
        // M4 date <= 11/02/2026
        // ========================================
        {
            name: "AWS Infrastructure Setup",
            atRisk: false,
            showInTimeline: true,
            link: "https://confluence.com/ecommerce/aws-arch",
            tags: ["infra", "aws", "P0"],
            group: "Infrastructure",
            milestones: { 
                START: "01/11/2025",
                M0: "15/11/2025",
                M1: "01/12/2025",
                M2: "15/12/2025",
                M3: "01/01/2026",
                M4: "15/01/2026"
            }
        },
        {
            name: "CI/CD Pipeline",
            atRisk: false,
            showInTimeline: true,
            tags: ["infra", "devops", "P0"],
            group: "Infrastructure",
            milestones: { 
                START: "15/11/2025",
                M0: "01/12/2025",
                M1: "15/12/2025",
                M2: "01/01/2026",
                M3: "15/01/2026",
                M4: "01/02/2026"
            }
        },
        {
            name: "Database Schema v1",
            atRisk: false,
            showInTimeline: true,
            tags: ["backend", "database", "P0"],
            group: "Backend Services",
            milestones: { 
                START: "01/11/2025",
                M0: "10/11/2025",
                M1: "25/11/2025",
                M2: "10/12/2025",
                M3: "20/12/2025",
                M4: "05/01/2026"
            }
        },
        {
            name: "API Gateway Setup",
            atRisk: false,
            showInTimeline: true,
            tags: ["infra", "api", "P0"],
            group: "Infrastructure",
            milestones: { 
                START: "10/11/2025",
                M0: "20/11/2025",
                M1: "05/12/2025",
                M2: "18/12/2025",
                M3: "02/01/2026",
                M4: "10/02/2026"
            }
        },
        {
            name: "Logging Infrastructure",
            atRisk: false,
            showInTimeline: true,
            tags: ["infra", "observability", "P0"],
            group: "Infrastructure",
            milestones: { 
                START: "01/12/2025",
                M0: "10/12/2025",
                M1: "20/12/2025",
                M2: "05/01/2026",
                M3: "20/01/2026",
                M4: "05/02/2026"
            }
        },
        {
            name: "SSL Certificates & Security",
            atRisk: false,
            showInTimeline: true,
            tags: ["security", "infra", "P0"],
            group: "Security",
            milestones: { 
                START: "15/11/2025",
                M0: "25/11/2025",
                M1: "10/12/2025",
                M2: "22/12/2025",
                M3: "08/01/2026",
                M4: "20/01/2026"
            }
        },
        
        // ========================================
        // STAGE STATE - In Staging (5)
        // M3 date <= 11/02/2026, M4 > 11/02/2026
        // ========================================
        {
            name: "User Authentication (OAuth2)",
            atRisk: false,
            showInTimeline: true,
            link: "https://auth0.com/docs",
            tags: ["security", "auth", "P0"],
            group: "Security",
            milestones: { 
                START: "01/12/2025",
                M0: "15/12/2025",
                M1: "10/01/2026",
                M2: "25/01/2026",
                M3: "05/02/2026",
                M4: "20/02/2026"
            }
        },
        {
            name: "Product Service API",
            atRisk: false,
            showInTimeline: true,
            link: "https://github.com/ecommerce/product-service",
            tags: ["backend", "api", "core", "P0"],
            group: "Backend Services",
            milestones: { 
                START: "01/12/2025",
                M0: "12/12/2025",
                M1: "05/01/2026",
                M2: "20/01/2026",
                M3: "03/02/2026",
                M4: "18/02/2026"
            }
        },
        {
            name: "Basic Admin Panel",
            atRisk: false,
            showInTimeline: true,
            tags: ["frontend", "admin", "P0"],
            group: "Frontend",
            milestones: { 
                START: "10/12/2025",
                M0: "20/12/2025",
                M1: "08/01/2026",
                M2: "22/01/2026",
                M3: "06/02/2026",
                M4: "22/02/2026"
            }
        },
        {
            name: "Email Notification Service",
            atRisk: false,
            showInTimeline: true,
            tags: ["backend", "notifications", "P0"],
            group: "Backend Services",
            milestones: { 
                START: "15/12/2025",
                M0: "28/12/2025",
                M1: "12/01/2026",
                M2: "26/01/2026",
                M3: "08/02/2026",
                M4: "25/02/2026"
            }
        },
        {
            name: "Session Management",
            atRisk: false,
            showInTimeline: true,
            tags: ["security", "backend", "P0"],
            group: "Security",
            milestones: { 
                START: "05/12/2025",
                M0: "18/12/2025",
                M1: "05/01/2026",
                M2: "18/01/2026",
                M3: "01/02/2026",
                M4: "15/02/2026"
            }
        },
        
        // ========================================
        // UAT STATE - Under User Acceptance Testing (5)
        // M2 date <= 11/02/2026, M3 > 11/02/2026
        // ========================================
        {
            name: "Product Catalog UI",
            atRisk: false,
            showInTimeline: true,
            link: "https://figma.com/ecommerce/catalog",
            tags: ["frontend", "core", "P0"],
            group: "Frontend",
            // Product Catalog UAT (M2) requires Product Service API to pass UAT (M3)
            dependencies: [{ task: "Product Service API", from: "M3", to: "M2" }],
            milestones: { 
                START: "01/12/2025",
                M0: "15/12/2025",
                M1: "15/01/2026",
                M2: "01/02/2026",
                M3: "18/02/2026",
                M4: "05/03/2026"
            }
        },
        {
            name: "Shopping Cart",
            atRisk: false,
            showInTimeline: true,
            link: "https://figma.com/ecommerce/cart",
            tags: ["frontend", "core", "P0"],
            group: "Frontend",
            milestones: { 
                START: "10/12/2025",
                M0: "22/12/2025",
                M1: "18/01/2026",
                M2: "05/02/2026",
                M3: "22/02/2026",
                M4: "10/03/2026"
            }
        },
        {
            name: "Order Management API",
            atRisk: true,
            showInTimeline: true,
            link: "https://github.com/ecommerce/order-service",
            tags: ["backend", "api", "core", "P0"],
            group: "Backend Services",
            milestones: { 
                START: "15/12/2025",
                M0: "28/12/2025",
                M1: "20/01/2026",
                M2: "08/02/2026",
                M3: "25/02/2026",
                M4: "12/03/2026"
            }
        },
        {
            name: "Customer Registration Flow",
            atRisk: false,
            showInTimeline: true,
            tags: ["frontend", "auth", "P0"],
            group: "Frontend",
            milestones: { 
                START: "20/12/2025",
                M0: "05/01/2026",
                M1: "22/01/2026",
                M2: "06/02/2026",
                M3: "20/02/2026",
                M4: "08/03/2026"
            }
        },
        {
            name: "Inventory Service",
            atRisk: false,
            showInTimeline: true,
            tags: ["backend", "api", "P1"],
            group: "Backend Services",
            milestones: { 
                START: "05/12/2025",
                M0: "20/12/2025",
                M1: "15/01/2026",
                M2: "02/02/2026",
                M3: "16/02/2026",
                M4: "02/03/2026"
            }
        },
        
        // ========================================
        // QA STATE - Under Quality Assurance (5)
        // M1 date <= 11/02/2026, M2 > 11/02/2026
        // ========================================
        {
            name: "Checkout Flow",
            atRisk: true,
            showInTimeline: true,
            link: "https://figma.com/ecommerce/checkout",
            tags: ["frontend", "core", "P0", "critical"],
            group: "Frontend",
            // Checkout QA (M2) requires Shopping Cart to pass UAT (M3)
            dependencies: [{ task: "Shopping Cart", from: "M3", to: "M2" }],
            milestones: { 
                START: "01/01/2026",
                M0: "15/01/2026",
                M1: "05/02/2026",
                M2: "22/02/2026",
                M3: "08/03/2026",
                M4: "22/03/2026"
            }
        },
        {
            name: "Stripe Integration",
            atRisk: false,
            showInTimeline: true,
            link: "https://stripe.com/docs",
            tags: ["payments", "integration", "P0"],
            group: "Payments",
            // Stripe UAT (M3) requires Checkout Flow to pass QA (M3)
            dependencies: [{ task: "Checkout Flow", from: "M3", to: "M3" }],
            milestones: { 
                START: "05/01/2026",
                M0: "18/01/2026",
                M1: "08/02/2026",
                M2: "25/02/2026",
                M3: "12/03/2026",
                M4: "28/03/2026"
            }
        },
        {
            name: "Product Search API",
            atRisk: false,
            showInTimeline: true,
            tags: ["backend", "search", "P1"],
            group: "Backend Services",
            milestones: { 
                START: "10/01/2026",
                M0: "22/01/2026",
                M1: "10/02/2026",
                M2: "28/02/2026",
                M3: "15/03/2026",
                M4: "01/04/2026"
            }
        },
        {
            name: "Wishlist Feature",
            atRisk: false,
            showInTimeline: true,
            tags: ["frontend", "feature", "P1"],
            group: "Frontend",
            milestones: { 
                START: "08/01/2026",
                M0: "20/01/2026",
                M1: "06/02/2026",
                M2: "20/02/2026",
                M3: "06/03/2026",
                M4: "20/03/2026"
            }
        },
        {
            name: "Order History Page",
            atRisk: false,
            showInTimeline: true,
            tags: ["frontend", "feature", "P1"],
            group: "Frontend",
            milestones: { 
                START: "12/01/2026",
                M0: "25/01/2026",
                M1: "10/02/2026",
                M2: "26/02/2026",
                M3: "12/03/2026",
                M4: "28/03/2026"
            }
        },
        
        // ========================================
        // DEV STATE - In Development (7)
        // M0 date <= 11/02/2026, M1 > 11/02/2026
        // ========================================
        {
            name: "User Account Dashboard",
            atRisk: false,
            showInTimeline: true,
            tags: ["frontend", "P1"],
            group: "Frontend",
            milestones: { 
                START: "15/01/2026",
                M0: "01/02/2026",
                M1: "01/03/2026",
                M2: "18/03/2026",
                M3: "02/04/2026",
                M4: "18/04/2026"
            }
        },
        {
            name: "Monitoring & Alerting",
            atRisk: false,
            showInTimeline: true,
            tags: ["infra", "observability", "P1"],
            group: "Infrastructure",
            milestones: { 
                START: "20/01/2026",
                M0: "05/02/2026",
                M1: "25/02/2026",
                M2: "12/03/2026",
                M3: "28/03/2026",
                M4: "15/04/2026"
            }
        },
        {
            name: "PayPal Integration",
            atRisk: false,
            showInTimeline: true,
            tags: ["payments", "integration", "P1"],
            group: "Payments",
            milestones: { 
                START: "18/01/2026",
                M0: "02/02/2026",
                M1: "22/02/2026",
                M2: "10/03/2026",
                M3: "25/03/2026",
                M4: "10/04/2026"
            }
        },
        {
            name: "Product Reviews System",
            atRisk: true,
            showInTimeline: true,
            tags: ["frontend", "feature", "P1"],
            group: "Frontend",
            milestones: { 
                START: "22/01/2026",
                M0: "08/02/2026",
                M1: "28/02/2026",
                M2: "15/03/2026",
                M3: "01/04/2026",
                M4: "18/04/2026"
            }
        },
        {
            name: "Coupon & Promo Codes",
            atRisk: false,
            showInTimeline: true,
            tags: ["backend", "feature", "P1"],
            group: "Backend Services",
            milestones: { 
                START: "25/01/2026",
                M0: "10/02/2026",
                M1: "02/03/2026",
                M2: "18/03/2026",
                M3: "02/04/2026",
                M4: "18/04/2026"
            }
        },
        {
            name: "Tax Calculation Service",
            atRisk: false,
            showInTimeline: true,
            tags: ["backend", "payments", "P1"],
            group: "Backend Services",
            milestones: { 
                START: "20/01/2026",
                M0: "05/02/2026",
                M1: "28/02/2026",
                M2: "15/03/2026",
                M3: "30/03/2026",
                M4: "15/04/2026"
            }
        },
        {
            name: "Address Validation",
            atRisk: false,
            showInTimeline: true,
            tags: ["backend", "integration", "P1"],
            group: "Integrations",
            milestones: { 
                START: "28/01/2026",
                M0: "10/02/2026",
                M1: "05/03/2026",
                M2: "22/03/2026",
                M3: "08/04/2026",
                M4: "25/04/2026"
            }
        },
        
        // ========================================
        // UX STATE - In Design (6)
        // START date <= 11/02/2026, M0 > 11/02/2026
        // ========================================
        {
            name: "PCI DSS Compliance",
            atRisk: true,
            showInTimeline: true,
            tags: ["security", "compliance", "P0", "critical"],
            group: "Security",
            milestones: { 
                START: "01/02/2026",
                M0: "01/03/2026",
                M1: "15/04/2026",
                M2: "01/05/2026",
                M3: "15/05/2026",
                M4: "01/06/2026"
            }
        },
        {
            name: "Search & Filter Engine",
            atRisk: false,
            showInTimeline: true,
            link: "https://confluence.com/ecommerce/search-spec",
            tags: ["backend", "elasticsearch", "P1"],
            group: "Backend Services",
            milestones: { 
                START: "05/02/2026",
                M0: "22/02/2026",
                M1: "15/03/2026",
                M2: "02/04/2026",
                M3: "18/04/2026",
                M4: "05/05/2026"
            }
        },
        {
            name: "Shipping Providers API",
            atRisk: false,
            showInTimeline: true,
            tags: ["integration", "shipping", "P1"],
            group: "Integrations",
            milestones: { 
                START: "03/02/2026",
                M0: "18/02/2026",
                M1: "08/03/2026",
                M2: "25/03/2026",
                M3: "10/04/2026",
                M4: "28/04/2026"
            }
        },
        {
            name: "Returns & Refunds Module",
            atRisk: false,
            showInTimeline: true,
            tags: ["backend", "feature", "P1"],
            group: "Backend Services",
            milestones: { 
                START: "08/02/2026",
                M0: "25/02/2026",
                M1: "18/03/2026",
                M2: "05/04/2026",
                M3: "22/04/2026",
                M4: "10/05/2026"
            }
        },
        {
            name: "Gift Cards System",
            atRisk: false,
            showInTimeline: true,
            tags: ["payments", "feature", "P2"],
            group: "Payments",
            milestones: { 
                START: "10/02/2026",
                M0: "28/02/2026",
                M1: "20/03/2026",
                M2: "08/04/2026",
                M3: "25/04/2026",
                M4: "12/05/2026"
            }
        },
        {
            name: "Multi-Currency Support",
            atRisk: false,
            showInTimeline: true,
            tags: ["backend", "payments", "P2"],
            group: "Backend Services",
            milestones: { 
                START: "06/02/2026",
                M0: "22/02/2026",
                M1: "12/03/2026",
                M2: "30/03/2026",
                M3: "15/04/2026",
                M4: "02/05/2026"
            }
        },
        
        // ========================================
        // NS STATE - Not Started (10)
        // START date > 11/02/2026
        // ========================================
        {
            name: "Mobile Responsive Design",
            atRisk: false,
            showInTimeline: true,
            tags: ["frontend", "P1", "mobile"],
            group: "Frontend",
            milestones: { 
                START: "01/04/2026",
                M0: "15/04/2026",
                M1: "30/05/2026",
                M2: "15/06/2026",
                M3: "25/06/2026",
                M4: "05/07/2026"
            }
        },
        {
            name: "Recommendation Engine",
            atRisk: false,
            showInTimeline: true,
            tags: ["backend", "ml", "P2"],
            group: "Backend Services",
            milestones: { 
                START: "01/06/2026",
                M0: "15/06/2026",
                M1: "01/08/2026",
                M2: "20/08/2026",
                M3: "01/09/2026",
                M4: "15/09/2026"
            }
        },
        {
            name: "Apple Pay / Google Pay",
            atRisk: false,
            showInTimeline: true,
            tags: ["payments", "mobile", "P2"],
            group: "Payments",
            milestones: { 
                START: "01/05/2026",
                M0: "15/05/2026",
                M1: "30/06/2026",
                M2: "15/07/2026",
                M3: "25/07/2026",
                M4: "05/08/2026"
            }
        },
        {
            name: "Subscription Billing",
            atRisk: false,
            showInTimeline: true,
            tags: ["payments", "recurring", "P2"],
            group: "Payments",
            milestones: { 
                START: "01/07/2026",
                M0: "20/07/2026",
                M1: "01/09/2026",
                M2: "20/09/2026",
                M3: "01/10/2026",
                M4: "15/10/2026"
            }
        },
        {
            name: "CDN & Caching Layer",
            atRisk: false,
            showInTimeline: true,
            tags: ["infra", "performance", "P1"],
            group: "Infrastructure",
            milestones: { 
                START: "01/04/2026",
                M0: "15/04/2026",
                M1: "15/05/2026",
                M2: "30/05/2026",
                M3: "10/06/2026",
                M4: "20/06/2026"
            }
        },
        {
            name: "Fraud Detection System",
            atRisk: false,
            showInTimeline: true,
            tags: ["security", "ml", "P2"],
            group: "Security",
            milestones: { 
                START: "01/05/2026",
                M0: "20/05/2026",
                M1: "01/07/2026",
                M2: "20/07/2026",
                M3: "01/08/2026",
                M4: "15/08/2026"
            }
        },
        {
            name: "Sales Dashboard",
            atRisk: false,
            showInTimeline: true,
            tags: ["analytics", "reporting", "P1"],
            group: "Analytics",
            milestones: { 
                START: "01/04/2026",
                M0: "15/04/2026",
                M1: "30/05/2026",
                M2: "15/06/2026",
                M3: "25/06/2026",
                M4: "05/07/2026"
            }
        },
        {
            name: "Customer Analytics",
            atRisk: false,
            showInTimeline: true,
            tags: ["analytics", "bi", "P2"],
            group: "Analytics",
            milestones: { 
                START: "01/06/2026",
                M0: "15/06/2026",
                M1: "01/08/2026",
                M2: "15/08/2026",
                M3: "01/09/2026",
                M4: "15/09/2026"
            }
        },
        {
            name: "A/B Testing Platform",
            atRisk: false,
            showInTimeline: true,
            tags: ["analytics", "experimentation", "P2"],
            group: "Analytics",
            milestones: { 
                START: "01/08/2026",
                M0: "15/08/2026",
                M1: "01/10/2026",
                M2: "20/10/2026",
                M3: "01/11/2026",
                M4: "15/11/2026"
            }
        },
        {
            name: "CRM Integration (Salesforce)",
            atRisk: false,
            showInTimeline: true,
            tags: ["integration", "crm", "P2"],
            group: "Integrations",
            milestones: { 
                START: "01/07/2026",
                M0: "15/07/2026",
                M1: "01/09/2026",
                M2: "15/09/2026",
                M3: "01/10/2026",
                M4: "15/10/2026"
            }
        },
        
        // ----------------------------------------
        // HIDDEN - Legacy / Completed Early (2)
        // ----------------------------------------
        {
            name: "Requirements Gathering",
            atRisk: false,
            showInTimeline: false,
            tags: ["planning"],
            group: "Planning",
            milestones: { 
                START: "01/09/2025",
                M0: "15/09/2025",
                M1: "01/10/2025",
                M2: "15/10/2025",
                M3: "25/10/2025",
                M4: "01/11/2025"
            }
        },
        {
            name: "Architecture Design",
            atRisk: false,
            showInTimeline: false,
            tags: ["planning", "architecture"],
            group: "Planning",
            milestones: { 
                START: "15/09/2025",
                M0: "01/10/2025",
                M1: "20/10/2025",
                M2: "01/11/2025",
                M3: "10/11/2025",
                M4: "20/11/2025"
            }
        }
    ]
};
