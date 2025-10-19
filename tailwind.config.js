/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/frontend/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg-start': '#2F161A',
        'dark-bg-end': '#1C0E10',
        'card-bg': '#f5f0e8',
        'dark-text': '#3d2618',
        'light-text': '#8b6f47',
        'header-text': '#f5f0e8',
        'sub-text': '#a08967',
        'gold': '#d4af37',
        'wine-red': '#6b2c2c',
        'wine-red-hover': '#8b3a3a',
        'dark-brown': '#3d2618',
        'dark-brown-hover': '#4a3225',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      borderRadius: {
        DEFAULT: '8px',
        'lg': '12px',
      },
      maxWidth: {
        'container': '1080px',
      },
    },
  },
  plugins: [],
}
