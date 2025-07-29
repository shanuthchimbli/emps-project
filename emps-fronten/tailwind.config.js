/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",         // ✅ include root HTML
    "./src/**/*.{js,jsx}",  // ✅ include all JS/JSX files in src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
