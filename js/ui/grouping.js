/**
 * RoadmapSnap — grouping logic
 * Uses AppState for groupCollapsed. Depends on AppState, CONFIG, renderRoadmap (window).
 */

function groupDeliverables(sources) {
    const groups = {};
    const ungrouped = [];

    sources.forEach(source => {
        const groupName = source.group || null;
        if (groupName) {
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(source);
        } else {
            ungrouped.push(source);
        }
    });

    return { groups, ungrouped };
}

function hasAnyGroups(sources) {
    return sources.some(source => source.group);
}

function toggleGroup(groupName) {
    const groupCollapsed = { ...AppState.get().groupCollapsed };
    groupCollapsed[groupName] = !groupCollapsed[groupName];
    AppState.set({ groupCollapsed });
}

function expandAllGroups() {
    const sources = CONFIG.DELIVERABLES;
    const groupCollapsed = { ...AppState.get().groupCollapsed };
    sources.forEach(source => {
        if (source.group) {
            groupCollapsed[source.group] = false;
        }
    });
    AppState.set({ groupCollapsed });
}

function collapseAllGroups() {
    const sources = CONFIG.DELIVERABLES;
    const groupCollapsed = { ...AppState.get().groupCollapsed };
    sources.forEach(source => {
        if (source.group) {
            groupCollapsed[source.group] = true;
        }
    });
    AppState.set({ groupCollapsed });
}

function getGroupStats(sources) {
    const atRiskCount = sources.filter(s => s.atRisk).length;
    return {
        total: sources.length,
        atRisk: atRiskCount
    };
}

function expandGroupsForDependencyGraph(graphNodes) {
    const sources = CONFIG.DELIVERABLES;
    const groupCollapsed = { ...AppState.get().groupCollapsed };
    sources.forEach(source => {
        if (graphNodes.includes(source.name) && source.group) {
            groupCollapsed[source.group] = false;
        }
    });
    AppState.set({ groupCollapsed });
}

// Export on window for global access
window.groupDeliverables = groupDeliverables;
window.hasAnyGroups = hasAnyGroups;
window.toggleGroup = toggleGroup;
window.expandAllGroups = expandAllGroups;
window.collapseAllGroups = collapseAllGroups;
window.getGroupStats = getGroupStats;
window.expandGroupsForDependencyGraph = expandGroupsForDependencyGraph;
