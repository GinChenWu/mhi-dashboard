import React, { useState } from "react";
import { cn } from "@/lib/utils";
import logoAnimated from "./logo-animated.svg?raw";

/* ============================================================================
 * 《灰階空間》 Grayscale Space：品牌首頁
 * 主視覺是品牌自己的動畫 logo（src/home/logo-animated.svg，原封不動嵌入）。
 * 「理念」一段把 logo 的五個元素對應到品牌的想法，點哪一個，logo 就亮哪一個。
 * 配色取自 logo 本身：紙色、五片灰、一個赭色的點。
 * ========================================================================== */

const WORKS = {
  spectrum: "https://claude.ai/artifact/2G1u3QVEjB1TdyyFtfebZB",
  comment: "https://claude.ai/artifact/59NcYa1iBACyEywxGHE473",
};

/* logo 的顏色 */
const C = {
  page: "#ECE9E2",
  paper: "#E3DFD4",
  raised: "#F5F3EE",
  ink: "#2F3332",
  text2: "#4E5453",
  muted: "#5F6564",
  hair: "#CFC9BC",
  ochre: "#C08F4F",
  ochreText: "#7E5826",
  band: "#2F3332",
  onBand: "#E3DFD4",
  onBand2: "#B7B0A2",
  onBandAccent: "#D9A866",
};

/* logo 的五片灰（路徑與顏色取自原始檔），以及動畫裡亮起的順序 */
const PANELS = [
  { d: "M 262 276 Q 262 265 272.51 268.24 L 345.49 290.76 Q 356 294 356 305 L 356 549 Q 356 560 345.4 562.93 L 272.6 583.07 Q 262 586 262 575 Z", fill: "#4B5456", order: 1 },
  { d: "M 344 325 Q 344 314 354.97 314.81 L 441.03 321.19 Q 452 322 452 333 L 452 575 Q 452 586 441.03 586.81 L 354.97 593.19 Q 344 594 344 583 Z", fill: "#879495", order: 4 },
  { d: "M 440 301 Q 440 290 450.97 289.17 L 535.03 282.83 Q 546 282 546 293 L 546 547 Q 546 558 535.01 558.41 L 450.99 561.59 Q 440 562 440 551 Z", fill: "#939B8C", order: 3 },
  { d: "M 534 347 Q 534 336 544.95 334.99 L 631.05 327.01 Q 642 326 642 337 L 642 581 Q 642 592 631.03 591.19 L 544.97 584.81 Q 534 584 534 573 Z", fill: "#B09F87", order: 5 },
  { d: "M 630 307 Q 630 296 640.55 292.9 L 721.45 269.1 Q 732 266 732 277 L 732 577 Q 732 588 721.34 585.28 L 640.66 564.72 Q 630 562 630 551 Z", fill: "#D6CBB9", order: 2 },
];
const PANEL_TOPS = [268, 315, 284, 328, 268];
const PANEL_CENTERS = [309, 398, 493, 588, 681];
const OVERLAPS = [[344, 356], [440, 452], [534, 546], [630, 642]];
const WAVE = "M 200 474 C 360 388, 525 514, 798 396";

const IDEAS = [
  { id: "panels", n: "01", title: "五種灰", en: "Five greys", text: "這五片灰，沒有一片是純黑，也沒有一片是純白。它們從深到淺排開，像同一件事的五種看法、五種說話的方式。每一片都站在自己的位置上。" },
  { id: "overlap", n: "02", title: "重疊的地方", en: "Where they overlap", text: "每一片都疊在旁邊那一片上，疊起來的地方會長出新的顏色。理解大概也是這樣：要靠近到有一點重疊，才看得見彼此。" },
  { id: "dot", n: "03", title: "一點溫度", en: "A little warmth", text: "在所有的灰之間，留了一個暖色的點。不管討論多冷、立場離得多遠，都提醒自己：螢幕對面，也是一個有溫度的人。" },
  { id: "wave", n: "04", title: "慢慢畫出來的線", en: "A line drawn slowly", text: "動畫裡，這條線是一點一點畫出來的，從這一頭走到那一頭。對話也需要時間，急不來。" },
  { id: "turns", n: "05", title: "交錯著亮起", en: "Taking turns", text: "五片灰不是從左到右排隊亮起，而是交錯的：一、五、三、二、四。之後有時候這邊亮，有時候那邊亮。沒有哪一邊永遠是對的，也沒有哪一邊永遠被聽見。" },
];

