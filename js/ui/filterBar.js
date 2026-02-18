/**
 * RoadmapSnap — filter bar logic
 * Extracted from index.html: filterState, filter/sort, updateFilter, clearFilters, filterByStatus, etc.
 * Depends on isDeliverableNonFilterable, getCurrentStatus, getStates, getLastMilestoneKey, parseDate, getMilestoneDate, renderRoadmap, activeDependencyGraph, drawDependencyArrows (window).
 */

let filterState = {
    status: 'ALL',
    riskOnly: false,
    search: '',
    sortBy: 'm3date',
    sortOrder: 'asc',
    showGantt: true
};

function filterDeliverables(sources) {
    return sources.filter(source => {
        const isNonFilterable = isDeliverableNonFilterable(source);
        if (filterState.status !== 'ALL' && isNonFilterable) {
            return false;
        }
        if (filterState.riskOnly && !source.atRisk) {
            return false;
        }
        if (filterState.status !== 'ALL') {
            const status = getCurrentStatus(source);
            if (status !== filterState.status) return false;
        }
        if (filterState.riskOnly && !source.atRisk) return false;
        if (filterState.search) {
            const searchLower = filterState.search.toLowerCase();
            const nameMatch = source.name.toLowerCase().includes(searchLower);
            const tagsMatch = source.tags && source.tags.some(tag =>
                tag.toLowerCase().includes(searchLower)
            );
            if (!nameMatch && !tagsMatch) return false;
        }
        return true;
    });
}

function sortDeliverables(sources) {
    const sorted = [...sources];
    const states = getStates();
    const lastMilestoneKey = getLastMilestoneKey();

    sorted.sort((a, b) => {
        let comparison = 0;
        switch (filterState.sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'status':
                const statusOrder = states.map(s => s.key);
                const statusA = statusOrder.indexOf(getCurrentStatus(a));
                const statusB = statusOrder.indexOf(getCurrentStatus(b));
                comparison = statusA - statusB;
                break;
            case 'm3date':
                const dateA = parseDate(getMilestoneDate(a, lastMilestoneKey)) || new Date(9999, 11, 31);
                const dateB = parseDate(getMilestoneDate(b, lastMilestoneKey)) || new Date(9999, 11, 31);
                comparison = dateA - dateB;
                break;
            case 'risk':
                comparison = (b.atRisk ? 1 : 0) - (a.atRisk ? 1 : 0);
                break;
        }
        return filterState.sortOrder === 'desc' ? -comparison : comparison;
    });

    return sorted;
}

function updateFilter(key, value) {
    filterState[key] = value;

    if (key === 'search') {
        clearTimeout(window.searchDebounceTimer);
        window.searchDebounceTimer = setTimeout(() => {
            renderRoadmap();
            const searchInput = document.querySelector('.filter-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
            }
        }, 150);
    } else {
        renderRoadmap();
    }
}

function clearFilters() {
    Object.assign(filterState, {
        status: 'ALL',
        riskOnly: false,
        search: '',
        sortBy: 'm3date',
        sortOrder: 'asc',
        showGantt: true
    });
    renderRoadmap();
}

function filterByStatus(status, event) {
    if (event) event.stopPropagation();
    if (filterState.status === status) {
        filterState.status = 'ALL';
    } else {
        filterState.status = status;
    }
    filterState.riskOnly = false;
    renderRoadmap();
}

function clearStatusFilterOnOutsideClick(event) {
    const clickedKpi = event.target.closest('.kpi-card.clickable');
    const clickedRiskSummary = event.target.closest('.risk-summary.clickable');
    if (!clickedKpi && !clickedRiskSummary && (filterState.status !== 'ALL' || filterState.riskOnly)) {
        filterState.status = 'ALL';
        filterState.riskOnly = false;
        renderRoadmap();
    }
}

function toggleRiskFilter(event) {
    if (event) event.stopPropagation();
    filterState.riskOnly = !filterState.riskOnly;
    renderRoadmap();
}

function toggleGanttBars() {
    filterState.showGantt = !filterState.showGantt;
    renderRoadmap();
    if (activeDependencyGraph) {
        setTimeout(() => drawDependencyArrows(), 50);
    }
}

// Export on window for global access
window.filterState = filterState;
window.filterDeliverables = filterDeliverables;
window.sortDeliverables = sortDeliverables;
window.updateFilter = updateFilter;
window.clearFilters = clearFilters;
window.filterByStatus = filterByStatus;
window.clearStatusFilterOnOutsideClick = clearStatusFilterOnOutsideClick;
window.toggleRiskFilter = toggleRiskFilter;
window.toggleGanttBars = toggleGanttBars;
