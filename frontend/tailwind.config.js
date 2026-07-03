/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0a0e1a',
        panel: '#111726',
        panelSoft: '#161d2e',
        edge: '#233048',
        accent: '#38bdf8',
        good: '#34d399',
        warn: '#fbbf24',
        crit: '#f87171',
      },
      boxShadow: {
        glow: '0 0 20px rgba(56, 189, 248, 0.35)',
        lightGlow: '0 0 24px 6px rgba(251, 191, 36, 0.55)',
      },
      keyframes: {
        spin: { to: { transform: 'rotate(360deg)' } },
      },
    },
  },
  plugins: [],
};
