import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/slow-motion-reality/",
  build: {
    assetsDir: "assets",
    emptyOutDir: false,
    outDir: "docs",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("onnxruntime-web")) return "onnx";
          if (id.includes("node_modules/react")) return "react";
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Slow-motion Reality",
        short_name: "Slow Reality",
        description:
          "A local camera, WebGPU, RIFE ONNX, and buffered audio slow-motion experience.",
        theme_color: "#101417",
        background_color: "#101417",
        display: "standalone",
        icons: [
          {
            src: "favicon.svg",
            sizes: "64x64",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,wasm,onnx}"],
        maximumFileSizeToCacheInBytes: 32 * 1024 * 1024,
        navigateFallback: "/slow-motion-reality/index.html",
      },
    }),
  ],
});
