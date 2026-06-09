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
