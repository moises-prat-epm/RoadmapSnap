/**
 * RoadmapSnap — dependency arrows overlay and toggle
 * Extracted from index.html: activeDependencyGraph, toggleDependencyGraph, clearDependencyGraphOnClickOutside, drawDependencyArrows, clearDependencyArrows.
 * Depends on getDependencyGraph, expandGroupsForDependencyGraph, filterState, renderRoadmap, generateMonths, getLastMilestoneKey, getFirstMilestoneKey, getAllDataSources, getMilestoneByKey, getMilestoneDate, formatDateDisplay, isDateInRange, calculatePosition (window).
 */

let activeDependencyGraph = null;

function toggleDependencyGraph(sourceName, event) {
    if (event) {
        event.stopPropagation();
    }

    if (activeDependencyGraph === sourceName) {
        activeDependencyGraph = null;
    } else {
        activeDependencyGraph = sourceName;
        const graphNodes = getDependencyGraph(sourceName).nodes;
        expandGroupsForDependencyGraph(graphNodes);
        filterState.status = 'ALL';
        filterState.riskOnly = false;
        filterState.search = '';
    }
    window.activeDependencyGraph = activeDependencyGraph;

    renderRoadmap();

    if (activeDependencyGraph) {
        setTimeout(() => drawDependencyArrows(), 50);
    } else {
        clearDependencyArrows();
    }
}

function clearDependencyGraphOnClickOutside(event) {
    if (activeDependencyGraph &&
        !event.target.closest('.dependency-icon') &&
        !event.target.closest('.data-source-row') &&
        !event.target.closest('.filter-bar') &&
        !event.target.closest('.filter-toggle') &&
        !event.target.closest('button') &&
        !event.target.closest('select')) {
        activeDependencyGraph = null;
        window.activeDependencyGraph = null;
        clearDependencyArrows();
        renderRoadmap();
    }
}

function drawDependencyArrows() {
    if (!activeDependencyGraph) return;

    const graph = getDependencyGraph(activeDependencyGraph);
    const container = document.querySelector('.roadmap-content');
    if (!container) return;

    clearDependencyArrows();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'dependency-arrows-svg';
    svg.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 100;';
    svg.setAttribute('pointer-events', 'none');

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    const inboundMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    inboundMarker.setAttribute('id', 'arrowhead-inbound');
    inboundMarker.setAttribute('markerWidth', '10');
    inboundMarker.setAttribute('markerHeight', '7');
    inboundMarker.setAttribute('refX', '9');
    inboundMarker.setAttribute('refY', '3.5');
    inboundMarker.setAttribute('orient', 'auto');
    const inboundPath = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    inboundPath.setAttribute('points', '0 0, 10 3.5, 0 7');
    inboundMarker.appendChild(inboundPath);
    defs.appendChild(inboundMarker);

    const outboundMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    outboundMarker.setAttribute('id', 'arrowhead-outbound');
    outboundMarker.setAttribute('markerWidth', '10');
    outboundMarker.setAttribute('markerHeight', '7');
    outboundMarker.setAttribute('refX', '9');
    outboundMarker.setAttribute('refY', '3.5');
    outboundMarker.setAttribute('orient', 'auto');
    const outboundPath = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    outboundPath.setAttribute('points', '0 0, 10 3.5, 0 7');
    outboundMarker.appendChild(outboundPath);
    defs.appendChild(outboundMarker);

    svg.appendChild(defs);

    const containerRect = container.getBoundingClientRect();

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

    const months = generateMonths();
    const lastMilestoneKey = getLastMilestoneKey();

    function getSourceByName(name) {
        return getAllDataSources().find(s => s.name === name);
    }

    function drawArrow(fromName, toName, fromRow, toRow, arrowType, fromMilestone = null, toMilestone = null) {
        const markerId = 'arrowhead-' + arrowType;
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
        const fromMilestoneShort = fromMilestoneDef?.short || actualFromMilestone;
        const toMilestoneShort = toMilestoneDef?.short || actualToMilestone;
        const fromMilestoneTitle = fromMilestoneDef?.title || actualFromMilestone;
        const toMilestoneTitle = toMilestoneDef?.title || actualToMilestone;

        if (fromSource) {
            const milestoneDate = getMilestoneDate(fromSource, actualFromMilestone);
            if (milestoneDate) {
                fromDateStr = formatDateDisplay(milestoneDate);
                fromVisible = isDateInRange(milestoneDate, months);
                const pos = calculatePosition(milestoneDate, months);
                fromXPercent = pos !== null ? pos : 100;
            }
        }

        if (toSource) {
            const milestoneDate = getMilestoneDate(toSource, actualToMilestone);
            if (milestoneDate) {
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

    graph.inboundEdges.forEach(edge => {
        const fromRow = getRowElement(edge.from);
        const toRow = getRowElement(edge.to);
        if (fromRow && toRow) {
            drawArrow(edge.from, edge.to, fromRow, toRow, 'inbound', edge.fromMilestone, edge.toMilestone);
        }
    });

    graph.outboundEdges.forEach(edge => {
        const fromRow = getRowElement(edge.from);
        const toRow = getRowElement(edge.to);
        if (fromRow && toRow) {
            drawArrow(edge.from, edge.to, fromRow, toRow, 'outbound', edge.fromMilestone, edge.toMilestone);
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

// Export on window for global access
window.activeDependencyGraph = activeDependencyGraph;
window.toggleDependencyGraph = toggleDependencyGraph;
window.clearDependencyGraphOnClickOutside = clearDependencyGraphOnClickOutside;
window.drawDependencyArrows = drawDependencyArrows;
window.clearDependencyArrows = clearDependencyArrows;
