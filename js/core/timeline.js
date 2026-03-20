/**
 * RoadmapSnap — timeline & date utilities
 * Clean copy: parseDate, formatDateDisplay, formatShortDate, darkenColor, getTodayDate (from roadmap.utils.js)
 * plus parseMonthYear, getMonthName, generateMonths, calculatePosition, isDateInRange (from index.html).
 * Exported on window for global access.
 */

function parseDate(dateStr) {
    if (!dateStr) return null;
    var parts = dateStr.split('/').map(Number);
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('/');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return parseInt(parts[0], 10) + ' ' + months[parseInt(parts[1], 10) - 1];
}

function formatShortDate(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('/');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return parseInt(parts[0], 10) + ' ' + months[parseInt(parts[1], 10) - 1] + ' ' + parts[2];
}

function darkenColor(hex, percent) {
    if (!hex) return '#000000';
    hex = String(hex).replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    r = Math.max(0, Math.floor(r * (1 - percent)));
    g = Math.max(0, Math.floor(g * (1 - percent)));
    b = Math.max(0, Math.floor(b * (1 - percent)));
    return '#' + [r, g, b].map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
}

function getTodayDate() {
    if (typeof CONFIG !== 'undefined' && CONFIG.TIMELINE && CONFIG.TIMELINE.TODAY) {
        return CONFIG.TIMELINE.TODAY;
    }
    var now = new Date();
    var day = String(now.getDate()).padStart(2, '0');
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var year = now.getFullYear();
    return day + '/' + month + '/' + year;
}

function parseMonthYear(monthYearStr) {
    var parts = monthYearStr.split('/').map(Number);
    return new Date(parts[1], parts[0] - 1, 1);
}

function getMonthName(date) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getFullYear();
}

function generateMonths() {
    var months = [];
    var start = parseMonthYear(CONFIG.TIMELINE.START_MONTH);
    var end = parseMonthYear(CONFIG.TIMELINE.END_MONTH);
    var current = new Date(start);
    while (current <= end) {
        months.push({
            date: new Date(current),
            name: getMonthName(current),
            daysInMonth: new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()
        });
        current.setMonth(current.getMonth() + 1);
    }
    return months;
}

/**
 * Generate visible months for 3M/6M/12M zoom: timeline starts at **today** (today at beginning),
 * remaining shows the next `count` months. Uses partial first/last month when needed.
 */
function generateVisibleMonthsForZoom(today, count) {
    var months = [];
    var startDate = new Date(today.getTime());
    var endDate = new Date(today.getFullYear(), today.getMonth() + count, today.getDate());
    var lastDayOfEndMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
    if (endDate.getDate() > lastDayOfEndMonth) endDate.setDate(lastDayOfEndMonth);

    var cur = new Date(startDate.getTime());
    var end = new Date(endDate.getTime());

    while (cur <= end) {
        var isFirst = months.length === 0;
        var isLastMonth = cur.getFullYear() === end.getFullYear() && cur.getMonth() === end.getMonth();
        var monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
        var monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
        var segmentStart;
        var daysInSegment;
        if (isFirst && startDate.getTime() > monthStart.getTime()) {
            segmentStart = new Date(startDate.getTime());
            daysInSegment = Math.ceil((monthEnd.getTime() - segmentStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        } else if (isLastMonth && endDate.getTime() < monthEnd.getTime()) {
            segmentStart = new Date(monthStart.getTime());
            daysInSegment = endDate.getDate();
        } else {
            segmentStart = new Date(monthStart.getTime());
            daysInSegment = monthEnd.getDate();
        }
        months.push({
            date: segmentStart,
            name: getMonthName(cur),
            daysInMonth: daysInSegment
        });
        cur.setMonth(cur.getMonth() + 1);
        cur.setDate(1);
    }
    return months;
}

/**
 * Returns header periods for the timeline. When span > 12 months, returns quarters (Q1 2026, Q2 2026, ...)
 * to avoid crowded month labels; otherwise returns one period per month.
 * Widths are day-proportional so the header aligns with the Gantt (which uses calculatePosition by days).
 * Each period: { label: string, widthPct: number }.
 */
function getTimelineHeaderPeriods(months) {
    if (!months || months.length === 0) return [];
    var totalDays = months.reduce(function (sum, m) { return sum + m.daysInMonth; }, 0);
    if (totalDays <= 0) return [];
    if (months.length <= 12) {
        return months.map(function (m) {
            return { label: m.name, widthPct: (m.daysInMonth / totalDays) * 100 };
        });
    }
    var periods = [];
    var i = 0;
    while (i < months.length) {
        var d = months[i].date;
        var year = d.getFullYear();
        var q = Math.floor(d.getMonth() / 3) + 1;
        var label = 'Q' + q + ' ' + year;
        var periodDays = 0;
        while (i < months.length) {
            var d2 = months[i].date;
            var q2 = Math.floor(d2.getMonth() / 3) + 1;
            if (d2.getFullYear() === year && q2 === q) {
                periodDays += months[i].daysInMonth;
                i++;
            } else {
                break;
            }
        }
        periods.push({ label: label, widthPct: (periodDays / totalDays) * 100 });
    }
    return periods;
}

function calculatePosition(dateStr, months) {
    var date = parseDate(dateStr);
    if (!date || !months.length) return null;
    var timelineStart = months[0].date;
    var totalDays = months.reduce(function (sum, m) { return sum + m.daysInMonth; }, 0);
    if (totalDays <= 0) return null;
    var daysFromStart = (date - timelineStart) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.min(100, (daysFromStart / totalDays) * 100));
}

function isDateInRange(dateStr, months) {
    var date = parseDate(dateStr);
    if (!date || !months.length) return false;
    var timelineStart = months[0].date;
    var last = months[months.length - 1];
    var timelineEnd = new Date(last.date.getTime());
    timelineEnd.setDate(timelineEnd.getDate() + last.daysInMonth);
    return date >= timelineStart && date < timelineEnd;
}

// Export on window for global access
window.parseDate = parseDate;
window.formatDateDisplay = formatDateDisplay;
window.formatShortDate = formatShortDate;
window.darkenColor = darkenColor;
window.getTodayDate = getTodayDate;
window.parseMonthYear = parseMonthYear;
window.getMonthName = getMonthName;
window.generateMonths = generateMonths;
window.generateVisibleMonthsForZoom = generateVisibleMonthsForZoom;
window.getTimelineHeaderPeriods = getTimelineHeaderPeriods;
window.calculatePosition = calculatePosition;
window.isDateInRange = isDateInRange;

export {
    parseDate, formatDateDisplay, formatShortDate, darkenColor, getTodayDate,
    parseMonthYear, getMonthName, generateMonths, generateVisibleMonthsForZoom, getTimelineHeaderPeriods, calculatePosition, isDateInRange
};
