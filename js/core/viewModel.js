/**
 * RoadmapSnap — deliverable view model
 * buildDeliverableViewModel(source, months, todayPosition, activeDependencyGraph)
 * resolveStateColor(statusKey), resolveStateTextColor(hexColor)
 * Depends on: getStates, getStateByKey, getCurrentStatus, getMilestones, getMilestoneByKey,
 *   getMilestoneDate, getFirstMilestoneKey, getLastMilestoneKey, parseDate, getTodayDate,
 *   calculatePosition, isDateInRange, getDependencyType, getInboundDependencies,
 *   getOutboundDependencies, getDependencyGraph (window).
 */
import { getStates, getStateByKey, getCurrentStatus, getMilestones, getMilestoneDate } from './workflow.js';
import { calculatePosition, isDateInRange } from './timeline.js';
import { getDependencyType, getInboundDependencies, getOutboundDependencies, getDependencyGraph } from './dependencies.js';

// Light theme state palette (index 0..7) — canonical mapping for resolveStateColor
var STATE_PALETTE = [
    '#c1c7d0', '#6554c0', '#0891b2', '#ffab00', '#36b37e', '#0065ff', '#0d9488', '#004cbf'
];

function resolveStateColor(statusKey) {
    var states = getStates();
    var index = states.findIndex(function (s) { return s.key === statusKey; });
    if (index < 0) index = 0;
    index = Math.min(7, index);
    return STATE_PALETTE[index];
}

function resolveStateTextColor(hexColor) {
    if (!hexColor || typeof hexColor !== 'string') return '#172b4d';
    var hex = hexColor.replace(/^#/, '');
    if (hex.length !== 6 && hex.length !== 3) return '#172b4d';
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var r = parseInt(hex.slice(0, 2), 16);
    var g = parseInt(hex.slice(2, 4), 16);
    var b = parseInt(hex.slice(4, 6), 16);
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#172b4d' : 'white';
}

function buildMilestoneMarkers(source, months, milestonesDef) {
    var MILESTONE_OVERLAP_THRESHOLD_PCT = 1.5;
    var allMarkers = [];
    var startDate = getMilestoneDate(source, 'START');
    var startMilestone = getMilestoneByKey('START');
    if (startDate && isDateInRange(startDate, months)) {
        var position = calculatePosition(startDate, months);
        allMarkers.push({ position: position, slotClass: 'start', short: (startMilestone && startMilestone.short) ? startMilestone.short : 'GO', date: startDate });
    }
    var nonStart = milestonesDef.filter(function (m) { return m.key !== 'START'; });
    nonStart.forEach(function (m, i) {
        var date = getMilestoneDate(source, m.key);
        if (!date || !isDateInRange(date, months)) return;
        var pos = calculatePosition(date, months);
        var slotClass = 'm' + Math.min(i, 5);
        allMarkers.push({ position: pos, slotClass: slotClass, short: m.short, date: date });
    });
    allMarkers.sort(function (a, b) { return a.position - b.position; });
    var keepIndex = new Set();
    var i = 0;
    while (i < allMarkers.length) {
        var j = i;
        while (j + 1 < allMarkers.length && (allMarkers[j + 1].position - allMarkers[j].position) < MILESTONE_OVERLAP_THRESHOLD_PCT) j++;
        keepIndex.add(j);
        i = j + 1;
    }
    return allMarkers.filter(function (_, idx) { return keepIndex.has(idx); }).map(function (m) {
        return {
            position: m.position,
            slotClass: m.slotClass,
            short: m.short,
            date: m.date,
            hideLabel: m.position < 2
        };
    });
}

function buildGanttSegments(source, months, todayPosition, milestonesDef) {
    var segments = [];
    var startDate = getMilestoneDate(source, 'START');
    var startDatePos = startDate ? calculatePosition(startDate, months) : null;
    var milestonePositions = {};
    milestonesDef.forEach(function (m) {
        var date = getMilestoneDate(source, m.key);
        milestonePositions[m.key] = date ? calculatePosition(date, months) : null;
    });
    function addSegment(start, end, milestoneSlot) {
        if (start === null || end === null || end <= start) return;
        var segClass = milestoneSlot === 0 ? 'segment-start' : 'segment-m' + (milestoneSlot - 1);
        var w = end - start;
        var pastWidth = Math.min(w, Math.max(0, todayPosition - start));
        var futureWidth = w - pastWidth;
        if (pastWidth > 0) {
            segments.push({ left: start, width: pastWidth, segmentClass: segClass, isFuture: false });
        }
        if (futureWidth > 0) {
            segments.push({ left: start + pastWidth, width: futureWidth, segmentClass: segClass, isFuture: true });
        }
    }
    for (var i = 0; i < milestonesDef.length; i++) {
        var current = milestonesDef[i];
        var currentPos = milestonePositions[current.key];
        var slot = i;
        if (i === 0) {
            if (currentPos !== null) {
                var segStart = startDatePos !== null ? startDatePos : Math.max(0, currentPos - 5);
                addSegment(segStart, currentPos, slot);
            }
        }
        if (i < milestonesDef.length - 1) {
            var next = milestonesDef[i + 1];
            var nextPos = milestonePositions[next.key];
            addSegment(currentPos, nextPos, slot);
        }
    }
    return segments;
}

function buildDependencyClass(activeDependencyGraph, sourceName) {
    if (!activeDependencyGraph) return '';
    var graph = getDependencyGraph(activeDependencyGraph);
    if (activeDependencyGraph === sourceName) return 'dependency-active';
    if (graph.nodes.indexOf(sourceName) !== -1) return 'dependency-highlight';
    return 'dependency-dimmed';
}

function buildDeliverableViewModel(source, months, todayPosition, activeDependencyGraph) {
    var status = getCurrentStatus(source);
    var state = getStateByKey(status);
    var stateColor = resolveStateColor(status);
    var statesDef = getStates();
    var milestonesDef = getMilestones();

    return {
        name: source.name,
        group: source.group || null,
        status: status,
        state: state,
        stateColor: stateColor,
        stateTextColor: resolveStateTextColor(stateColor),
        atRisk: !!source.atRisk,
        descoped: !!source.descoped,
        showInTimeline: source.showInTimeline !== false,
        link: source.link || null,
        tags: Array.isArray(source.tags) ? source.tags : [],
        milestoneMarkers: buildMilestoneMarkers(source, months, milestonesDef),
        ganttSegments: buildGanttSegments(source, months, todayPosition, milestonesDef),
        dependencyType: getDependencyType(source),
        dependencyClass: buildDependencyClass(activeDependencyGraph, source.name),
        inboundDeps: getInboundDependencies(source),
        outboundDeps: getOutboundDependencies(source)
    };
}

window.buildDeliverableViewModel = buildDeliverableViewModel;
window.resolveStateColor = resolveStateColor;
window.resolveStateTextColor = resolveStateTextColor;
