import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import EnvironmentPlugin from "vite-plugin-environment"

export default defineConfig({
  // depending on your application, base can also be "/"
  base: '/',
  plugins: [
    react(),
    viteTsconfigPaths(),
    EnvironmentPlugin("all", { prefix: "FIREBASE_" }),
    EnvironmentPlugin("all", { prefix: "VITE_REACT_" }),
  ],
  build: {
    outDir: 'build'
  },
  server: {
    host: true,
    open: false,
    // this sets a default port to 3000
    port: 3000,
  },
})
