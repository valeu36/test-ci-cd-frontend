import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// The router plugin must run before @vitejs/plugin-react so the generated route
// tree is transformed by React Refresh like any other source file.
export default defineConfig(({ mode }) => ({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  server: {
    // Pinned so this app never collides with another dev server on the machine.
    port: 5173,
    strictPort: true,
    proxy: {
      // Lets VITE_API_URL stay relative ("/api") in dev, which is what keeps the
      // production bundle host-agnostic. See src/services/api/config.ts.
      "/api": {
        // The shell environment wins; the .env files are the fallback — Vite
        // does not inject them into `process.env` for this config file, so
        // they are read explicitly here.
        target:
          process.env.API_PROXY_TARGET ??
          loadEnv(mode, rootDir, "API_").API_PROXY_TARGET ??
          "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
}));
