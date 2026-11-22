# 灰階空間（Grayscale Space）

大部分的事，都在黑白之間。這個專案包含品牌首頁和兩個互動作品，三個都是獨立的網站，共用配色、字體與元件：

| 網站 | 進入點 | 建置 |
| --- | --- | --- |
| 灰階空間（品牌首頁） | `home.html`、`src/home/` | `npx vite build --config vite.home.config.js` |
| 聽見光譜 | `index.html`、`src/App.jsx` | `npm run build` |
| 先別急著留言 | `comment.html`、`src/comment/` | `npx vite build --config vite.comment.config.js` |

品牌首頁只放標語和作品，主視覺是縮小的 `src/home/logo-animated.svg`（品牌提供的動畫 logo，原封不動嵌入）；`logo-static.svg` 是靜態版本。logo 的理念放在子頁「關於」（網址 `#about`）。首頁的配色取自 logo：紙色 #E3DFD4、五片灰、赭色 #C08F4F。

---

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
| ├ 劇場畫面 | `Setup` → `Theater`（含 `RelationshipDashboard`）→ `Report`（含 `Translator`） |
| ├ 雙人模式 | 每一段戲兩人輪流各答一次（`Handoff` 換手卡），過程不顯示任何解析，全部答完經 `RevealGate` 進入 `PairReport` 的三份揭曉 |
| ├ 對話 | `STOPS`（五個位置）、`SCENARIOS`（三個隨機場景）、`SpectrumChat` |
| ├ 首頁 | `Landing`：主視覺、一句話的兩面、五種說話的方式、兩種走法、常見問題 |
| └ 外框 | `AppHeader`、`AppFooter`、`App` |
| `src/index.css` | 配色。`sand` 色階由淺到深反向編號：950 是頁面底色，50 是最深的文字色 |

## 同系列：先別急著留言（Before You Comment）

同一個專案裡的第二個網站，共用配色、字體與元件。前三則是虛構的貼文：留言會真的「送出」，接著看它得到幾個讚、被誰讀到、刪不刪得掉，以及截圖沒截到的部分；同時練習把貼文分成三堆（看得到的、聽說的、腦補的）。最後一則，被截圖的人換成讀的人自己，底下的留言是前三則留過的那幾種話。

| 位置 | 內容 |
| --- | --- |
| `comment.html`、`vite.comment.config.js` | 獨立的進入點與建置設定，輸出到 `dist-comment/` |
| `src/comment/stories.js` | 三則貼文的內容。要加新的貼文，照同樣的格式加一筆即可 |
| `src/comment/App.jsx` | 首頁、單則貼文的流程（分三堆、留言、後果）、最後一則 |

```bash
npx vite build --config vite.comment.config.js   # 建置第二個網站
```

所有內容都在瀏覽器端執行，沒有後端，也不儲存使用者的回答。

本體驗為心理教育用途，非臨床診斷工具。
