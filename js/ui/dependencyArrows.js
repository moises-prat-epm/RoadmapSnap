/**
 * RoadmapSnap — dependency arrows overlay and toggle
 * Uses AppState for activeDependencyGraph. Depends on AppState, getDependencyGraph, expandGroupsForDependencyGraph, renderRoadmap, generateMonths, getLastMilestoneKey, getFirstMilestoneKey, getAllDataSources, getMilestoneByKey, getMilestoneDate, formatDateDisplay, isDateInRange, calculatePosition (window).
 */
import AppState from '../state/appState.js';
import { getDependencyGraph, getAllDataSources } from '../core/dependencies.js';
import { expandGroupsForDependencyGraph } from './grouping.js';
import { generateMonths, generateVisibleMonthsForZoom, getTodayDate, parseDate, formatDateDisplay, isDateInRange, calculatePosition } from '../core/timeline.js';
import { getLastMilestoneKey, getFirstMilestoneKey, getMilestoneByKey, getMilestoneDate } from '../core/workflow.js';

function toggleDependencyGraph(sourceName, event) {
    if (event) {
        event.stopPropagation();
    }

    const current = AppState.get().activeDependencyGraph;
    if (current === sourceName) {
        AppState.set({ activeDependencyGraph: null });
    } else {
        AppState.set({ activeDependencyGraph: sourceName });
        const graphNodes = getDependencyGraph(sourceName).nodes;
        expandGroupsForDependencyGraph(graphNodes);
        AppState.set({
            filter: { status: 'ALL', riskOnly: false, descopedOnly: false, search: '' }
        });
    }

    if (AppState.get().activeDependencyGraph) {
        setTimeout(() => drawDependencyArrows(), 50);
    } else {
        clearDependencyArrows();
    }
}

function clearDependencyGraphOnClickOutside(event) {
    const active = AppState.get().activeDependencyGraph;
    if (active &&
        !event.target.closest('.dependency-icon') &&
        !event.target.closest('.data-source-row') &&
        !event.target.closest('.filter-bar') &&
        !event.target.closest('.filter-toggle') &&
        !event.target.closest('button') &&
        !event.target.closest('select')) {
        AppState.set({ activeDependencyGraph: null });
        clearDependencyArrows();
    }
}

