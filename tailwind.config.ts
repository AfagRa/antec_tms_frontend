import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lms: {
          navy: {
            DEFAULT: '#08529C',
            dark: '#063E75',
            light: '#E6EFF8',
            text: '#0A335C',
          },
          canvas: '#F8FAFC',
          sidebar: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
          heading: '#2D2B2E',
          badge: {
            active: { bg: '#E6EFF8', text: '#08529C' },
            done: { bg: '#FEF3C7', text: '#92400E' },
            passive: { bg: '#F1F5F9', text: '#475569' },
            draft: { bg: '#DBEAFE', text: '#1D4ED8' },
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
} satisfies Config;
