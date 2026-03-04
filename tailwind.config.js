/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1EAEDB',
        secondary: '#8B5CF6',
        accent: '#2563EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        dark: {
          900: '#0A0B0F',
          800: '#1A1B23',
          700: '#2A2B35',
          600: '#3A3B47',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-delay': 'fadeIn 0.6s ease-out 0.2s forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out 2s infinite',
        'gradient': 'gradient 5s ease infinite',
        'scroll': 'scroll 30s linear infinite',
        'hover-lift': 'hoverLift 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        gradient: {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        scroll: {
          'from': {
            transform: 'translateX(0)',
          },
          'to': {
            transform: 'translateX(-50%)',
          },
        },
        hoverLift: {
          'to': {
            transform: 'translateY(-16px)',
          },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(30, 174, 219, 0.3)',
        'glow-md': '0 0 20px rgba(30, 174, 219, 0.4)',
        'glow-lg': '0 0 30px rgba(30, 174, 219, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundSize: {
        '200': '200% 200%',
      },
    },
  },
  plugins: [],
}
