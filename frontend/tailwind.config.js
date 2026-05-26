/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        adobe: {
          red: '#FF0000',
          navy: '#1B2A4A',
          blue: '#1473E6',
          dark: '#0F1923',
          gray: '#F5F5F5',
        }
      }
    },
  },
  plugins: [],
}
