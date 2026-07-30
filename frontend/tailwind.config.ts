import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './features/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050512',
        surface: '#0f1220',
        surface2: '#171a2b',
        border: '#21243f',
        accent: '#7c76ff',
        accentSoft: '#4f49f3',
        muted: '#8d95b9'
      },
      boxShadow: {
        card: '0 20px 60px rgba(5, 7, 23, 0.45)'
      }
    }
  },
  plugins: []
};

export default config;
