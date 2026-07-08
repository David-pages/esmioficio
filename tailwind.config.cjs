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
        primary: '#04D9A5',
        'primary-hover': '#00C496',
        'aurora-violet': '#7B4FD4',
        'aurora-rose': '#E04B8A',
        'aurora-gold': '#F0A832',
        background: '#070C1A',
        surface: '#0D1830',
        'surface-light': '#152240',
        border: '#1E3356',
      },
      animation: {
        'aurora-drift': 'aurora-drift 22s ease-in-out infinite alternate',
        'aurora-drift-2': 'aurora-drift-2 28s ease-in-out infinite alternate',
        'aurora-pulse': 'aurora-pulse 4s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out both',
      },
      keyframes: {
        'aurora-drift': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(70px, -50px) scale(1.18)' },
        },
        'aurora-drift-2': {
          '0%': { transform: 'translate(0, 0) scale(1.05)' },
          '100%': { transform: 'translate(-55px, 65px) scale(0.90)' },
        },
        'aurora-pulse': {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.80' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    }
  },
  safelist: [
    {
      pattern: /text-(blue|green|yellow|red|purple|pink|cyan|orange|indigo|emerald|lime|teal|amber|slate|gray)-(100|200|300|400|500|600)/,
    }
  ],
  plugins: []
};
