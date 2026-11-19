# 聽見光譜（The Spectrum of Being Heard）

關於我們怎麼說話，又怎麼被聽見。一個互動網頁，用一段對話和三幕劇場，帶人認識五種說話的方式：只談分工、都聽你的、一起商量、急著逼問、不再開口。

## 開發

```bash
npm install
npm run dev      # 本機開發
npm run build    # 產出 dist/
node scripts/palette.mjs                 # 用 Adobe Leonardo 檢查並重新產生文字色
npx @google/design.md lint DESIGN.md     # 檢查視覺規範檔
```

## 用到的工具

| 工具 | 用在哪裡 |
| --- | --- |
| React 18、Vite、Tailwind CSS v4 | 整個網站 |
| lucide-react | 圖示 |
| shadcn/ui（Radix） | `src/components/ui`：常見問題的手風琴、「一句話的兩面」的分頁 |
| Magic UI（motion） | `src/components/magicui`：兩行橫移的字、首頁進場順序、報告頁會跳動的數字 |
| Adobe Leonardo | `scripts/palette.mjs`：依目標對比度產生文字色 |
| DESIGN.md | 專案根目錄的 `DESIGN.md`：視覺規範，修改外觀前先讀 |

字體從 Google Fonts 載入：霞鶩文楷（中文標題）、思源宋體（首頁內文）、Cormorant Garamond（英文）。

## 架構

| 位置 | 內容 |
| --- | --- |
| `src/App.jsx` | 所有畫面與內容 |
| ├ 劇場資料與計分 | `SCRIPT`（兩個視角 × 三幕 × 上下兩個抉擇點 × 五種回應）、`computeState` |
| ├ 劇場畫面 | `Setup` → `Theater`（含 `RelationshipDashboard`）→ `Report`／`PairReport`（含 `Translator`） |
| ├ 對話 | `STOPS`（五個位置）、`SCENARIOS`（三個隨機場景）、`SpectrumChat` |
| ├ 首頁 | `Landing`：主視覺、一句話的兩面、五種說話的方式、兩種走法、常見問題 |
| └ 外框 | `AppHeader`、`AppFooter`、`App` |
| `src/index.css` | 配色。`sand` 色階由淺到深反向編號：950 是頁面底色，50 是最深的文字色 |

所有內容都在瀏覽器端執行，沒有後端，也不儲存使用者的回答。

本體驗為心理教育用途，非臨床診斷工具。
