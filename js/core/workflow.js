/**
 * RoadmapSnap — workflow logic
 * Extracted from index.html: workflow, states, milestones, status, non-filterable groups.
 * Depends on global CONFIG; getNextMilestone and getCurrentStatus use parseDate, getTodayDate (window).
 * In Node (tests), window/CONFIG/parseDate/getTodayDate may be missing; pass workflow and todayStr where supported.
 */

function parseDateFallback(dateStr) {
    if (!dateStr) return null;
    const [day, month, year] = String(dateStr).split('/').map(Number);
    return new Date(year, month - 1, day);
}

function getParseDate() {
    if (typeof window !== 'undefined' && window.parseDate) return window.parseDate;
    return parseDateFallback;
}

function getTodayDateFallback() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return day + '/' + month + '/' + year;
}

function getWorkflow() {
    if (CONFIG.WORKFLOW && Array.isArray(CONFIG.WORKFLOW)) {
        return CONFIG.WORKFLOW;
    }
    const legacyMilestones = CONFIG.MILESTONES || [
        { key: 'M0', short: 'M0', title: 'Dev Complete', subtitle: '' },
        { key: 'M1', short: 'M1', title: 'Deployed', subtitle: '' },
        { key: 'M2', short: 'M2', title: 'Ready', subtitle: '' },
        { key: 'M3', short: 'M3', title: 'Complete', subtitle: '' }
    ];
    const workflow = [
        { type: 'state', key: 'NS', short: 'NS', title: 'Not Started', description: 'Pending kickoff' },
        { type: 'milestone', key: 'START', short: 'START', title: 'Start', subtitle: 'Kickoff' },
        { type: 'state', key: 'DEV', short: 'DEV', title: 'In Development', description: 'Active development' }
    ];
    legacyMilestones.forEach((m, index) => {
        workflow.push({ type: 'milestone', key: m.key, short: m.short, title: m.title, subtitle: m.subtitle });
        if (index < legacyMilestones.length - 1) {
            workflow.push({ type: 'state', key: `S${index + 1}`, short: `S${index + 1}`, title: `Phase ${index + 2}`, description: '' });
        } else {
            workflow.push({ type: 'state', key: 'DONE', short: 'DONE', title: 'Done', description: 'Complete' });
        }
    });
    return workflow;
}

function getStates() {
    const workflow = getWorkflow();
    return workflow.filter(item => item.type === 'state');
}

function getMilestones() {
    const workflow = getWorkflow();
    return workflow.filter(item => item.type === 'milestone');
}

function getStateByKey(key) {
    const states = getStates();
    return states.find(s => s.key === key) || null;
}

function getMilestoneByKey(key) {
    const milestones = getMilestones();
    return milestones.find(m => m.key === key) || null;
}

function getStateAfterMilestone(milestoneKey, workflowOverride) {
    const workflow = workflowOverride || getWorkflow();
    const milestoneIndex = workflow.findIndex(item => item.type === 'milestone' && item.key === milestoneKey);
    if (milestoneIndex === -1) return null;
    for (let i = milestoneIndex + 1; i < workflow.length; i++) {
        if (workflow[i].type === 'state') {
            return workflow[i];
        }
    }
    return null;
}

function getFirstState(workflowOverride) {
    const states = workflowOverride
        ? workflowOverride.filter(item => item.type === 'state')
        : getStates();
    return states[0] || { key: 'NS', short: 'NS', title: 'Not Started', description: '' };
}

function getLastState(workflowOverride) {
    const states = workflowOverride
        ? workflowOverride.filter(item => item.type === 'state')
        : getStates();
    return states[states.length - 1] || { key: 'DONE', short: 'DONE', title: 'Done', description: '' };
}

function getNonFilterableGroups() {
    return CONFIG.NON_FILTERABLE_GROUPS || [];
}

function isGroupNonFilterable(groupName) {
    const nonFilterableGroups = getNonFilterableGroups();
    return nonFilterableGroups.includes(groupName);
}

function isDeliverableNonFilterable(source) {
    return source.group && isGroupNonFilterable(source.group);
}

function getFilterableDeliverables() {
    return CONFIG.DELIVERABLES.filter(source => !isDeliverableNonFilterable(source));
}

function getFirstMilestoneKey() {
    const milestones = getMilestones();
    return milestones[0]?.key || 'START';
}

function getLastMilestoneKey() {
    const milestones = getMilestones();
    return milestones[milestones.length - 1]?.key || 'M4';
}

function getMilestoneDate(source, milestoneKey) {
    if (source.milestones && source.milestones[milestoneKey]) {
        return source.milestones[milestoneKey];
    }
    if (milestoneKey === 'START' && source.startDate) {
        return source.startDate;
    }
    return null;
}

function getNextMilestone(source, workflowOverride, todayStr) {
    const parseDateFn = getParseDate();
    const today = parseDateFn(todayStr || (typeof window !== 'undefined' && window.getTodayDate ? window.getTodayDate() : getTodayDateFallback()));
    const milestones = workflowOverride
        ? workflowOverride.filter(i => i.type === 'milestone')
        : getMilestones();
    for (const milestone of milestones) {
        const milestoneDate = parseDateFn(getMilestoneDate(source, milestone.key));
        if (milestoneDate && today < milestoneDate) {
            return milestone;
        }
    }
    return null;
}

function getCurrentStatus(source, workflowOverride, todayStr) {
    const parseDateFn = getParseDate();
    const today = parseDateFn(todayStr || (typeof window !== 'undefined' && window.getTodayDate ? window.getTodayDate() : getTodayDateFallback()));
    const milestones = workflowOverride
        ? workflowOverride.filter(i => i.type === 'milestone')
        : getMilestones();
    for (let i = milestones.length - 1; i >= 0; i--) {
        const milestone = milestones[i];
        const milestoneDate = parseDateFn(getMilestoneDate(source, milestone.key));
        if (milestoneDate && today >= milestoneDate) {
            const nextState = getStateAfterMilestone(milestone.key, workflowOverride);
            return nextState ? nextState.key : getLastState(workflowOverride).key;
        }
    }
    return getFirstState(workflowOverride).key;
}

// Export on window for global access (browser only)
if (typeof window !== 'undefined') {
    window.getWorkflow = getWorkflow;
    window.getStates = getStates;
    window.getMilestones = getMilestones;
    window.getStateByKey = getStateByKey;
    window.getMilestoneByKey = getMilestoneByKey;
    window.getStateAfterMilestone = getStateAfterMilestone;
    window.getFirstState = getFirstState;
    window.getLastState = getLastState;
    window.getFirstMilestoneKey = getFirstMilestoneKey;
    window.getLastMilestoneKey = getLastMilestoneKey;
    window.getCurrentStatus = getCurrentStatus;
    window.getNextMilestone = getNextMilestone;
    window.getMilestoneDate = getMilestoneDate;
    window.getNonFilterableGroups = getNonFilterableGroups;
    window.isGroupNonFilterable = isGroupNonFilterable;
    window.isDeliverableNonFilterable = isDeliverableNonFilterable;
    window.getFilterableDeliverables = getFilterableDeliverables;
}

export {
    getWorkflow, getStates, getMilestones, getStateByKey,
    getStateAfterMilestone, getFirstState, getLastState,
    getFirstMilestoneKey, getLastMilestoneKey,
    getCurrentStatus, getNextMilestone, getMilestoneDate,
    getNonFilterableGroups, isGroupNonFilterable, isDeliverableNonFilterable, getFilterableDeliverables
};
