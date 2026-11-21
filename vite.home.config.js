// 「灰階空間」品牌首頁的建置設定，輸出到 dist-home/。
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(root, "src") } },
  build: { outDir: "dist-home", rollupOptions: { input: path.resolve(root, "home.html") } },
});
