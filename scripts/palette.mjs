// 用 Adobe Leonardo 依「目標對比度」產生文字色，並檢查現有配色。
// 執行：node scripts/palette.mjs
import { Theme, Color, BackgroundColor, contrast } from "@adobe/leonardo-contrast-colors";

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const ratio = (fg, bg) => Math.abs(contrast(hexToRgb(fg), hexToRgb(bg))).toFixed(2);

// 文字會出現在這三種淺色底上；取最深的一種（tint）當作最嚴格的條件
const surfaces = { page: "#faf3e7", card: "#fffbf4", tint: "#f3e6d0" };

// 目前的文字色
const current = { "sand-500 (muted)": "#7d6b58", "sand-400": "#6b5b4b", "sand-300": "#54463a", "amber-300": "#b4610f", "cyan-300": "#2f6f73", "rose-300": "#b8404f", "emerald-300": "#2f7a54", "violet-300": "#7a5ba8" };
console.log("現有文字色的對比度（AA 內文需 ≥ 4.5）");
for (const [name, hex] of Object.entries(current)) console.log(`  ${name.padEnd(18)} ${hex}  page ${ratio(hex, surfaces.page)}  card ${ratio(hex, surfaces.card)}  tint ${ratio(hex, surfaces.tint)}`);

// 以最深的淺色底為背景，產生達到指定對比度的顏色
const bg = new BackgroundColor({ name: "tint", colorKeys: [surfaces.tint], ratios: [1] });
const families = {
  sand: { keys: ["#7d6b58", "#33291f"], ratios: { 500: 4.8, 400: 6.2, 300: 8.5 } },
  amber: { keys: ["#b4610f", "#e8973a"], ratios: { 300: 4.8 } },
  cyan: { keys: ["#2f6f73", "#4a9a9a"], ratios: { 300: 4.8 } },
  rose: { keys: ["#b8404f", "#e0707c"], ratios: { 300: 4.8 } },
  emerald: { keys: ["#2f7a54", "#5fae85"], ratios: { 300: 4.8 } },
  violet: { keys: ["#7a5ba8", "#b79ad6"], ratios: { 300: 4.8 } },
};
const colors = Object.entries(families).map(([name, f]) => new Color({ name, colorKeys: f.keys, colorSpace: "CAM02", ratios: f.ratios }));
const theme = new Theme({ colors, backgroundColor: bg, lightness: 92, output: "HEX" });
console.log("\nLeonardo 產生的文字色（在最深的淺色底上達到目標對比度）");
for (const group of theme.contrastColors.slice(1)) for (const v of group.values) console.log(`  --color-${group.name}-${v.name.replace(/^\D+/, "")}: ${v.value.toLowerCase()};  目標 ${v.contrast}  實際 page ${ratio(v.value, surfaces.page)} tint ${ratio(v.value, surfaces.tint)}`);
