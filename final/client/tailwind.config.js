/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        rose: {
          50: '#FFF0F4',
          100: '#FFE0EA',
          200: '#FFC1D5',
          300: '#FF93B2',
          400: '#FF5585',
          500: '#FF2060',
          600: '#E8003E',
          700: '#C41E3A',
          800: '#9E1230',
          900: '#7D1028',
        },
        navy: {
          50: '#EEF2FF',
          100: '#DDE6FF',
          200: '#C4CFFF',
          300: '#9DAFFF',
          400: '#7080FF',
          500: '#4A5BFF',
          600: '#2D38F5',
          700: '#1E2B52',
          800: '#161E3D',
          900: '#0E1427',
        },
        cream: {
          50: '#FFFBF9',
          100: '#FFF6F1',
          200: '#FDEEE6',
          300: '#F9DDD0',
          400: '#F2C5AB',
        },
        sage: {
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        // Doctor dashboard palette (used only within the /doctor portal)
        brand: {
          50: '#fff1f3',
          100: '#ffe0e6',
          200: '#ffc2cd',
          300: '#ff93a8',
          400: '#f9607f',
          500: '#e0233f',
          600: '#c41e3a',
          700: '#a11731',
          800: '#86152c',
          900: '#711629',
          950: '#3f0812',
        },
        accent: {
          50: '#fff5ed',
          100: '#ffe8d4',
          200: '#ffcda8',
          300: '#ffaa70',
          400: '#ff7c38',
          500: '#fb5c12',
          600: '#ec420a',
          700: '#c4300a',
          800: '#9a2710',
          900: '#7c2210',
        },
      },
      animation: {
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scroll-left': 'scrollLeft 35s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-x': 'gradientX 6s ease infinite',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'bounce-in': 'bounceIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'spin-slow': 'spin 14s linear infinite',
        'drift': 'drift 18s ease-in-out infinite',
        // Doctor dashboard animations (namespaced with d- to avoid clashing
        // with the fade-in/scale-in timings used on the public site)
        'd-fade-in': 'dFadeIn 0.4s ease-out',
        'd-slide-in': 'dSlideIn 0.3s ease-out',
        'd-scale-in': 'dScaleIn 0.2s ease-out',
        'd-pulse-soft': 'dPulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '60%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.97)' },
        },
        dFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dSlideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        dScaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        dPulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
