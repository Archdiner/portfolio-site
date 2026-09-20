import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // The live site.
        main: resolve(__dirname, 'index.html'),
        // Tuning harness for the water shader. Built so it survives a deploy and
        // can be opened on a real phone — a laptop GPU tells you nothing about
        // how the simulation holds up on mobile. Nothing links to it.
        water: resolve(__dirname, 'water-test.html'),
      },
    },
  },
})
