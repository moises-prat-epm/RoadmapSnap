/**
 * RoadmapSnap — timeline section HTML (state legend, roadmap-content with header + data rows).
 * Uses html`` throughout. Defines renderSourceRow internally. Depends on window: CONFIG, escapeHtmlAttr, riskIconSVG, infoIconSVG.
 */
import { html, raw, renderIf } from './renderer.js';
import { getStates, getMilestones, getLastMilestoneKey, getFirstMilestoneKey, getMilestoneByKey, getMilestoneDate } from '../core/workflow.js';
import { getAllDataSources } from '../core/dependencies.js';
import { formatDateDisplay } from '../core/timeline.js';
import { buildDeliverableViewModel } from '../core/viewModel.js';
import { groupDeliverables, hasAnyGroups, getGroupStats } from './grouping.js';
import AppState from '../state/appState.js';

var chevronSVG = '<svg class="group-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clip-rule="evenodd" /></svg>';

function renderTimelineGrid(state, visibleSources, months, todayPosition) {
    var statesDef = getStates();
    var milestonesDef = getMilestones();
    var lastMilestoneKey = getLastMilestoneKey();
    var monthWidth = months.length ? 100 / months.length : 0;
    var gridLinesHTML = months.slice(1).map(function (m, i) {
        return '<div class="month-grid-line" style="left: ' + (i + 1) * monthWidth + '%;"></div>';
    }).join('');

    function renderSourceRow(source, isGroupItem, months, todayPosition) {
        var vm = buildDeliverableViewModel(source, months, todayPosition, AppState.get().activeDependencyGraph);
        var stateIndex = Math.min(7, Math.max(0, statesDef.findIndex(function (s) { return s.key === vm.status; })));
        var statusClass = 'state-' + stateIndex;
        var indicatorClass = 'state-' + stateIndex;
        var atRiskClass = vm.atRisk ? 'at-risk' : '';
        var descopedClass = vm.descoped ? 'descoped' : '';
        var groupItemClass = isGroupItem ? 'group-item' : '';
        var ganttTooltipLines = milestonesDef.map(function (m) {
            var date = getMilestoneDate(source, m.key);
            return date ? (m.short || m.key) + ': ' + formatDateDisplay(date) : null;
        }).filter(Boolean);
        var ganttTooltip = ganttTooltipLines.length ? ganttTooltipLines.join('\n') : '';
        var ganttSegmentsHTML = vm.ganttSegments.map(function (seg) {
            return html`<div class="gantt-bar ${seg.segmentClass}${seg.isFuture ? ' gantt-future' : ''}" style="left: ${seg.left}%; width: ${seg.width}%;" title="${ganttTooltip}"></div>`;
        });
        var milestonesHTMLArr = vm.milestoneMarkers.map(function (m) {
            return html`<div class="milestone-marker ${m.slotClass}" style="left: ${m.position}%;${m.hideLabel ? ' min-width: 8px; width: 8px; height: 8px; border-radius: 50%;' : ''}">${m.hideLabel ? [] : [html`<span>${m.short}</span><div class="milestone-date">${formatDateDisplay(m.date)}</div>`]}</div>`;
        });
        var dependencyIconHTML = '';
        if (vm.dependencyType !== 'none') {
            var firstMsKey = getFirstMilestoneKey();
            var formatInboundDep = function (dep) {
                var fromMsKey = dep.from || lastMilestoneKey;
                var toMsKey = dep.to || firstMsKey;
                var fromMsDef = getMilestoneByKey(fromMsKey);
                var toMsDef = getMilestoneByKey(toMsKey);
                var fromShort = (fromMsDef && fromMsDef.short) ? fromMsDef.short : fromMsKey;
                var toShort = (toMsDef && toMsDef.short) ? toMsDef.short : toMsKey;
                var otherSource = getAllDataSources().find(function (s) { return s.name === dep.task; });
                var fromDateStr = otherSource ? getMilestoneDate(otherSource, fromMsKey) : null;
                var datePart = fromDateStr ? ' — ' + formatDateDisplay(fromDateStr) : '';
                return dep.task + ' (' + fromShort + ' → ' + toShort + ')' + datePart;
            };
            var formatOutboundDep = function (dep) {
                var fromMsKey = dep.from || lastMilestoneKey;
                var toMsKey = dep.to || firstMsKey;
                var fromMsDef = getMilestoneByKey(fromMsKey);
                var toMsDef = getMilestoneByKey(toMsKey);
                var fromShort = (fromMsDef && fromMsDef.short) ? fromMsDef.short : fromMsKey;
                var toShort = (toMsDef && toMsDef.short) ? toMsDef.short : toMsKey;
                var fromDateStr = getMilestoneDate(source, fromMsKey);
                var datePart = fromDateStr ? ' — ' + formatDateDisplay(fromDateStr) : '';
                return dep.task + ' (' + fromShort + ' → ' + toShort + ')' + datePart;
            };
            var depTooltip = '';
            var depIconSVG = '';
            if (vm.dependencyType === 'inbound') {
                depIconSVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 3v7H6l6 8 6-8h-3.5V3z"/></svg>';
                depTooltip = 'Blocked by:\n' + vm.inboundDeps.map(formatInboundDep).join('\n');
            } else if (vm.dependencyType === 'outbound') {
                depIconSVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.5 21v-7H18l-6-8-6 8h3.5v7z"/></svg>';
                depTooltip = 'Blocks:\n' + vm.outboundDeps.map(formatOutboundDep).join('\n');
            } else {
                depIconSVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5-5 5 5H7zm0 4l5 5 5-5H7z"/></svg>';
                depTooltip = 'Blocked by:\n' + vm.inboundDeps.map(formatInboundDep).join('\n') + '\n\nBlocks:\n' + vm.outboundDeps.map(formatOutboundDep).join('\n');
            }
            var isActive = AppState.get().activeDependencyGraph === vm.name;
            dependencyIconHTML = html`<div class="dependency-icon ${vm.dependencyType} ${isActive ? 'active' : ''}" title="${depTooltip}" onclick="toggleDependencyGraph('${vm.name}', event)">${raw(depIconSVG)}</div>`;
        }
        var riskIndicatorHTML = renderIf(vm.atRisk, raw('<div class="risk-indicator" title="At Risk">' + (typeof riskIconSVG !== 'undefined' ? riskIconSVG : '') + '</div>'));
        var infoLinkHTML = renderIf(vm.link && vm.link.trim(), raw(html`<a class="info-link" href="${vm.link}" target="_blank" rel="noopener noreferrer" title="More info">${raw(typeof infoIconSVG !== 'undefined' ? infoIconSVG : '')}</a>`));
        var dependencyIconFragment = renderIf(vm.dependencyType !== 'none', raw(dependencyIconHTML));
        var showGantt = AppState.get().showGantt;
        var ganttOrOverlay = showGantt ? ganttSegmentsHTML : (ganttTooltip ? [html`<div class="gantt-tooltip-overlay" title="${ganttTooltip}"></div>`] : []);
        return html`<div class="data-source-row ${atRiskClass} ${groupItemClass} ${vm.dependencyClass} ${descopedClass}">
            <div class="source-name ${statusClass}">
                ${riskIndicatorHTML}
                <span class="source-name-text">${vm.name}</span>
                ${infoLinkHTML}
                ${dependencyIconFragment}
                <span class="status-indicator ${indicatorClass}" title="${(vm.state && vm.state.title) || vm.status}">${(vm.state && vm.state.short) || vm.status}</span>
            </div>
            <div class="timeline-track">
                ${raw(gridLinesHTML)}
                ${ganttOrOverlay}
                <div class="today-guide-line" style="left: ${todayPosition}%;"></div>
                ${milestonesHTMLArr}
            </div>
        </div>`;
    }

    var columnHeaderLabel = (typeof CONFIG !== 'undefined' && CONFIG.ENTITY_LABELS && (CONFIG.ENTITY_LABELS.columnHeader || CONFIG.ENTITY_LABELS.singular)) ? (CONFIG.ENTITY_LABELS.columnHeader || CONFIG.ENTITY_LABELS.singular) : 'Item';
    var monthColumns = months.map(function (m) {
        return html`<div class="month-column">${m.name}</div>`;
    });
    var hasGroups = hasAnyGroups(visibleSources);

    var dataSourceRows = [];
    if (hasGroups && typeof groupDeliverables === 'function') {
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
    } else {
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
