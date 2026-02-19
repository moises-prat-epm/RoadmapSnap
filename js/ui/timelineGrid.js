/**
 * RoadmapSnap — timeline section HTML (state legend, roadmap-content with header + data rows).
 * Uses html`` throughout. Calls renderSourceRow for each row. Depends on window: html, raw,
 * getStates, groupDeliverables, hasAnyGroups, getGroupStats, AppState, CONFIG, escapeHtmlAttr, renderSourceRow.
 */

var chevronSVG = '<svg class="group-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clip-rule="evenodd" /></svg>';

function renderTimelineGrid(state, visibleSources, months, todayPosition) {
    var statesDef = getStates();
    var columnHeaderLabel = (typeof CONFIG !== 'undefined' && CONFIG.ENTITY_LABELS && (CONFIG.ENTITY_LABELS.columnHeader || CONFIG.ENTITY_LABELS.singular)) ? (CONFIG.ENTITY_LABELS.columnHeader || CONFIG.ENTITY_LABELS.singular) : 'Item';
    var monthColumns = months.map(function (m) {
        return html`<div class="month-column">${m.name}</div>`;
    });
    var hasGroups = hasAnyGroups(visibleSources);

    var dataSourceRows = [];
    if (hasGroups && typeof groupDeliverables === 'function' && typeof renderSourceRow === 'function') {
        var result = groupDeliverables(visibleSources);
        var groups = result.groups;
        var ungrouped = result.ungrouped;
        var groupOrder = (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.GROUP_ORDER) && CONFIG.GROUP_ORDER.length) ? CONFIG.GROUP_ORDER : null;
        var sortedGroupNames = groupOrder
            ? Object.keys(groups).sort(function (a, b) {
                var i = groupOrder.indexOf(a);
                var j = groupOrder.indexOf(b);
                if (i === -1 && j === -1) return a.localeCompare(b);
                if (i === -1) return 1;
                if (j === -1) return -1;
                return i - j;
            })
            : Object.keys(groups).sort();
        sortedGroupNames.forEach(function (groupName) {
            var groupSources = groups[groupName];
            var collapsed = (state.groupCollapsed && state.groupCollapsed[groupName]) || false;
            var groupStats = getGroupStats(groupSources);
            var chevronClass = 'group-chevron' + (collapsed ? ' collapsed' : '');
            dataSourceRows.push(html`<div class="group-header" onclick="toggleGroup('${escapeHtmlAttr(groupName)}')">
                <div class="group-header-name">
                    ${raw(chevronSVG.replace('class="group-chevron"', 'class="' + chevronClass + '"'))}
                    ${groupName}
                    <span class="group-stats">
                        ${groupStats.total} items${groupStats.atRisk > 0 ? raw(' <span class="group-stats-risk">(' + groupStats.atRisk + ' at risk)</span>') : []}
                    </span>
                </div>
                <div class="group-header-track"></div>
            </div>`);
            if (!collapsed) {
                groupSources.forEach(function (source) {
                    dataSourceRows.push(renderSourceRow(source, true, months, todayPosition));
                });
            }
        });
        ungrouped.forEach(function (source) {
            dataSourceRows.push(renderSourceRow(source, false, months, todayPosition));
        });
    } else if (typeof renderSourceRow === 'function') {
        visibleSources.forEach(function (source) {
            dataSourceRows.push(renderSourceRow(source, false, months, todayPosition));
        });
    }

    var stateLegendItems = statesDef.map(function (s, i) {
        var stateClass = 'state-' + Math.min(i, 7);
        return html`<div class="state-legend-item">
            <span class="state-legend-badge ${stateClass}">${s.short}</span>
            <span class="state-legend-label">${s.title}</span>
        </div>`;
    });

    var rowsHTML = dataSourceRows.join('');
    return html`<div id="timeline-section">
        <div class="state-legend">
            <div class="state-legend-items">
                ${stateLegendItems}
            </div>
            <div class="state-legend-info">
                Timeline: <span class="state-legend-info-count">${months[0] ? months[0].name : ''}</span> - <span class="state-legend-info-count">${months[months.length - 1] ? months[months.length - 1].name : ''}</span>
            </div>
        </div>
        <div class="roadmap-content">
            <div class="roadmap-grid">
                <div class="timeline-header">
                    <div class="timeline-label">${columnHeaderLabel}</div>
                    <div class="timeline-months">
                        ${monthColumns}
                        <div class="today-pointer" style="left: ${todayPosition}%;">
                            <div class="today-pointer-arrow"></div>
                        </div>
                    </div>
                </div>
                ${raw(rowsHTML)}
            </div>
        </div>
    </div>`;
}

window.renderTimelineGrid = renderTimelineGrid;
