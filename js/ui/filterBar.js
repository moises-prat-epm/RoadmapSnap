/**
 * RoadmapSnap — filter bar logic
 * Uses AppState for filter/sort/showGantt. Subscriber in index.html calls renderRoadmap. Depends on AppState, isDeliverableNonFilterable, getCurrentStatus, getStates, getLastMilestoneKey, parseDate, getMilestoneDate, drawDependencyArrows (window).
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
    if (key === 'search') {
        clearTimeout(window.searchDebounceTimer);
        window.searchDebounceTimer = setTimeout(() => {
            AppState.set({ filter: { ...AppState.get().filter, search: value } });
            const searchInput = document.querySelector('.filter-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
            }
        }, 150);
        return;
    }
    if (key === 'sortBy') {
        AppState.set({ sort: { ...state.sort, by: value } });
    } else if (key === 'sortOrder') {
        AppState.set({ sort: { ...state.sort, order: value } });
    } else if (key === 'showGantt') {
        AppState.set({ showGantt: value });
    } else {
        AppState.set({ filter: { ...state.filter, [key]: value } });
    }
}

function clearFilters() {
    AppState.reset();
}

function filterByStatus(status, event) {
    if (event) event.stopPropagation();
    const filter = AppState.get().filter;
    if (filter.status === status) {
        AppState.set({ filter: { ...filter, status: 'ALL', riskOnly: false } });
    } else {
        AppState.set({ filter: { ...filter, status, riskOnly: false } });
    }
}

function clearStatusFilterOnOutsideClick(event) {
    const clickedKpi = event.target.closest('.kpi-card.clickable');
    const clickedRiskSummary = event.target.closest('.risk-summary.clickable');
    const filter = AppState.get().filter;
    if (!clickedKpi && !clickedRiskSummary && (filter.status !== 'ALL' || filter.riskOnly)) {
        AppState.set({ filter: { ...filter, status: 'ALL', riskOnly: false } });
    }
}

function toggleRiskFilter(event) {
    if (event) event.stopPropagation();
    const filter = AppState.get().filter;
    AppState.set({ filter: { ...filter, riskOnly: !filter.riskOnly } });
}

function toggleGanttBars() {
    const showGantt = AppState.get().showGantt;
    AppState.set({ showGantt: !showGantt });
    if (AppState.get().activeDependencyGraph) {
        setTimeout(() => drawDependencyArrows(), 50);
    }
}

function renderFilterBar(state, sources) {
    var filterableSources = sources.filter(function (s) { return !isDeliverableNonFilterable(s); });
    var filteredCount = filterableSources.length;
    var allVisible = typeof getAllVisibleDataSources === 'function' ? getAllVisibleDataSources() : [];
    var totalVisible = allVisible.filter(function (s) { return !isDeliverableNonFilterable(s); }).length;
    var entityScopeLabel = (typeof CONFIG !== 'undefined' && CONFIG.ENTITY_LABELS && CONFIG.ENTITY_LABELS.scopeLabel) ? CONFIG.ENTITY_LABELS.scopeLabel : 'items';
    var hasGroups = typeof hasAnyGroups === 'function' && hasAnyGroups(sources);
    var lastMilestoneKey = typeof getLastMilestoneKey === 'function' ? getLastMilestoneKey() : 'm3date';
    var hasActiveFilters = state.filter.status !== 'ALL' || state.filter.riskOnly || state.filter.search;
    var ganttSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>';
    return html`<div class="filter-bar">
        <div class="filter-group">
            <button class="filter-toggle ${state.showGantt ? 'active' : ''}" onclick="toggleGanttBars()">${raw(ganttSvg)} Gantt Bars</button>
        </div>
        <div class="filter-group">
            <input type="text" class="filter-input" placeholder="Search by name..." value="${(typeof window.escapeHtmlAttr === 'function' ? window.escapeHtmlAttr(state.filter.search) : state.filter.search)}" oninput="updateFilter('search', this.value)">
        </div>
        <div class="filter-group">
            <span class="filter-label">Sort:</span>
            <select class="filter-select" onchange="updateFilter('sortBy', this.value)">
                <option value="name" ${state.sort.by === 'name' ? 'selected' : ''}>Name</option>
                <option value="status" ${state.sort.by === 'status' ? 'selected' : ''}>Status</option>
                <option value="m3date" ${state.sort.by === 'm3date' ? 'selected' : ''}>${lastMilestoneKey} Date</option>
                <option value="risk" ${state.sort.by === 'risk' ? 'selected' : ''}>Risk</option>
            </select>
            <select class="filter-select" onchange="updateFilter('sortOrder', this.value)">
                <option value="asc" ${state.sort.order === 'asc' ? 'selected' : ''}>Asc</option>
                <option value="desc" ${state.sort.order === 'desc' ? 'selected' : ''}>Desc</option>
            </select>
        </div>
        ${hasActiveFilters ? [html`<button class="filter-clear" onclick="clearFilters()">Clear Filters</button>`] : []}
        ${hasGroups ? [html`<div class="group-controls">
            <button class="group-control-btn" onclick="expandAllGroups()">Expand All</button>
            <button class="group-control-btn" onclick="collapseAllGroups()">Collapse All</button>
        </div>`] : []}
        <div class="zoom-controls">
            <span class="filter-label">Zoom:</span>
            <button class="zoom-btn ${state.zoom === '3mo' ? 'active' : ''}" onclick="setDateRange(3)">3mo</button>
            <button class="zoom-btn ${state.zoom === '6mo' ? 'active' : ''}" onclick="setDateRange(6)">6mo</button>
            <button class="zoom-btn ${state.zoom === '12mo' ? 'active' : ''}" onclick="setDateRange(12)">12mo</button>
            <button class="zoom-btn ${state.zoom === 'all' ? 'active' : ''}" onclick="setDateRange('all')">All</button>
        </div>
        <div class="filter-group">
            <span class="filter-label">Theme:</span>
            <select class="filter-select theme-select" onchange="AppState.set({ theme: this.value })" title="Choose theme">
                <option value="light" ${state.theme === 'light' ? 'selected' : ''}>Light</option>
                <option value="dark" ${state.theme === 'dark' ? 'selected' : ''}>Dark</option>
                <option value="professional" ${state.theme === 'professional' ? 'selected' : ''}>Professional</option>
                <option value="colorful" ${state.theme === 'colorful' ? 'selected' : ''}>Colorful</option>
                <option value="blank" ${state.theme === 'blank' ? 'selected' : ''}>Blank</option>
            </select>
        </div>
        <div class="filter-results">
            Showing <strong>${filteredCount}</strong> of <strong>${totalVisible}</strong> ${entityScopeLabel}
        </div>
    </div>`;
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
window.renderFilterBar = renderFilterBar;
