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