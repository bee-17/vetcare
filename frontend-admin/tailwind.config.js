/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vet: {
          bg: '#F4F9F8',
          dark: '#14463F',
          primary: '#0D5C53',
          secondary: '#FE6B4A',
          soft: '#25635B',
          accent: '#E6F0EF',
        }
      },
      fontFamily: {
        serif: ['Lora', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
