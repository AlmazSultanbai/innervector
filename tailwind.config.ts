import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#141210',
          800: '#1e1b17',
          700: '#252018',
          600: '#2e2a24',
        },
        gold: {
          DEFAULT: '#e8a045',
          light: '#f5c06a',
          dark: '#c97b38',
        },
        // Emerald brand accent — growth, progress, action
        brand: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
          muted: 'rgba(16,185,129,0.15)',
          border: 'rgba(16,185,129,0.3)',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'radial-dark': 'radial-gradient(ellipse at 50% 0%, #2a2018 0%, #1e1b17 50%, #141210 100%)',
      },
    },
  },
  plugins: [],
  safelist: [
    'delay-0', 'delay-100', 'delay-200', 'delay-300', 'delay-400',
    'delay-500', 'delay-600', 'delay-700', 'delay-800', 'delay-900',
  ],
};
export default config;