const CSS = `
html { scroll-behavior: smooth; }
body { background: ${C.page}; color: ${C.ink}; }
.font-display { font-family: "LXGW WenKai TC", "Noto Serif TC", "Songti TC", "PMingLiU", serif; }
.font-latin { font-family: "Cormorant Garamond", "Times New Roman", serif; }
.font-body { font-family: "Noto Serif TC", "Songti TC", "PMingLiU", serif; }
.gs-logo svg { display: block; width: 100%; height: auto; }
.grain { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .3  0 0 0 0 .3  0 0 0 0 .3  0 0 0 .45 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); opacity: .12; mix-blend-mode: multiply; }
.emblem-part { transition: opacity .45s ease, transform .45s ease; }
@keyframes drawLine { from { stroke-dashoffset: 660; } to { stroke-dashoffset: 0; } }
.draw { stroke-dasharray: 660; animation: drawLine 2.4s ease-in-out both; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fade-in { animation: fadeIn .7s ease both; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .gs-logo svg * { animation: none !important; }
  .draw, .fade-in { animation: none; }
}
`;

const WRAP = "mx-auto max-w-5xl px-4 sm:px-6";

/* 小的靜態標誌，給頂部和頁尾用 */
function Mark({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="240 250 520 360" className={className} aria-hidden="true">
      {PANELS.map((p) => <path key={p.fill} d={p.d} fill={p.fill} opacity=".92" style={{ mixBlendMode: "multiply" }} />)}
      <circle cx="580" cy="296" r="22" fill={C.ochre} />
    </svg>
  );
}

/* 理念區的互動標誌：點選一個想法，對應的部分會亮起來 */
function Emblem({ focus }) {
  const dim = (on) => ({ opacity: focus && !on ? 0.12 : 1 });
  const panelsOn = !focus || focus === "panels" || focus === "overlap" || focus === "turns";
  return (
    <svg viewBox="180 192 640 438" className="w-full" role="img" aria-label="灰階空間的標誌：五片由深到淺的灰色面板彼此重疊，上方一個赭色圓點，一條細線從左到右穿過。">
      <g style={{ isolation: "isolate" }}>
        {PANELS.map((p, i) => (
          <path key={p.fill} className="emblem-part" d={p.d} fill={p.fill} opacity={focus === "overlap" ? 0.55 : 0.92} style={{ mixBlendMode: "multiply", ...dim(panelsOn), transform: focus === "turns" ? `translateY(${p.order % 2 ? -6 : 6}px)` : "none" }} />
        ))}
      </g>
      {focus === "overlap" &&
        OVERLAPS.map(([a, b]) => <rect key={a} x={a - 3} y="300" width={b - a + 6} height="270" rx="5" fill="none" stroke={C.ochre} strokeWidth="3" strokeDasharray="6 6" />)}
      {focus === "turns" &&
        PANELS.map((p, i) => (
          <g key={p.fill}>
            <circle cx={PANEL_CENTERS[i]} cy={PANEL_TOPS[i] - 34} r="19" fill={C.raised} stroke={C.ink} strokeWidth="2" />
            <text x={PANEL_CENTERS[i]} y={PANEL_TOPS[i] - 27} textAnchor="middle" fontSize="20" fontWeight="600" fill={C.ink}>{p.order}</text>
          </g>
        ))}
      <circle className="emblem-part" cx="580" cy="296" r="19" fill={C.ochre} style={{ ...dim(focus === "dot"), transform: focus === "dot" ? "scale(1.5)" : "none", transformBox: "fill-box", transformOrigin: "center" }} />
      {focus === "dot" && <circle cx="580" cy="296" r="40" fill="none" stroke={C.ochre} strokeWidth="2" opacity=".6" />}
      <path key={focus === "wave" ? "draw" : "still"} className={cn("emblem-part", focus === "wave" && "draw")} d={WAVE} fill="none" stroke={focus === "wave" ? C.ink : "#B9B2A4"} strokeWidth={focus === "wave" ? 5 : 3.2} strokeLinecap="round" style={dim(focus === "wave")} />
    </svg>
  );
}

