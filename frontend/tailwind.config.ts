import type { Config } from 'tailwindcss';

// Color tokens sampled directly from logo.jpg (see scripts used during Phase A build):
//  - primary   #0E3056  -> average of ~15,000 navy pixels across the E/F letterforms
//  - accent    #846033  -> average of ~5,300 gold/bronze pixels across the wheat + wordmark
//  - accentLight #D8B573 -> the brightest, most saturated gold highlight pixel found (wheat tip gradient)
// primary-dark / neutrals are derived to complement the sampled values.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0E3056',
          light: '#1E4A7A',
          dark: '#081D33',
          50: '#EAF0F6',
          100: '#CBDAE9',
          200: '#9DB9D3',
          300: '#6E97BC',
          400: '#4A7AA8',
          500: '#0E3056',
          600: '#0C2A4B',
          700: '#0A233F',
          800: '#081D33',
          900: '#051526',
        },
        accent: {
          DEFAULT: '#846033',
          light: '#D8B573',
          dark: '#5E4423',
          50: '#FBF6EE',
          100: '#F3E6CE',
          200: '#E6CCA0',
          300: '#D8B573',
          400: '#A98449',
          500: '#846033',
          600: '#6B4E28',
          700: '#523B1F',
          800: '#3A2A16',
          900: '#241A0E',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F7F6F3',
          dark: '#0B1220',
          'dark-muted': '#121B2E',
        },
        ink: {
          DEFAULT: '#161A1F',
          soft: '#4B5563',
          onDark: '#F1F1EF',
          onDarkSoft: '#B8C0CC',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(14 48 86 / 0.06), 0 1px 3px 0 rgb(14 48 86 / 0.1)',
        'card-hover': '0 4px 12px 0 rgb(14 48 86 / 0.12), 0 2px 4px 0 rgb(14 48 86 / 0.08)',
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(circle at 20% 20%, rgba(216,181,115,0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(14,48,86,0.25), transparent 50%), linear-gradient(135deg, #0E3056 0%, #0A233F 55%, #081D33 100%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
