/**
 * RoadmapSnap — Utilities
 * parseDate, formatDateDisplay, formatShortDate, darkenColor, getTodayDate
 */
(function () {
    'use strict';

    function parseDate(dateStr) {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    }

    function formatDateDisplay(dateStr) {
        if (!dateStr) return '';
        const [day, month] = dateStr.split('/');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return parseInt(day, 10) + ' ' + months[parseInt(month, 10) - 1];
    }

    function formatShortDate(dateStr) {
        if (!dateStr) return '';
        const [day, month, year] = dateStr.split('/');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return parseInt(day, 10) + ' ' + months[parseInt(month, 10) - 1] + ' ' + year;
    }

    function darkenColor(hex, percent) {
        if (!hex) return '#000000';
        hex = String(hex).replace('#', '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        r = Math.max(0, Math.floor(r * (1 - percent)));
        g = Math.max(0, Math.floor(g * (1 - percent)));
        b = Math.max(0, Math.floor(b * (1 - percent)));
        return '#' + [r, g, b].map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    }

    function getTodayDate() {
        if (typeof CONFIG !== 'undefined' && CONFIG.TIMELINE && CONFIG.TIMELINE.TODAY) {
            return CONFIG.TIMELINE.TODAY;
        }
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        return day + '/' + month + '/' + year;
    }

    window.parseDate = parseDate;
    window.formatDateDisplay = formatDateDisplay;
    window.formatShortDate = formatShortDate;
    window.darkenColor = darkenColor;
    window.getTodayDate = getTodayDate;
})();
