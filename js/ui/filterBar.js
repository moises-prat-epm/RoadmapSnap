/**
 * RoadmapSnap — filter bar logic
 * Uses AppState for filter/sort/showGantt. Depends on AppState, isDeliverableNonFilterable, getCurrentStatus, getStates, getLastMilestoneKey, parseDate, getMilestoneDate, renderRoadmap, drawDependencyArrows (window).
 */

function filterDeliverables(sources) {
    const filter = AppState.get().filter;
    return sources.filter(source => {
        const isNonFilterable = isDeliverableNonFilterable(source);
        if (filter.status !== 'ALL' && isNonFilterable) {
            return false;
        }
        if (filter.riskOnly && !source.atRisk) {
            return false;
        }
        if (filter.status !== 'ALL') {
            const status = getCurrentStatus(source);
            if (status !== filter.status) return false;
        }
        if (filter.riskOnly && !source.atRisk) return false;
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
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
    const sort = AppState.get().sort;

    sorted.sort((a, b) => {
        let comparison = 0;
        switch (sort.by) {
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
        return sort.order === 'desc' ? -comparison : comparison;
    });

    return sorted;
}

function updateFilter(key, value) {
    const state = AppState.get();
    if (key === 'sortBy') {
        AppState.set({ sort: { ...state.sort, by: value } });
    } else if (key === 'sortOrder') {
        AppState.set({ sort: { ...state.sort, order: value } });
    } else if (key === 'showGantt') {
        AppState.set({ showGantt: value });
    } else {
        AppState.set({ filter: { ...state.filter, [key]: value } });
    }

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
    AppState.reset();
    renderRoadmap();
}

function filterByStatus(status, event) {
    if (event) event.stopPropagation();
    const filter = AppState.get().filter;
    if (filter.status === status) {
        AppState.set({ filter: { ...filter, status: 'ALL', riskOnly: false } });
    } else {
        AppState.set({ filter: { ...filter, status, riskOnly: false } });
    }
    renderRoadmap();
}

function clearStatusFilterOnOutsideClick(event) {
    const clickedKpi = event.target.closest('.kpi-card.clickable');
    const clickedRiskSummary = event.target.closest('.risk-summary.clickable');
    const filter = AppState.get().filter;
    if (!clickedKpi && !clickedRiskSummary && (filter.status !== 'ALL' || filter.riskOnly)) {
        AppState.set({ filter: { ...filter, status: 'ALL', riskOnly: false } });
        renderRoadmap();
    }
}

function toggleRiskFilter(event) {
    if (event) event.stopPropagation();
    const filter = AppState.get().filter;
    AppState.set({ filter: { ...filter, riskOnly: !filter.riskOnly } });
    renderRoadmap();
}

function toggleGanttBars() {
    const showGantt = AppState.get().showGantt;
    AppState.set({ showGantt: !showGantt });
    renderRoadmap();
    if (AppState.get().activeDependencyGraph) {
        setTimeout(() => drawDependencyArrows(), 50);
    }
}

// Export on window for global access
window.filterDeliverables = filterDeliverables;
window.sortDeliverables = sortDeliverables;
window.updateFilter = updateFilter;
window.clearFilters = clearFilters;
window.filterByStatus = filterByStatus;
window.clearStatusFilterOnOutsideClick = clearStatusFilterOnOutsideClick;
window.toggleRiskFilter = toggleRiskFilter;
window.toggleGanttBars = toggleGanttBars;
