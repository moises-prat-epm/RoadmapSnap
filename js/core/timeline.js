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

function calculatePosition(dateStr, months) {
    var date = parseDate(dateStr);
    if (!date) return null;
    var timelineStart = months[0].date;
    var timelineEnd = new Date(months[months.length - 1].date);
    timelineEnd.setMonth(timelineEnd.getMonth() + 1);
    var totalDays = (timelineEnd - timelineStart) / (1000 * 60 * 60 * 24);
    var daysFromStart = (date - timelineStart) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.min(100, (daysFromStart / totalDays) * 100));
}

function isDateInRange(dateStr, months) {
    var date = parseDate(dateStr);
    if (!date) return false;
    var timelineStart = months[0].date;
    var timelineEnd = new Date(months[months.length - 1].date);
    timelineEnd.setMonth(timelineEnd.getMonth() + 1);
    return date >= timelineStart && date <= timelineEnd;
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
window.calculatePosition = calculatePosition;
window.isDateInRange = isDateInRange;

export {
    parseDate, formatDateDisplay, formatShortDate, darkenColor, getTodayDate,
    parseMonthYear, getMonthName, generateMonths, calculatePosition, isDateInRange
};
