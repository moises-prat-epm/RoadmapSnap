/**
 * RoadmapSnap — summary dashboard HTML (header, KPI cards, progress bar, milestone cards).
 * Uses html`` tagged template. Depends on window: html, raw, getStates, getLastState, getMilestones,
 * formatShortDate, getTodayDate, filterByStatus, toggleRiskFilter, riskIconSVG, CONFIG.
 */

function getBreakdownText(stats, status) {
    var visible = stats.visibleByStatus && stats.visibleByStatus[status];
    var hidden = stats.hiddenByStatus && stats.hiddenByStatus[status];
    if (hidden > 0) {
        return (visible || 0) + ' shown + ' + hidden + ' hidden';
    }
    return '';
}

function renderDashboard(state, stats, upcoming, months) {
    var statesDef = getStates();
    var lastState = getLastState();
    var milestonesDef = getMilestones();
    var entityPlural = (typeof CONFIG !== 'undefined' && CONFIG.ENTITY_LABELS && CONFIG.ENTITY_LABELS.plural) ? CONFIG.ENTITY_LABELS.plural : 'Items';
    var entityScopeLabel = (typeof CONFIG !== 'undefined' && CONFIG.ENTITY_LABELS && CONFIG.ENTITY_LABELS.scopeLabel) ? CONFIG.ENTITY_LABELS.scopeLabel : entityPlural.toLowerCase();
    var dashboardTitle = (typeof CONFIG !== 'undefined' && CONFIG.DASHBOARD_TEXT && CONFIG.DASHBOARD_TEXT.title) ? CONFIG.DASHBOARD_TEXT.title : 'Roadmap Dashboard';
    var totalSubtitleSuffix = (typeof CONFIG !== 'undefined' && CONFIG.DASHBOARD_TEXT && CONFIG.DASHBOARD_TEXT.totalSubtitleSuffix) ? CONFIG.DASHBOARD_TEXT.totalSubtitleSuffix : 'in scope';

    var riskSummaryBlock = stats.atRisk > 0
        ? raw(html`<div class="risk-summary clickable ${state.filter.riskOnly ? 'active' : ''}" onclick="toggleRiskFilter(event)" title="Click to filter At Risk items">
            <span class="risk-summary-icon">${raw(riskIconSVG)}</span>
            <span class="risk-summary-text">${stats.atRisk} At Risk</span>
          </div>`)
        : [];

    var kpiCards = statesDef.map(function (s, i) {
        var stateClass = 'state-' + Math.min(i, 7);
        var breakdown = getBreakdownText(stats, s.key);
        return html`<div class="kpi-card clickable ${stateClass} ${state.filter.status === s.key ? 'active' : ''}" onclick="filterByStatus('${s.key}', event)">
            <div class="kpi-value">${stats[s.key] != null ? stats[s.key] : 0}</div>
            <div class="kpi-label">${s.title}</div>
            <div class="kpi-sublabel">${s.description || ''}</div>
            ${breakdown ? [html`<div class="kpi-breakdown">${breakdown}</div>`] : []}
          </div>`;
    });

    var totalBreakdown = stats.hidden > 0 ? [html`<div class="kpi-breakdown">${stats.visible} shown + ${stats.hidden} hidden</div>`] : [];

    var progressSegments = statesDef.map(function (s, i) {
        var count = stats[s.key] != null ? stats[s.key] : 0;
        var stateClass = 'state-' + Math.min(i, 7);
        var isFiltering = state.filter.status && state.filter.status !== 'ALL';
        var isActiveFilter = state.filter.status === s.key;
        var segmentOpacity = isFiltering ? (isActiveFilter ? '1' : '0.3') : '1';
        var pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
        return html`<div class="progress-segment ${stateClass}" style="width: ${pct}%; opacity: ${segmentOpacity};">${count > 0 ? count : ''}</div>`;
    });

    var progressLegend = statesDef.map(function (s, i) {
        var stateClass = 'state-' + Math.min(i, 7);
        return html`<div class="progress-legend-item">
            <div class="progress-legend-dot ${stateClass}"></div>
            <span>${s.short} ${s.title}</span>
          </div>`;
    });

    var milestoneCards = milestonesDef.map(function (m, idx) {
        var upcomingItem = upcoming && upcoming[m.key];
        var milestoneSlot = idx === 0 ? 'start' : 'm' + Math.min(idx - 1, 5);
        var content = upcomingItem
            ? raw(html`<span class="milestone-card-date">${formatShortDate(upcomingItem.date)}</span> - <span class="milestone-card-source">${upcomingItem.source}</span>${upcomingItem.atRisk ? ' ⚠️' : ''}`)
            : 'All ' + (m.title ? m.title.toLowerCase() : m.key.toLowerCase()) + ' complete';
        return html`<div class="milestone-card">
            <div class="milestone-card-header">
                <div class="milestone-card-icon ${milestoneSlot}">${m.short}</div>
                <div>
                    <div class="milestone-card-title">Next ${m.title}</div>
                    <div class="milestone-card-subtitle">${m.subtitle || ''}</div>
                </div>
            </div>
            <div class="milestone-card-content">${content}</div>
          </div>`;
    });

    return html`<div class="summary-dashboard" id="summary-section">
        <div class="summary-header">
            <div class="summary-title">
                ${dashboardTitle}
                <span class="summary-title-note">(${stats.total} total ${entityScopeLabel}, ${stats.visible} shown in timeline)</span>
            </div>
            <div class="header-right">
                ${riskSummaryBlock}
                <div class="today-date-container">
                    <span class="today-date-label">Today:</span>
                    <span class="today-date-value">${formatShortDate(getTodayDate())}</span>
                </div>
            </div>
        </div>
        <div class="kpi-section" style="grid-template-columns: repeat(${1 + statesDef.length}, 1fr);">
            <div class="kpi-card total">
                <div class="kpi-value">${stats.total}</div>
                <div class="kpi-label">Total ${entityPlural}</div>
                <div class="kpi-sublabel">${totalSubtitleSuffix}</div>
                ${totalBreakdown}
            </div>
            ${kpiCards}
        </div>
        <div class="progress-section">
            <div class="progress-header">
                <div class="progress-title">Overall Progress (All ${stats.total} ${entityPlural})</div>
                <div class="progress-percentage">${stats.completionPercentage}% ${lastState.title}</div>
            </div>
            <div class="progress-bar-container">
                ${progressSegments}
            </div>
            <div class="progress-legend">
                ${progressLegend}
            </div>
        </div>
        <div class="key-milestones" style="grid-template-columns: repeat(${milestonesDef.length}, 1fr);">
            ${milestoneCards}
        </div>
    </div>`;
}

window.renderDashboard = renderDashboard;
