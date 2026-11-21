import React, { useEffect, useMemo, useRef, useState } from "react";
import { Heart, MessageCircle, Repeat2, Scissors } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { MIRROR, PILES, STORIES } from "./stories.js";

/* ============================================================================
 * 《先別急著留言》 Before You Comment
 * 前三則貼文：留言真的送出去，再看它得到幾個讚、被誰讀到、刪不刪得掉，
 * 以及那張截圖沒截到的部分。同時練習「分三堆」：看得到的、聽說的、腦補的。
 * 第一則事後回頭看，第二則留言前先分，第三則由讀的人自己決定要不要分。
 * 最後一則，被截圖的人換成讀的人自己。
 * 和《聽見光譜》共用配色、字體與元件，視覺規範見專案根目錄的 DESIGN.md。
 * ========================================================================== */

const SPECTRUM_URL = "https://claude.ai/artifact/2G1u3QVEjB1TdyyFtfebZB";
const WRAP = "mx-auto max-w-2xl px-4 sm:px-6";

const CSS = `
.font-display { font-family: "LXGW WenKai TC", "Noto Serif TC", "Songti TC", "PMingLiU", serif; }
.font-latin { font-family: "Cormorant Garamond", "Times New Roman", serif; }
.font-body { font-family: "Noto Serif TC", "Songti TC", "PMingLiU", serif; }
.shadow-warm { box-shadow: 0 10px 34px -16px rgba(120,72,20,.28); }
@keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.rise { animation: rise .5s ease both; }
.grain { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .15  0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); opacity: .1; mix-blend-mode: multiply; }
@media (prefers-reduced-motion: reduce) { .rise { animation: none; } }
`;

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Button({ children, onClick, tone = "ink", className }) {
  const tones = {
    ink: "bg-[#2B2019] text-[#FFF8EC] hover:bg-[#44342A] shadow-[0_10px_24px_-12px_rgba(43,32,25,.7)]",
    line: "border border-sand-600 bg-sand-900/60 text-sand-100 hover:bg-sand-800",
    paper: "bg-[#F7ECDD] text-[#2B2019] hover:bg-white",
  };
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400", tones[tone], className)}>
      {children}
    </button>
  );
}

/* 標誌：四個裁切角，中間一個點 */
function Mark({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M4 11 V4 H11 M21 4 H28 V11 M28 21 V28 H21 M11 28 H4 V21" fill="none" stroke="#2B2019" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="4" fill="#E8973A" />
    </svg>
  );
}

/* 裁切框的四個角 */
function CropCorners({ color = "#E8973A" }) {
  const c = "pointer-events-none absolute h-4 w-4";
  const s = { borderColor: color };
  return (
    <>
      <span aria-hidden="true" className={`${c} -left-1 -top-1 rounded-tl-md border-l-[3px] border-t-[3px]`} style={s} />
      <span aria-hidden="true" className={`${c} -right-1 -top-1 rounded-tr-md border-r-[3px] border-t-[3px]`} style={s} />
      <span aria-hidden="true" className={`${c} -bottom-1 -left-1 rounded-bl-md border-b-[3px] border-l-[3px]`} style={s} />
      <span aria-hidden="true" className={`${c} -bottom-1 -right-1 rounded-br-md border-b-[3px] border-r-[3px]`} style={s} />
    </>
  );
}

