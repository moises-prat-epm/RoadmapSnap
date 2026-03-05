/**
 * RoadmapSnap — statistics calculation
 * Extracted from index.html: stats, upcoming milestones, visible data sources.
 * Depends on global CONFIG; uses filterDeliverables, sortDeliverables, and workflow helpers (window).
 * calculateStats accepts (deliverables, workflow, todayStr, config?) for testability.
 */
import { getCurrentStatus, getStates, getLastState, getWorkflow, getMilestones, getMilestoneDate } from './workflow.js';

// Get visible data sources (with filters applied)
function getVisibleDataSources() {
    let sources = CONFIG.DELIVERABLES.filter(source => source.showInTimeline !== false);
    sources = filterDeliverables(sources);
    sources = sortDeliverables(sources);
    return sources;
}

// Get all visible sources (without filters, for stats)
function getAllVisibleDataSources() {
    return CONFIG.DELIVERABLES.filter(source => source.showInTimeline !== false);
}

function getFilterableDeliverablesFrom(deliverables, config) {
    const nonFilterableGroups = (config && config.NON_FILTERABLE_GROUPS) || (typeof CONFIG !== 'undefined' ? (CONFIG.NON_FILTERABLE_GROUPS || []) : []);
    if (!nonFilterableGroups.length) return deliverables;
    return deliverables.filter(source => !source.group || !nonFilterableGroups.includes(source.group));
}

// Calculate Statistics (uses all deliverables, not filtered)
// Params: deliverables?, workflow?, todayStr?, config? — default to CONFIG.DELIVERABLES, CONFIG.WORKFLOW, getTodayDate(), CONFIG.
function calculateStats(deliverablesOverride, workflowOverride, todayStrOverride, configOverride) {
    const deliverables = deliverablesOverride ?? (typeof CONFIG !== 'undefined' ? CONFIG.DELIVERABLES : []);
    const workflow = workflowOverride ?? (typeof CONFIG !== 'undefined' && CONFIG.WORKFLOW ? CONFIG.WORKFLOW : (typeof window !== 'undefined' ? getWorkflow() : null));
    const todayStr = todayStrOverride ?? (typeof window !== 'undefined' && window.getTodayDate ? window.getTodayDate() : null);
    const config = configOverride ?? (typeof CONFIG !== 'undefined' ? CONFIG : {});

    const allSources = getFilterableDeliverablesFrom(deliverables, config);
    // KPIs exclude descoped items: only count non-descoped for totals, state counts, and progress
    const kpiSources = allSources.filter(source => !source.descoped);
    const visibleSources = kpiSources.filter(source => source.showInTimeline !== false);

    const states = workflow
        ? workflow.filter(item => item.type === 'state')
        : getStates();
    const lastState = workflow
        ? (states[states.length - 1] || { key: 'DONE', short: 'DONE', title: 'Done', description: '' })
        : getLastState();

    const stats = {
        total: kpiSources.length,
        visible: visibleSources.length,
        hidden: kpiSources.length - visibleSources.length,
        atRisk: 0,
        descoped: 0,
        visibleByStatus: {},
        hiddenByStatus: {},
        stateKeys: states.map(s => s.key)
    };

    states.forEach(s => {
        stats[s.key] = 0;
        stats.visibleByStatus[s.key] = 0;
        stats.hiddenByStatus[s.key] = 0;
    });

    // Count descoped from full set (for filter pill); all other counts from kpiSources (non-descoped)
    allSources.forEach(source => {
        if (source.descoped) stats.descoped++;
    });

    kpiSources.forEach(source => {
        const status = workflow != null && todayStr != null
            ? getCurrentStatus(source, workflow, todayStr)
            : getCurrentStatus(source);
        if (stats[status] !== undefined) {
            stats[status]++;
        }

        if (source.atRisk) stats.atRisk++;
        // descoped already counted above from allSources

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

    const lastStateKey = lastState.key;
    stats.completionPercentage = stats.total === 0 ? 0 : Math.round((stats[lastStateKey] / stats.total) * 100);

    if (states.length >= 2) {
        const secondLastState = states[states.length - 2];
        stats.productionReadyPercentage = stats.total === 0 ? 0 : Math.round(((stats[secondLastState.key] + stats[lastStateKey]) / stats.total) * 100);
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

// Export on window for global access (browser only)
if (typeof window !== 'undefined') {
    window.calculateStats = calculateStats;
    window.getUpcomingMilestones = getUpcomingMilestones;
    window.getVisibleDataSources = getVisibleDataSources;
    window.getAllVisibleDataSources = getAllVisibleDataSources;
}

export {
    calculateStats, getUpcomingMilestones, getVisibleDataSources, getAllVisibleDataSources
};
