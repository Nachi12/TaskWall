/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: '#0B1020',
          surface: 'rgba(20, 26, 45, 0.72)',
          'surface-hover': 'rgba(29, 38, 64, 0.85)',
          'surface-active': 'rgba(38, 49, 82, 0.95)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-focus': 'rgba(167, 139, 250, 0.4)',
          accent: '#A78BFA',
          'accent-glow': 'rgba(167, 139, 250, 0.25)',
          secondary: '#60A5FA',
          success: '#34D399',
          warning: '#FBBF24',
          danger: '#F87171',
          text: '#F8FAFC',
          muted: '#94A3B8',
          subtle: '#64748B'
        }
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        deep: '24px'
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-glow': '0 0 25px rgba(167, 139, 250, 0.2)',
        'card-hover': '0 12px 40px -10px rgba(0, 0, 0, 0.5)'
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
