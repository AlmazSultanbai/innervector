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
          900: '#0a0d14',
          800: '#10131e',
          700: '#1a1f35',
          600: '#232840',
        },
        gold: {
          DEFAULT: '#d4a843',
          light: '#e8c96a',
          dark: '#b8882e',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'radial-dark': 'radial-gradient(ellipse at top, #1a1f35 0%, #0a0d14 60%)',
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
