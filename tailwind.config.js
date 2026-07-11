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
        paper: '#f2f0e7',
        card: '#f8f7f0',
        ink: '#1a1f1a',
        green: '#235c34',
        forest: '#1c3524',
        muted: '#6a6f62',
        line: 'rgba(26,31,26,0.14)',
      },
    },
  },
  plugins: [],
}
