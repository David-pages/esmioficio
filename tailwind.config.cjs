/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './*.{ts,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#3B82F6',
        'primary-hover': '#60A5FA',
        background: '#08111F',
        surface: '#0F1B2D',
        'surface-light': '#17263B',
        border: '#2C4162',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out both',
        'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both'
      }
    }
  },
  safelist: [
    {
      pattern: /text-(blue|green|yellow|red|purple|pink|cyan|orange|indigo|emerald|lime|teal|amber|slate|gray)-(100|200|300|400|500|600)/,
    }
  ],
  plugins: []
};