/* 截圖：一開始只看得到原貼文截的範圍；打開後，被裁掉的部分出現，原本的範圍用裁切框標出來 */
function Shot({ shot, open }) {
  const row = (l, i) => {
    if (shot.kind === "timeline" || l.side === "sys") {
      return (
        <div key={i} className={cn("flex gap-3 text-[14px] leading-relaxed", shot.kind === "chat" && "justify-center text-xs text-sand-500")}>
          {(open || shot.kind === "timeline") && l.time && <span className="shrink-0 tabular-nums text-sand-500">{open ? l.time : "　　　"}</span>}
          <span className={shot.kind === "timeline" ? "text-sand-100" : ""}>{l.text}</span>
        </div>
      );
    }
    const mine = l.side === "me";
    return (
      <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
        <div className={cn("max-w-[84%] rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed", mine ? "rounded-br-sm bg-[#3B8C8C] text-[#F4FBFA]" : "rounded-bl-sm bg-sand-800 text-sand-100")}>
          {l.text}
          {open && l.time && <span className={cn("ml-2 text-[11px] tabular-nums", mine ? "text-[#D5ECEA]" : "text-sand-500")}>{l.time}</span>}
        </div>
      </div>
    );
  };

  // 把連續的「原本就有」與「被裁掉」分成幾段，才能只在原本的範圍外面畫裁切框
  const groups = [];
  shot.lines.forEach((l, i) => {
    const cropped = Boolean(l.cropped);
    const last = groups[groups.length - 1];
    if (last && last.cropped === cropped) last.items.push([l, i]);
    else groups.push({ cropped, items: [[l, i]] });
  });

  return (
    <figure className="rounded-2xl border border-sand-800 bg-sand-950 p-3">
      <figcaption className="mb-2 flex items-center justify-between text-[11px] text-sand-500">
        <span className="flex items-center gap-1.5"><Scissors className="h-3 w-3" />{shot.caption}</span>
        <span>{open ? "完整的畫面" : "貼文裡看到的"}</span>
      </figcaption>
      <div className="space-y-2">
        {groups.map((g, gi) =>
          g.cropped ? (
            open ? (
              <div key={gi} className="rise space-y-2 rounded-xl border border-dashed border-amber-400/60 bg-amber-400/10 p-2.5">
                <div className="text-[11px] font-medium text-amber-300">被裁掉的部分</div>
                {g.items.map(([l, i]) => row(l, i))}
              </div>
            ) : (
              <div key={gi} aria-hidden="true" className="h-2 rounded-full bg-[repeating-linear-gradient(90deg,#D9C8AD_0_6px,transparent_6px_12px)] opacity-70" />
            )
          ) : (
            <div key={gi} className={cn("relative space-y-2 p-2.5", open && "rounded-lg")}>
              {open && <CropCorners />}
              {g.items.map(([l, i]) => row(l, i))}
            </div>
          )
        )}
      </div>
    </figure>
  );
}

function Avatar({ initial, color, size = "h-10 w-10 text-base" }) {
  return <span className={`font-latin flex shrink-0 items-center justify-center rounded-full font-medium text-[#FFF8EC] ${size}`} style={{ background: color }} aria-hidden="true">{initial}</span>;
}

