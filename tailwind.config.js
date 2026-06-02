/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#8b5cf6', // Violet
          secondary: '#06b6d4', // Cyan
          accent: '#6366f1', // Indigo
          purple: '#a855f7',
          pink: '#ec4899',
        },
        dark: {
          bg: '#09090b',
          card: '#121214',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
