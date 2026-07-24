/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Native system UI stack — most universally readable, no webfont download.
        // Renders San Francisco (Apple), Segoe UI (Windows), Roboto (Android), Calibri/Arial fallback.
        display: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'Calibri', 'sans-serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'Calibri', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: '#f4efe4',   // warm paper
        ink: '#1b1813',     // warm near-black
        blood: '#7c2b26',   // oxblood — links, hover, hobby words
        clay: '#cf9a86',    // light warm accent, used only on the dark footer
        muted: '#6f6a5e',   // secondary text / meta
        faint: '#e9e2d3',   // subtle fills (thumbnails, tags)
        line: 'rgba(27,24,16,0.15)',
      },
    },
  },
  plugins: [],
}
