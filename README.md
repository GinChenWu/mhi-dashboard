# 聽見光譜（The Spectrum of Being Heard）

關於我們怎麼說話，又怎麼被聽見。一個互動網頁，用一段對話和三幕劇場，帶人認識五種說話的方式：只談分工、都聽你的、一起商量、急著逼問、不再開口。

## 開發

```bash
npm install
npm run dev      # 本機開發
npm run build    # 產出 dist/
```

技術：React 18、Vite、Tailwind CSS v4、lucide-react。整個應用在 `src/App.jsx` 單一檔案內；配色定義在 `src/index.css`（`sand` 色階由淺到深反向編號，950 是頁面底色，50 是最深的文字色）。字體從 Google Fonts 載入：霞鶩文楷（標題）、思源宋體（首頁內文）、Cormorant Garamond（英文）。

## 架構（`src/App.jsx`）

| 區塊 | 內容 |
| --- | --- |
| 劇場資料 | `SCRIPT`：兩個視角 × 三幕 × 上下兩個抉擇點 × 五種回應 |
| 計分 | `computeState(perspective, choices)`：四個維度、關係生命力、倒數沙漏、風險指數 |
| 劇場畫面 | `Setup` → `Theater`（含 `RelationshipDashboard`）→ `Report`／`PairReport`（含 `Translator`） |
| 對話資料 | `STOPS`（五個位置）、`SCENARIOS`（三個隨機場景） |
| 對話畫面 | `SpectrumChat`：引導者小譯以一問一答走過五個位置 |
| 首頁 | `Landing`：主視覺、一句話的兩面、五種說話的方式、兩種走法、常見問題 |
| 外框 | `AppHeader`、`AppFooter`、`App` |

所有內容都在瀏覽器端執行，沒有後端，也不儲存使用者的回答。

本體驗為心理教育用途，非臨床診斷工具。
