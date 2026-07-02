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
        primary: '#e6b319',
        'primary-hover': '#d4a415',
        background: '#121212',
        surface: '#1E1E1E',
        'surface-light': '#2C2C2C',
        border: '#333333',
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
