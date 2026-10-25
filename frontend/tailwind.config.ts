import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './features/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: 'rgba(255, 255, 255, 0.75)',
        surface2: 'rgba(241, 245, 249, 0.90)',
        surface3: 'rgba(226, 232, 240, 0.80)',
        border: 'rgba(226, 232, 240, 0.90)',
        accent: '#FF6B00',
        accentLight: '#FF8833',
        accentSoft: '#FFA055',
        accentGlow: 'rgba(255, 107, 0, 0.25)',
        muted: '#64748B',
        obsidian: '#0F172A',
      },
      boxShadow: {
        card: '0 20px 60px rgba(0, 0, 0, 0.65)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        orangeGlow: '0 0 40px -5px rgba(255, 107, 0, 0.5)',
        orangeGlowLg: '0 0 70px -10px rgba(255, 107, 0, 0.65)',
        orangeBtn: '0 10px 25px -4px rgba(255, 107, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
      },
      animation: {
        'float-slow': 'float 7s ease-in-out infinite',
        'float-medium': 'float 5s ease-in-out infinite',
        'float-fast': 'float 3.5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.06)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
