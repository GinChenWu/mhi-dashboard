import React, { useEffect, useMemo, useRef, useState } from "react";
import { Heart, MessageCircle, Repeat2, Scissors } from "lucide-react";
import { BlurFade } from "@/components/magicui/blur-fade";
import { cn } from "@/lib/utils";
import { QUESTIONS, STAGES, STORIES } from "./stories.js";

/* ============================================================================
 * 《先別急著留言》 Before You Comment
 * 三則貼文，每一則先寫下想留的話（先不送出），再多看三層：
 * 沒被截到的部分 → 發文的前一天 → 後來。每打開一層，問一次草稿要不要改。
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

function PostCard({ story, shotOpen }) {
  const p = story.post;
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
      <div className="mt-3"><Shot shot={story.shot} open={shotOpen} /></div>
      <div className="mt-3 flex gap-5 text-xs text-sand-500">
        <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />{p.likes}</span>
        <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{p.replies}</span>
        <span className="flex items-center gap-1.5"><Repeat2 className="h-4 w-4" />{p.reposts}</span>
      </div>
      <ul className="mt-3 space-y-2.5 border-t border-sand-800 pt-3">
        {story.topComments.map((c) => (
          <li key={c.name} className="flex gap-2.5 text-sm">
            <Avatar initial={c.name[0].toUpperCase()} color="#B9A68A" size="h-6 w-6 text-xs" />
            <div className="min-w-0">
              <span className="font-semibold text-sand-200">{c.name}</span>
              <span className="ml-2 text-sand-300">{c.text}</span>
              <div className="mt-0.5 text-[11px] text-sand-500">{c.likes} 個讚</div>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

/* 一層新資訊 */
function Layer({ title, en, children, innerRef }) {
  return (
    <section ref={innerRef} className="rise scroll-mt-24 rounded-[1.75rem] border border-amber-400/40 bg-amber-400/10 p-5 sm:p-6">
      <h3 className="font-display text-xl font-semibold text-sand-50">{title}</h3>
      <p className="font-latin text-lg italic text-amber-300">{en}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StoryView({ story, index, total, order, onDone }) {
  const [stage, setStage] = useState(0); // 0 第一眼 → 1 沒被截到的 → 2 前一天 → 3 後來 → 4 回顧
  const [trail, setTrail] = useState([]); // 每個階段結束時的草稿（選項 id）
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(true);
  const anchor = useRef(null);
  const opt = (id) => story.options.find((o) => o.id === id);

  useEffect(() => {
    if (stage > 0 && anchor.current) anchor.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stage]);

  const advance = () => {
    const next = [...trail, draft];
    setTrail(next);
    setEditing(false);
    setStage(stage + 1);
  };
  const nextLabel = ["先放著，看看沒被截到的部分", "再往前一天看", "看後來發生的事", "看這一則的回顧"][stage];
  const first = trail.length ? opt(trail[0]) : null;
  const last = draft ? opt(draft) : null;

  return (
    <div className={`${WRAP} pb-24 pt-6`}>
      <div className="text-xs text-sand-500">第 {index + 1} 則／共 {total} 則・{story.topic}</div>
      <ol className="mt-2 flex items-center gap-1.5 text-xs" aria-label="這一則的進度">
        {STAGES.map((s, i) => (
          <li key={s} aria-current={Math.min(stage, 3) === i ? "step" : undefined} className={cn("whitespace-nowrap rounded-full px-2.5 py-1", i <= Math.min(stage, 3) ? "bg-sand-800 text-sand-100" : "text-sand-600")}>{s}</li>
        ))}
      </ol>

      <div className="mt-4"><PostCard story={story} shotOpen={stage >= 1} /></div>

      <div className="mt-4 space-y-4">
        {stage >= 1 && (
          <Layer innerRef={stage === 1 ? anchor : null} title="沒被截到的部分" en="What was cropped out">
            <p className="text-[15px] leading-loose text-sand-200">{story.shot.note}</p>
            <p className="mt-2 text-xs text-sand-500">往上看那張截圖：橘色框是原本貼出來的範圍，虛線框是被裁掉的。</p>
          </Layer>
        )}
        {stage >= 2 && (
          <Layer innerRef={stage === 2 ? anchor : null} title="發文的前一天" en="The day before">
            <div className="grid gap-3 sm:grid-cols-2">
              {story.dayBefore.map((d) => (
                <div key={d.who} className="rounded-2xl bg-sand-900 p-4">
                  <div className="text-xs font-medium text-sand-500">{d.who}</div>
                  <p className="mt-1.5 text-[15px] leading-loose text-sand-100">{d.text}</p>
                </div>
              ))}
            </div>
          </Layer>
        )}
        {stage >= 3 && (
          <Layer innerRef={stage === 3 ? anchor : null} title="後來" en="Afterwards">
            <ol className="space-y-3">
              {story.after.map((t, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-loose text-sand-100">
                  <span className="font-latin mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-400/60 text-sm italic text-amber-300">{i + 1}</span>{t}
                </li>
              ))}
            </ol>
          </Layer>
        )}
      </div>

      {stage < 4 ? (
        <section className="mt-6 rounded-[1.75rem] border border-sand-700 bg-sand-900/80 p-5 shadow-warm sm:p-6" aria-label="你的留言草稿">
          <h3 className="font-display text-lg font-semibold text-sand-50">{stage === 0 ? "看完這則，你想留什麼？" : "看到這裡，草稿要改嗎？"}</h3>
          <p className="mt-1 text-xs text-sand-500">{stage === 0 ? "選最接近你會打的那一句。它會先放在草稿裡，不會送出。" : "草稿還沒送出。可以維持，也可以換一句。"}</p>

          {draft && !editing && (
            <div className="mt-4 flex items-start gap-2.5">
              <Avatar initial="你" color="#2B2019" size="h-8 w-8 text-sm font-display" />
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-dashed border-sand-600 bg-sand-950 px-4 py-3">
                <div className="text-[11px] text-sand-500">草稿・還沒送出</div>
                <p className="mt-0.5 text-[15px] leading-relaxed text-sand-100">{last.text}</p>
              </div>
            </div>
          )}

          {editing && (
            <div className="mt-4 space-y-2" role="radiogroup" aria-label="留言草稿">
              {order.map((id) => {
                const o = opt(id);
                const on = draft === id;
                return (
                  <button key={id} type="button" role="radio" aria-checked={on} onClick={() => setDraft(id)} className={cn("w-full rounded-2xl border px-4 py-3 text-left text-[15px] leading-relaxed transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400", on ? "border-amber-400 bg-amber-400/15 text-sand-50" : "border-sand-700 bg-sand-950/60 text-sand-200 hover:border-sand-500")}>
                    {o.text}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {draft && <Button onClick={advance}>{nextLabel}</Button>}
            {draft && !editing && <Button tone="line" onClick={() => setEditing(true)}>改一下草稿</Button>}
          </div>
        </section>
      ) : (
        <section ref={anchor} className="rise mt-6 scroll-mt-24 rounded-[1.75rem] p-6 sm:p-8" style={{ background: "#2B2019" }}>
          <h3 className="font-display text-2xl font-semibold text-[#F7ECDD]">這一則的回顧</h3>
          <p className="font-latin text-lg italic text-[#E8B77A]">Looking back</p>

          <div className="mt-5 space-y-4">
            <div>
              <div className="text-xs text-[#A8947D]">如果你在第一眼就送出，留在那裡的會是</div>
              <p className="font-display mt-1 text-[17px] leading-relaxed text-[#F7ECDD]">{first.text}</p>
            </div>
            <div>
              <div className="text-xs text-[#A8947D]">看完三層之後，你的草稿是</div>
              <p className="font-display mt-1 text-[17px] leading-relaxed text-[#F7ECDD]">{last.text}</p>
            </div>
            <p className="border-t border-white/10 pt-4 text-[15px] leading-loose text-[#D9C8B4]">
              {first.heat && last.heat && "你的看法沒有變。第一眼的判斷有時候是對的，只是這一則的第一眼，是別人裁好給你看的。"}
              {first.heat && !last.heat && `你在看到「${STAGES[trail.findIndex((id) => !opt(id).heat)] || "後來"}」的時候換了一句。如果當時直接送出，那則留言現在還在那裡。`}
              {!first.heat && last.heat && "你一開始沒有急著下結論，看得越多反而越有話想說。這也很真實：知道得多，不一定比較容易平靜。"}
              {!first.heat && !last.heat && "你從第一眼就沒有急著下結論。這在留言區裡，其實是很少見的。"}
            </p>
            <p className="font-display text-[17px] leading-loose text-[#F7ECDD]">{story.closing}</p>
          </div>

          <Button tone="paper" className="mt-6" onClick={() => onDone([...trail])}>{index < total - 1 ? "看下一則" : "看我的三則草稿"}</Button>
        </section>
      )}
    </div>
  );
}

/* 最後：三則的草稿對照，加一張留言前的小卡 */
function Summary({ trails, onRestart }) {
  const [copied, setCopied] = useState(null);
  const rows = STORIES.map((s, i) => {
    const opt = (id) => s.options.find((o) => o.id === id);
    const t = trails[i];
    return { s, first: opt(t[0]), last: opt(t[t.length - 1]), changedAt: t.findIndex((id, k) => k > 0 && id !== t[0]) };
  });
  const hotFirst = rows.filter((r) => r.first.heat).length;
  const cooled = rows.filter((r) => r.first.heat && !r.last.heat).length;
  const stayedHot = rows.filter((r) => r.first.heat && r.last.heat).length;
  const title = hotFirst === 0 ? "習慣先問一句的人" : cooled === hotFirst ? "看到全貌就會停下來的人" : stayedHot === hotFirst ? "相信第一眼的人" : "有時候會停下來的人";
  const text =
    hotFirst === 0
      ? "三則貼文，你都沒有急著下結論。留言區很需要這樣的人，雖然這樣的留言通常不會被推到最上面。"
      : cooled === hotFirst
        ? `有 ${hotFirst} 則你第一眼想說重話，但多看幾層之後都換了一句。你不是沒有情緒，只是願意等一下。`
        : stayedHot === hotFirst
          ? "多看了三層，你的想法大多沒有變。第一眼的判斷有時候是對的。只是在網路上，第一眼通常是別人幫你裁好的。"
          : `有 ${hotFirst} 則你第一眼想說重話，其中 ${cooled} 則後來換了一句。哪些事會讓你停下來、哪些不會，可以留意一下。`;
  const card = [`先別急著留言｜${title}`, ...QUESTIONS.map((q, i) => `${i + 1}. ${q}`)].join("\n");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(card);
      setCopied("ok");
      setTimeout(() => setCopied(null), 2200);
    } catch {
      setCopied("fail");
    }
  };

  return (
    <div className={`${WRAP} pb-20 pt-8`}>
      <h1 className="font-display text-4xl font-semibold text-sand-50">你的三則草稿</h1>
      <p className="font-latin text-2xl italic text-amber-300">Three drafts</p>

      <ol className="mt-8 space-y-4">
        {rows.map(({ s, first, last, changedAt }) => (
          <li key={s.id} className="rounded-[1.75rem] border border-sand-800 bg-sand-900 p-5">
            <div className="text-xs text-sand-500">{s.topic}・{s.post.handle}</div>
            <p className="mt-1 text-sm leading-relaxed text-sand-400">{s.post.text}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-sand-950 p-3.5">
                <dt className="text-[11px] text-sand-500">第一眼的草稿</dt>
                <dd className="font-display mt-1 text-[16px] leading-relaxed text-sand-100">{first.text}</dd>
              </div>
              <div className={cn("rounded-2xl p-3.5", first.id === last.id ? "bg-sand-950" : "border border-amber-400/50 bg-amber-400/10")}>
                <dt className="text-[11px] text-sand-500">{first.id === last.id ? "最後的草稿（沒有改）" : `最後的草稿（在「${STAGES[changedAt]}」之後改的）`}</dt>
                <dd className="font-display mt-1 text-[16px] leading-relaxed text-sand-100">{last.text}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>

      <section className="mt-8 rounded-[2rem] border border-amber-400/50 bg-gradient-to-br from-amber-400/15 via-sand-900 to-rose-400/10 p-6 shadow-warm sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-sand-50">帶走的小卡</h2>
        <p className="font-latin text-lg italic text-amber-300">Before you comment</p>
        <div className="mt-5">
          <div className="text-xs text-sand-500">這一輪的你</div>
          <div className="font-display mt-1 text-xl font-semibold text-sand-50">{title}</div>
          <p className="mt-1 text-[15px] leading-loose text-sand-200">{text}</p>
        </div>
        <div className="mt-5">
          <div className="text-xs text-sand-500">下次想留言之前，可以先問自己三件事</div>
          <ol className="mt-2 space-y-2">
            {QUESTIONS.map((q, i) => (
              <li key={q} className="font-display flex gap-3 text-[17px] leading-relaxed text-sand-50">
                <span className="font-latin flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-400/60 text-base italic text-amber-300">{i + 1}</span>{q}
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-6 border-t border-sand-700 pt-4">
          <Button tone="line" onClick={copy}>{copied === "ok" ? "已複製，可以貼到備忘錄" : "複製小卡文字"}</Button>
          {copied === "fail" && <p className="mt-2 text-xs text-sand-500">這個瀏覽器不允許自動複製，請長按上面的文字自行複製。</p>}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={onRestart}>再走一次</Button>
        <a href={SPECTRUM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-sand-600 bg-sand-900/60 px-6 py-3 text-sm font-semibold text-sand-100 transition hover:bg-sand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">同系列：聽見光譜</a>
      </div>
    </div>
  );
}

function Landing({ onStart }) {
  const sample = STORIES[0];
  const steps = [
    ["第一眼", "First look", "你滑到一則讓人火大的貼文，寫下第一個想留的話。先放在草稿，不送出。"],
    ["多看三層", "Three layers", "沒被截到的部分、發文的前一天、後來發生的事。一層一層打開。"],
    ["再決定", "Then decide", "每打開一層，問你一次：草稿要維持，還是換一句？"],
  ];
  return (
    <div className="font-body">
      <header className={`${WRAP} pb-6 pt-6 sm:pt-10`}>
        <BlurFade duration={0.6} offset={10}>
          <h1 className="font-display text-[3.2rem] font-semibold leading-tight text-sand-50 sm:text-7xl">先別急著<br />留言</h1>
          <p className="font-latin mt-2 text-2xl italic text-amber-300 sm:text-4xl">Before You Comment</p>
        </BlurFade>
        <BlurFade delay={0.2} duration={0.6}>
          <p className="mt-6 max-w-lg text-[16px] leading-loose text-sand-300">網路上最容易吵起來的貼文，常常只是一張被裁過的截圖。這裡有三則你可能滑到過的貼文，每一則，我們多看三層。</p>
          <div className="font-sans mt-7 flex flex-wrap items-center gap-4">
            <Button onClick={onStart}>開始看第一則</Button>
            <span className="text-xs text-sand-500">三則貼文，大約八分鐘</span>
          </div>
        </BlurFade>
      </header>

      <BlurFade delay={0.4} duration={0.7}>
        <div className={`${WRAP} mt-6`}>
          <div className="relative rounded-[1.75rem] border border-sand-800 bg-sand-900 p-4 shadow-[0_40px_90px_-45px_rgba(120,72,20,.6)] sm:p-5" aria-hidden="true">
            <div className="flex items-center gap-3">
              <Avatar initial={sample.post.initial} color={sample.post.color} />
              <div><div className="text-sm font-semibold text-sand-100">{sample.post.handle}</div><div className="text-xs text-sand-500">{sample.post.time}</div></div>
            </div>
            <p className="font-sans mt-3 text-[16px] leading-relaxed text-sand-50">{sample.post.text}</p>
            <div className="font-sans mt-3"><Shot shot={sample.shot} open={false} /></div>
            <div className="font-sans mt-3 flex gap-5 text-xs text-sand-500">
              <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />{sample.post.likes}</span>
              <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />{sample.post.replies}</span>
              <span className="flex items-center gap-1.5"><Repeat2 className="h-4 w-4" />{sample.post.reposts}</span>
            </div>
          </div>
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
          <p className="font-display text-[1.7rem] leading-loose text-[#F7ECDD] sm:text-4xl sm:leading-[1.7]" style={{ textWrap: "balance" }}>不是要你不生氣。只是在按下送出之前，多看一眼。</p>
          <p className="font-latin mt-4 text-2xl italic text-[#E8B77A]">Look once more before you post.</p>
          <div className="font-sans mt-8"><Button tone="paper" onClick={onStart}>開始看第一則</Button></div>
          <div className="font-sans mt-12 grid gap-6 border-t border-white/10 pt-8 text-[13px] leading-relaxed text-[#BDA98F] sm:grid-cols-2">
            <p>貼文、帳號和人物都是虛構的，情節取材自常見的網路爭議。你的選擇只留在這個頁面裡，不會被傳送或儲存。</p>
            <p>同系列的另一個作品：<a href={SPECTRUM_URL} target="_blank" rel="noreferrer" className="text-[#F7ECDD] underline decoration-[#7A6652] underline-offset-4">聽見光譜</a>，關於我們怎麼說話，又怎麼被聽見。</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("landing"); // landing | story | summary
  const [index, setIndex] = useState(0);
  const [trails, setTrails] = useState([]);
  const [run, setRun] = useState(0);
  const orders = useMemo(() => STORIES.map((s) => shuffle(s.options.map((o) => o.id))), [run]);

  const top = () => window.scrollTo({ top: 0 });
  const start = () => {
    setRun((n) => n + 1);
    setTrails([]);
    setIndex(0);
    setView("story");
    top();
  };
  const done = (trail) => {
    const next = [...trails, trail];
    setTrails(next);
    if (index < STORIES.length - 1) setIndex(index + 1);
    else setView("summary");
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
        {view === "story" && <StoryView key={`${run}-${index}`} story={STORIES[index]} index={index} total={STORIES.length} order={orders[index]} onDone={done} />}
        {view === "summary" && <Summary trails={trails} onRestart={start} />}
      </main>
    </div>
  );
}
