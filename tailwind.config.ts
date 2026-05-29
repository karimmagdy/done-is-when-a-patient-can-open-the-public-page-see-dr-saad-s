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
        primary: { DEFAULT: '#1a5c4e', light: '#2d8c76', dark: '#0f3d34' },
        accent: { DEFAULT: '#c8a96e', light: '#d4bb8a' },
      },
      fontFamily: {
        sans: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
