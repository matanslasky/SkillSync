/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#050505',
          light: '#0a0a0a',
          lighter: '#151515',
        },
        neon: {
          green: '#00ff9d',
          blue: '#00b8ff',
          pink: '#ff4757',
          purple: '#9333ea',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(0, 255, 157, 0.3)',
        'neon-blue': '0 0 20px rgba(0, 184, 255, 0.3)',
        'neon-pink': '0 0 20px rgba(255, 71, 87, 0.3)',
      }
    },
  },
  plugins: [],
}
