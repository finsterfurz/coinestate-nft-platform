
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // 🔥 WICHTIG: Dark Mode via CSS Klasse aktivieren
  theme: {
    extend: {
      // ==================== INTER + JETBRAINS MONO FONT SYSTEM ====================
      fontFamily: {
        // 🎯 INTER - Hauptschrift für professionelle Fintech-UI
        'sans': [
          'Inter', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'sans-serif'
        ],
        // 🔢 JETBRAINS MONO - Für alle Finanz- und Datenwerte
        'mono': [
          'JetBrains Mono', 
          'SF Mono', 
          'Monaco', 
          'Inconsolata', 
          'Roboto Mono', 
          'monospace'
        ],
        // 📊 FINTECH - Spezielle Kombination für Dashboard
        'fintech': [
          'Inter', 
          'system-ui', 
          'sans-serif'
        ]
      },
      
      // Font weights für Inter
      fontWeight: {
        'light': '300',
        'normal': '400', 
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800',
        'black': '900'
      },

      // Letter spacing optimiert für Fintech
      letterSpacing: {
        'fintech': '-0.02em',    // Für Headlines
        'data': '0.02em',        // Für Zahlen/NFT IDs
        'tight': '-0.01em',      // Für body text
      },

      // 🎯 ENHANCED ANIMATIONS FOR THEME SWITCHING
      animation: {
        'slideIn': 'slideIn 0.3s ease-out',
        'fadeIn': 'fadeIn 0.5s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'theme-switch': 'theme-switch 0.3s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce-subtle 2s infinite',
      },
      
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'theme-switch': {
          '0%': { opacity: '0.8', transform: 'scale(0.95)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '0.8', transform: 'scale(1)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        }
      },

      // 🚀 OPTIMIZED TRANSITIONS FOR SMOOTH THEME SWITCHING
      transitionProperty: {
        'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke',
        'theme': 'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
        'transform': 'transform',
        'opacity': 'opacity',
      },
      
      transitionDuration: {
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
      },
      
      transitionTimingFunction: {
        'theme': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      // 🎨 ENHANCED COLORS FOR BETTER DARK MODE
      colors: {
        gray: {
          850: '#1f2937',
          950: '#111827'
        },
        blue: {
          550: '#3b82f6',
        }
      },

      // 📦 BOX SHADOWS FOR DEPTH
      boxShadow: {
        'theme-toggle': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'theme-toggle-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
  
  // 🛡️ ENHANCED VARIANTS FOR COMPREHENSIVE DARK MODE SUPPORT
  variants: {
    extend: {
      backgroundColor: ['dark', 'hover', 'focus', 'active'],
      textColor: ['dark', 'hover', 'focus', 'active'],
      borderColor: ['dark', 'hover', 'focus', 'active'],
      gradientColorStops: ['dark'],
      boxShadow: ['dark'],
      opacity: ['dark'],
      scale: ['dark', 'hover', 'group-hover'],
      rotate: ['dark', 'hover', 'group-hover'],
      translate: ['dark', 'hover', 'group-hover'],
    }
  }
}
