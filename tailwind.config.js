/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B3C78',
          dark: '#0F2550',
          container: '#C8D8F5',
          on: '#001945',
        },
        accent: {
          DEFAULT: '#3DB540',
          dark: '#1E7A21',
          container: '#C2F0C4',
          on: '#002204',
        },
        danger: {
          DEFAULT: '#D32F2F',
          bg: '#FFEBEE',
        },
      },
    },
  },
  plugins: [],
}
