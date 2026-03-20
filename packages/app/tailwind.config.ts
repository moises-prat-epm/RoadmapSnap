import type { Config } from 'tailwindcss'
import { colors, layout, typography } from '@roadmapsnap/tokens'

const toKebab = (s: string) => s.replace(/([A-Z])/g, '-$1').toLowerCase()

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: Object.fromEntries(
        Object.keys(colors).map((key) => [
          toKebab(key),
          `var(--color-${toKebab(key)})`,
        ])
      ),
      maxWidth: { screen: layout.maxWidth },
      borderRadius: {
        sm: layout.borderRadiusSm,
        md: layout.borderRadiusMd,
        lg: layout.borderRadiusLg,
        xl: layout.borderRadiusXl,
      },
      spacing: {
        'row-height': layout.rowHeight,
        'page': layout.paddingPage,
        'gap-xs': layout.gapXs,
        'gap-sm': layout.gapSm,
        'gap-md': layout.gapMd,
        'gap-lg': layout.gapLg,
        'gap-xl': layout.gapXl,
      },
      fontFamily: { sans: [typography.fontFamily] },
      fontSize: {
        7: typography.fontSize7,
        8: typography.fontSize8,
        9: typography.fontSize9,
        10: typography.fontSize10,
        11: typography.fontSize11,
        12: typography.fontSize12,
        13: typography.fontSize13,
        14: typography.fontSize14,
        18: typography.fontSize18,
        28: typography.fontSize28,
      },
      fontWeight: {
        400: typography.fontWeight400,
        500: typography.fontWeight500,
        600: typography.fontWeight600,
        700: typography.fontWeight700,
      },
      lineHeight: { snug: typography.lineHeight },
    },
  },
  plugins: [],
} satisfies Config
