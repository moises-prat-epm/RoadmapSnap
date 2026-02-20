/**
 * RoadmapSnap — config validation
 * validateConfig(config) returns { errors: [], warnings: [] }.
 * Errors block rendering; warnings are logged but rendering continues.
 */

var DDMMYYYY = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;

function isDDMMYYYY(s) {
    return typeof s === 'string' && DDMMYYYY.test(s.trim());
}

/** Parse MM/YYYY to a Date (first day of month). */
function parseMonthYear(monthYearStr) {
    if (!monthYearStr || typeof monthYearStr !== 'string') return null;
    var parts = monthYearStr.trim().split('/');
    if (parts.length !== 2) return null;
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[1], 10);
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) return null;
    return new Date(year, month - 1, 1);
}

/** Parse DD/MM/YYYY to a Date. */
function parseDDMMYYYY(s) {
    if (!s || typeof s !== 'string') return null;
    var parts = s.trim().split('/');
    if (parts.length !== 3) return null;
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (month < 1 || month > 12) return null;
    var d = new Date(year, month - 1, day);
    if (d.getDate() !== day || d.getMonth() !== month - 1 || d.getFullYear() !== year) return null;
    return d;
}

/** Get task name from a dependency (string or { task: "..." }). */
function getDependencyTaskName(dep) {
    return typeof dep === 'string' ? dep : (dep && dep.task);
}

