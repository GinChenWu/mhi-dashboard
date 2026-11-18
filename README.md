# 溝通光譜：在終焉之前（The Communication Spectrum: Before the End）

一個以親密關係心理學為底的互動敘事網頁：透過雙軸光譜、訊號稜鏡、雙視角三幕劇、動態視覺隱喻與隱藏量表，讓人看見一段感情如何從日常的「訊號漏接」滑向「安靜離職」。

## 開發

```bash
npm install
npm run dev      # 本機開發
npm run build    # 產出 dist/
```

技術：React 18、Vite、Tailwind CSS v4、lucide-react。整個應用在 `src/App.jsx` 單一檔案內。

## 架構（`src/App.jsx`）

| 區塊 | 內容 |
| --- | --- |
| 資料層 | `PRISM_LINES`、`SPECTRUM_POINTS`、`SCRIPT`（A／B 視角 × 三幕 × 三選項）、`DECODER`／`CONVERTER` |
| 計分引擎 | `computeState(perspective, choices)`：四維度、關係生命力、終焉沙漏、風險指數 |
| 視覺隱喻引擎 | `RelationshipDashboard`：角色輪廓清晰度、訊號粒子／防衛高牆、心電圖、沙漏 |
| 視圖 | `Landing` → `Setup` → `Theater` → `Report`（含 `Translator`） |

本體驗為心理教育用途，非臨床診斷工具。
