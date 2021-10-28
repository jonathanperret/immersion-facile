import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import eslint from "@rollup/plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    { ...eslint({ include: "src/**/*.+(js|jsx|ts|tsx)" }), enforce: "pre" },
    react(),
  ],
  resolve: {
    alias: {
      src: resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:1234/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
