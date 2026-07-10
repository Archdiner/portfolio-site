/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ivory: '#f4f1e9',
        paper: '#faf8f2',
        ink: '#1c1a17',
        muted: '#6f695d',
        faint: '#8a8474',
        accent: '#a2432a',
      },
    },
  },
  plugins: [],
}
