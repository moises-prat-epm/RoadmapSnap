const CONFIG = {
    
    // Timeline Configuration
    TIMELINE: {
        TODAY: "",  // Leave empty to use current date automatically
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
    
    // Dynamic Milestones - Custom 5-phase delivery process
    MILESTONES: [
        { key: "M0", short: "M0", title: "Design Approved", subtitle: "UX/UI Sign-off", color: "#9b59b6" },
        { key: "M1", short: "M1", title: "Dev Complete", subtitle: "Code Ready", color: "#3498db" },
        { key: "M2", short: "M2", title: "QA Passed", subtitle: "Testing Done", color: "#f39c12" },
        { key: "M3", short: "M3", title: "UAT Approved", subtitle: "Business Sign-off", color: "#1abc9c" },
        { key: "M4", short: "M4", title: "Production", subtitle: "Live in Prod", color: "#2ecc71" }
    ],
    
    // Status Labels
    STATUS_LABELS: {
        NS: "Not Started",
        DEV: "In Development",
        M0: "Design Done",
        M1: "Dev Complete",
        M2: "QA Passed",
        M3: "UAT Done",
        M4: "In Production"
    },
    
    // Status Descriptions (for KPI cards)
    STATUS_DESCRIPTIONS: {
        NS: "Pending kickoff",
        DEV: "Active development",
        M0: "Design approved",
        M1: "Development finished",
        M2: "Testing complete",
        M3: "Business approved",
        M4: "Live in production"
    },
    
    // ============================================
    // E-COMMERCE PLATFORM FEATURES
    // ============================================
    DELIVERABLES: [
        
        // ----------------------------------------
        // FRONTEND - User Interface Components
        // ----------------------------------------
        {
            name: "Product Catalog UI",
            startDate: "15/12/2025",
            atRisk: false,
            showInTimeline: true,
            link: "https://figma.com/ecommerce/catalog",
            tags: ["frontend", "core", "P0"],
            group: "Frontend",
            milestones: { 
                M0: "05/01/2026",
                M1: "20/02/2026",
                M2: "05/03/2026",
                M3: "15/03/2026",
                M4: "01/04/2026"
            }
        },
        {
            name: "Shopping Cart",
            startDate: "01/01/2026",
            atRisk: false,
            showInTimeline: true,
            link: "https://figma.com/ecommerce/cart",
            tags: ["frontend", "core", "P0"],
            group: "Frontend",
            milestones: { 
                M0: "15/01/2026",
                M1: "28/02/2026",
                M2: "15/03/2026",
                M3: "25/03/2026",
                M4: "10/04/2026"
            }
        },
        {
            name: "Checkout Flow",
            startDate: "01/02/2026",
            atRisk: true,
            showInTimeline: true,
            link: "https://figma.com/ecommerce/checkout",
            tags: ["frontend", "core", "P0", "critical"],
            group: "Frontend",
            milestones: { 
                M0: "20/02/2026",
                M1: "25/03/2026",
                M2: "10/04/2026",
                M3: "20/04/2026",
                M4: "01/05/2026"
            }
        },
        {
            name: "User Account Dashboard",
            startDate: "15/02/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["frontend", "P1"],
            group: "Frontend",
            milestones: { 
                M0: "01/03/2026",
                M1: "15/04/2026",
                M2: "30/04/2026",
                M3: "10/05/2026",
                M4: "20/05/2026"
            }
        },
        {
            name: "Mobile Responsive Design",
            startDate: "01/04/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["frontend", "P1", "mobile"],
            group: "Frontend",
            milestones: { 
                M0: "15/04/2026",
                M1: "30/05/2026",
                M2: "15/06/2026",
                M3: "25/06/2026",
                M4: "05/07/2026"
            }
        },
        
        // ----------------------------------------
        // BACKEND - API & Services
        // ----------------------------------------
        {
            name: "Product Service API",
            startDate: "01/01/2026",
            atRisk: false,
            showInTimeline: true,
            link: "https://github.com/ecommerce/product-service",
            tags: ["backend", "api", "core", "P0"],
            group: "Backend Services",
            milestones: { 
                M0: "10/01/2026",
                M1: "15/02/2026",
                M2: "01/03/2026",
                M3: "10/03/2026",
                M4: "20/03/2026"
            }
        },
        {
            name: "Order Management API",
            startDate: "15/01/2026",
            atRisk: true,
            showInTimeline: true,
            link: "https://github.com/ecommerce/order-service",
            tags: ["backend", "api", "core", "P0"],
            group: "Backend Services",
            milestones: { 
                M0: "25/01/2026",
                M1: "10/03/2026",
                M2: "25/03/2026",
                M3: "05/04/2026",
                M4: "15/04/2026"
            }
        },
        {
            name: "Inventory Service",
            startDate: "01/02/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["backend", "api", "P1"],
            group: "Backend Services",
            milestones: { 
                M0: "15/02/2026",
                M1: "01/04/2026",
                M2: "15/04/2026",
                M3: "25/04/2026",
                M4: "05/05/2026"
            }
        },
        {
            name: "Search & Filter Engine",
            startDate: "01/03/2026",
            atRisk: false,
            showInTimeline: true,
            link: "https://confluence.com/ecommerce/search-spec",
            tags: ["backend", "elasticsearch", "P1"],
            group: "Backend Services",
            milestones: { 
                M0: "15/03/2026",
                M1: "30/04/2026",
                M2: "15/05/2026",
                M3: "25/05/2026",
                M4: "05/06/2026"
            }
        },
        {
            name: "Recommendation Engine",
            startDate: "01/06/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["backend", "ml", "P2"],
            group: "Backend Services",
            milestones: { 
                M0: "15/06/2026",
                M1: "01/08/2026",
                M2: "20/08/2026",
                M3: "01/09/2026",
                M4: "15/09/2026"
            }
        },
        
        // ----------------------------------------
        // PAYMENTS - Payment Processing
        // ----------------------------------------
        {
            name: "Stripe Integration",
            startDate: "01/02/2026",
            atRisk: false,
            showInTimeline: true,
            link: "https://stripe.com/docs",
            tags: ["payments", "integration", "P0"],
            group: "Payments",
            milestones: { 
                M0: "10/02/2026",
                M1: "15/03/2026",
                M2: "01/04/2026",
                M3: "10/04/2026",
                M4: "20/04/2026"
            }
        },
        {
            name: "PayPal Integration",
            startDate: "01/03/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["payments", "integration", "P1"],
            group: "Payments",
            milestones: { 
                M0: "15/03/2026",
                M1: "20/04/2026",
                M2: "05/05/2026",
                M3: "15/05/2026",
                M4: "25/05/2026"
            }
        },
        {
            name: "Apple Pay / Google Pay",
            startDate: "01/05/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["payments", "mobile", "P2"],
            group: "Payments",
            milestones: { 
                M0: "15/05/2026",
                M1: "30/06/2026",
                M2: "15/07/2026",
                M3: "25/07/2026",
                M4: "05/08/2026"
            }
        },
        {
            name: "Subscription Billing",
            startDate: "01/07/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["payments", "recurring", "P2"],
            group: "Payments",
            milestones: { 
                M0: "20/07/2026",
                M1: "01/09/2026",
                M2: "20/09/2026",
                M3: "01/10/2026",
                M4: "15/10/2026"
            }
        },
        
        // ----------------------------------------
        // INFRASTRUCTURE - DevOps & Platform
        // ----------------------------------------
        {
            name: "AWS Infrastructure Setup",
            startDate: "01/12/2025",
            atRisk: false,
            showInTimeline: true,
            link: "https://confluence.com/ecommerce/aws-arch",
            tags: ["infra", "aws", "P0"],
            group: "Infrastructure",
            milestones: { 
                M0: "15/12/2025",
                M1: "15/01/2026",
                M2: "25/01/2026",
                M3: "01/02/2026",
                M4: "10/02/2026"
            }
        },
        {
            name: "CI/CD Pipeline",
            startDate: "10/12/2025",
            atRisk: false,
            showInTimeline: true,
            tags: ["infra", "devops", "P0"],
            group: "Infrastructure",
            milestones: { 
                M0: "20/12/2025",
                M1: "20/01/2026",
                M2: "30/01/2026",
                M3: "05/02/2026",
                M4: "15/02/2026"
            }
        },
        {
            name: "Monitoring & Alerting",
            startDate: "01/02/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["infra", "observability", "P1"],
            group: "Infrastructure",
            milestones: { 
                M0: "15/02/2026",
                M1: "15/03/2026",
                M2: "30/03/2026",
                M3: "10/04/2026",
                M4: "20/04/2026"
            }
        },
        {
            name: "CDN & Caching Layer",
            startDate: "01/04/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["infra", "performance", "P1"],
            group: "Infrastructure",
            milestones: { 
                M0: "15/04/2026",
                M1: "15/05/2026",
                M2: "30/05/2026",
                M3: "10/06/2026",
                M4: "20/06/2026"
            }
        },
        
        // ----------------------------------------
        // SECURITY - Authentication & Security
        // ----------------------------------------
        {
            name: "User Authentication (OAuth2)",
            startDate: "01/01/2026",
            atRisk: false,
            showInTimeline: true,
            link: "https://auth0.com/docs",
            tags: ["security", "auth", "P0"],
            group: "Security",
            milestones: { 
                M0: "15/01/2026",
                M1: "20/02/2026",
                M2: "05/03/2026",
                M3: "15/03/2026",
                M4: "25/03/2026"
            }
        },
        {
            name: "PCI DSS Compliance",
            startDate: "01/02/2026",
            atRisk: true,
            showInTimeline: true,
            tags: ["security", "compliance", "P0", "critical"],
            group: "Security",
            milestones: { 
                M0: "01/03/2026",
                M1: "15/04/2026",
                M2: "01/05/2026",
                M3: "15/05/2026",
                M4: "01/06/2026"
            }
        },
        {
            name: "Fraud Detection System",
            startDate: "01/05/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["security", "ml", "P2"],
            group: "Security",
            milestones: { 
                M0: "20/05/2026",
                M1: "01/07/2026",
                M2: "20/07/2026",
                M3: "01/08/2026",
                M4: "15/08/2026"
            }
        },
        
        // ----------------------------------------
        // ANALYTICS - Reporting & Insights
        // ----------------------------------------
        {
            name: "Sales Dashboard",
            startDate: "01/04/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["analytics", "reporting", "P1"],
            group: "Analytics",
            milestones: { 
                M0: "15/04/2026",
                M1: "30/05/2026",
                M2: "15/06/2026",
                M3: "25/06/2026",
                M4: "05/07/2026"
            }
        },
        {
            name: "Customer Analytics",
            startDate: "01/06/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["analytics", "bi", "P2"],
            group: "Analytics",
            milestones: { 
                M0: "15/06/2026",
                M1: "01/08/2026",
                M2: "15/08/2026",
                M3: "01/09/2026",
                M4: "15/09/2026"
            }
        },
        {
            name: "A/B Testing Platform",
            startDate: "01/08/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["analytics", "experimentation", "P2"],
            group: "Analytics",
            milestones: { 
                M0: "15/08/2026",
                M1: "01/10/2026",
                M2: "20/10/2026",
                M3: "01/11/2026",
                M4: "15/11/2026"
            }
        },
        
        // ----------------------------------------
        // INTEGRATIONS - Third-Party Services
        // ----------------------------------------
        {
            name: "Shipping Providers API",
            startDate: "01/03/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["integration", "shipping", "P1"],
            group: "Integrations",
            milestones: { 
                M0: "15/03/2026",
                M1: "01/05/2026",
                M2: "15/05/2026",
                M3: "25/05/2026",
                M4: "05/06/2026"
            }
        },
        {
            name: "Email Marketing (Mailchimp)",
            startDate: "01/04/2026",
            atRisk: false,
            showInTimeline: true,
            link: "https://mailchimp.com/developer",
            tags: ["integration", "marketing", "P1"],
            group: "Integrations",
            milestones: { 
                M0: "15/04/2026",
                M1: "20/05/2026",
                M2: "05/06/2026",
                M3: "15/06/2026",
                M4: "25/06/2026"
            }
        },
        {
            name: "CRM Integration (Salesforce)",
            startDate: "01/07/2026",
            atRisk: false,
            showInTimeline: true,
            tags: ["integration", "crm", "P2"],
            group: "Integrations",
            milestones: { 
                M0: "15/07/2026",
                M1: "01/09/2026",
                M2: "15/09/2026",
                M3: "01/10/2026",
                M4: "15/10/2026"
            }
        },
        
        // ----------------------------------------
        // HIDDEN - Legacy / Completed Early
        // ----------------------------------------
        {
            name: "Requirements Gathering",
            startDate: "01/10/2025",
            atRisk: false,
            showInTimeline: false,  // Hidden - completed before timeline starts
            tags: ["planning"],
            group: "Planning",
            milestones: { 
                M0: "15/10/2025",
                M1: "01/11/2025",
                M2: "15/11/2025",
                M3: "25/11/2025",
                M4: "01/12/2025"
            }
        },
        {
            name: "Architecture Design",
            startDate: "15/10/2025",
            atRisk: false,
            showInTimeline: false,  // Hidden - completed before timeline starts
            tags: ["planning", "architecture"],
            group: "Planning",
            milestones: { 
                M0: "01/11/2025",
                M1: "20/11/2025",
                M2: "01/12/2025",
                M3: "10/12/2025",
                M4: "20/12/2025"
            }
        }
    ]
};
