import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: '#0B0B0D',       // noir profond
        chalk: '#F5F4F0',       // blanc cassé (craie d'ardoise)
        sang: '#8E1B22',        // rouge foncé — couleur signature
        'sang-vif': '#C2272F',  // rouge accent (live, alertes)
        ardoise: '#17171B',     // surfaces de cartes
        ligne: '#2A2A30',       // bordures
      },
      fontFamily: {
        display: ['"Archivo Black"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
