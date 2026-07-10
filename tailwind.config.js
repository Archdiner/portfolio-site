/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"EB Garamond Variable"', 'Georgia', 'serif'],
      },
      colors: {
        paper: '#f1ebdd',
        ink: '#191510',
        muted: '#6f6858',
        faint: '#a09883',
      },
    },
  },
  plugins: [],
}
