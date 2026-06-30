/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      },
      colors: {
        primary: {
          DEFAULT: '#6C63FF',
          50:  '#F0EFFE',
          100: '#E2DFFD',
          200: '#C5BFFB',
          300: '#A89FF9',
          400: '#8B7FF7',
          500: '#6C63FF',
          600: '#4D42F5',
          700: '#3328E0',
          800: '#2720B8',
          900: '#1E1990'
        },
        accent: {
          DEFAULT: '#00D4AA',
          50:  '#E6FBF7',
          100: '#CCF7EF',
          200: '#99EFDF',
          300: '#66E7CF',
          400: '#33DFBF',
          500: '#00D4AA',
          600: '#00AA88',
          700: '#008066',
          800: '#005544',
          900: '#002B22'
        },
        surface: {
          DEFAULT: '#1A1A2E',
          50:  '#F2F2F8',
          100: '#E5E5F1',
          200: '#BBBBD8',
          300: '#9191BF',
          400: '#5555A0',
          500: '#1A1A2E',
          600: '#161627',
          700: '#111120',
          800: '#0D0D19',
          900: '#080812'
        },
        base: {
          DEFAULT: '#0A0A0F',
          50:  '#F0F0F2',
          100: '#E0E0E5',
          200: '#B3B3C0',
          300: '#86869B',
          400: '#4D4D61',
          500: '#0A0A0F',
          600: '#08080C',
          700: '#060609',
          800: '#040406',
          900: '#020203'
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6C63FF 0%, #00D4AA 100%)',
        'gradient-surface': 'linear-gradient(180deg, #1A1A2E 0%, #0A0A0F 100%)'
      },
      boxShadow: {
        'primary-glow': '0 0 20px rgba(108, 99, 255, 0.35)',
        'accent-glow':  '0 0 20px rgba(0, 212, 170, 0.35)'
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-in-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'pulse-soft':'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' },                        '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' },                  '50%':  { opacity: '0.6' } }
      }
    }
  },
  plugins: []
}