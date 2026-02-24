/**
 * Safe HTML rendering: escapeHtml, html`` tagged template, raw(), renderIf.
 */

function escapeHtml(value) {
    if (value == null) return '';
    const s = String(value);
    return s
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function html(strings, ...values) {
    const parts = [];
    for (let i = 0; i < strings.length; i++) {
        parts.push(strings[i]);
        if (i < values.length) {
            const v = values[i];
            if (Array.isArray(v)) {
                parts.push(v.join(''));
            } else if (v && typeof v === 'object' && v.__raw === true) {
                parts.push(v.value);
            } else {
                parts.push(escapeHtml(v));
            }
        }
    }
    return parts.join('');
}

function raw(str) {
    return { __raw: true, value: str == null ? '' : String(str) };
}

function renderIf(condition, content) {
    return condition ? content : '';
}

window.escapeHtml = escapeHtml;
window.html = html;
window.raw = raw;
window.renderIf = renderIf;

export { escapeHtml, html, raw, renderIf };
