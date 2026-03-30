/**
 * @roadmapsnap/tokens — design tokens extracted from css/roadmap.css.
 * Single source of truth for colors, layout, and typography.
 */

/** Light (default) theme colors — from css/roadmap.css :root */
export const colors = {
  start: '#6554c0',
  m0: 'var(--color-state-2)', /* resolved in CSS */
  m1: '#ffab00',
  m2: '#36b37e',
  m3: '#0f766e',
  m4: '#0d9488',
  m5: '#7c3aed',
  state0: '#c1c7d0',
  state1: '#6554c0',
  state2: '#0891b2',
  state3: '#ffab00',
  state4: '#36b37e',
  state5: '#0065ff',
  state6: '#0d9488',
  state7: '#004cbf',
  dependencyInbound: '#3498db',
  dependencyOutbound: '#e67e22',
  risk: '#de350b',
  border: '#dfe1e6',
  bgWhite: '#ffffff',
  bgPage: '#f4f5f7',
  bgSecondary: '#fafbfc',
  textDark: '#172b4d',
  textLight: '#6b778c',
  today: '#de350b',
}

/** Dark theme overrides (for .dark and [data-theme="dark"]) */
export const darkColors = {
  border: '#3d4f5f',
  bgWhite: '#1a2332',
  bgPage: '#0d1117',
  bgSecondary: '#161b22',
  textDark: '#e6edf3',
  textLight: '#8b949e',
  start: '#a78bfa',
  m0: 'var(--color-state-2)',
  m1: '#fbbf24',
  m2: '#34d399',
  m3: '#10b981',
  m4: '#2dd4bf',
  m5: '#a78bfa',
  state0: '#475569',
  state1: '#818cf8',
  state2: '#22d3ee',
  state3: '#fbbf24',
  state4: '#34d399',
  state5: '#60a5fa',
  state6: '#2dd4bf',
  state7: '#3b82f6',
  dependencyInbound: '#38bdf8',
  dependencyOutbound: '#fb923c',
  risk: '#f87171',
  today: '#f87171',
}

/** Layout tokens from roadmap.css */
export const layout = {
  rowHeight: '36px',
  maxWidth: '1400px',
  paddingPage: '20px',
  borderRadiusSm: '4px',
  borderRadiusMd: '6px',
  borderRadiusLg: '8px',
  borderRadiusXl: '12px',
  gapXs: '4px',
  gapSm: '6px',
  gapMd: '8px',
  gapLg: '12px',
  gapXl: '16px',
}

/** Typography tokens from roadmap.css */
export const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen, Ubuntu, sans-serif',
  lineHeight: '1.4',
  fontSize7: '7px',
  fontSize8: '8px',
  fontSize9: '9px',
  fontSize10: '10px',
  fontSize11: '11px',
  fontSize12: '12px',
  fontSize13: '13px',
  fontSize14: '14px',
  fontSize18: '18px',
  fontSize28: '28px',
  fontWeight400: '400',
  fontWeight500: '500',
  fontWeight600: '600',
  fontWeight700: '700',
}

/** All CSS custom property names (--color-*) for :root */
export const colorVarNames = [
  'color-start', 'color-m0', 'color-m1', 'color-m2', 'color-m3', 'color-m4', 'color-m5',
  'color-state-0', 'color-state-1', 'color-state-2', 'color-state-3', 'color-state-4',
  'color-state-5', 'color-state-6', 'color-state-7',
  'color-dependency-inbound', 'color-dependency-outbound',
  'color-risk', 'color-border', 'color-bg-white', 'color-bg-page', 'color-bg-secondary',
  'color-text-dark', 'color-text-light', 'color-today',
]

export default { colors, darkColors, layout, typography }
