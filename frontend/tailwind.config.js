/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ANDE Brand Colors - Colores institucionales
        ande: {
          orange: {
            DEFAULT: '#FF9F1C',
            50: '#FFF8ED',
            100: '#FFEDCC',
            200: '#FFD999',
            300: '#FFC266',
            400: '#FFAB3D',
            500: '#FF9F1C', // Principal
            600: '#E68900',
            700: '#B36900',
            800: '#804C00',
            900: '#4D2E00',
          },
          blue: {
            DEFAULT: '#2455B8',
            50: '#EBF1FA',
            100: '#C7D9F0',
            200: '#8FB5E0',
            300: '#5791D1',
            400: '#3B73C2',
            500: '#2455B8', // Principal
            600: '#1D4494',
            700: '#163370',
            800: '#0F224C',
            900: '#081128',
          },
          lavender: {
            DEFAULT: '#BFA4FF',
            50: '#F8F6FF',
            100: '#EDE8FF',
            200: '#DBD1FF',
            300: '#C9BAFF',
            400: '#BFA4FF', // Principal
            500: '#A888E6',
            600: '#8C6CBF',
            700: '#705099',
            800: '#543473',
            900: '#38184D',
          },
          peach: {
            DEFAULT: '#FFC77D',
            50: '#FFF9F0',
            100: '#FFEDCC',
            200: '#FFE1AA',
            300: '#FFD488',
            400: '#FFC77D', // Principal
            500: '#E6AE61',
            600: '#BF8F4A',
            700: '#997033',
            800: '#73511C',
            900: '#4D3205',
          },
        },
        // Semantic colors
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#2563EB',
        },
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #FF9F1C 0%, #2455B8 100%)',
        'gradient-card': 'linear-gradient(135deg, #BFA4FF 0%, #FFC77D 100%)',
        'gradient-button': 'linear-gradient(90deg, #FF9F1C 0%, #FFC77D 100%)',
        'gradient-lavender': 'linear-gradient(135deg, #BFA4FF 0%, #C9BAFF 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-orange': '0 0 20px 0px rgba(255, 159, 28, 0.5)',
        'glow-blue': '0 0 20px 0px rgba(36, 85, 184, 0.5)',
        'glow-lavender': '0 0 20px 0px rgba(191, 164, 255, 0.3)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '250ms',
        'slow': '350ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}
