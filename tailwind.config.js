/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"EB Garamond Variable"', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['"EB Garamond Variable"', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: '#ffffff',   // clean white
        ink: '#1b1813',     // warm near-black
        blood: '#7c2b26',   // oxblood — links, hover, key words
        clay: '#cf9a86',    // light warm accent, used only on the dark footer
        muted: '#6f6a5e',   // secondary text / meta
        faint: '#f3f2ee',   // subtle fills (thumbnails, tags)
        line: 'rgba(20,18,14,0.14)',
      },
    },
  },
  plugins: [],
}
