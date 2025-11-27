/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Tradeo Brand Colors
        primary: {
          DEFAULT: '#00C853',
          dark: '#00A043',
          light: '#B9F6CA',
        },
        // Background Colors
        background: {
          DEFAULT: '#FFFFFF',
          gray: '#F5F5F5',
        },
        // Text Colors
        text: {
          primary: '#212121',
          secondary: '#757575',
        },
        // Accent Colors
        accent: {
          red: '#EF5350',
          blue: '#42A5F5',
          yellow: '#FFCA28',
          orange: '#FF7043',
        },
        // UI Colors
        divider: '#E0E0E0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'h1-mobile': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['36px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2-mobile': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'h3-mobile': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-mobile': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
      },
      boxShadow: {
        'card': '0px 2px 8px rgba(0, 0, 0, 0.08)',
        'button': '0px 4px 12px rgba(0, 200, 83, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}


