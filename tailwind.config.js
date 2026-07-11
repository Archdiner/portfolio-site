/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: '#f0ede4',
        ink: '#1c1a14',
        orange: '#dd521f',
        rust: '#b23f14',
        cream: '#f6f1e6',
        muted: '#78735f',
        line: 'rgba(28,26,20,0.16)',
      },
    },
  },
  plugins: [],
}
