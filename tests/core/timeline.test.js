import { test } from 'node:test';
import assert from 'node:assert/strict';

// timeline.js assigns to window; ensure it exists so the module loads in Node
globalThis.window = globalThis.window || {};
const {
  parseDate,
  formatDateDisplay,
  formatShortDate,
  darkenColor,
  getTodayDate,
  parseMonthYear,
  getMonthName,
  generateMonths,
  calculatePosition,
  isDateInRange,
} = await import('../../js/core/timeline.js');

// --- parseDate ---
test('parseDate: valid DD/MM/YYYY returns correct Date object', () => {
  const d = parseDate('15/03/2026');
  assert.ok(d instanceof Date);
  assert.equal(d.getDate(), 15);
  assert.equal(d.getMonth(), 2); // March = 2 (0-indexed)
  assert.equal(d.getFullYear(), 2026);
});

test('parseDate: empty string returns null', () => {
  assert.equal(parseDate(''), null);
});

test('parseDate: null returns null', () => {
  assert.equal(parseDate(null), null);
});

test('parseDate: undefined returns null', () => {
  assert.equal(parseDate(undefined), null);
});

// --- formatDateDisplay ---
test('formatDateDisplay: "15/03/2026" returns "15 Mar"', () => {
  assert.equal(formatDateDisplay('15/03/2026'), '15 Mar');
});

test('formatDateDisplay: "01/01/2026" returns "1 Jan"', () => {
  assert.equal(formatDateDisplay('01/01/2026'), '1 Jan');
});

test('formatDateDisplay: empty string returns ""', () => {
  assert.equal(formatDateDisplay(''), '');
});

// --- formatShortDate ---
test('formatShortDate: "15/03/2026" returns "15 Mar 2026"', () => {
  assert.equal(formatShortDate('15/03/2026'), '15 Mar 2026');
});

test('formatShortDate: empty string returns ""', () => {
  assert.equal(formatShortDate(''), '');
});

// --- getTodayDate ---
test('getTodayDate: when CONFIG is not defined returns string matching DD/MM/YYYY', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = undefined;
  try {
    const result = getTodayDate();
    assert.equal(typeof result, 'string');
    assert.ok(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(result), `expected DD/MM/YYYY, got ${result}`);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('getTodayDate: when CONFIG.TIMELINE.TODAY is set returns that value', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { TODAY: '19/02/2026' } };
  try {
    assert.equal(getTodayDate(), '19/02/2026');
  } finally {
    globalThis.CONFIG = prev;
  }
});

// --- generateMonths (requires CONFIG.TIMELINE) ---
test('generateMonths: given START_MONTH "01/2026" and END_MONTH "03/2026" returns array of 3 months', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { START_MONTH: '01/2026', END_MONTH: '03/2026' } };
  try {
    const months = generateMonths();
    assert.equal(months.length, 3);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('generateMonths: each month has date (Date), name (string), daysInMonth (number)', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { START_MONTH: '01/2026', END_MONTH: '03/2026' } };
  try {
    const months = generateMonths();
    months.forEach((m, i) => {
      assert.ok(m.date instanceof Date, `month ${i} .date is Date`);
      assert.equal(typeof m.name, 'string', `month ${i} .name is string`);
      assert.equal(typeof m.daysInMonth, 'number', `month ${i} .daysInMonth is number`);
    });
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('generateMonths: month names are correct (Jan 2026, Feb 2026, Mar 2026)', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { START_MONTH: '01/2026', END_MONTH: '03/2026' } };
  try {
    const months = generateMonths();
    assert.equal(months[0].name, 'Jan 2026');
    assert.equal(months[1].name, 'Feb 2026');
    assert.equal(months[2].name, 'Mar 2026');
  } finally {
    globalThis.CONFIG = prev;
  }
});