function PostCard({ post, shot, comments, shotOpen, mine, note }) {
  const p = post;
  return (
    <article className="rounded-[1.75rem] border border-sand-800 bg-sand-900 p-4 shadow-warm sm:p-5">
      <header className="flex items-center gap-3">
        <Avatar initial={p.initial} color={p.color} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-sand-100">{p.handle}</div>
          <div className="text-xs text-sand-500">{p.time}</div>
        </div>
      </header>
      <p className="mt-3 text-[16px] leading-relaxed text-sand-50">{p.text}</p>
      {note && <p className="mt-2 rounded-xl bg-amber-400/15 px-3 py-2 text-sm text-amber-300">{note}</p>}
      <div className="mt-3"><Shot shot={shot} open={shotOpen} /></div>
      <div className="mt-3 flex gap-5 text-xs text-sand-500">
        <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />{p.likes}</span>
        <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{p.replies}</span>
        <span className="flex items-center gap-1.5"><Repeat2 className="h-4 w-4" />{p.reposts}</span>
      </div>
      <ul className="mt-3 space-y-2.5 border-t border-sand-800 pt-3">
        {mine && (
          <li className="rise flex gap-2.5 rounded-xl border border-amber-400 bg-amber-400/15 p-2.5 text-sm">
            <Avatar initial="你" color="#2B2019" size="h-6 w-6 text-xs font-display" />
            <div className="min-w-0">
              <span className="font-semibold text-sand-100">你</span>
              <span className="ml-2 text-sand-100">{mine.text}</span>
              <div className="mt-0.5 text-[11px] text-sand-500">{mine.likes.toLocaleString()} 個讚</div>
            </div>
          </li>
        )}
        {comments.map((c) => (
          <li key={c.name} className="flex gap-2.5 text-sm">
            <Avatar initial={c.name[0].toUpperCase()} color="#B9A68A" size="h-6 w-6 text-xs" />
            <div className="min-w-0">
              <span className="font-semibold text-sand-200">{c.name}</span>
              <span className="ml-2 text-sand-300">{c.text}</span>
              <div className="mt-0.5 text-[11px] text-sand-500">{c.tag || `${c.likes} 個讚`}</div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* 一段新的內容 */
function Block({ title, en, children, innerRef, tone = "amber" }) {
  const tones = { amber: "border-amber-400/40 bg-amber-400/10", plain: "border-sand-700 bg-sand-900/80 shadow-warm" };
  return (
    <section ref={innerRef} className={cn("rise scroll-mt-20 rounded-[1.75rem] border p-5 sm:p-6", tones[tone])}>
      <h3 className="font-display text-xl font-semibold text-sand-50">{title}</h3>
      {en && <p className="font-latin text-lg italic text-amber-300">{en}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const PILE_LABEL = Object.fromEntries(PILES.map((p) => [p.id, p.label]));
const PILE_TONE = { seen: "border-emerald-400 bg-emerald-400/15 text-emerald-300", told: "border-amber-400 bg-amber-400/15 text-amber-300", guess: "border-rose-400 bg-rose-400/15 text-rose-300" };

/* 分三堆。interactive 為 false 時，直接顯示答案（第一則事後回頭看用） */
function Piles({ claims, interactive, onDone }) {
  const [picks, setPicks] = useState({});
  const [checked, setChecked] = useState(!interactive);
  const all = claims.every((_, i) => picks[i]);
  const seen = claims.filter((c) => c.kind === "seen").length;
  return (
    <div>
      <ul className="space-y-3">
        {claims.map((c, i) => (
          <li key={c.text} className="rounded-2xl bg-sand-900 p-4">
            <p className="font-display text-[16px] leading-relaxed text-sand-50">{c.text}</p>
            {!checked ? (
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={`「${c.text}」屬於哪一堆`}>
                {PILES.map((p) => (
                  <button key={p.id} type="button" role="radio" aria-checked={picks[i] === p.id} onClick={() => setPicks({ ...picks, [i]: p.id })} className={cn("rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400", picks[i] === p.id ? "border-[#2B2019] bg-[#2B2019] text-[#FFF8EC]" : "border-sand-600 text-sand-300 hover:bg-sand-800")}>{p.label}</button>
                ))}
              </div>
            ) : (
              <div className="mt-2.5">
                <span className={cn("inline-block rounded-full border px-3 py-1 text-xs font-semibold", PILE_TONE[c.kind])}>{PILE_LABEL[c.kind]}</span>
                {interactive && picks[i] !== c.kind && <span className="ml-2 text-xs text-sand-500">你放在「{PILE_LABEL[picks[i]]}」</span>}
                <p className="mt-1.5 text-sm leading-relaxed text-sand-300">{c.why}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
      {!checked && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {all ? <Button onClick={() => setChecked(true)}>對答案</Button> : <span className="text-xs text-sand-500">每一句都放進一堆：{PILES.map((p) => `${p.label}（${p.hint}）`).join("、")}</span>}
        </div>
      )}
      {checked && (
        <div className="mt-4">
          <p className="text-[15px] leading-loose text-sand-200">四句話裡，真正擺在你眼前的只有 {seen} 句。其他的，不是別人告訴你的，就是你自己補上去的。</p>
          {interactive && <Button className="mt-4" onClick={onDone}>好，來留言</Button>}
        </div>
      )}
    </div>
  );
}

/* 對方手機上的通知。mine 是讀的人自己送出的那一則 */
function Phone({ owner, where, items, mine, note }) {
  return (
    <div className="rounded-[1.75rem] p-4 sm:p-5" style={{ background: "#2B2019" }}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="font-display text-lg text-[#F7ECDD]">{owner}的手機</div>
        <div className="text-right text-xs text-[#A8947D]">{where}</div>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((t, i) => (
          <li key={i} className="rounded-2xl bg-white/5 px-3.5 py-2.5">
            <div className="text-[11px] text-[#A8947D]">有人回覆了這則貼文</div>
            <div className="text-[15px] leading-relaxed text-[#E5D6C2]">{t}</div>
          </li>
        ))}
        {mine && (
          <li className="rise rounded-2xl border border-[#E8973A] bg-[#E8973A]/15 px-3.5 py-2.5">
            <div className="text-[11px] font-semibold text-[#E8B77A]">這一則是你留的</div>
            <div className="text-[15px] leading-relaxed text-[#FFF8EC]">{mine}</div>
          </li>
        )}
      </ul>
      {note && <p className="mt-3 text-sm leading-relaxed text-[#BDA98F]">{note}</p>}
    </div>
  );
}

const ORDER = {
  impulse: ["write", "sent", "crop", "before", "after"],
  guided: ["sort", "write", "sent", "crop", "before", "after"],
  free: ["choose", "write", "sent", "crop", "before", "after"],
};

function StoryView({ story, index, total, order, mode, onDone }) {
  const [steps, setSteps] = useState(ORDER[mode]);
  const [at, setAt] = useState(0);
  const [pick, setPick] = useState(null); // 還沒送出時選中的那一句
  const [sent, setSent] = useState(null); // 送出的選項 id
  const [sorted, setSorted] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const anchor = useRef(null);
  const phase = steps[at];
  const reached = (name) => steps.indexOf(name) !== -1 && steps.indexOf(name) <= at;
  const opt = (id) => story.options.find((o) => o.id === id);
  const fx = story.effect;
  const mineOpt = sent ? opt(sent) : null;
  const commented = sent && sent !== "wait";
  const likes = commented ? fx.likes[sent] : 0;

  useEffect(() => {
    if (at > 0 && anchor.current) anchor.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [at]);
  const go = () => setAt((n) => n + 1);
  const here = (name) => (phase === name ? anchor : null);

  const readerPhone = sent === "counter" ? fx.poster : fx.target;
  const phoneItems = sent === "counter" ? fx.poster.sees : story.topComments.slice(0, 2).map((c) => c.text);

  return (
    <div className={`${WRAP} pb-24 pt-6`}>
      <div className="text-xs text-sand-500">第 {index + 1} 則／共 {total} 則・{story.topic}</div>

      <div className="mt-3">
        <PostCard post={story.post} shot={story.shot} comments={story.topComments} shotOpen={reached("crop")} mine={commented && !deleted && reached("sent") ? { text: mineOpt.text, likes } : null} />
      </div>

      <div className="mt-4 space-y-4">
        {phase === "choose" && (
          <Block tone="plain" title="這一則，沒有人提醒你" innerRef={here("choose")}>
            <p className="text-[15px] leading-loose text-sand-300">你可以先把這則貼文分成三堆，也可以直接留言。</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => { setSteps(["choose", "sort", ...ORDER.impulse]); go(); }}>先分三堆</Button>
              <Button tone="line" onClick={go}>直接留言</Button>
            </div>
          </Block>
        )}

        {reached("sort") && (
          <Block title="留言之前，先分三堆" en="Seen, told, or guessed" innerRef={here("sort")}>
            {phase === "sort" ? (
              <Piles claims={story.claims} interactive onDone={() => { setSorted(true); go(); }} />
            ) : (
              <p className="text-[15px] leading-loose text-sand-200">你分過了：四句話裡，真正擺在眼前的只有 {story.claims.filter((c) => c.kind === "seen").length} 句。</p>
            )}
          </Block>
        )}

        {phase === "write" && (
          <Block tone="plain" title="看完這則，你想留什麼？" innerRef={here("write")}>
            <p className="-mt-2 text-xs text-sand-500">選最接近你會打的那一句。按下去就會送出。</p>
            <div className="mt-4 space-y-2" role="radiogroup" aria-label="你的留言">
              {order.map((id) => (
                <button key={id} type="button" role="radio" aria-checked={pick === id} onClick={() => setPick(id)} className={cn("w-full rounded-2xl border px-4 py-3 text-left text-[15px] leading-relaxed transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400", pick === id ? "border-amber-400 bg-amber-400/15 text-sand-50" : "border-sand-700 bg-sand-950/60 text-sand-200 hover:border-sand-500")}>
                  {opt(id).text}
                </button>
              ))}
            </div>
            {pick && <Button className="mt-5" onClick={() => { setSent(pick); go(); }}>{pick === "wait" ? "滑過去" : "送出留言"}</Button>}
          </Block>
        )}

        {reached("sent") && (
          <Block tone="plain" title={commented ? "送出了" : "你滑過去了"} innerRef={here("sent")}>
            {commented ? (
              <>
                <div className="flex items-baseline gap-2">
                  <NumberTicker value={likes} className="font-latin text-6xl font-medium text-sand-50" />
                  <span className="text-sm text-sand-400">個讚</span>
                </div>
                <p className="mt-3 text-[15px] leading-loose text-sand-300">
                  {mineOpt.heat ? "不到一個小時，你的留言被推到很前面。這大概是你今天最多人按讚的一句話。" : "你的留言很快就被新的留言洗下去了。問問題的留言，通常不會被推到前面。"}
                </p>
              </>
            ) : (
              <p className="text-[15px] leading-loose text-sand-300">你什麼都沒留。這則貼文繼續往上衝，留言數每分鐘都在跳。</p>
            )}
            {phase === "sent" && <Button className="mt-5" onClick={go}>十二個小時後</Button>}
          </Block>
        )}

        {reached("crop") && (
          <Block title="那張截圖沒截到的部分" en="What was cropped out" innerRef={here("crop")}>
            <p className="text-[15px] leading-loose text-sand-200">{story.shot.note}</p>
            <p className="mt-2 text-xs text-sand-500">往上看那張截圖：橘色框是原本貼出來的範圍，虛線框是被裁掉的。</p>
            {phase === "crop" && <Button className="mt-5" onClick={go}>發文的前一天</Button>}
          </Block>
        )}

        {reached("before") && (
          <Block title="發文的前一天" en="The day before" innerRef={here("before")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {story.dayBefore.map((d) => (
                <div key={d.who} className="rounded-2xl bg-sand-900 p-4">
                  <div className="text-xs font-medium text-sand-500">{d.who}</div>
                  <p className="mt-1.5 text-[15px] leading-loose text-sand-100">{d.text}</p>
                </div>
              ))}
            </div>
            {phase === "before" && <Button className="mt-5" onClick={go}>{commented ? "我的留言後來去了哪裡" : "後來發生的事"}</Button>}
          </Block>
        )}

        {reached("after") && (
          <Block title={commented ? "你的留言，後來去了哪裡" : "後來"} en="Where it went" innerRef={here("after")}>
            <Phone owner={readerPhone.owner} where={readerPhone.where} items={phoneItems} mine={mineOpt && mineOpt.heat ? mineOpt.text : null} note={mineOpt.heat ? null : commented ? "這些通知裡也有你的那一則，在很下面。它是少數沒有罵人的。" : "這些通知裡，沒有你。"} />
            <p className="font-display mt-4 text-[17px] leading-loose text-sand-50">{fx[sent]}</p>

            {mineOpt.heat && (
              <div className="mt-4 rounded-2xl border border-sand-700 bg-sand-900 p-4">
                {!deleted ? (
                  <>
                    <p className="text-sm leading-relaxed text-sand-300">看到這裡，你可以把留言刪掉。</p>
                    <Button tone="line" className="mt-3" onClick={() => setDeleted(true)}>刪除我的留言</Button>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-sand-100">留言已刪除</div>
                    <p className="mt-1.5 text-[15px] leading-loose text-sand-300">{fx.del}</p>
                  </>
                )}
              </div>
            )}

            <ol className="mt-5 space-y-3 border-t border-amber-400/30 pt-5">
              {story.after.map((t, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-loose text-sand-100">
                  <span className="font-latin mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-400/60 text-sm italic text-amber-300">{i + 1}</span>{t}
                </li>
              ))}
              <li className="flex gap-3 text-[15px] leading-loose text-sand-100">
                <span className="font-latin mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-400/60 text-sm italic text-amber-300">{story.after.length + 1}</span>{fx.correction}
              </li>
            </ol>
            <p className="font-display mt-5 text-[17px] leading-loose text-sand-50">{story.closing}</p>

            {mode === "impulse" && (
              <div className="mt-6 border-t border-amber-400/30 pt-5">
                <h4 className="font-display text-lg font-semibold text-sand-50">回頭看：你留言的時候，手上有什麼</h4>
                <p className="mt-1 text-sm leading-relaxed text-sand-400">把那則貼文拆成三堆：看得到的、聽說的、腦補的。下一則開始，換你自己分。</p>
                <div className="mt-4"><Piles claims={story.claims} interactive={false} /></div>
              </div>
            )}
            <Button className="mt-6" onClick={() => onDone({ kind: sent, sorted })}>{index < total - 2 ? "看下一則" : "看最後一則"}</Button>
          </Block>
        )}
      </div>
    </div>
  );
}

/* 最後一則：被截圖的人是讀的人自己。底下的留言，是前三則留過的那幾種話 */
function MirrorRound({ results, total, onRestart }) {
  const [at, setAt] = useState(0);
  const anchor = useRef(null);
  useEffect(() => {
    if (at > 0 && anchor.current) anchor.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [at]);
  const names = ["sunny_side", "walk.slow", "tofu_cat"];
  const comments = results.map((r, i) => (r.kind === "wait" ? null : { name: names[i], text: MIRROR.comments[r.kind][i], tag: `跟你在第 ${i + 1} 則留的，是同一種話` })).filter(Boolean);
  const asked = results.some((r) => r.kind === "ask");
  const allQuiet = comments.length === 0;
  const last = results[results.length - 1];

  return (
    <div className={`${WRAP} pb-24 pt-6`}>
      <div className="text-xs text-sand-500">第 {total} 則／共 {total} 則・換你</div>
      <h2 className="font-display mt-2 text-3xl font-semibold text-sand-50">最後一則有點不一樣</h2>
      <p className="mt-2 text-[15px] leading-loose text-sand-300">這一次，被截圖的人是你。</p>

      <div className="mt-4">
        <PostCard post={MIRROR.post} shot={MIRROR.shot} comments={comments} shotOpen={at >= 1} note="這張截圖裡，綠色那一邊說話的人是你。" />
      </div>
      {allQuiet && <p className="mt-3 text-sm leading-relaxed text-sand-400">底下有兩千多則留言。也有很多人滑過去了，什麼都沒留，就像你前三則一樣。</p>}

      <div className="mt-4 space-y-4">
        {at === 0 && <Button onClick={() => setAt(1)}>打開完整的對話</Button>}
        {at >= 1 && (
          <Block title="你知道完整的經過" en="You know the rest" innerRef={at === 1 ? anchor : null}>
            <p className="text-[15px] leading-loose text-sand-200">因為那是你的對話。你記得小魚欠了多少，記得自己隔天還是去了醫院。</p>
            <p className="mt-3 text-[15px] leading-loose text-sand-200">
              底下 2,104 則留言裡，{asked ? "只有一則問了前後文。跟你那時候留的，是同一句。" : "沒有人問你前後文。"}
            </p>
            {at === 1 && <Button className="mt-5" onClick={() => setAt(2)}>然後呢</Button>}
          </Block>
        )}
        {at >= 2 && (
          <section ref={anchor} className="rise scroll-mt-20 rounded-[1.75rem] p-6 sm:p-8" style={{ background: "#2B2019" }}>
            <p className="font-display text-[1.7rem] leading-loose text-[#F7ECDD] sm:text-4xl sm:leading-[1.7]" style={{ textWrap: "balance" }}>每一張截圖外面，都有一個知道全部經過的人。</p>
            <p className="font-latin mt-3 text-2xl italic text-[#E8B77A]">Someone knows the rest.</p>
            <p className="mt-6 text-[15px] leading-loose text-[#D9C8B4]">
              {last.sorted ? "第三則沒有人提醒你，你還是先分了三堆。這就是不捕風捉影的樣子：先看清楚手上有什麼，再開口。" : "第三則沒有人提醒，你直接留了言。這很正常，習慣要練很多次才會變成反射。"}
            </p>
            <p className="mt-3 text-[15px] leading-loose text-[#D9C8B4]">下次滑到讓你火大的貼文，先分三堆：看得到的、聽說的、腦補的。只對第一堆說話。</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button tone="paper" onClick={onRestart}>再走一次</Button>
              <a href={SPECTRUM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-[#7A6652] px-6 py-3 text-sm font-semibold text-[#F7ECDD] transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">同系列：聽見光譜</a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Landing({ onStart }) {
  const sample = STORIES[0];
  const steps = [
    ["留言", "Comment", "你滑到一則讓人火大的貼文，留下第一個反應。這一次，它會真的送出去。"],
    ["看它去了哪裡", "Follow it", "得到幾個讚、被誰讀到、刪不刪得掉。還有那張截圖沒截到的部分。"],
    ["分三堆", "Sort", "練習把一則貼文拆開：看得到的、聽說的、腦補的。"],
  ];
  return (
    <div className="font-body">
      <header className={`${WRAP} pb-6 pt-6 sm:pt-10`}>
        <BlurFade duration={0.6} offset={10}>
          <h1 className="font-display text-[3.2rem] font-semibold leading-tight text-sand-50 sm:text-7xl">先別急著<br />留言</h1>
          <p className="font-latin mt-2 text-2xl italic text-amber-300 sm:text-4xl">Before You Comment</p>
        </BlurFade>
        <BlurFade delay={0.2} duration={0.6}>
          <p className="mt-6 max-w-lg text-[16px] leading-loose text-sand-300">網路上最容易吵起來的貼文，常常只是一張被裁過的截圖。這裡有四則貼文。前三則，你留言，然後看看那句話後來去了哪裡。最後一則，換你被截圖。</p>
          <div className="font-sans mt-7 flex flex-wrap items-center gap-4">
            <Button onClick={onStart}>開始看第一則</Button>
            <span className="text-xs text-sand-500">四則貼文，大約十分鐘</span>
          </div>
        </BlurFade>
      </header>

      <BlurFade delay={0.4} duration={0.7}>
        <div className={`${WRAP} mt-6`}>
          <div className="font-sans" aria-hidden="true"><PostCard post={sample.post} shot={sample.shot} comments={sample.topComments.slice(0, 1)} shotOpen={false} /></div>
          <p className="mt-4 text-center text-sm text-sand-500">這張截圖上下各有一條虛線。虛線外面，還有東西。</p>
        </div>
      </BlurFade>

      <section className={`${WRAP} mt-20`}>
        <ol className="space-y-8">
          {steps.map(([t, en, d], i) => (
            <li key={t} className="relative flex gap-5">
              {i < steps.length - 1 && <span aria-hidden="true" className="absolute left-7 top-14 h-[calc(100%-1.5rem)] w-px bg-sand-700" />}
              <span className="font-latin relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-amber-400/60 bg-sand-900 text-2xl italic text-amber-300">0{i + 1}</span>
              <div>
                <h2 className="font-display text-xl font-semibold text-sand-50">{t}<span className="font-latin ml-2.5 text-lg font-normal italic text-amber-300">{en}</span></h2>
                <p className="mt-2 text-[15px] leading-loose text-sand-400">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-20" style={{ background: "#2B2019" }}>
        <section className={`${WRAP} py-16`}>
          <p className="font-display text-[1.7rem] leading-loose text-[#F7ECDD] sm:text-4xl sm:leading-[1.7]" style={{ textWrap: "balance" }}>不是要你不生氣。只是在按下送出之前，先看清楚手上有什麼。</p>
          <p className="font-latin mt-4 text-2xl italic text-[#E8B77A]">Know what you actually saw.</p>
          <div className="font-sans mt-8"><Button tone="paper" onClick={onStart}>開始看第一則</Button></div>
          <div className="font-sans mt-12 grid gap-6 border-t border-white/10 pt-8 text-[13px] leading-relaxed text-[#BDA98F] sm:grid-cols-2">
            <p>貼文、帳號和人物都是虛構的，情節取材自常見的網路爭議。你的選擇只留在這個頁面裡，不會被傳送或儲存，也不會真的發到任何地方。</p>
            <p>同系列的另一個作品：<a href={SPECTRUM_URL} target="_blank" rel="noreferrer" className="text-[#F7ECDD] underline decoration-[#7A6652] underline-offset-4">聽見光譜</a>，關於我們怎麼說話，又怎麼被聽見。</p>
          </div>
        </section>
      </div>
    </div>
  );
}

const MODES = ["impulse", "guided", "free"];

export default function App() {
  const [view, setView] = useState("landing"); // landing | story | mirror
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]); // 每一則：留了哪一種話、有沒有先分三堆
  const [run, setRun] = useState(0);
  const orders = useMemo(() => STORIES.map((s) => shuffle(s.options.map((o) => o.id))), [run]);
  const total = STORIES.length + 1;

  const top = () => window.scrollTo({ top: 0 });
  const start = () => {
    setRun((n) => n + 1);
    setResults([]);
    setIndex(0);
    setView("story");
    top();
  };
  const done = (r) => {
    setResults([...results, r]);
    if (index < STORIES.length - 1) setIndex(index + 1);
    else setView("mirror");
    top();
  };

  return (
    <div className="relative min-h-screen bg-sand-950 text-sand-100 antialiased">
      <style>{CSS}</style>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-rose-500/15 blur-3xl" />
        <div className="grain absolute inset-0" />
      </div>
      <div className={view === "landing" ? "sticky top-0 z-30 border-b border-sand-800/60 bg-sand-950/80 backdrop-blur-md" : "relative z-20"}>
        <div className={`${WRAP} flex items-center justify-between py-3`}>
          <button type="button" onClick={() => { setView("landing"); top(); }} className="-my-1 flex items-center gap-2 rounded-full py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" aria-label="先別急著留言，回到首頁">
            <Mark />
            <span className="font-display text-lg font-semibold tracking-[0.08em] text-sand-50">先別急著留言</span>
          </button>
          {view !== "landing" && <button type="button" onClick={() => { setView("landing"); top(); }} className="rounded-full border border-sand-800 px-3.5 py-2 text-xs text-sand-500 hover:text-sand-300">離開</button>}
        </div>
      </div>
      <main className="relative">
        {view === "landing" && <Landing onStart={start} />}
        {view === "story" && <StoryView key={`${run}-${index}`} story={STORIES[index]} index={index} total={total} order={orders[index]} mode={MODES[index]} onDone={done} />}
        {view === "mirror" && <MirrorRound key={run} results={results} total={total} onRestart={start} />}
      </main>
    </div>
  );
}
