/**
 * RoadmapSnap — statistics calculation
 * Extracted from index.html: stats, upcoming milestones, visible data sources.
 * Depends on global CONFIG; uses filterDeliverables, sortDeliverables, and workflow helpers (window).
 */

// Get visible data sources (with filters applied)
function getVisibleDataSources() {
    let sources = CONFIG.DELIVERABLES.filter(source => source.showInTimeline);
    sources = filterDeliverables(sources);
    sources = sortDeliverables(sources);
    return sources;
}

// Get all visible sources (without filters, for stats)
function getAllVisibleDataSources() {
    return CONFIG.DELIVERABLES.filter(source => source.showInTimeline);
}

// Calculate Statistics (uses all deliverables, not filtered)
// Now counts by STATES instead of milestones
function calculateStats() {
    // Only count filterable deliverables (exclude non-filterable groups)
    const allSources = getFilterableDeliverables();
    const visibleSources = allSources.filter(source => source.showInTimeline);
    const states = getStates();
    const lastState = getLastState();
    
    // Initialize stats dynamically with states
    const stats = { 
        total: allSources.length,
        visible: visibleSources.length,
        hidden: allSources.length - visibleSources.length,
        atRisk: 0,
        visibleByStatus: {},
        hiddenByStatus: {},
        stateKeys: states.map(s => s.key)
    };
    
    // Initialize state counts
    states.forEach(s => {
        stats[s.key] = 0;
        stats.visibleByStatus[s.key] = 0;
        stats.hiddenByStatus[s.key] = 0;
    });
    
    allSources.forEach(source => {
        const status = getCurrentStatus(source);
        if (stats[status] !== undefined) {
            stats[status]++;
        }
        
        if (source.atRisk) stats.atRisk++;
        
        if (source.showInTimeline) {
            if (stats.visibleByStatus[status] !== undefined) {
                stats.visibleByStatus[status]++;
            }
        } else {
            if (stats.hiddenByStatus[status] !== undefined) {
                stats.hiddenByStatus[status]++;
            }
        }
    });
    
    // Calculate completion percentage (last state = complete/production)
    const lastStateKey = lastState.key;
    stats.completionPercentage = Math.round((stats[lastStateKey] / stats.total) * 100);
    
    // Calculate "advanced" percentage (last 2 states)
    if (states.length >= 2) {
        const secondLastState = states[states.length - 2];
        stats.productionReadyPercentage = Math.round(((stats[secondLastState.key] + stats[lastStateKey]) / stats.total) * 100);
    } else {
        stats.productionReadyPercentage = stats.completionPercentage;
    }
    
    return stats;
}

// Find upcoming milestones (dynamic)
function getUpcomingMilestones() {
    const today = parseDate(getTodayDate());
    const milestones = getMilestones();
    const upcoming = {};
    const visibleSources = getAllVisibleDataSources();
    
    milestones.forEach(m => {
        let nearest = null;
        let nearestDate = null;

        visibleSources.forEach(source => {
            const milestoneDate = getMilestoneDate(source, m.key);
            const date = parseDate(milestoneDate);
            const group = source.group;
            if (isGroupNonFilterable(group)) {
                return;
            }

            if (date && date >= today) {
                if (!nearestDate || date < nearestDate) {
                    nearestDate = date;
                    nearest = { source: source.name, date: milestoneDate, atRisk: source.atRisk };
                }
            }
        });
        
        upcoming[m.key] = nearest;
    });
    
    return upcoming;
}

// Export on window for global access
window.calculateStats = calculateStats;
window.getUpcomingMilestones = getUpcomingMilestones;
window.getVisibleDataSources = getVisibleDataSources;
window.getAllVisibleDataSources = getAllVisibleDataSources;