function drawDependencyArrows() {
    const state = AppState.get();
    const activeDependencyGraph = state.activeDependencyGraph;
    const showRiskOnlyRed = !!(state.filter && state.filter.riskOnly) && !activeDependencyGraph;
    if (!activeDependencyGraph && !showRiskOnlyRed) return;

    const graph = activeDependencyGraph ? getDependencyGraph(activeDependencyGraph) : null;
    const container = document.querySelector('.roadmap-content');
    if (!container) return;

    clearDependencyArrows();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'dependency-arrows-svg';
    svg.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 20;';
    svg.setAttribute('pointer-events', 'none');

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    function addMarker(id, color) {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', id);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', color);
        polygon.setAttribute('stroke', color);
        polygon.setAttribute('stroke-width', '1');
        marker.appendChild(polygon);
        defs.appendChild(marker);
    }

    addMarker('arrowhead-green', '#16a34a');
    addMarker('arrowhead-orange', '#ea580c');
    addMarker('arrowhead-red', '#dc2626');

    svg.appendChild(defs);

    const containerRect = container.getBoundingClientRect();

    // Use same visible months as timeline (today at beginning + next X months for 3mo/6mo/12mo)
    const months = (state.zoom === 'all' || !state.zoom)
        ? generateMonths()
        : generateVisibleMonthsForZoom(parseDate(getTodayDate()), parseInt(state.zoom, 10));
    const today = parseDate(getTodayDate());

    function getRowElement(name) {
        const rows = container.querySelectorAll('.data-source-row');
        for (const row of rows) {
            const nameEl = row.querySelector('.source-name-text');
            if (nameEl && nameEl.textContent.trim() === name) {
                return row;
            }
        }
        return null;
    }
    const lastMilestoneKey = getLastMilestoneKey();

    function getSourceByName(name) {
        return getAllDataSources().find(s => s.name === name);
    }

    function getAllInboundEdges() {
        const edges = [];
        getAllDataSources().forEach(target => {
            (target.dependencies || []).forEach(dep => {
                const task = typeof dep === 'string' ? dep : dep.task;
                edges.push({
                    from: task,
                    to: target.name,
                    fromMilestone: (typeof dep === 'object' && dep.from) ? dep.from : null,
                    toMilestone: (typeof dep === 'object' && dep.to) ? dep.to : null
                });
            });
        });
        return edges;
    }

    function drawArrow(fromName, toName, fromRow, toRow, arrowType, fromMilestone = null, toMilestone = null, onlyRed = false) {
        const fromRect = fromRow.getBoundingClientRect();
        const toRect = toRow.getBoundingClientRect();

        const fromTrack = fromRow.querySelector('.timeline-track');
        const toTrack = toRow.querySelector('.timeline-track');
        const fromTrackRect = fromTrack ? fromTrack.getBoundingClientRect() : fromRect;
        const toTrackRect = toTrack ? toTrack.getBoundingClientRect() : toRect;

        const fromSource = getSourceByName(fromName);
        const toSource = getSourceByName(toName);

        const firstMilestoneKey = getFirstMilestoneKey();
        const actualFromMilestone = fromMilestone || lastMilestoneKey;
        const actualToMilestone = toMilestone || firstMilestoneKey;

        const fromMilestoneDef = getMilestoneByKey(actualFromMilestone);
        const toMilestoneDef = getMilestoneByKey(actualToMilestone);

        let fromXPercent = 100;
        let toXPercent = 0;
        let fromDateStr = 'N/A';
        let toDateStr = 'N/A';
        let fromVisible = false;
        let toVisible = false;
        let fromDate = null;
        let toDate = null;
        const fromMilestoneShort = fromMilestoneDef?.short || actualFromMilestone;
        const toMilestoneShort = toMilestoneDef?.short || actualToMilestone;
        const fromMilestoneTitle = fromMilestoneDef?.title || actualFromMilestone;
        const toMilestoneTitle = toMilestoneDef?.title || actualToMilestone;

        if (fromSource) {
            const milestoneDate = getMilestoneDate(fromSource, actualFromMilestone);
            if (milestoneDate) {
                fromDate = parseDate(milestoneDate);
                fromDateStr = formatDateDisplay(milestoneDate);
                fromVisible = isDateInRange(milestoneDate, months);
                const pos = calculatePosition(milestoneDate, months);
                fromXPercent = pos !== null ? pos : 100;
            }
        }

        if (toSource) {
            const milestoneDate = getMilestoneDate(toSource, actualToMilestone);
            if (milestoneDate) {
                toDate = parseDate(milestoneDate);
                toDateStr = formatDateDisplay(milestoneDate);
                toVisible = isDateInRange(milestoneDate, months);
                const pos = calculatePosition(milestoneDate, months);
                toXPercent = pos !== null ? pos : 0;
            }
        }

        if (!fromVisible || !toVisible) {
            return;
        }

        const fromTrackWidth = fromTrackRect.width;
        const toTrackWidth = toTrackRect.width;

        const fromX = fromTrackRect.left - containerRect.left + (fromTrackWidth * fromXPercent / 100);
        const fromY = fromRect.top - containerRect.top + fromRect.height / 2;

        const toX = toTrackRect.left - containerRect.left + (toTrackWidth * toXPercent / 100);
        const toY = toRect.top - containerRect.top + toRect.height / 2;

        const vertDist = Math.abs(toY - fromY);
        const curveOffset = Math.min(20, vertDist * 0.15 + 8);

        let d;
        if (vertDist < 5) {
            d = `M ${fromX} ${fromY} L ${toX} ${toY}`;
        } else {
            const midY = (fromY + toY) / 2;
            const controlX = Math.max(fromX, toX) + curveOffset;
            d = `M ${fromX} ${fromY} Q ${controlX} ${midY}, ${toX} ${toY}`;
        }

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.style.cursor = 'pointer';
        group.setAttribute('pointer-events', 'auto');

        const hoverPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        hoverPath.setAttribute('d', d);
        hoverPath.setAttribute('stroke', 'transparent');
        hoverPath.setAttribute('stroke-width', '14');
        hoverPath.setAttribute('fill', 'none');
        hoverPath.setAttribute('pointer-events', 'stroke');
        group.appendChild(hoverPath);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', 'dependency-arrow-' + arrowType);
        var color = '#16a34a';
        var markerId = 'arrowhead-green';
        if (fromDate && today && fromDate.getTime() <= today.getTime()) {
            color = '#16a34a';
            markerId = 'arrowhead-green';
        } else if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
            color = '#dc2626';
            markerId = 'arrowhead-red';
        } else if (fromDate && toDate) {
            var diffDays = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 10) {
                color = '#ea580c';
                markerId = 'arrowhead-orange';
            }
        }
        if (onlyRed && color !== '#dc2626') return;
        path.setAttribute('stroke', color);
        path.style.stroke = color;
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', `url(#${markerId})`);
        path.setAttribute('opacity', '0.8');
        path.setAttribute('pointer-events', 'none');
        group.appendChild(path);

        group.addEventListener('mouseenter', () => {
            path.setAttribute('stroke-width', '3');
            path.setAttribute('opacity', '1');
        });
        group.addEventListener('mouseleave', () => {
            path.setAttribute('stroke-width', '2');
            path.setAttribute('opacity', '0.8');
        });

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${fromName}\n[${fromMilestoneShort}] ${fromMilestoneTitle}: ${fromDateStr}\n  ↓\n${toName}\n[${toMilestoneShort}] ${toMilestoneTitle}: ${toDateStr}`;
        group.appendChild(title);

        svg.appendChild(group);
    }

    const inboundEdges = graph ? graph.inboundEdges : getAllInboundEdges();
    const outboundEdges = graph ? graph.outboundEdges : [];
    inboundEdges.forEach(edge => {
        const fromRow = getRowElement(edge.from);
        const toRow = getRowElement(edge.to);
        if (fromRow && toRow) {
            drawArrow(edge.from, edge.to, fromRow, toRow, 'inbound', edge.fromMilestone, edge.toMilestone, showRiskOnlyRed);
        }
    });

    outboundEdges.forEach(edge => {
        const fromRow = getRowElement(edge.from);
        const toRow = getRowElement(edge.to);
        if (fromRow && toRow) {
            drawArrow(edge.from, edge.to, fromRow, toRow, 'outbound', edge.fromMilestone, edge.toMilestone, showRiskOnlyRed);
        }
    });

    container.style.position = 'relative';
    container.appendChild(svg);
}

function clearDependencyArrows() {
    const svg = document.getElementById('dependency-arrows-svg');
    if (svg) {
        svg.remove();
    }
}

/** Close the dependency graph (state + DOM). Call when filters change so the graph is cleared. */
function closeDependencyGraph() {
    if (AppState.get().activeDependencyGraph) {
        AppState.set({ activeDependencyGraph: null });
        clearDependencyArrows();
    }
}

// Export on window for global access
window.toggleDependencyGraph = toggleDependencyGraph;
window.clearDependencyGraphOnClickOutside = clearDependencyGraphOnClickOutside;
window.drawDependencyArrows = drawDependencyArrows;
window.clearDependencyArrows = clearDependencyArrows;
window.closeDependencyGraph = closeDependencyGraph;
