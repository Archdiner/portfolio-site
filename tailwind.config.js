/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces Variable"', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: '#ece5d8',   // warm paper stock
        ink: '#1f1a13',     // warm near-black
        blood: '#7c2b26',   // oxblood — links, hover, key words
        clay: '#cf9a86',    // light warm accent, used only on the dark footer
        muted: '#6b6557',   // secondary text / meta
        faint: '#e0d8c9',   // subtle fills (thumbnails, tags)
        line: 'rgba(31,26,19,0.14)',
      },
    },
  },
  plugins: [],
}
