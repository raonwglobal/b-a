/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'b-green': '#14532D',
        'b-slate': '#101828',
        'b-beige': '#F9F5EB'
      }
    },
  },
  plugins: [],
}
