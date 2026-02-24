/**
 * RoadmapSnap — PNG export (html2canvas)
 * Extracted from index.html: exportToPNG.
 * Depends on global html2canvas, getTodayDate (window).
 */
import { getTodayDate } from '../core/timeline.js';

function exportToPNG(elementId, fileNamePrefix) {
    const element = document.getElementById(elementId);
    const buttons = document.querySelectorAll('.export-btn');

    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });

    html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        const today = getTodayDate().replace(/\//g, '-');
        link.download = `${fileNamePrefix}-${today}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        buttons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });

    }).catch(err => {
        console.error('Export failed:', err);
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    });
}

// Export on window for global access
window.exportToPNG = exportToPNG;
