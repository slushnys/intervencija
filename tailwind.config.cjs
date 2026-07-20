/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './system-audits/**/*.html',
    './critical-builds/**/*.html',
    './fractional-architecture/**/*.html',
    './assets/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#fbfaf7',
        paper: '#f6f1e8',
        warm: '#efe7da',
        espresso: '#1c1917',
        line: '#ded8ce',
        brass: '#9a6b2f',
        clay: '#7c6f64'
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        paper: '0 24px 70px rgba(28, 25, 23, 0.075)',
        hard: '0 22px 58px rgba(28, 25, 23, 0.11)'
      }
    }
  },
  plugins: []
};
