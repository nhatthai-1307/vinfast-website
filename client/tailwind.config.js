/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vinfast: {
          blue: {
            DEFAULT: '#103F91', // Standard VinFast Blue
            light: '#2563EB',
            dark: '#0B2554',
          },
          cyan: {
            DEFAULT: '#00F2FE', // Electric Cyan
            light: '#70F3FF',
            dark: '#00A8B5',
          },
          carbon: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
            950: '#070A13', // Premium Ultra Dark Carbon
          },
          accent: {
            gold: '#D4AF37', // Luxury highlight gold
            silver: '#E5E4E2',
          }
        },
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'Inter', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'electric-gradient': 'linear-gradient(135deg, #103F91 0%, #00F2FE 100%)',
        'dark-gradient': 'linear-gradient(180deg, #070A13 0%, #111827 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 242, 254, 0.3)',
        'glow-blue': '0 0 15px rgba(16, 63, 145, 0.4)',
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
