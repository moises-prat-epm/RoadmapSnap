/**
 * RoadmapSnap — workflow logic
 * Extracted from index.html: workflow, states, milestones, status, non-filterable groups.
 * Depends on global CONFIG; getNextMilestone and getCurrentStatus use parseDate, getTodayDate (window).
 */

function getWorkflow() {
    if (CONFIG.WORKFLOW && Array.isArray(CONFIG.WORKFLOW)) {
        return CONFIG.WORKFLOW;
    }
    const legacyMilestones = CONFIG.MILESTONES || [
        { key: 'M0', short: 'M0', title: 'Dev Complete', subtitle: '', color: '#8993a4' },
        { key: 'M1', short: 'M1', title: 'Deployed', subtitle: '', color: '#ffab00' },
        { key: 'M2', short: 'M2', title: 'Ready', subtitle: '', color: '#36b37e' },
        { key: 'M3', short: 'M3', title: 'Complete', subtitle: '', color: '#0065ff' }
    ];
    const workflow = [
        { type: 'state', key: 'NS', short: 'NS', title: 'Not Started', description: 'Pending kickoff' },
        { type: 'milestone', key: 'START', short: 'START', title: 'Start', subtitle: 'Kickoff', color: '#6554c0' },
        { type: 'state', key: 'DEV', short: 'DEV', title: 'In Development', description: 'Active development' }
    ];
    legacyMilestones.forEach((m, index) => {
        workflow.push({ type: 'milestone', key: m.key, short: m.short, title: m.title, subtitle: m.subtitle, color: m.color });
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

function getStateAfterMilestone(milestoneKey) {
    const workflow = getWorkflow();
    const milestoneIndex = workflow.findIndex(item => item.type === 'milestone' && item.key === milestoneKey);
    if (milestoneIndex === -1) return null;
    for (let i = milestoneIndex + 1; i < workflow.length; i++) {
        if (workflow[i].type === 'state') {
            return workflow[i];
        }
    }
    return null;
}

function getFirstState() {
    const states = getStates();
    return states[0] || { key: 'NS', short: 'NS', title: 'Not Started', description: '' };
}

function getLastState() {
    const states = getStates();
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

function getNextMilestone(source) {
    const today = parseDate(getTodayDate());
    const milestones = getMilestones();
    for (const milestone of milestones) {
        const milestoneDate = parseDate(getMilestoneDate(source, milestone.key));
        if (milestoneDate && today < milestoneDate) {
            return milestone;
        }
    }
    return null;
}

function getCurrentStatus(source) {
    const today = parseDate(getTodayDate());
    const milestones = getMilestones();
    for (let i = milestones.length - 1; i >= 0; i--) {
        const milestone = milestones[i];
        const milestoneDate = parseDate(getMilestoneDate(source, milestone.key));
        if (milestoneDate && today >= milestoneDate) {
            const nextState = getStateAfterMilestone(milestone.key);
            return nextState ? nextState.key : getLastState().key;
        }
    }
    return getFirstState().key;
}

// Export on window for global access
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