// --- calculatePosition (uses months from generateMonths) ---
test('calculatePosition: date exactly at start of timeline returns 0 or very close', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { START_MONTH: '01/2026', END_MONTH: '03/2026' } };
  try {
    const months = generateMonths();
    const pos = calculatePosition('01/01/2026', months);
    assert.equal(typeof pos, 'number');
    assert.ok(pos >= 0 && pos < 1, `expected ~0, got ${pos}`);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('calculatePosition: date at last day of timeline returns high value (timeline end is start of next month)', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { START_MONTH: '01/2026', END_MONTH: '03/2026' } };
  try {
    const months = generateMonths();
    // 31/03 is last day of March; timeline end in code is start of April, so position < 100
    const pos = calculatePosition('31/03/2026', months);
    assert.equal(typeof pos, 'number');
    assert.ok(pos >= 98 && pos <= 100, `expected high position, got ${pos}`);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('calculatePosition: date before timeline start returns 0 (clamped)', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { START_MONTH: '01/2026', END_MONTH: '03/2026' } };
  try {
    const months = generateMonths();
    const pos = calculatePosition('01/12/2025', months);
    assert.equal(pos, 0);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('calculatePosition: date after timeline end returns 100 (clamped)', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { START_MONTH: '01/2026', END_MONTH: '03/2026' } };
  try {
    const months = generateMonths();
    const pos = calculatePosition('15/05/2026', months);
    assert.equal(pos, 100);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('calculatePosition: null date returns null', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { START_MONTH: '01/2026', END_MONTH: '03/2026' } };
  try {
    const months = generateMonths();
    assert.equal(calculatePosition('', months), null);
    assert.equal(calculatePosition(null, months), null);
  } finally {
    globalThis.CONFIG = prev;
  }
});

// --- isDateInRange ---
test('isDateInRange: date within range returns true', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { START_MONTH: '01/2026', END_MONTH: '03/2026' } };
  try {
    const months = generateMonths();
    assert.equal(isDateInRange('15/02/2026', months), true);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('isDateInRange: date before range returns false', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { START_MONTH: '01/2026', END_MONTH: '03/2026' } };
  try {
    const months = generateMonths();
    assert.equal(isDateInRange('15/12/2025', months), false);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('isDateInRange: date after range returns false', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { START_MONTH: '01/2026', END_MONTH: '03/2026' } };
  try {
    const months = generateMonths();
    assert.equal(isDateInRange('15/05/2026', months), false);
  } finally {
    globalThis.CONFIG = prev;
  }
});

test('isDateInRange: empty string returns false', () => {
  const prev = globalThis.CONFIG;
  globalThis.CONFIG = { TIMELINE: { START_MONTH: '01/2026', END_MONTH: '03/2026' } };
  try {
    const months = generateMonths();
    assert.equal(isDateInRange('', months), false);
  } finally {
    globalThis.CONFIG = prev;
  }
});

// --- parseMonthYear (for coverage and API stability) ---
test('parseMonthYear: "01/2026" returns Date for first day of January 2026', () => {
  const d = parseMonthYear('01/2026');
  assert.ok(d instanceof Date);
  assert.equal(d.getMonth(), 0);
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getDate(), 1);
});

// --- getMonthName (for coverage) ---
test('getMonthName: Date for Jan 2026 returns "Jan 2026"', () => {
  const d = new Date(2026, 0, 15);
  assert.equal(getMonthName(d), 'Jan 2026');
});

// --- darkenColor (for coverage) ---
test('darkenColor: reduces brightness and returns hex', () => {
  const result = darkenColor('#ffffff', 0.5);
  assert.equal(typeof result, 'string');
  assert.ok(result.startsWith('#'));
  assert.notEqual(result.toLowerCase(), '#ffffff');
});

test('darkenColor: empty hex returns "#000000"', () => {
  assert.equal(darkenColor('', 0.2), '#000000');
  assert.equal(darkenColor(null, 0.2), '#000000');
});

test('darkenColor: 0% leaves color unchanged', () => {
  assert.equal(darkenColor('#ff0000', 0), '#ff0000');
});
