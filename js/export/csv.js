/**
 * RoadmapSnap — CSV export
 * Extracted from index.html: exportToCSV, downloadFile.
 * Depends on getMilestones, getCurrentStatus, getStateByKey, getNextMilestone, getMilestoneDate, CONFIG (window).
 */

function exportToCSV() {
    const milestones = getMilestones();
    const headers = ['Name', 'Group', 'Current State', 'Next Milestone', 'At Risk', 'Tags', 'Link'];
    milestones.forEach(m => headers.push(`${m.key} Date`));

    const rows = [headers.join(',')];

    CONFIG.DELIVERABLES.forEach(source => {
        const status = getCurrentStatus(source);
        const currentState = getStateByKey(status);
        const nextMilestone = getNextMilestone(source);
        const row = [
            `"${(source.name || '').replace(/"/g, '""')}"`,
            `"${source.group || ''}"`,
            currentState ? `${currentState.short} - ${currentState.title}` : status,
            nextMilestone ? nextMilestone.short : 'Complete',
            source.atRisk ? 'Yes' : 'No',
            `"${(source.tags || []).join('; ')}"`,
            `"${source.link || ''}"`
        ];
        milestones.forEach(m => {
            row.push(getMilestoneDate(source, m.key) || '');
        });
        rows.push(row.join(','));
    });

    const csvContent = rows.join('\n');
    downloadFile(csvContent, 'deliverables.csv', 'text/csv');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// Export on window for global access
window.exportToCSV = exportToCSV;
window.downloadFile = downloadFile;
