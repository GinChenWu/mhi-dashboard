// 「先別急著留言」的建置設定：和聽見光譜共用樣式與元件，但輸出成獨立的網站。
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(root, "src") } },
  build: { outDir: "dist-comment", rollupOptions: { input: path.resolve(root, "comment.html") } },
});
