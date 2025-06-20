/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.ejs', './public/**/*.{js,css,html}', './src/**/*.js'],
  theme: {
    extend: {
      // Cores personalizadas da marca
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
      },

      // Tipografia
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      // Espaçamentos personalizados
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },

      // Animações personalizadas
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      // Keyframes para animações
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },

      // Sombras personalizadas
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        medium:
          '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        strong:
          '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },

      // Bordas personalizadas
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      // Gradientes personalizados
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary':
          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-success': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },

      // Breakpoints personalizados
      screens: {
        xs: '475px',
        '3xl': '1600px',
        '4xl': '1920px',
      },

      // Z-index personalizado
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),

    // Plugin personalizado para componentes
    function ({ addComponents, theme }) {
      addComponents({
        // Botões personalizados
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontWeight: '500',
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          border: 'none',
          outline: 'none',
          '&:focus': {
            outline: '2px solid',
            outlineOffset: '2px',
          },
        },
        '.btn-primary': {
          backgroundColor: theme('colors.primary.600'),
          color: 'white',
          '&:hover': {
            backgroundColor: theme('colors.primary.700'),
          },
          '&:focus': {
            outlineColor: theme('colors.primary.500'),
          },
        },
        '.btn-secondary': {
          backgroundColor: theme('colors.secondary.200'),
          color: theme('colors.secondary.800'),
          '&:hover': {
            backgroundColor: theme('colors.secondary.300'),
          },
          '&:focus': {
            outlineColor: theme('colors.secondary.500'),
          },
        },
        '.btn-success': {
          backgroundColor: theme('colors.success.600'),
          color: 'white',
          '&:hover': {
            backgroundColor: theme('colors.success.700'),
          },
          '&:focus': {
            outlineColor: theme('colors.success.500'),
          },
        },
        '.btn-danger': {
          backgroundColor: theme('colors.danger.600'),
          color: 'white',
          '&:hover': {
            backgroundColor: theme('colors.danger.700'),
          },
          '&:focus': {
            outlineColor: theme('colors.danger.500'),
          },
        },

        // Cards personalizados
        '.card': {
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: theme('boxShadow.soft'),
          overflow: 'hidden',
        },
        '.card-header': {
          padding: '1.5rem',
          borderBottom: `1px solid ${theme('colors.gray.200')}`,
        },
        '.card-body': {
          padding: '1.5rem',
        },
        '.card-footer': {
          padding: '1.5rem',
          borderTop: `1px solid ${theme('colors.gray.200')}`,
          backgroundColor: theme('colors.gray.50'),
        },

        // Formulários personalizados
        '.form-input': {
          width: '100%',
          padding: '0.75rem 1rem',
          border: `1px solid ${theme('colors.gray.300')}`,
          borderRadius: '0.375rem',
          fontSize: '1rem',
          transition: 'border-color 0.2s ease-in-out',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.primary.500'),
            boxShadow: `0 0 0 3px ${theme('colors.primary.100')}`,
          },
        },
        '.form-label': {
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: theme('colors.gray.700'),
        },

        // Alertas personalizados
        '.alert': {
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid',
        },
        '.alert-success': {
          backgroundColor: theme('colors.success.50'),
          borderColor: theme('colors.success.200'),
          color: theme('colors.success.800'),
        },
        '.alert-warning': {
          backgroundColor: theme('colors.warning.50'),
          borderColor: theme('colors.warning.200'),
          color: theme('colors.warning.800'),
        },
        '.alert-danger': {
          backgroundColor: theme('colors.danger.50'),
          borderColor: theme('colors.danger.200'),
          color: theme('colors.danger.800'),
        },
        '.alert-info': {
          backgroundColor: theme('colors.primary.50'),
          borderColor: theme('colors.primary.200'),
          color: theme('colors.primary.800'),
        },
      });
    },
  ],

  // Configurações de produção
  ...(process.env.NODE_ENV === 'production' && {
    purge: {
      enabled: true,
      content: [
        './views/**/*.ejs',
        './public/**/*.{js,css,html}',
        './src/**/*.js',
      ],
    },
  }),
};
