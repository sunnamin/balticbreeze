import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // If deploying to user.github.io/balticbreeze/, set:
  base: "/balticbreeze/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ["recharts"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
