/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          50:  '#FDF8EC',
          100: '#FAF0D4',
          200: '#F4DEAA',
          300: '#EDCA7E',
          400: '#E2B254',
          500: '#C9A84C',
          600: '#A8882E',
          700: '#84681C',
          800: '#5F4A10',
          900: '#3A2D06',
        },
        executive: {
          dark:     '#0F1629',
          navy:     '#1A2540',
          charcoal: '#2C2C3E',
          cream:    '#FAFAF5',
          muted:    '#6B7280',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold:   '0 0 0 1px rgba(201, 168, 76, 0.3), 0 4px 16px rgba(201, 168, 76, 0.1)',
        'gold-lg': '0 0 0 2px rgba(201, 168, 76, 0.4), 0 8px 32px rgba(0,0,0,0.12)',
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
      }
    }
  },
  plugins: []
}
