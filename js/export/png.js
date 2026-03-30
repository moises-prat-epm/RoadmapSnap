/**
 * RoadmapSnap — PNG export (html2canvas)
 * Extracted from index.html: exportToPNG.
 * Depends on global html2canvas, getTodayDate (window).
 */
import { getTodayDate } from '../core/timeline.js';

function exportToPNG(elementId, fileNamePrefix) {
    const element = document.getElementById(elementId);
    const h2c = typeof globalThis.html2canvas === 'function' ? globalThis.html2canvas : null;
    const buttons = document.querySelectorAll('.export-btn');

    if (!element) {
        console.error('Export failed: element not found:', elementId);
        return;
    }
    if (!h2c) {
        console.error('Export failed: html2canvas is not loaded (check index.html script tag).');
        return;
    }

    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });

    h2c(element, {
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
