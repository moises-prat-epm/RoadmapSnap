/**
 * RoadmapSnap — JSON export
 * Extracted from index.html: exportToJSON.
 * Depends on window.downloadFile, getWorkflow, getStates, getMilestones, getStateByKey, getCurrentStatus, getNextMilestone, CONFIG.
 */
import { getWorkflow, getStates, getMilestones, getStateByKey, getCurrentStatus, getNextMilestone } from '../core/workflow.js';

function exportToJSON() {
    const exportData = {
        exportDate: new Date().toISOString(),
        timeline: CONFIG.TIMELINE,
        workflow: getWorkflow(),
        states: getStates(),
        milestones: getMilestones(),
        deliverables: CONFIG.DELIVERABLES.map(source => {
            const currentState = getStateByKey(getCurrentStatus(source));
            const nextMilestone = getNextMilestone(source);
            return {
                ...source,
                currentState: currentState ? { key: currentState.key, title: currentState.title } : null,
                nextMilestone: nextMilestone ? { key: nextMilestone.key, title: nextMilestone.title } : null
            };
        })
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    window.downloadFile(jsonContent, 'deliverables.json', 'application/json');
}

// Export on window for global access
window.exportToJSON = exportToJSON;
