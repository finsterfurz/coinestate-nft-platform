
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

      animation: {
        'slideIn': 'slideIn 0.3s ease-out',
        'fadeIn': 'fadeIn 0.5s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
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
        }
      }
    },
  },
  plugins: [],
}