function Ideas() {
  const [focus, setFocus] = useState("panels");
  const idea = IDEAS.find((i) => i.id === focus);
  return (
    <div className="grid items-start gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
      <div className="sticky top-[60px] z-10 -mx-4 px-4 pb-2 pt-2 md:top-24 md:mx-0 md:px-0 md:pt-0" style={{ background: C.page }}>
        <div className="rounded-[2rem] p-3 sm:p-8" style={{ background: C.paper }}>
          <Emblem focus={focus} />
        </div>
        <p key={focus} className="fade-in mt-5 hidden text-[15px] leading-loose md:block" style={{ color: C.text2 }}>{idea.text}</p>
      </div>
      <ol className="space-y-2" aria-label="logo 的五個想法">
        {IDEAS.map((i) => {
          const on = i.id === focus;
          return (
            <li key={i.id}>
              <button type="button" aria-pressed={on} onClick={() => setFocus(i.id)} className="flex w-full items-baseline gap-4 rounded-2xl px-4 py-4 text-left transition focus:outline-none focus-visible:ring-2" style={{ background: on ? C.raised : "transparent", boxShadow: on ? "0 10px 30px -18px rgba(47,51,50,.45)" : "none", "--tw-ring-color": C.ochre }}>
                <span className="font-latin w-8 shrink-0 text-xl italic" style={{ color: on ? C.ochreText : C.muted }}>{i.n}</span>
                <span className="min-w-0">
                  <span className="font-display block text-xl font-semibold" style={{ color: C.ink }}>{i.title}</span>
                  <span className="font-latin block text-lg italic" style={{ color: C.muted }}>{i.en}</span>
                  {on && <span className="fade-in mt-2 block text-[15px] leading-loose md:hidden" style={{ color: C.text2 }}>{i.text}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SpectrumArt() {
  const dots = [["#3B8C8C", 10], ["#6E9FB0", 30], ["#E8973A", 50], ["#D9414F", 70], ["#C2697B", 90]];
  return (
    <svg viewBox="0 0 320 120" className="w-full" aria-hidden="true">
      <defs><linearGradient id="specBand" x1="0" x2="1"><stop offset="0" stopColor="#3B8C8C" /><stop offset=".5" stopColor="#E8973A" /><stop offset="1" stopColor="#D9596A" /></linearGradient></defs>
      <rect x="20" y="58" width="280" height="6" rx="3" fill="url(#specBand)" opacity=".7" />
      {dots.map(([c, x]) => <circle key={x} cx={20 + (x / 100) * 280} cy="61" r={x === 50 ? 13 : 9} fill={x === 50 ? c : "#FAF6EE"} stroke={c} strokeWidth="3" />)}
      <rect x="34" y="12" width="96" height="26" rx="13" fill="#FAF6EE" stroke="#CFC9BC" />
      <rect x="190" y="86" width="96" height="24" rx="12" fill="#2F3332" opacity=".85" />
    </svg>
  );
}

function CommentArt() {
  return (
    <svg viewBox="0 0 320 120" className="w-full" aria-hidden="true">
      <rect x="70" y="18" width="180" height="88" rx="14" fill="#FAF6EE" stroke="#CFC9BC" />
      <rect x="150" y="38" width="84" height="18" rx="9" fill="#3B8C8C" opacity=".85" />
      <rect x="86" y="64" width="98" height="18" rx="9" fill="#D9D3C6" />
      <path d="M80 30 V22 H90 M230 22 H240 V30 M240 94 V102 H230 M90 102 H80 V94" fill="none" stroke={C.ochre} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 10 H250 M70 114 H250" stroke="#CFC9BC" strokeWidth="2" strokeDasharray="5 6" />
    </svg>
  );
}

const WORK_LIST = [
  { key: "spectrum", art: SpectrumArt, title: "聽見光譜", en: "The Spectrum of Being Heard", text: "同一句話，說的人心裡想的，和聽的人收到的，常常不一樣。跟小譯聊一段，或兩個人一起演一齣三幕的故事，看看五種說話的方式。", meta: ["10 到 15 分鐘", "可以兩個人一起玩"], url: WORKS.spectrum },
  { key: "comment", art: CommentArt, title: "先別急著留言", en: "Before You Comment", text: "四則你可能滑到過的貼文。前三則你留言，然後看那句話後來去了哪裡；最後一則，換你被截圖。", meta: ["約 10 分鐘", "一個人玩"], url: WORKS.comment },
];

const BELIEFS = [
  ["先不選邊", "先聽完兩邊，再決定自己站在哪裡。"],
  ["不貼標籤", "我們談的是說話的方式，不是哪一種人。作品裡沒有男女對立。"],
  ["不記錄你", "所有作品都在你的瀏覽器裡進行，你的回答不會被傳送或儲存。"],
];

export default function App() {
  return (
    <div className="font-body relative min-h-screen antialiased" style={{ background: C.page, color: C.ink }}>
      <style>{CSS}</style>
      <div aria-hidden="true" className="grain pointer-events-none fixed inset-0" />

      <div className="sticky top-0 z-30 border-b backdrop-blur-md" style={{ background: "rgba(236,233,226,.82)", borderColor: C.hair }}>
        <div className={`${WRAP} flex items-center justify-between py-3`}>
          <a href="#top" className="flex items-center gap-2.5 rounded-full py-1 focus:outline-none focus-visible:ring-2" style={{ "--tw-ring-color": C.ochre }} aria-label="灰階空間，回到頂端">
            <Mark />
            <span className="font-display text-lg font-semibold tracking-[0.14em]">灰階空間</span>
            <span className="font-latin hidden text-base italic sm:inline" style={{ color: C.muted }}>Grayscale Space</span>
          </a>
          <nav aria-label="主要導覽" className="flex gap-1 text-sm">
            {[["#idea", "理念"], ["#works", "作品"]].map(([h, t]) => (
              <a key={h} href={h} className="rounded-full px-3.5 py-2 transition hover:bg-black/5 focus:outline-none focus-visible:ring-2" style={{ color: C.text2, "--tw-ring-color": C.ochre }}>{t}</a>
            ))}
          </nav>
        </div>
      </div>

      <main id="top" className="relative">
        {/* ── 主視覺：品牌的動畫 logo ── */}
        <header className={`${WRAP} pb-10 pt-8 text-center sm:pt-12`}>
          <h1 className="sr-only">灰階空間 Grayscale Space</h1>
          <div className="fade-in mx-auto max-w-[34rem] rounded-[2.25rem] p-2 sm:p-3" style={{ background: C.raised, boxShadow: "0 50px 100px -50px rgba(47,51,50,.55)" }}>
            <div className="gs-logo overflow-hidden rounded-[1.75rem]" role="img" aria-label="灰階空間 Grayscale Space 的動畫標誌：五片灰色面板交錯亮起，一條線從左到右慢慢畫出來。" dangerouslySetInnerHTML={{ __html: logoAnimated.replace(/<\?xml[^>]*\?>/, "") }} />
          </div>
          <p className="font-display fade-in mt-10 text-[1.9rem] leading-snug sm:text-5xl sm:leading-tight" style={{ animationDelay: ".2s", textWrap: "balance" }}>大部分的事，都在黑白之間。</p>
          <p className="font-latin fade-in mt-2 text-2xl italic sm:text-3xl" style={{ color: C.ochreText, animationDelay: ".3s" }}>Most things live in the grey.</p>
          <p className="fade-in mx-auto mt-6 max-w-xl text-[16px] leading-loose" style={{ color: C.text2, animationDelay: ".4s" }}>網路上很多事，被講成非黑即白。灰階空間做一些小小的互動作品，陪你看看中間那一大片：不同的人怎麼說話、怎麼聽，一句話被裁掉之後又變成了什麼。</p>
          <div className="fade-in mt-8 flex flex-wrap items-center justify-center gap-3 font-sans" style={{ animationDelay: ".5s" }}>
            <a href="#works" className="rounded-full px-6 py-3 text-sm font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ background: C.ink, color: C.raised, "--tw-ring-color": C.ochre }}>看作品</a>
            <a href="#idea" className="rounded-full border px-6 py-3 text-sm font-semibold transition hover:bg-black/5 focus:outline-none focus-visible:ring-2" style={{ borderColor: "#A9A397", color: C.ink, "--tw-ring-color": C.ochre }}>這個名字的意思</a>
          </div>
        </header>

        {/* ── 理念：logo 的五個元素 ── */}
        <section id="idea" className="scroll-mt-16 py-20 sm:py-28">
          <div className={WRAP}>
            <div className="mb-10 max-w-2xl sm:mb-14">
              <h2 className="font-display text-[2rem] font-semibold leading-tight sm:text-5xl">為什麼是灰階</h2>
              <p className="font-latin mt-1 text-xl italic sm:text-2xl" style={{ color: C.ochreText }}>Why grayscale</p>
              <p className="mt-5 text-[16px] leading-loose" style={{ color: C.text2 }}>黑和白之間，其實有很多很多層灰。這個標誌就是在說這件事。點每一項，看看它在標誌裡的哪裡。</p>
            </div>
            <Ideas />
          </div>
        </section>

        {/* ── 作品 ── */}
        <section id="works" className="scroll-mt-16 py-20 sm:py-28" style={{ background: C.paper }}>
          <div className={WRAP}>
            <div className="mb-10 max-w-2xl sm:mb-14">
              <h2 className="font-display text-[2rem] font-semibold leading-tight sm:text-5xl">作品</h2>
              <p className="font-latin mt-1 text-xl italic sm:text-2xl" style={{ color: C.ochreText }}>Works</p>
              <p className="mt-5 text-[16px] leading-loose" style={{ color: C.text2 }}>每一個作品都是一個小小的練習，十分鐘左右，手機就可以玩。</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {WORK_LIST.map((w) => (
                <article key={w.key} className="flex flex-col overflow-hidden rounded-[2rem]" style={{ background: C.raised, boxShadow: "0 30px 70px -45px rgba(47,51,50,.6)" }}>
                  <div className="px-6 pt-6 sm:px-8 sm:pt-8"><div className="rounded-2xl p-3" style={{ background: C.page }}><w.art /></div></div>
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <h3 className="font-display text-3xl font-semibold">{w.title}</h3>
                    <p className="font-latin text-xl italic" style={{ color: C.ochreText }}>{w.en}</p>
                    <p className="mt-4 flex-1 text-[15px] leading-loose" style={{ color: C.text2 }}>{w.text}</p>
                    <ul className="mt-5 flex flex-wrap gap-2 font-sans text-xs" style={{ color: C.text2 }}>
                      {w.meta.map((m) => <li key={m} className="rounded-full px-3 py-1" style={{ background: C.page }}>{m}</li>)}
                    </ul>
                    <a href={w.url} target="_blank" rel="noreferrer" className="mt-6 self-start rounded-full px-6 py-3 font-sans text-sm font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ background: C.ink, color: C.raised, "--tw-ring-color": C.ochre }}>打開《{w.title}》</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 我們的做法 ＋ 頁尾 ── */}
        <section className="relative overflow-hidden" style={{ background: C.band }}>
          <div className={`${WRAP} relative py-20 sm:py-28`}>
            <p className="font-display max-w-3xl text-[1.75rem] leading-loose sm:text-5xl sm:leading-[1.6]" style={{ color: C.onBand, textWrap: "balance" }}>先別急著選邊，多看一眼。</p>
            <p className="font-latin mt-3 text-2xl italic sm:text-3xl" style={{ color: C.onBandAccent }}>Look once more before you choose a side.</p>
            <ul className="mt-12 grid gap-8 sm:grid-cols-3">
              {BELIEFS.map(([t, d]) => (
                <li key={t}>
                  <div className="mb-3 h-px w-10" style={{ background: C.onBandAccent }} />
                  <h3 className="font-display text-xl font-semibold" style={{ color: C.onBand }}>{t}</h3>
                  <p className="mt-2 text-[15px] leading-loose" style={{ color: C.onBand2 }}>{d}</p>
                </li>
              ))}
            </ul>
            <footer className="mt-20 flex flex-wrap items-end justify-between gap-6 border-t pt-8 font-sans text-[13px]" style={{ borderColor: "rgba(227,223,212,.15)", color: C.onBand2 }}>
              <div className="flex items-center gap-3">
                <span className="rounded-xl p-1.5" style={{ background: C.paper }}><Mark className="h-7 w-7" /></span>
                <div>
                  <div className="font-display text-base tracking-[0.14em]" style={{ color: C.onBand }}>灰階空間</div>
                  <div className="font-latin text-base italic">Grayscale Space</div>
                </div>
              </div>
              <p className="max-w-xs leading-relaxed">心理教育用途的互動內容，不是臨床診斷工具。作品裡的人物與情節皆為虛構。</p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
