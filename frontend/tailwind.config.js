/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0faf0', 100: '#d6f0d6', 200: '#a8d8a8', 300: '#6ab86a',
          400: '#3a8a3a', 500: '#1a5c1a', 600: '#0f3d0f', 700: '#001e00',
          800: '#001800', 900: '#001200', 950: '#000a00'
        },
        gold: {
          300: '#e8cc7a', 400: '#d2b45a', 500: '#b4963c', 600: '#96782a'
        }
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,30,0,0.08), 0 1px 2px rgba(0,30,0,0.05)'
      }
    }
  },
  plugins: []
};
