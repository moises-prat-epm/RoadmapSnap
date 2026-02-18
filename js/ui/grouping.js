/**
 * RoadmapSnap — grouping logic
 * Extracted from index.html: groupCollapsedState, groupDeliverables, toggle/expand/collapse, getGroupStats, expandGroupsForDependencyGraph.
 * Depends on global CONFIG and renderRoadmap (window).
 */

let groupCollapsedState = {};

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
    groupCollapsedState[groupName] = !groupCollapsedState[groupName];
    renderRoadmap();
}

function expandAllGroups() {
    const sources = CONFIG.DELIVERABLES;
    sources.forEach(source => {
        if (source.group) {
            groupCollapsedState[source.group] = false;
        }
    });
    renderRoadmap();
}

function collapseAllGroups() {
    const sources = CONFIG.DELIVERABLES;
    sources.forEach(source => {
        if (source.group) {
            groupCollapsedState[source.group] = true;
        }
    });
    renderRoadmap();
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

    sources.forEach(source => {
        if (graphNodes.includes(source.name) && source.group) {
            groupCollapsedState[source.group] = false;
        }
    });
}

// Export on window for global access
window.groupCollapsedState = groupCollapsedState;
window.groupDeliverables = groupDeliverables;
window.hasAnyGroups = hasAnyGroups;
window.toggleGroup = toggleGroup;
window.expandAllGroups = expandAllGroups;
window.collapseAllGroups = collapseAllGroups;
window.getGroupStats = getGroupStats;
window.expandGroupsForDependencyGraph = expandGroupsForDependencyGraph;
