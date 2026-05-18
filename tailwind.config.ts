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
          900: '#161614',
          800: '#1f1f1c',
          700: '#272724',
          600: '#2e2e2a',
        },
        gold: {
          DEFAULT: '#7eb89a',
          light: '#a2ccb5',
          dark: '#5a9478',
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
        'radial-dark': 'radial-gradient(ellipse at 50% 0%, #1e2420 0%, #1a1f1c 50%, #161614 100%)',
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
