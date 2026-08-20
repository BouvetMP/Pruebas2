// ¿Qué? Configuración de Tailwind CSS con la paleta de diseño de TriDa.
// ¿Para qué? Definir colores, fuentes y extensiones del design system para
//            que las clases utility de Tailwind usen nuestra paleta.
// ¿Impacto? Todos los componentes que usen clases Tailwind heredan estos valores.

import type { Config } from 'tailwindcss';

const config: Config = {
  // Archivos que Tailwind debe escanear para generar clases
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  // Soporte para dark mode via atributo data-theme
  darkMode: ['selector', '[data-theme="dark"]'],

  theme: {
    extend: {
      // ================================================================
      // FUENTES (RD-002 — Sans-serif exclusivamente)
      // ================================================================
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont',
               'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Menlo',
               'Consolas', 'Liberation Mono', 'monospace'],
      },

      // ================================================================
      // COLORES — Modo Oscuro (Índigo + Neon Futurista)
      // ================================================================
      colors: {
        // Backgrounds oscuros
        dark: {
          base:     '#0B0D1A',
          surface:  '#111427',
          elevated: '#1A1D35',
          overlay:  '#232847',
        },

        // Backgrounds claros (Azul acero)
        light: {
          base:     '#F0F2F7',
          surface:  '#FFFFFF',
          elevated: '#E8EBF0',
          overlay:  '#FFFFFF',
        },

        // Paleta azul acero (modo claro)
        steel: {
          100: '#F0F2F7',
          200: '#E8EBF0',
          300: '#6582AA',
          400: '#486387',
          500: '#334663',
          600: '#1E2B40',
          700: '#0C121D',
        },

        // Índigo primario
        indigo: {
          DEFAULT: '#6366F1',
          light:   '#818CF8',
          dark:    '#4F46E5',
          50:      'rgba(99, 102, 241, 0.08)',
          100:     'rgba(99, 102, 241, 0.12)',
          200:     'rgba(99, 102, 241, 0.25)',
          300:     'rgba(99, 102, 241, 0.35)',
          400:     'rgba(99, 102, 241, 0.50)',
        },

        // Neon violet (highlights especiales)
        neon: {
          violet: '#7C3AED',
          green:  '#06D6A0',
          cyan:   '#00E5FF',
          coral:  '#FF6B6B',
          amber:  '#FFB547',
          orange: '#FF8A4C',
        },

        // Colores de riesgo — Modo oscuro
        risk: {
          low:      '#06D6A0',
          medium:   '#FFB547',
          high:     '#FF8A4C',
          critical: '#FF6B6B',
        },

        // Colores de riesgo — Modo claro
        'risk-light': {
          low:      '#16A34A',
          medium:   '#CA8A04',
          high:     '#D97706',
          critical: '#DC2626',
        },

        // Textos oscuros
        'dark-text': {
          primary:   '#E8EAF6',
          secondary: '#9FA4C4',
          tertiary:  '#6B70A0',
          disabled:  '#3D4270',
        },

        // Textos claros
        'light-text': {
          primary:   '#1E2B40',
          secondary: '#486387',
          tertiary:  '#6582AA',
          disabled:  '#9CA3AF',
        },
      },

      // ================================================================
      // SOMBRAS — Con tono índigo para modo oscuro
      // ================================================================
      boxShadow: {
        'glow-sm':  '0 0 20px rgba(99, 102, 241, 0.08)',
        'glow-md':  '0 0 30px rgba(99, 102, 241, 0.12)',
        'glow-lg':  '0 0 40px rgba(99, 102, 241, 0.18)',
        'neon-green': '0 0 8px rgba(6, 214, 160, 0.4)',
        'neon-coral': '0 0 8px rgba(255, 107, 107, 0.4)',
        'neon-cyan':  '0 0 8px rgba(0, 229, 255, 0.4)',
      },

      // ================================================================
      // BORDER RADIUS
      // ================================================================
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
      },

      // ================================================================
      // ANIMACIONES
      // ================================================================
      animation: {
        'spin-slow':    'spin 2s linear infinite',
        'pulse-slow':   'pulse-opacity 2s ease-in-out infinite',
        'pulse-scale':  'pulse-scale 1.5s ease-in-out infinite',
        'fade-in':      'fade-in 0.15s ease-out',
        'slide-up':     'slide-in-up 0.2s ease-out',
        'slide-down':   'slide-in-down 0.2s ease-out',
        'scale-in':     'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'dropdown-in':  'dropdown-in 0.15s ease-out',
        'shake':        'shake 0.5s ease-in-out',
      },
      keyframes: {
        'pulse-opacity': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        'pulse-scale': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(1.3)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'dropdown-in': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'shake': {
          '0%, 100%':                    { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%':     { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%':          { transform: 'translateX(4px)' },
        },
      },
    },
  },

  plugins: [],
};

export default config;