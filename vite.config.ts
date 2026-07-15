import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE || '/Tradeshow/',
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        // react-dev-locator stamps every element with trae-inspector-*
        // source-location attributes — dev-only tooling that bloats the
        // production bundle and DOM, so enable it only for `vite dev`.
        plugins: command === 'serve' ? ['react-dev-locator'] : [],
      },
    }),
    tsconfigPaths()
  ],
}))
