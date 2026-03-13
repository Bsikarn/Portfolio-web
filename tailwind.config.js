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
        'brand-dark': '#0d1b2a',
        'brand-muted': '#5a7a9a',
        'brand-muted-light': '#8aabcc',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
