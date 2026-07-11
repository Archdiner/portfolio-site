/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display Variable"', 'Georgia', 'serif'],
        sans: ['"Space Grotesk Variable"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        paper: '#f2efe6',
        card: '#f8f6ef',
        ink: '#191612',
        orange: '#e0531c',
        rust: '#b23f16',
        muted: '#726c5f',
        line: 'rgba(25,22,18,0.14)',
      },
    },
  },
  plugins: [],
}
