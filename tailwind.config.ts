import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#08529C',
        secondary: '#F1F2F5',
        success: '#00A63D',
        warning: '#FE9900',
        danger: '#FF2157',
        info: '#0EA5E9',
        surface: '#E7E5E4',
        'surface-light': '#F0EFEE',
        'surface-dark': '#CECDCC',
        'text-base': '#1E2938',
        lms: {
          green: '#00A63D',
          'green-dark': '#008B32',
          border: '#CECDCC',
          muted: '#64748B',
          heading: '#1E2938',
          student: {
            bg: '#E8EDF2',
            surface: '#EEF2F7',
            inset: '#DDE3EB',
            accent: '#3B82F6',
            accentDk: '#1D4ED8',
            accentLt: '#DBEAFE',
            text: '#1E293B',
            muted: '#64748B',
            shadow: {
              light: '#FFFFFF',
              dark: '#C8D0D8',
            },
          },
        },
      },
      fontFamily: {
        sans: ['"Space Mono"', 'monospace'],
        display: ['"Space Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        neu: '6px 6px 14px #CECDCC, -6px -6px 14px #FFFFFF',
        'neu-sm': '4px 4px 8px #CECDCC, -4px -4px 8px #FFFFFF',
        'neu-lg': '10px 10px 20px #CECDCC, -10px -10px 20px #FFFFFF',
        'neu-inset': 'inset 4px 4px 10px #CECDCC, inset -4px -4px 10px #FFFFFF',
        'neu-inset-sm': 'inset 2px 2px 6px #CECDCC, inset -2px -2px 6px #FFFFFF',
        'neu-raised': '6px 6px 12px #C8D0D8, -6px -6px 12px #FFFFFF',
        'neu-inset': 'inset 4px 4px 8px #C8D0D8, inset -4px -4px 8px #FFFFFF',
        'neu-sm': '3px 3px 6px #C8D0D8, -3px -3px 6px #FFFFFF',
        'neu-flat': '2px 2px 5px #C8D0D8, -2px -2px 5px #FFFFFF',
        'neu-pressed': 'inset 2px 2px 5px #C8D0D8, inset -2px -2px 5px #FFFFFF',
      },
      borderRadius: {
        neu: '16px',
        'neu-sm': '10px',
        'neu-lg': '24px',
      },
    },
  },
  plugins: [],
}

export default config