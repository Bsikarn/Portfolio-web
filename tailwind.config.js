/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#0D6EFD', // Dark Blue / Highlight
        'brand-secondary': '#A3D8F4', // Light Blue
        'brand-accent': '#ffc8d5', // Pastel Pink
        'brand-sakura': '#F7CAD0', // Pastel Sakura Pink
        'brand-matcha': '#D8F3DC', // Pastel Matcha Green
        'brand-cream': '#FAF7F2', // Pastel Cream
        'brand-dark': '#0d1b2a', // Deep dark navy for sharp typography
        'brand-muted': '#334155', // Slate 700 for high contrast body text
        'brand-muted-light': '#64748b',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'clay-card': '12px 16px 32px rgba(13, 110, 253, 0.08), -8px -8px 20px rgba(255, 255, 255, 0.9), inset 2px 2px 4px rgba(255, 255, 255, 0.9), inset -2px -2px 4px rgba(13, 110, 253, 0.04)',
        'clay-btn': '8px 12px 24px rgba(13, 110, 253, 0.28), -4px -4px 12px rgba(255, 255, 255, 0.8), inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.15)',
        'clay-btn-hover': '12px 16px 28px rgba(13, 110, 253, 0.35), -6px -6px 16px rgba(255, 255, 255, 0.9), inset 2px 2px 4px rgba(255, 255, 255, 0.5)',
        'clay-pressed': 'inset 4px 4px 10px rgba(13, 110, 253, 0.08), inset -4px -4px 10px rgba(255, 255, 255, 0.9)',
        'clay-pill': '4px 6px 14px rgba(13, 110, 253, 0.06), -3px -3px 8px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 0.8)',
      },
    },
  },
  plugins: [],
}