function validateConfig(config) {
    var errors = [];
    var warnings = [];

    if (!config) {
        errors.push('CONFIG is missing.');
        return { errors: errors, warnings: warnings };
    }

    // --- TIMELINE ---
    if (!config.TIMELINE || typeof config.TIMELINE !== 'object') {
        errors.push('CONFIG.TIMELINE must exist and be an object.');
    } else {
        if (config.TIMELINE.START_MONTH === undefined || config.TIMELINE.START_MONTH === null || config.TIMELINE.START_MONTH === '') {
            errors.push('CONFIG.TIMELINE must have START_MONTH.');
        }
        if (config.TIMELINE.END_MONTH === undefined || config.TIMELINE.END_MONTH === null || config.TIMELINE.END_MONTH === '') {
            errors.push('CONFIG.TIMELINE must have END_MONTH.');
        }
        if (config.TIMELINE.TODAY != null && config.TIMELINE.TODAY !== '' && !isDDMMYYYY(config.TIMELINE.TODAY)) {
            warnings.push('TIMELINE.TODAY must match DD/MM/YYYY format when set.');
        }
    }

    // --- WORKFLOW ---
    if (!Array.isArray(config.WORKFLOW)) {
        errors.push('CONFIG.WORKFLOW must be an array.');
    } else {
        if (config.WORKFLOW.length < 3) {
            errors.push('CONFIG.WORKFLOW must have at least 3 items.');
        }
        for (var i = 0; i < config.WORKFLOW.length; i++) {
            var item = config.WORKFLOW[i];
            var expectedType = (i % 2 === 0) ? 'state' : 'milestone';
            if (!item || item.type !== expectedType) {
                errors.push('CONFIG.WORKFLOW must alternate state/milestone: index ' + i + ' should be type "' + expectedType + '".');
            }
        }
    }

    // First milestone key (for later deliverable check)
    var firstMilestoneKey = null;
    if (Array.isArray(config.WORKFLOW)) {
        for (var j = 0; j < config.WORKFLOW.length; j++) {
            if (config.WORKFLOW[j] && config.WORKFLOW[j].type === 'milestone') {
                firstMilestoneKey = config.WORKFLOW[j].key;
                break;
            }
        }
    }

    // --- DELIVERABLES ---
    if (!Array.isArray(config.DELIVERABLES)) {
        errors.push('CONFIG.DELIVERABLES must be an array.');
    } else {
        if (config.DELIVERABLES.length === 0) {
            errors.push('CONFIG.DELIVERABLES must be a non-empty array.');
        }
        var allDeliverableNames = config.DELIVERABLES.map(function (d) { return d && d.name ? d.name.trim() : ''; }).filter(Boolean);
        var names = [];
        for (var d = 0; d < config.DELIVERABLES.length; d++) {
            var del = config.DELIVERABLES[d];
            if (!del || typeof del !== 'object') {
                errors.push('Deliverable at index ' + d + ' must be an object.');
                continue;
            }
            if (typeof del.name !== 'string' || !del.name.trim()) {
                errors.push('Each deliverable must have a non-empty "name" string (index ' + d + ').');
            } else {
                if (names.indexOf(del.name) !== -1) {
                    errors.push('Duplicate deliverable name: "' + del.name + '".');
                }
                names.push(del.name);
            }
            if (!del.milestones || typeof del.milestones !== 'object' || Array.isArray(del.milestones)) {
                errors.push('Each deliverable must have a "milestones" object (deliverable: "' + (del.name || 'index ' + d) + '").');
            } else if (firstMilestoneKey != null && del.milestones[firstMilestoneKey] === undefined) {
                errors.push('The first milestone key "' + firstMilestoneKey + '" must appear in every deliverable\'s milestones (deliverable: "' + (del.name || 'index ' + d) + '").');
            }

            // Warnings: milestone date format
            if (del.milestones && typeof del.milestones === 'object') {
                for (var mk in del.milestones) {
                    if (Object.prototype.hasOwnProperty.call(del.milestones, mk)) {
                        var val = del.milestones[mk];
                        if (val != null && val !== '' && !isDDMMYYYY(val)) {
                            warnings.push('Milestone date for "' + (del.name || '?') + '".' + mk + ' does not match DD/MM/YYYY: ' + val);
                        }
                    }
                }
            }

            // Warnings: dependencies reference unknown task
            if (Array.isArray(del.dependencies)) {
                for (var x = 0; x < del.dependencies.length; x++) {
                    var taskName = getDependencyTaskName(del.dependencies[x]);
                    if (taskName && allDeliverableNames.indexOf(taskName) === -1) {
                        warnings.push('Dependency references task "' + taskName + '" not found in DELIVERABLES (deliverable: "' + (del.name || '?') + '").');
                    }
                }
            }
        }

        // Warnings: showInTimeline deliverable with milestone dates outside range
        if (config.TIMELINE && config.TIMELINE.START_MONTH != null && config.TIMELINE.END_MONTH != null) {
            var rangeStart = parseMonthYear(config.TIMELINE.START_MONTH);
            var rangeEnd = parseMonthYear(config.TIMELINE.END_MONTH);
            if (rangeStart && rangeEnd) {
                rangeEnd = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth() + 1, 0);
                for (var idx = 0; idx < config.DELIVERABLES.length; idx++) {
                    var d2 = config.DELIVERABLES[idx];
                    if (!d2.showInTimeline || !d2.milestones) continue;
                    for (var mkey in d2.milestones) {
                        if (!Object.prototype.hasOwnProperty.call(d2.milestones, mkey)) continue;
                        var dateStr = d2.milestones[mkey];
                        if (dateStr == null || dateStr === '') continue;
                        var md = parseDDMMYYYY(dateStr);
                        if (!md) continue;
                        if (md < rangeStart || md > rangeEnd) {
                            warnings.push('Deliverable "' + (d2.name || '?') + '" (showInTimeline: true) has milestone "' + mkey + '" date ' + dateStr + ' outside TIMELINE range ' + config.TIMELINE.START_MONTH + ' to ' + config.TIMELINE.END_MONTH + '.');
                            break;
                        }
                    }
                }
            }
        }
    }

    return { errors: errors, warnings: warnings };
}

if (typeof window !== 'undefined') {
    window.validateConfig = validateConfig;
}

export {
    isDDMMYYYY, parseMonthYear, parseDDMMYYYY, getDependencyTaskName, validateConfig
};
