/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#030014',
          900: '#080521',
        },
        neon: {
          purple: '#a855f7',
          cyan: '#06b6d4',
          pink: '#ec4899',
        },
      },
      boxShadow: {
        'glow-purple': '0 0 24px rgba(168, 85, 247, 0.28)',
        'glow-cyan': '0 0 24px rgba(6, 182, 212, 0.24)',
        glass: 'inset 0 1px 0 rgba(255, 255, 255, 0.025), 0 16px 60px rgba(0, 0, 0, 0.16)',
      },
      backdropBlur: {
        16: '16px',
      },
    },
  },
  plugins: [],
}
