import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  User,
  Users,
  Coffee,
  Heart,
  KeyRound,
  Luggage,
  Mail,
  Moon,
  Timer,
  VolumeX,
  Wind,
  Brain,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  HeartPulse,
  Hourglass,
  Languages,
  Lock,
  MessageCircle,
  Quote,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Waypoints,
} from "lucide-react";

/* ============================================================================
 * 《溝通光譜：在終焉之前》 The Communication Spectrum: Before the End
 * 單檔 React 元件：資料層（劇本／量表）→ 計分引擎 → 視覺隱喻引擎 → 五個視圖
 * ========================================================================== */

/* ------------------------------- 全域樣式 -------------------------------- */

const GLOBAL_CSS = `
.shadow-warm { box-shadow: 0 10px 34px -16px rgba(120,72,20,.28); }
@keyframes threadFlow { to { stroke-dashoffset: -44; } }
.thread { animation: threadFlow 2.4s linear infinite; }
.font-display { font-family: "LXGW WenKai TC", "Noto Serif TC", "Songti TC", "PMingLiU", "Source Han Serif TC", serif; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.fade-up { animation: fadeUp .55s ease both; }
@keyframes drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-24px) scale(1.08); } }
.orb { animation: drift 16s ease-in-out infinite; }
.sig { transform-box: fill-box; transform-origin: center; opacity: 0; }
@keyframes sigWarm { 0% { transform: translate(0,0); opacity: 0; } 15% { opacity: 1; } 50% { transform: translate(150px,-12px); } 85% { opacity: 1; } 100% { transform: translate(300px,0); opacity: 0; } }
.sig-warm { animation: sigWarm 2.6s ease-in-out infinite; }
@keyframes sigNeutral { 0% { transform: translate(0,0); opacity: 0; } 15% { opacity: .7; } 85% { opacity: .7; } 100% { transform: translate(300px,0); opacity: 0; } }
.sig-neutral { animation: sigNeutral 3s linear infinite; }
@keyframes sigCold { 0% { transform: translate(0,0) rotate(0deg); opacity: 0; } 15% { opacity: .9; } 100% { transform: translate(135px,96px) rotate(90deg); opacity: 0; } }
.sig-cold { animation: sigCold 3.2s ease-in infinite; }
@keyframes sigSpike { 0% { transform: translate(0,0); opacity: 0; } 10% { opacity: 1; } 68% { transform: translate(258px,0); opacity: 1; } 78% { transform: translate(246px,0); opacity: .9; } 100% { transform: translate(250px,0); opacity: 0; } }
.sig-spike { animation: sigSpike .95s cubic-bezier(.5,0,.9,.4) infinite; }
@keyframes ecgScroll { from { transform: translateX(0); } to { transform: translateX(-600px); } }
.ecg-scroll { animation: ecgScroll 6s linear infinite; }
@keyframes halo { 0%,100% { opacity: .15; transform: scale(1); } 50% { opacity: .5; transform: scale(1.12); } }
.halo { transform-box: fill-box; transform-origin: center; animation: halo 2.6s ease-in-out infinite; }
.wall { transform-box: fill-box; transform-origin: bottom; transition: transform .7s cubic-bezier(.2,.9,.3,1.2), opacity .4s; }
.fig { transition: opacity .9s ease, filter .9s ease; }
.amp { transition: transform 1.2s ease; }
.sand { transition: transform 1.2s ease; }
@keyframes dotBounce { 0%,80%,100% { transform: translateY(0); opacity: .4; } 40% { transform: translateY(-4px); opacity: 1; } }
.typing-dot { animation: dotBounce 1.1s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .orb, .ecg-scroll, .halo, .fade-up { animation: none; }
  .sig { animation-duration: 6s; }
}
`;

/* ------------------------------- 資料：角色 ------------------------------- */

const CAST = {
  linear: { name: "柏翰", tag: "直線思考／配合型", stroke: "#3B8C8C", fill: "rgba(59,140,140,.16)", text: "text-cyan-300" },
  sensitive: { name: "語安", tag: "深度連結／高敏型", stroke: "#E8973A", fill: "rgba(232,151,58,.2)", text: "text-amber-300" },
};

const PERSPECTIVES = {
  A: {
    id: "A",
    you: "linear",
    partner: "sensitive",
    title: "視角 A｜習慣直線思考／配合型伴侶",
    blurb: "你扮演柏翰。你負責、不亂發脾氣、她說什麼你都說好。你會親身體會：為什麼明明沒做錯任何大事，關係卻一路走向崩解。",
    recommended: true,
  },
  B: {
    id: "B",
    you: "sensitive",
    partner: "linear",
    title: "視角 B｜渴望深度連結／高敏內耗伴侶",
    blurb: "你扮演語安。你想要的從來不是「被照顧」，而是「被參與」。你會練習：把說不清楚的失落，轉成對方聽得懂、做得到的高解析度訊號。",
    recommended: false,
  },
};

/* ------------------------------- 資料：稜鏡 ------------------------------- */

const PRISM_LINES = [
  {
    line: "行程你比較會排，交給你決定就好。",
    speaker: "他說",
    intent: "「我信任你的品味，而且這樣最有效率。你負責規劃、我負責出錢出力，這不就是很好的分工嗎？」",
    received: "「這趟旅行是你的專案，不是我們的。」對方收到的不是信任，而是一張工單，以及一個人查資料到半夜的孤單。",
    psych:
      "任務外包 vs. 過程共謀。直線思考把旅行看成『待完成的任務』，所以外包是合理的；但對重視連結的人來說，規劃過程本身就是親密——一起滑民宿、一起期待，才是這趟旅行真正的起點。被外包的不只是行程，還有『共同期待』。",
  },
  {
    line: "沒事，我自己處理好了，你忙你的。",
    speaker: "她說",
    intent: "「我試過讓你知道我需要你，但每次都落空。與其再失望一次，不如自己來。這樣比較不痛。」",
    received: "「太好了，好獨立、好懂事，我們之間沒有問題。」對方把這句話歸檔為『好消息』，然後安心地繼續忙。",
    psych:
      "訊號盲區與安靜離職。抱怨其實是一種投資——還願意吵，代表還相信對方會改。當一個人開始客氣、不再提出需求，往往不是關係變穩定了，而是已經在心裡遞出辭呈。沒有爭吵，是最容易被誤讀的警訊。",
  },
  {
    line: "我現在就要知道你的答案！",
    speaker: "他說",
    intent: "「我很慌，我快失去你了。我只是想把事情講清楚，知道問題在哪，我才有辦法修。」",
    received: "「我被審問了。」對方的身體先於理智進入防衛：心跳加速、腦袋空白。此刻說出口的任何話，都不會是真心話。",
    psych:
      "高壓逼問與峰終定律。人在被逼到牆角時會啟動戰、逃或凍結，對話功能直接下線。更殘酷的是峰終定律：我們對一段關係的整體記憶，由『最強烈的時刻』與『結尾』決定。最後那場難堪的逼問，會回頭覆寫過去所有的好。",
  },
];

const LENSES = [
  { key: "intent", label: "發訊者自認的意思", color: "text-cyan-300", ring: "border-cyan-400/60 bg-cyan-400/10", beam: "#3B8C8C" },
  { key: "received", label: "對方實際收到的訊號", color: "text-rose-300", ring: "border-rose-400/60 bg-rose-400/10", beam: "#D9596A" },
  { key: "psych", label: "底層心理學解析", color: "text-amber-300", ring: "border-amber-400/60 bg-amber-400/10", beam: "#E8973A" },
];

/* --------------------------- 資料：雙軸光譜落點 --------------------------- */

const SPECTRUM_POINTS = [
  { id: "outsource", x: 0.1, y: 0.34, label: "任務外包", color: "#3B8C8C", desc: "任務端。「你排就好，錢我出。」把愛翻譯成分工與效率。自我是清楚的，但人不在過程裡：對方得到資源，卻得不到同伴。" },
  { id: "drift", x: 0.3, y: 0.86, label: "隨波逐流", color: "#6E9FB0", desc: "任務端。「都可以、看你、你決定。」看似配合度滿分，實則把所有決策的重量與孤獨都留給對方。久了，對方會發現身邊這個人「少了自己」。" },
  { id: "cocreate", x: 0.5, y: 0.16, label: "過程共謀", color: "#E8973A", desc: "光譜中間的交會區：有自己的想法（自我清晰），也願意走進對方的過程（情感在場）。不是誰配合誰，而是兩個完整的人一起決定一件事。" },
  { id: "interrogate", x: 0.7, y: 0.72, label: "高壓逼問", color: "#D9414F", desc: "情感端。「我現在就要答案！」看起來很強勢，其實是被焦慮淹沒、把感受整個丟出去的狀態。平常再理性的人，慌起來也可能滑到這裡。越用力抓，對方的牆升得越高。" },
  { id: "quiet", x: 0.9, y: 0.8, label: "安靜離職", color: "#C2697B", desc: "情感端。「沒事，我自己來。」感受很多，卻全部收了起來。表面風平浪靜，內心已在倒數。" },
];

/* ------------------------------- 資料：劇本 ------------------------------- */
/* tone: warm 暖光粒子｜cold 下沉冰晶｜spike 紅色尖刺（升起防衛高牆）
 * d: [訊號敏銳度, 共謀參與感, 自我主體性, 衝突容受力]；vit 關係生命力；quiet 安靜離職沙漏
 * clarity: 角色輪廓清晰度變化；missed 是否漏接訊號；overwrite 是否觸發記憶覆寫 */

const SCRIPT = {
  A: [
    {
      act: "第一幕",
      title: "雙人旅行的隱形勞動",
      focus: "任務外包 vs. 過程共謀",
      scene: [
        { who: "narr", text: "週四晚上十一點。你剛結束一場拖了很久的線上會議，癱在沙發上滑手機。" },
        { who: "partner", text: "欸，下個月連假不是要去台南嗎？我這幾天找了三間民宿，各有優缺點，你要不要一起看一下？" },
        { who: "narr", text: "她把筆電轉向你，螢幕上是整理好的表格：價位、交通、評價，甚至標了附近的早餐店。" },
        { who: "partner", text: "還有，第二天我想不到要排什麼……你有沒有什麼想去的地方？" },
      ],
      options: [
        {
          tone: "cold",
          tag: "任務外包",
          say: "你比較會排啦，交給你決定就好。訂好跟我說多少錢，我來出。",
          surface: "……好，那我再看看。",
          inner: "我不是在問誰付錢。我查了三個晚上，是想跟你一起期待這趟旅行。原來對你來說，這只是一件『交辦事項』。",
          review: "你給了資源，卻收回了參與。她問的其實不是『哪間民宿』，而是『你想不想跟我一起期待』。這是第一個被漏接的訊號。",
          d: [-10, -25, -4, 0], vit: -18, quiet: 22, clarity: -6, missed: true,
        },
        {
          tone: "cold",
          tag: "隨波逐流",
          say: "都可以啊，看你。我沒什麼特別想去的，你喜歡就好。",
          surface: "嗯……好吧，那我自己決定。",
          inner: "又是『都可以』。我有時候會想，如果沒有我，他自己想去哪裡？跟他在一起，像是我一個人在談戀愛。",
          review: "『都可以』聽起來體貼，實際上把決策的全部重量丟回給她。更深的問題是：她在這段關係裡看不見『你』。沒有主見不是隨和，是缺席。",
          d: [-10, -20, -26, 0], vit: -20, quiet: 24, clarity: -34, missed: true,
        },
        {
          tone: "warm",
          tag: "過程共謀",
          say: "表格傳給我，我想看。第二天早上交給我——我想帶你去吃我大學常去的那間牛肉湯，五點半就要排隊的那種。",
          surface: "五點半？你認真？……好啦，那你要負責叫我起床。",
          inner: "他有自己想帶我去的地方。這趟旅行不是我一個人的作業了，是我們的。",
          review: "你沒有接下整份工作，只做了兩件小事：表示想看、提出一個屬於你的主張。但這已經足夠讓她感覺到『我們』。",
          d: [14, 28, 20, 4], vit: 12, quiet: -8, clarity: 8, missed: false,
        },
      ],
    },
    {
      act: "第二幕",
      title: "暴風雨前的客氣與平靜",
      focus: "把退縮當懂事 vs. 讀懂安靜離職",
      scene: [
        { who: "narr", text: "三個月後。你們已經很久沒吵架了。你覺得這是關係成熟的象徵。" },
        { who: "narr", text: "今晚她的專案出了大包，加班到十一點半，一個人叫車回家。你是隔天看她限動才知道的。" },
        { who: "you", text: "昨天怎麼了？你怎麼沒跟我說？" },
        { who: "partner", text: "沒事啦，我自己處理好了。你最近也很忙，你忙你的就好。" },
        { who: "narr", text: "她的語氣很平、很客氣，甚至還加了一個笑臉貼圖。" },
      ],
      options: [
        {
          tone: "cold",
          tag: "訊號盲區",
          say: "好喔，那就好。你真的很獨立，這點我最欣賞你。早點休息！",
          surface: "嗯，晚安。",
          inner: "他鬆了一口氣。我不再吵他，他覺得這樣很好。……原來我不見了，他也不會發現。",
          review: "你把『沒有需求』解讀成『沒有問題』，還稱讚了她的退縮。這是整段關係最關鍵的漏接：客氣，是她離開前最後的禮貌。",
          d: [-28, -10, 0, -5], vit: -24, quiet: 30, clarity: 0, missed: true,
        },
        {
          tone: "spike",
          tag: "解題與究責",
          say: "你怎麼不早講？這種事下次要第一時間跟我說啊，我可以去接你、幫你想辦法，你這樣我怎麼幫？",
          surface: "好，下次會說。",
          inner: "所以又是我的錯。我以前說過，你回我『先冷靜、想解法』。我不是不說，是學會了說了也沒用。",
          review: "你的出發點是想幫忙，但句型是『糾正』。她聽到的是：連難過的方式都做錯了。解決問題之前，她需要的是有人先接住那個晚上的她。",
          d: [-12, -8, 4, -15], vit: -14, quiet: 20, clarity: 0, missed: true,
        },
        {
          tone: "warm",
          tag: "讀懂退縮",
          say: "『處理好了』跟『沒事』好像不太一樣。我發現你最近比較少跟我講事情，我有點在意。不用現在說——我買宵夜過去，在旁邊陪你就好？",
          surface: "……你怎麼突然這樣。好啦，我想吃鹹酥雞。",
          inner: "他發現了。我以為他永遠不會發現。……也許，還可以再試一次。",
          review: "你沒有逼她解釋，只是說出你觀察到的變化，並給了一個不需要她費力的陪伴選項。這讓一扇快關上的門，又留了一條縫。",
          d: [30, 15, 8, 14], vit: 14, quiet: -12, clarity: 4, missed: false,
        },
      ],
    },
    {
      act: "第三幕",
      title: "終焉邊緣的高壓逼問",
      focus: "控制型質詢 vs. 守住邊界並打開對話",
      scene: [
        { who: "narr", text: "又過了兩個月。你們原本說好租約到期後一起搬家。" },
        { who: "narr", text: "今天，你在她桌上看到一份已經簽好的租約——單人套房，下個月起租。她沒有跟你提過一個字。" },
        { who: "narr", text: "你的腦袋嗡的一聲。她剛洗完澡走出來，看見你手上的紙，停在原地。" },
        { who: "partner", text: "……我本來想找個時間跟你說的。" },
      ],
      options: [
        {
          tone: "spike",
          tag: "高壓逼問",
          say: "找個時間？你現在就給我講清楚！你是不是早就想分手了？我到底哪裡對不起你？我現在就要知道答案！",
          surface: "……我現在不想講。你這樣我沒辦法講。",
          inner: "心跳好快，腦袋一片空白。我本來還在猶豫的——謝謝你幫我確定了。原來在一起這兩年，最後是這個樣子。",
          review: "你的慌張是真的，但出口的方式是審問。她的防衛系統全面啟動，而這一幕成了這段關係的『終』——依峰終定律，它將回頭覆寫所有美好的回憶。",
          d: [-12, -5, -10, -35], vit: -30, quiet: 35, clarity: -6, missed: true, overwrite: true,
        },
        {
          tone: "cold",
          tag: "自我消音",
          say: "……喔。沒關係，你決定就好。你覺得這樣比較好的話，我都可以。",
          surface: "……嗯。謝謝你體諒。",
          inner: "連這種時候，他都說『都可以』。我簽約前其實偷偷希望過，他會不會至少為我們爭取一次。",
          review: "你吞下了受傷，也吞下了自己的底線。看似成熟，但對她而言，這證實了她最深的孤單：這段關係裡，從頭到尾只有她一個人在做決定。",
          d: [-8, -10, -30, -15], vit: -22, quiet: 25, clarity: -36, missed: true,
        },
        {
          tone: "warm",
          tag: "邊界與脆弱並存",
          say: "我現在很受傷，也很慌。這麼大的決定沒被告知，對我來說是底線。但我不想用逼的——我更想知道，這幾個月我漏掉了什麼。今晚或明天，你挑一個你可以的時間，好嗎？",
          surface: "……明天晚上吧。我今天真的講不出來。（停頓）謝謝你沒有吼我。",
          inner: "他說他受傷了。他從來沒有說過自己的感覺。……他也問了『我漏掉了什麼』。我想，至少這一次，我願意好好講完。",
          review: "你同時做到三件很難的事：說出自己的底線、承認自己的脆弱、把時間的主導權還給她。不保證挽回，但你守住了自己，也守住了這段關係的『終』。",
          d: [15, 10, 26, 32], vit: 16, quiet: -15, clarity: 10, missed: false,
        },
      ],
    },
  ],
  B: [
    {
      act: "第一幕",
      title: "雙人旅行的隱形勞動",
      focus: "吞下失落 vs. 發出高解析度邀請",
      scene: [
        { who: "narr", text: "週四晚上十一點。為了下個月的台南連假，你已經連續三個晚上在比較民宿。" },
        { who: "you", text: "欸，我找了三間民宿，你要不要一起看一下？第二天我也還沒想到要去哪。" },
        { who: "partner", text: "你比較會排啦，交給你決定就好。訂好跟我說多少錢，我來出。" },
        { who: "narr", text: "他的眼睛沒有離開手機。你心裡有個東西，輕輕地沉了一下。" },
      ],
      options: [
        {
          tone: "cold",
          tag: "吞下去",
          say: "好啊，那我排。",
          surface: "讚啦，交給你我最放心。",
          inner: "她說好，那就是沒問題。她真的很會規劃，有她在好輕鬆。",
          review: "你把失落收起來了，而他收到的訊息是『一切正常』。沒被說出口的需要，對直線型的人來說等於不存在。安靜離職，是從第一次『算了』開始的。",
          d: [-12, -18, -22, -4], vit: -18, quiet: 24, clarity: -28, missed: true,
        },
        {
          tone: "spike",
          tag: "帶刺的測試",
          say: "每次都這樣。你到底有沒有想去？算了，不用了，我自己弄。",
          surface: "蛤？我不是說我出錢嗎？你幹嘛生氣？",
          inner: "我做錯什麼了？我明明是信任她才讓她決定……她到底要我怎樣？好難懂，下次少講少錯。",
          review: "你的委屈完全合理，但他只接收到『攻擊』，接不到『邀請』。『每次』『到底』這類字眼會讓對方忙著辯護，而不是聽懂你其實想要一起期待。",
          d: [-8, -10, 4, -22], vit: -14, quiet: 16, clarity: 0, missed: true,
        },
        {
          tone: "warm",
          tag: "高解析度邀請",
          say: "我不是要你幫我決定，我是想跟你一起期待。今晚給我二十分鐘，我們從這三間選一間；然後第二天早上交給你，排一個你想帶我去的地方，好嗎？",
          surface: "喔——原來是這個意思。好啊，那我想想……欸，我大學常吃的那間牛肉湯你一定要去。",
          inner: "原來她要的不是我做決定，是要我『在』。二十分鐘、選一間、排一個早上——這我做得到。",
          review: "你把『你都不參與』翻譯成了：一段感受＋一個時間框＋兩個具體動作。對直線型伴侶來說，這不是降低標準，而是終於拿到了一份他看得懂的地圖。",
          d: [18, 28, 18, 6], vit: 14, quiet: -10, clarity: 8, missed: false,
        },
      ],
    },
    {
      act: "第二幕",
      title: "暴風雨前的客氣與平靜",
      focus: "客氣的退縮 vs. 說出真正需要的東西",
      scene: [
        { who: "narr", text: "三個月後。專案出了大包，你加班到十一點半，一個人叫車回家，在後座偷偷哭了一下。" },
        { who: "narr", text: "隔天中午，他看到你的限動，傳來訊息。" },
        { who: "partner", text: "昨天怎麼了？你怎麼沒跟我說？" },
        { who: "narr", text: "你盯著螢幕。腦中浮現上次你說工作很累，他回的那句『那你要不要先列出問題，一個一個解？』" },
      ],
      options: [
        {
          tone: "cold",
          tag: "客氣退場",
          say: "沒事啦，我自己處理好了。你最近也很忙，你忙你的就好。😊",
          surface: "好喔，那就好。你真的很獨立，這點我最欣賞你！",
          inner: "還好沒事。她越來越成熟了，我們最近都沒吵架，感情應該很穩定吧。",
          review: "這句話保護了你，也把他關在門外。他不是不在乎，他是真的讀不到——而你的客氣，剛好成了他『一切安好』的證據。",
          d: [-20, -12, -20, -6], vit: -24, quiet: 30, clarity: -26, missed: true,
        },
        {
          tone: "spike",
          tag: "翻舊帳",
          say: "你現在才問？反正跟你講你也只會叫我列清單、想解法。算了，講了你也不懂。",
          surface: "我是想幫你啊……那你到底要我怎樣？",
          inner: "我怎麼做都錯。幫她想辦法不對，沒發現也不對。我覺得自己好沒用……乾脆不要問了。",
          review: "你說的都是事實，但『講了你也不懂』直接關上了他學習的門。他因此得到的結論不是『我要換個方式聽』，而是『我少開口比較安全』。",
          d: [-6, -10, 6, -24], vit: -16, quiet: 18, clarity: 0, missed: true,
        },
        {
          tone: "warm",
          tag: "說出真正的需要",
          say: "其實不太好，我昨天在車上哭了。我不需要你幫我解決，我需要你今晚打給我，聽我講十分鐘，中間只要說『辛苦了』就好。可以嗎？",
          surface: "可以。……對不起，我不知道你哭了。我九點打給你，我只聽，不給建議。",
          inner: "她哭了我居然不知道。還好她告訴我要怎麼做——『只聽、說辛苦了』，原來這樣就是幫忙。我想做到。",
          review: "你同時做了兩件勇敢的事：承認自己不好，並且給出明確的『使用說明』。很多直線型伴侶不是不願意給情緒支持，而是從來沒有人告訴他們那長什麼樣子。",
          d: [26, 16, 16, 12], vit: 16, quiet: -14, clarity: 8, missed: false,
        },
      ],
    },
    {
      act: "第三幕",
      title: "終焉邊緣的高壓逼問",
      focus: "被逼到牆角時：關機、反擊，還是守住自己",
      scene: [
        { who: "narr", text: "又過了兩個月。你一個人去看了房，簽下一間單人套房的租約。你還沒想好要怎麼開口。" },
        { who: "narr", text: "今晚你洗完澡走出來，看見他站在書桌前，手上拿著那份租約。" },
        { who: "partner", text: "這是什麼？你是不是早就想分手了？我到底哪裡對不起你？你現在就給我講清楚，我現在就要知道答案！" },
        { who: "narr", text: "你的心跳很快，耳朵嗡嗡作響。腦袋一片空白。" },
      ],
      options: [
        {
          tone: "cold",
          tag: "凍結關機",
          say: "……沒什麼好說的。就這樣吧。",
          surface: "什麼叫就這樣？你說話啊！",
          inner: "她連解釋都不願意。兩年，就換來一句『就這樣』？我到底算什麼？",
          review: "在高壓下關機是身體的自我保護，不是你的錯。但沉默讓他只能用最壞的版本填空。這個『終』，會成為你們兩個人記憶裡最後的畫面。",
          d: [-10, -8, -18, -22], vit: -26, quiet: 30, clarity: -24, missed: true, overwrite: true,
        },
        {
          tone: "spike",
          tag: "全面反擊",
          say: "你現在才想知道？台南那次、我加班那次、每一次你說『都可以』的時候，你有問過嗎？現在才來兇我，太晚了！",
          surface: "所以都是我的錯？你從來沒講過，我怎麼會知道！",
          inner: "原來她記了這麼多筆帳。我以為我們很好……原來這兩年在她眼裡，我一無是處。",
          review: "壓抑許久的話終於說出口，但在兩個人都被情緒淹沒的時刻，真話只會變成武器。這場互相傷害的結尾，將同時覆寫你們各自對這段感情的記憶。",
          d: [-6, -6, 6, -32], vit: -28, quiet: 28, clarity: 0, missed: true, overwrite: true,
        },
        {
          tone: "warm",
          tag: "守住邊界、留下門",
          say: "我不是不回答。但你現在這樣問，我只講得出傷人的話。給我二十分鐘冷靜，我保證今晚會把這幾個月的事，從頭到尾跟你講完——到時候請你先聽完，好嗎？",
          surface: "……（深呼吸）好。對不起，我太慌了。我去客廳等你，二十分鐘。",
          inner: "她沒有逃，也沒有吼回來。她說今晚會講完。我好怕，但……我等。我想知道我到底漏掉了什麼。",
          review: "你拒絕了被審問的方式，卻沒有拒絕對話本身：設定暫停、承諾回來、提出條件。無論結局是留下或離開，這個『終』都不會是難堪，而是一場完整的告別或重新開始。",
          d: [14, 12, 28, 32], vit: 18, quiet: -16, clarity: 12, missed: false,
        },
      ],
    },
  ],
};

/* 每一幕的下半場：同一幕裡的第二個抉擇點。bridge 依上半場的選擇語氣，接上不同的過場。 */
const SCRIPT_PART2 = {
  A: [
    {
      focus: "看見對方的付出 vs. 當個等導遊的團員",
      meta: { when: "旅行第二天 下午", where: "台南的騎樓下" },
      bridge: { warm: "牛肉湯那個早上，她笑得很開心。到了旅行的第二天下午——", cold: "行程最後是她一個人排完的。到了旅行的第二天下午——", spike: "出發前你們有點僵。到了旅行的第二天下午——" },
      scene: [
        { who: "narr", text: "突然下起大雨。她排的景點全是戶外的，整個下午的行程泡湯了。" },
        { who: "narr", text: "她站在騎樓下滑手機找備案，眉頭皺得很緊。" },
        { who: "partner", text: "怎麼辦，我排的地方都不能去了……對不起，我應該先查天氣的。" },
      ],
      options: [
        {
          tone: "cold", tag: "旁觀等待",
          say: "沒關係啊，你慢慢找，不急，我都可以。",
          surface: "……嗯，等我一下。",
          inner: "又是我。連下雨都是我一個人的問題。他站在旁邊滑手機，像一個在等導遊的團員。",
          review: "你想說的是「我不怪你」，但她聽到的是「這還是你的事」。在她自責的時候，她需要的不是寬容，而是隊友。",
          d: [-12, -22, -10, 0], vit: -16, quiet: 20, clarity: -12, missed: true,
        },
        {
          tone: "spike", tag: "效率檢討",
          say: "所以我才說行程不要排太滿。下次記得先看氣象。現在先找個室內的吧，快點，雨越下越大了。",
          surface: "好，我在找了。",
          inner: "我排了一個月，他連一句謝謝都沒有，開口第一句是檢討。下次？沒有下次了，我不想再排了。",
          review: "你在解決問題，而且建議可能都對。但她剛說了對不起，你回她的是一份改善報告。被檢討的隱形勞動，下次就不會再有人做了。",
          d: [-14, -12, 2, -16], vit: -18, quiet: 22, clarity: 0, missed: true,
        },
        {
          tone: "warm", tag: "接手與感謝",
          say: "不用對不起，你排了這麼久，辛苦了。換我來，我查一下附近有沒有老戲院或咖啡店。雨天版本搞不好更好玩。",
          surface: "……真的嗎？那我要喝熱的。",
          inner: "他說辛苦了，然後他接手了。原來我可以不用一個人撐完整趟旅行。",
          review: "兩個動作：看見她的付出，然後把擔子接過去。你不需要找到完美的備案，她要的只是在出狀況的時候，身邊有一個人一起想。",
          d: [14, 26, 14, 8], vit: 14, quiet: -10, clarity: 6, missed: false,
        },
      ],
    },
    {
      focus: "她最後一次主動敲門",
      meta: { when: "幾週後 週日晚餐", where: "餐桌" },
      bridge: { warm: "那晚的鹹酥雞之後，她的話又多了一點。幾週後的週日——", cold: "那天之後，她的訊息變得更短，也更有禮貌。幾週後的週日——", spike: "那天之後，她不再提工作上的事了。幾週後的週日——" },
      scene: [
        { who: "narr", text: "你們難得一起在家吃晚餐。你一邊吃，一邊回主管的訊息。" },
        { who: "narr", text: "她放下筷子，看了你一會兒。" },
        { who: "partner", text: "欸，我們是不是很久沒有好好聊天了？" },
      ],
      options: [
        {
          tone: "cold", tag: "字面回應",
          say: "有嗎？我們不是每天都有講話？……等我一下，我先回個訊息。",
          surface: "嗯，沒事，你忙。",
          inner: "每天講的是「吃了沒」「幾點回來」。這是我最後一次主動提了。",
          review: "她問的不是事實，是邀請。這句話是安靜離職之前，最容易接、也最不能錯過的一次敲門。你照字面回答了，門就關上了。",
          d: [-26, -12, 0, -4], vit: -22, quiet: 28, clarity: 0, missed: true,
        },
        {
          tone: "spike", tag: "防衛反擊",
          say: "你是不是又在不滿什麼？我最近真的很累，可不可以不要現在講這個。",
          surface: "好，當我沒說。",
          inner: "我只是想靠近他，卻變成我在找麻煩。以後不說了。",
          review: "你聽到的是指責，所以你防衛了。但她說的是「我想你」的另一種版本。當靠近被當成找碴，人就會學會不再靠近。",
          d: [-18, -10, 0, -20], vit: -20, quiet: 26, clarity: 0, missed: true,
        },
        {
          tone: "warm", tag: "放下手機",
          say: "（把手機蓋起來）……好像是。我最近都在忙，連你在想什麼都不知道。現在可以嗎？我想聽。",
          surface: "（愣了一下）……現在？好啊。其實我也不知道要從哪裡講起。",
          inner: "他把手機蓋起來了。就這一個動作，我差點哭出來。",
          review: "你沒有說什麼漂亮的話，只是把注意力完整地給了她。對一個快要放棄開口的人來說，這比任何承諾都有用。",
          d: [28, 16, 6, 12], vit: 16, quiet: -14, clarity: 4, missed: false,
        },
      ],
    },
    {
      focus: "當她終於說出口：辯護、討好，還是聽完",
      meta: { when: "那之後", where: "客廳" },
      bridge: { warm: "她說了「明天晚上」。隔天，她真的坐了下來——", cold: "你說完「都可以」之後，房間安靜了很久。最後是她先開口——", spike: "那一晚你們都沒睡。天快亮的時候，她終於開口——" },
      scene: [
        { who: "partner", text: "我不是突然決定的。我講過很多次，只是你沒有聽到。" },
        { who: "partner", text: "跟你在一起，我常常覺得只有我一個人。" },
        { who: "narr", text: "你的胸口很悶。你想起這兩年你做過的所有事。" },
      ],
      options: [
        {
          tone: "spike", tag: "列出功勞",
          say: "我哪裡沒聽？我薪水都拿回家、從來沒兇過你、你要什麼我都說好，這樣還不夠嗎？你知道多少人羨慕你嗎？",
          surface: "……對，你很好。是我的問題。",
          inner: "我說我很孤單，他回我一張成績單。夠了，我不想再解釋了。",
          review: "你說的每一項都是真的，也都是愛。但她講的是感受，你答的是功勞。這一刻成了這段關係的最後一幕，也會是她記得最清楚的一幕。",
          d: [-16, -6, -8, -30], vit: -28, quiet: 32, clarity: -4, missed: true, overwrite: true,
        },
        {
          tone: "cold", tag: "全面討好",
          say: "好，我改，我全部都改。你說，你要我怎樣我就怎樣，你不要走就好。",
          surface: "……你不用這樣。",
          inner: "到了最後一刻，他還是在問我「要他怎樣」。我要的不是一個聽話的人，我要的是一個人。",
          review: "你的害怕很真實。但「你要我怎樣都可以」把所有的決定又交回給她，這正是她累了兩年的原因。挽回需要的不是更多配合，而是你自己站出來。",
          d: [-8, -8, -30, -12], vit: -20, quiet: 24, clarity: -36, missed: true,
        },
        {
          tone: "warm", tag: "聽完，不辯解",
          say: "……我想我真的沒有聽到。聽你這樣說我很難受，但我想聽完。你說的「只有你一個人」，是從什麼時候開始的？",
          surface: "（沉默很久）……台南那次吧。",
          inner: "他沒有辯解。他問了「什麼時候開始」。如果兩年前他就這樣問……不，至少現在他問了。",
          review: "忍住辯解是很難的事，尤其當你真的付出了很多。你選擇先聽完，這讓她第一次覺得那些話有地方可以去。",
          d: [20, 10, 20, 30], vit: 18, quiet: -16, clarity: 8, missed: false,
        },
      ],
    },
  ],
  B: [
    {
      focus: "一個人扛 vs. 開口請對方接手",
      meta: { when: "旅行第二天 下午", where: "台南的騎樓下" },
      bridge: { warm: "那二十分鐘，你們真的一起選了民宿。到了旅行的第二天下午——", cold: "行程最後是你一個人排完的。到了旅行的第二天下午——", spike: "那一晚你們有點僵。到了旅行的第二天下午——" },
      scene: [
        { who: "narr", text: "突然下起大雨。你排的景點全是戶外的，整個下午的行程泡湯了。" },
        { who: "you", text: "怎麼辦，我排的地方都不能去了……對不起，我應該先查天氣的。" },
        { who: "partner", text: "沒關係啊，你慢慢找，不急，我都可以。" },
        { who: "narr", text: "他說完，低頭繼續滑手機。" },
      ],
      options: [
        {
          tone: "cold", tag: "自己扛完",
          say: "好，等我一下，我再找找。",
          surface: "OK，不急。",
          inner: "她在處理了，我不要吵她。我表現得不在意，她應該比較沒有壓力吧。",
          review: "他把安靜當成體貼，完全不知道你希望他接手。你又一次獨自解決了問題，而他又一次確認了：交給你就沒問題。",
          d: [-12, -20, -18, -2], vit: -16, quiet: 22, clarity: -22, missed: true,
        },
        {
          tone: "spike", tag: "累積的爆發",
          say: "你可不可以不要每次都「都可以」？你就不能幫忙想一下嗎？",
          surface: "我……我是怕我找的你不喜歡啊。",
          inner: "我開口也錯，不開口也錯。她到底要我怎樣？",
          review: "你的疲憊是真的。但這句話他只收到「你又做錯了」，收不到「我需要你」。他下一次會更不敢出手。",
          d: [-8, -8, 4, -20], vit: -14, quiet: 16, clarity: 0, missed: true,
        },
        {
          tone: "warm", tag: "明確地請求",
          say: "我現在有點慌，也有點自責。你可以幫我嗎？你負責找一間可以躲雨的咖啡店，我來看下午怎麼調。",
          surface: "好，交給我。……欸，這間有老唱片，你一定喜歡。",
          inner: "原來她需要我。她給了我一件明確的事，我做得到。而且我好像還滿會找的？",
          review: "你說了感受，也給了一件他做得到的事。很多人不是不願意幫，是不知道從哪裡下手。他第一次發現，自己在這趟旅行裡是有用的。",
          d: [16, 26, 14, 8], vit: 14, quiet: -10, clarity: 6, missed: false,
        },
      ],
    },
    {
      focus: "那句在心裡轉了很久的話",
      meta: { when: "幾週後 週日晚餐", where: "餐桌" },
      bridge: { warm: "那通十分鐘的電話之後，你覺得輕了一點。幾週後的週日——", cold: "那個笑臉貼圖之後，你們的對話越來越短。幾週後的週日——", spike: "那次之後，他問你事情變得小心翼翼。幾週後的週日——" },
      scene: [
        { who: "narr", text: "你們難得一起在家吃晚餐。他一邊吃，一邊回主管的訊息。" },
        { who: "narr", text: "你看著他。有一句話在你心裡轉了很久：我們是不是很久沒有好好聊天了。" },
      ],
      options: [
        {
          tone: "cold", tag: "把話吞回去",
          say: "（你什麼都沒說，把飯吃完，收了碗。）",
          surface: "欸，你吃好快。我回完這個就好喔。",
          inner: "今天很平靜，真好。",
          review: "你決定不說了，因為說了也沒用。他那邊看到的是一頓安靜、和平的晚餐。你們之間的距離，從他的角度完全看不見。",
          d: [-18, -14, -22, -4], vit: -22, quiet: 28, clarity: -26, missed: true,
        },
        {
          tone: "spike", tag: "酸一句",
          say: "你乾脆跟手機交往好了。",
          surface: "我在處理工作欸，不然誰賺錢？",
          inner: "又來了。我工作也是為了我們，她為什麼不能體諒？",
          review: "這句話底下是「我想你」，但他聽到的是「你做錯了」。他開始為工作辯護，你們吵的已經不是你真正在意的事了。",
          d: [-8, -10, 4, -22], vit: -16, quiet: 18, clarity: 0, missed: true,
        },
        {
          tone: "warm", tag: "把想念說出來",
          say: "我想跟你說一件事，不是抱怨。我覺得我們很久沒有好好聊天了，我很想你。吃完飯，可以把手機放旁邊半小時嗎？",
          surface: "（抬起頭）……有這麼久了嗎？好，我回完這一則就收起來。",
          inner: "她說「我很想你」。我們明明住在一起……我是不是真的漏掉什麼了。",
          review: "你先聲明這不是抱怨，再說出想念，最後給了一個半小時的具體請求。他沒有東西需要防衛，只剩下一件做得到的事。",
          d: [24, 18, 16, 12], vit: 16, quiet: -14, clarity: 8, missed: false,
        },
      ],
    },
    {
      focus: "當他拿出成績單：敷衍、反擊，還是說出真正要的",
      meta: { when: "那之後", where: "客廳" },
      bridge: { warm: "二十分鐘後你走進客廳，他真的在等。他一開口，還是很慌——", cold: "沉默了很久之後，他又開口了——", spike: "吵到兩個人都累了。他的聲音低了下來——" },
      scene: [
        { who: "partner", text: "你說啊，我到底哪裡做不好？" },
        { who: "partner", text: "我薪水都拿回家、從來沒兇過你、你要什麼我都說好。這樣還不夠嗎？" },
        { who: "narr", text: "他的眼眶是紅的。你知道他說的每一件都是真的。" },
      ],
      options: [
        {
          tone: "cold", tag: "客氣帶過",
          say: "你很好，真的。是我的問題。",
          surface: "那為什麼……我不懂。",
          inner: "她說我很好，卻還是要走。我永遠不會知道原因了。",
          review: "你不想再傷他，所以選了最客氣的說法。但「你很好」沒有給他任何可以理解的東西。他會帶著這個問號很多年。",
          d: [-14, -8, -18, -14], vit: -22, quiet: 26, clarity: -22, missed: true,
        },
        {
          tone: "spike", tag: "否定全部",
          say: "你看，你到現在還在講你自己做了多少。你從頭到尾都沒有在聽我講話！",
          surface: "我沒在聽？那你這兩年又講了什麼！",
          inner: "我把我會的全都給了，她說那些都不算。",
          review: "你指出的問題是對的，但「從頭到尾」把他兩年的付出一筆勾銷。兩個人都帶著「我的努力不被承認」離開，這會是你們共同的最後一幕。",
          d: [-6, -6, 4, -30], vit: -26, quiet: 28, clarity: 0, missed: true, overwrite: true,
        },
        {
          tone: "warm", tag: "先承認，再說真話",
          say: "你做的那些我都知道，也很謝謝你。但我要的不是你「說好」，是你「在」。我常常覺得這段關係裡只有我一個人。我想把這幾次的事講給你聽，你可以先聽完嗎？",
          surface: "……好，我聽。（坐下來）從哪一次開始？",
          inner: "「不是說好，是在」……我好像第一次聽懂她要什麼。我一直以為我都在。",
          review: "你先承認了他的付出，他才有餘裕聽見後面的話。「不是說好，是在」把兩年來說不清楚的感覺，濃縮成一句他聽得懂的話。",
          d: [18, 12, 26, 30], vit: 18, quiet: -16, clarity: 10, missed: false,
        },
      ],
    },
  ],
};

["A", "B"].forEach((k) => {
  SCRIPT[k] = SCRIPT[k].flatMap((a, i) => [{ ...a, part: "上" }, { ...SCRIPT_PART2[k][i], act: a.act, title: a.title, part: "下" }]);
});

/* ---------------------------- 資料：報告與翻譯機 --------------------------- */

const DIMS = [
  { key: "sens", label: "訊號敏銳度", en: "Signal Sensitivity", A: "能不能在『沒事』裡聽見有事，分辨平靜與退場。", B: "能不能把內在的失落，轉成對方收得到的清楚訊號。" },
  { key: "co", label: "共謀參與感", en: "Co-Creation", A: "是否走進過程，而不只是為結果買單。", B: "是否邀請對方進來，而不是一個人默默扛完。" },
  { key: "self", label: "自我主體性", en: "Self-Differentiation", A: "在關係裡是否仍有自己的想法、偏好與底線。", B: "是否保有自己的聲音，而不是把需要吞回去。" },
  { key: "cont", label: "衝突容受力", en: "Conflict Containment", A: "焦慮時能否先安放自己，而不是逼對方立刻給答案。", B: "被逼問或受傷時，能否不關機、不反擊，仍留下對話空間。" },
];

const VERDICTS = {
  A: {
    low: { title: "在場的共謀者", text: "你沒有變成另一個人，只是多做了幾件小事：提出自己的想法、看見她的沉默、在慌張時說出感受而不是質問。關係的生命力，就長在這些小地方。" },
    mid: { title: "善意的缺席者", text: "你的心意是真的，但訊號在半路折射了。有些時刻你接住了，有些時刻你用『效率』或『配合』代替了『在場』。好消息是：這個落差是可以學的。" },
    high: { title: "措手不及的好人", text: "你沒有做錯任何『大事』——不劈腿、不暴力、有責任感。但關係不是敗在大事，而是敗在一次次沒被接住的小訊號。當她不再抱怨，倒數其實早已開始。" },
  },
  B: {
    low: { title: "高解析度的發訊者", text: "你沒有降低自己的需要，只是換了一種對方聽得懂的語言：感受、時間框、具體動作。你讓對方有機會成為你需要的那個人。" },
    mid: { title: "半靜音的等待者", text: "有些時刻你勇敢說出來了，有些時刻你選擇『算了』或讓委屈帶著刺出場。你的需要從來都合理，值得被完整地說一次。" },
    high: { title: "已經離職的在場者", text: "你人還在這段關係裡，心卻已經遞出辭呈。那些被吞下的話沒有消失，只是變成了距離。這不是你的錯——但沒被說出口的需要，對方真的看不見。" },
  },
};

const EPILOGUES = {
  A: {
    low: "隔天晚上，她講了很久，你聽了很久。有些話很刺，你沒有辯解。那份租約後來怎麼了，劇本沒有寫——但你們第一次，真的在對話。",
    mid: "她還是搬了出去，說想先一個人想清楚。離開前她說：『你有幾次，其實讓我很想留下來。』你反覆想著，是哪幾次。",
    high: "三週後，你收到一則很長、很客氣的訊息。沒有爭吵，沒有眼淚。最後一句是：『謝謝你這兩年的照顧，你是個好人。』你讀了很多遍，還是不知道，到底是從哪一天開始的。",
  },
  B: {
    low: "二十分鐘後你走進客廳，他真的坐在那裡等。你從台南那個晚上開始講，他中途紅了眼眶，但沒有打斷你。那份租約後來怎麼了，劇本沒有寫——但這一次，你沒有一個人。",
    mid: "你還是搬了出去。整理箱子的時候你想起，有幾次你其實說出口了，而他也真的試著接。你不確定，如果早一點、多說幾次，結局會不會不同。",
    high: "你搬進了那間套房。很安靜，很自由，也很空。朋友問你們怎麼了，你想了很久，只說得出：『沒有怎麼了。就是，我講過，然後就不想再講了。』",
  },
};

const MEMORIES = ["第一次一起旅行的那個清晨", "對方記得你隨口說過想吃的那家店", "停電那晚，聊到天亮的陽台", "生病時，床邊那碗溫掉的粥"];

const DECODER = [
  { heard: "「沒事，我自己處理好了。」", decoded: "這不是報平安，是一份結案報告：『我已經不指望你了。』", reply: "「處理好了，那你呢？你還好嗎？我想聽過程，不是結果。」" },
  { heard: "「你忙你的，不用管我。」", decoded: "她不是體貼，是不再測試你會不會來。測試結束，通常代表期待也結束了。", reply: "「我想管。今天不解決任何事，我只是想在你旁邊。」" },
  { heard: "「都可以，你決定。」（以前很有想法的她，開始這樣說）", decoded: "她不是變隨和，是不再投資。意見是一種參與，放棄意見是一種撤資。", reply: "「你以前都有很多想法。是不是我讓你覺得，講了也沒用？」" },
  { heard: "「我們是不是很久沒有好好聊天了？」", decoded: "黃金訊號。她還在敲門——這是最容易回應、也最不能錯過的一句。", reply: "放下手機，看著她：「是。現在可以嗎？還是我們約今晚？」" },
  { heard: "「隨便啊。」（語氣很平）", decoded: "『希望你猜中』的階段已經過去，剩下的是疲憊。", reply: "給出你的偏好加兩個選項：「我想吃那間拉麵，或你上次說的韓式——你今天比較想哪個？」" },
];

const DETOX = [
  { bad: "「都可以，看你。」", good: "「我比較想＿＿，但我也想聽你的想法。」", why: "戒掉被動配合：有偏好不是自私，是讓對方有一個『人』可以互動。" },
  { bad: "「你排就好，錢我出。」", good: "「這一段我來排，其他的我們今晚一起看二十分鐘。」", why: "戒掉任務外包：不用全包，但要認領一塊屬於你的。" },
  { bad: "「我現在就要知道答案！」", good: "「這件事對我很重要，我需要在這兩天內談。你什麼時候可以？」", why: "戒掉高壓逼問：守住『要談』的底線，放掉『現在』的控制。" },
  { bad: "「你怎麼不早講？」", good: "「謝謝你告訴我。那個時候你一定很累吧。」", why: "戒掉先究責：先接住人，再處理事。" },
];

const CONVERTER = [
  { vague: "「你都不關心我。」", why: "這是一個無法執行的指控。對方會急著舉證『我哪有』，而不是靠近你。", hires: "「我加班那天，如果你九點傳一句『到家跟我說』，我會覺得被放在心上。這週可以試一次嗎？」" },
  { vague: "「算了，沒事。」", why: "直線型伴侶會照字面收下，然後真的當作沒事。", hires: "「我現在有事，但還講不清楚。給我一小時，晚點我會主動找你——到時候請先聽完，不要急著給建議。」" },
  { vague: "「你決定就好啊。」（其實是反話）", why: "他會把這句話當成授權，而不是失望。", hires: "「這次我希望你先提一個方案，哪怕只有一個。我想感覺到你也在期待。」" },
  { vague: "「你根本沒有在聽。」", why: "他很可能正在努力聽——只是在聽『要解決什麼』。", hires: "「我講這件事不是要你解決。接下來五分鐘，你只要回『然後呢』和『辛苦了』就好。」" },
  { vague: "「我覺得我們之間少了什麼。」", why: "太抽象。他會焦慮地開始找『故障的零件』，卻找不到。", hires: "「我想念我們一起做一件事的感覺。這個週末一起煮一頓飯，菜單一人決定一半，好嗎？」" },
];

const MECHANISMS = [
  { icon: Luggage, title: "任務外包 vs. 過程共謀", he: "「你擅長你排，我出錢出力，這是信任。」", she: "「我要的不是有人買單，是有人跟我一起期待。」", note: "愛不只在結果裡，也在一起準備的過程裡。" },
  { icon: Wind, title: "隨波逐流的「都可以」", he: "「我配合度很高，對方想怎樣都好。」", she: "「所有決定都是我做的。這個人自己，到底在哪裡？」", note: "有自己的想法不是自私，是讓對方有一個人可以相遇。" },
  { icon: VolumeX, title: "訊號盲區與安靜離職", he: "「最近都沒吵架，我們很穩定。」", she: "「我不吵了，因為我已經不期待了。」", note: "還願意抱怨，是還在投資。安靜，才是需要靠近的時候。" },
  { icon: Timer, title: "高壓逼問與峰終定律", he: "「我只是想把話講清楚，知道問題在哪。」", she: "「我被審問了。原來最後是這個樣子。」", note: "一段感情怎麼結尾，會決定它怎麼被記得。" },
];

const ACT_META = [
  { icon: Luggage, when: "週四 晚上十一點", where: "客廳沙發" },
  { icon: Moon, when: "三個月後 隔天中午", where: "訊息對話框" },
  { icon: KeyRound, when: "又過了兩個月 深夜", where: "書桌前" },
];

const LETTERS = {
  A: {
    low: "你不需要變成另一個人。你只是在這三個晚上，多留了一點自己在現場。請記得這種感覺——被需要的從來不是你的效率，而是你這個人。",
    mid: "你其實一直都在乎，只是在乎的方式，有時候沒有抵達。這不是缺陷，是一種沒有人教過你的語言。你已經聽懂一半了，剩下的，慢慢來。",
    high: "先別急著責怪自己。你用你被教會的方式去愛了：負責、不添麻煩、把事情做好。只是沒有人告訴過你，她要的是你這個人走進來。現在你知道了，而知道，永遠不算太晚。",
  },
  B: {
    low: "你沒有委屈自己，也沒有把對方推開。把需要說清楚，是一件很勇敢的事。謝謝你願意再相信一次：話，是可以被聽見的。",
    mid: "你的敏感不是負擔，是你愛人的天線。只是這支天線收得太多、發得太少。下一次想說『算了』的時候，試著多說一句就好。",
    high: "你不是太難懂，也不是要得太多。你只是一個人撐了太久，久到忘了可以開口。不管這段關係最後去哪裡，請先把那個一直說『沒事』的自己，接回來。",
  },
};

const PRACTICES = {
  A: [
    "今晚問一個不求解答的問題：「今天有沒有哪一刻，你希望我在？」",
    "下一次想說「都可以」之前，先說出一個自己的偏好，再小都好。",
    "當她說「沒事」，回一句：「好，那我陪你坐一下。」然後真的坐下。",
  ],
  B: [
    "這週挑一件小事，用「情境＋感受＋一個動作＋時間」完整說一次。",
    "想說「算了」的時候，改成：「我有事，但我需要一點時間整理。」",
    "當他做對一件小事，告訴他：「剛剛那樣，我有被接住。」讓他知道地圖是對的。",
  ],
};

/* -------------------------------- 計分引擎 -------------------------------- */

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const BEAT_WEIGHT = 0.55; // 每幕有上下兩個抉擇點，單次影響減半左右
const BASE = { dims: [50, 50, 50, 50], vit: 62, quiet: 20, clarity: 100 };

function computeState(perspective, choices) {
  const acts = SCRIPT[perspective];
  const s = { dims: [...BASE.dims], vit: BASE.vit, quiet: BASE.quiet, clarity: BASE.clarity, tone: null };
  choices.forEach((optIdx, actIdx) => {
    const o = acts[actIdx].options[optIdx];
    s.dims = s.dims.map((v, i) => clamp(v + o.d[i] * BEAT_WEIGHT));
    s.vit = clamp(s.vit + o.vit * BEAT_WEIGHT);
    s.quiet = clamp(s.quiet + o.quiet * BEAT_WEIGHT);
    s.clarity = clamp(s.clarity + o.clarity * BEAT_WEIGHT, 22, 100);
    s.tone = o.tone;
  });
  const avg = s.dims.reduce((a, b) => a + b, 0) / 4;
  s.risk = Math.round(s.quiet * 0.6 + (100 - avg) * 0.4);
  s.level = s.risk < 34 ? "low" : s.risk < 64 ? "mid" : "high";
  return s;
}

/* ------------------------------ 視覺隱喻引擎 ------------------------------ */

const ECG_BEAT = [[0, 40], [30, 40], [36, 34], [42, 40], [48, 40], [52, 46], [58, 6], [64, 62], [69, 40], [80, 40], [88, 30], [96, 40], [100, 40]];
const ECG_PATH = Array.from({ length: 12 })
  .flatMap((_, b) => ECG_BEAT.map(([x, y]) => `${x + b * 100},${y}`))
  .join(" ");
const PARTICLE_OFFSETS = [-14, 8, -4, 14, -9, 3, 10];

function Figure({ cx, role, opacity = 1, blur = 0, label, sub }) {
  const c = CAST[role];
  return (
    <g>
      <g className="fig" style={{ opacity, filter: `blur(${blur}px)` }}>
        <circle cx={cx} cy={66} r={20} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
        <path d={`M ${cx - 36},146 Q ${cx - 36},98 ${cx},98 Q ${cx + 36},98 ${cx + 36},146 Z`} fill={c.fill} stroke={c.stroke} strokeWidth={2} />
      </g>
    </g>
  );
}

function SignalParticles({ tone, animKey }) {
  if (!tone) return null;
  const shape = {
    warm: <circle r={5.5} fill="#E8973A" filter="url(#glow)" />,
    neutral: <circle r={3.5} fill="#54463A" />,
    cold: <polygon points="0,-7 5,0 0,7 -5,0" fill="#8C7A66" stroke="#7D6B58" strokeWidth={1} />,
    spike: <polygon points="-12,-5 12,0 -12,5 -7,0" fill="#D9414F" filter="url(#glowRed)" />,
  }[tone];
  const gap = tone === "spike" ? 0.14 : 0.42;
  return (
    <g>
      {PARTICLE_OFFSETS.map((dy, i) => (
        <g key={`${animKey}-${tone}-${i}`} transform={`translate(150 ${104 + dy})`}>
          <g className={`sig sig-${tone}`} style={{ animationDelay: `${i * gap}s` }}>{shape}</g>
        </g>
      ))}
    </g>
  );
}

function Firewall({ up }) {
  const bricks = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 2; c++) {
      bricks.push(<rect key={`${r}-${c}`} x={426 + c * 12 + (r % 2 ? 0 : -4)} y={40 + r * 13} width={11} height={11} rx={1.5} fill="rgba(244,63,94,.25)" stroke="#D9596A" strokeWidth={1} />);
    }
  }
  return (
    <g className="wall" style={{ transform: up ? "scaleY(1)" : "scaleY(0)", opacity: up ? 1 : 0 }}>
      {bricks}
      <text x={434} y={32} textAnchor="middle" fill="#B8404F" fontSize="13" fontWeight="600">防衛高牆</text>
    </g>
  );
}

function EcgStrip({ amp, color, flat }) {
  return (
    <svg viewBox="0 0 600 80" className="h-16 w-full" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="40" x2="600" y2="40" stroke="#EADFCB" strokeWidth="1" />
      <g className="amp" style={{ transform: `scaleY(${flat ? 0.001 : amp})`, transformOrigin: "0px 40px" }}>
        <g className="ecg-scroll">
          <polyline points={ECG_PATH} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </g>
      </g>
      {flat && <line x1="0" y1="40" x2="600" y2="40" stroke={color} strokeWidth="2" />}
    </svg>
  );
}

function HourglassMeter({ quiet }) {
  const q = quiet / 100;
  return (
    <svg viewBox="0 0 60 80" className="h-16 w-12 shrink-0" aria-hidden="true">
      <defs>
        <clipPath id="hgClip">
          <path d="M10,10 C10,30 27,36 27,40 C27,44 10,50 10,70 H50 C50,50 33,44 33,40 C33,36 50,30 50,10 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#hgClip)">
        <rect className="sand" x="8" y="10" width="44" height="30" fill="#E8973A" opacity=".85" style={{ transform: `scaleY(${1 - q})`, transformOrigin: "30px 40px" }} />
        <rect className="sand" x="8" y="40" width="44" height="30" fill="#8C7A66" style={{ transform: `scaleY(${q})`, transformOrigin: "30px 70px" }} />
        {q > 0.02 && q < 0.98 && <line x1="30" y1="38" x2="30" y2="70" stroke="#E8973A" strokeWidth="1.2" strokeDasharray="2 3" />}
      </g>
      <path d="M10,10 C10,30 27,36 27,40 C27,44 10,50 10,70 H50 C50,50 33,44 33,40 C33,36 50,30 50,10 Z" fill="none" stroke="#7D6B58" strokeWidth="1.8" />
      <line x1="7" y1="8" x2="53" y2="8" stroke="#7D6B58" strokeWidth="3" strokeLinecap="round" />
      <line x1="7" y1="72" x2="53" y2="72" stroke="#7D6B58" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function RelationshipDashboard({ perspective, state, xray, animKey }) {
  const p = PERSPECTIVES[perspective];
  const you = CAST[p.you];
  const partner = CAST[p.partner];
  const tone = state.tone ? (xray ? state.tone : "neutral") : null;
  const clarity = xray ? state.clarity : 100;
  const flat = xray && state.vit <= 10;
  const amp = xray ? 0.15 + (state.vit / 100) * 0.95 : 0.8;
  const ecgColor = !xray ? "#7D6B58" : state.vit > 55 ? "#2F7A54" : state.vit > 25 ? "#B4610F" : "#B8404F";
  const vitLabel = !xray ? "表面看起來：平穩" : flat ? "死線 Flatline" : state.vit > 55 ? "活躍" : state.vit > 25 ? "振幅衰減中" : "幾乎沒有波動";
  const toneLabel = { warm: "暖光粒子：訊號抵達", cold: "下沉冰晶：訊號半途墜落", spike: "紅色尖刺：對方升起防衛高牆", neutral: "你以為：訊號正常送達" }[tone] || "等待你發出訊號";

  return (
    <section aria-label="關係動態視覺儀表板" className="rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-4 backdrop-blur sm:p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-sand-400">
        <span className="flex items-center gap-1.5 font-medium text-sand-300"><Waypoints className="h-4 w-4 text-cyan-300" />關係動態視覺儀表板</span>
        <span className={xray ? "text-amber-300" : "text-sand-500"}>{xray ? "X 光透視中：你看得見真實狀態" : "X 光已關閉：你只看得見表面"}</span>
      </div>

      <p className="mb-1 text-center text-xs text-sand-400 sm:text-sm">{toneLabel}</p>
      <svg viewBox="40 14 520 146" className="w-full" role="img" aria-label={`訊號狀態：${toneLabel}`}>
        <defs>
          <filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="glowRed" x="-100%" y="-200%" width="300%" height="500%"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <line x1="140" y1="104" x2="460" y2="104" stroke="#EADFCB" strokeWidth="1" strokeDasharray="3 6" />
        {tone === "warm" && <circle className="halo" cx={505} cy={100} r={58} fill="none" stroke="#E8973A" strokeWidth={2} />}
        <Figure cx={95} role={p.you} opacity={0.2 + (clarity / 100) * 0.8} blur={(100 - clarity) / 22} label={`你｜${you.name}`} sub={xray ? `自我清晰度 ${Math.round(clarity)}%` : you.tag} />
        <Figure cx={505} role={p.partner} label={`伴侶｜${partner.name}`} sub={partner.tag} />
        <SignalParticles tone={tone} animKey={animKey} />
        <Firewall up={tone === "spike"} />
      </svg>

      <div className="flex justify-between gap-4 px-1 text-center sm:px-6">
        <div><div className="text-sm font-semibold text-sand-100">你｜{you.name}</div><div className="text-xs text-sand-500">{xray ? `自我清晰度 ${Math.round(clarity)}%` : you.tag}</div></div>
        <div><div className="text-sm font-semibold text-sand-100">伴侶｜{partner.name}</div><div className="text-xs text-sand-500">{partner.tag}</div></div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="rounded-xl border border-sand-800 bg-sand-950/70 px-3 py-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-sand-300"><HeartPulse className="h-3.5 w-3.5" style={{ color: ecgColor }} />關係心電圖</span>
            <span style={{ color: ecgColor }}>{vitLabel}</span>
          </div>
          <EcgStrip amp={amp} color={ecgColor} flat={flat} />
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-sand-800 bg-sand-950/70 px-4 py-2">
          {xray ? <HourglassMeter quiet={state.quiet} /> : <div className="flex h-16 w-12 items-center justify-center"><Lock className="h-6 w-6 text-sand-600" /></div>}
          <div className="text-xs">
            <div className="flex items-center gap-1.5 text-sand-300"><Hourglass className="h-3.5 w-3.5 text-amber-300" />終焉沙漏</div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-sand-100">{xray ? `${Math.round(state.quiet)}%` : "？"}</div>
            <div className="text-sand-500">{xray ? "安靜離職進度" : "結算時揭曉"}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- 共用元件 -------------------------------- */

function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="orb absolute -left-32 top-10 h-96 w-96 rounded-full bg-amber-500/30 blur-3xl" />
      <div className="orb absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-rose-500/20 blur-3xl" style={{ animationDelay: "-6s" }} />
      <div className="orb absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" style={{ animationDelay: "-11s" }} />
    </div>
  );
}

function XrayToggle({ xray, setXray, compact }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={xray}
      onClick={() => setXray(!xray)}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${xray ? "border-amber-400/60 bg-amber-400/10 text-amber-200" : "border-sand-700 bg-sand-900 text-sand-400 hover:text-sand-200"}`}
    >
      {xray ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      {compact ? (xray ? "X 光：開" : "X 光：關") : xray ? "伴侶腦內 X 光透視：開啟" : "伴侶腦內 X 光透視：關閉"}
    </button>
  );
}

function PrimaryButton({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A8432F] to-[#B85C1C] px-6 py-3 text-sm font-semibold text-[#FFF8EC] shadow-lg shadow-orange-900/20 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${className}`}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition group-hover:transand-x-0.5" />
    </button>
  );
}

function SectionTitle({ kicker, title, children }) {
  return (
    <div className="mb-6">
      <div className="text-xs font-medium tracking-[0.25em] text-cyan-300/80">{kicker}</div>
      <h2 className="font-display mt-2 text-2xl font-semibold text-sand-50 sm:text-3xl">{title}</h2>
      {children && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sand-400">{children}</p>}
    </div>
  );
}

/* --------------------------------- 視圖一：首頁 ----------------------------- */

function SpectrumMap() {
  const [sel, setSel] = useState("cocreate");
  const W = 520, H = 340, pad = 44;
  const pt = SPECTRUM_POINTS.find((p) => p.id === sel);
  const px = (x) => pad + x * (W - pad * 2);
  const py = (y) => pad + y * (H - pad * 2);
  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="雙軸溝通光譜：橫軸為任務導向到情感導向，縱軸為自我清晰到自我模糊">
          <defs>
            <linearGradient id="specX" x1="0" x2="1"><stop offset="0" stopColor="#3B8C8C" /><stop offset=".5" stopColor="#9A7BC8" /><stop offset="1" stopColor="#D9596A" /></linearGradient>
            <radialGradient id="sweet"><stop offset="0" stopColor="#E8973A" stopOpacity=".28" /><stop offset="1" stopColor="#E8973A" stopOpacity="0" /></radialGradient>
          </defs>
          <circle cx={px(0.5)} cy={py(0.16)} r={95} fill="url(#sweet)" />
          <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="url(#specX)" strokeWidth="3" strokeLinecap="round" />
          <line x1={W / 2} y1={pad - 14} x2={W / 2} y2={H - pad + 14} stroke="#D9C8AD" strokeWidth="1.5" strokeDasharray="4 5" />
          <text x={pad} y={H / 2 - 10} fill="#2F6F73" fontSize="12">任務端：用做事表達</text>
          <text x={W - pad} y={H / 2 - 10} fill="#B8404F" fontSize="12" textAnchor="end">情感端：用感受表達</text>
          <text x={W / 2 + 8} y={pad - 14} fill="#54463A" fontSize="12">自我清晰</text>
          <text x={W / 2 + 8} y={H - pad + 14} fill="#8C7A66" fontSize="12">自我模糊</text>
          {SPECTRUM_POINTS.map((p) => {
            const on = p.id === sel;
            return (
              <g key={p.id} role="button" tabIndex={0} aria-label={p.label} aria-pressed={on} onClick={() => setSel(p.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSel(p.id)} className="cursor-pointer focus:outline-none">
                <circle cx={px(p.x)} cy={py(p.y)} r={22} fill="transparent" />
                {on && <circle className="halo" cx={px(p.x)} cy={py(p.y)} r={15} fill="none" stroke={p.color} strokeWidth="1.5" />}
                <circle cx={px(p.x)} cy={py(p.y)} r={on ? 8 : 6} fill={p.color} opacity={on ? 1 : 0.7} />
                <text x={px(p.x)} y={py(p.y) + 26} textAnchor="middle" fill={on ? "#33291F" : "#7D6B58"} fontSize="12.5" fontWeight={on ? 700 : 400}>{p.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div key={pt.id} className="fade-up flex flex-col justify-center rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-6">
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: pt.color }}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: pt.color }} />{pt.label}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-sand-300">{pt.desc}</p>
        <p className="mt-4 text-xs text-sand-500">點選光譜上的光點，看看每種溝通姿態落在哪裡。</p>
      </div>
    </div>
  );
}

function PrismLab() {
  const [lineIdx, setLineIdx] = useState(0);
  const [lens, setLens] = useState("intent");
  const item = PRISM_LINES[lineIdx];
  const lensMeta = LENSES.find((l) => l.key === lens);
  return (
    <div className="rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-5 sm:p-7">
      <div className="flex flex-col gap-2">
        {PRISM_LINES.map((l, i) => (
          <button
            key={l.line}
            type="button"
            onClick={() => setLineIdx(i)}
            aria-pressed={i === lineIdx}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${i === lineIdx ? "border-sand-500 bg-sand-800 text-sand-50" : "border-sand-800 bg-sand-950/50 text-sand-400 hover:border-sand-700 hover:text-sand-200"}`}
          >
            <Quote className="h-4 w-4 shrink-0 text-sand-500" />
            <span className="font-display">「{l.line}」</span>
          </button>
        ))}
      </div>

      <svg viewBox="0 0 600 150" className="mt-5 w-full" aria-hidden="true">
        <line x1="20" y1="75" x2="262" y2="75" stroke="#33291F" strokeWidth="3" strokeLinecap="round" opacity=".85" />
        <polygon points="300,22 352,128 248,128" fill="rgba(148,163,184,.1)" stroke="#7D6B58" strokeWidth="1.5" />
        {LENSES.map((l, i) => {
          const y = 30 + i * 45;
          const on = l.key === lens;
          return <line key={l.key} x1="330" y1="78" x2="580" y2={y} stroke={l.beam} strokeWidth={on ? 5 : 2} strokeLinecap="round" opacity={on ? 1 : 0.3} style={{ transition: "all .4s" }} />;
        })}
        <text x="20" y="62" fill="#7D6B58" fontSize="11">一句話</text>
        <text x="300" y="146" fill="#8C7A66" fontSize="11" textAnchor="middle">溝通稜鏡</text>
      </svg>

      <div role="tablist" aria-label="解碼視角" className="mt-3 grid gap-2 sm:grid-cols-3">
        {LENSES.map((l) => (
          <button
            key={l.key}
            role="tab"
            type="button"
            aria-selected={l.key === lens}
            onClick={() => setLens(l.key)}
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${l.key === lens ? `${l.ring} ${l.color}` : "border-sand-800 text-sand-400 hover:text-sand-200"}`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div key={`${lineIdx}-${lens}`} role="tabpanel" className="fade-up mt-4 min-h-28 rounded-xl border border-sand-800 bg-sand-950/70 p-5">
        <div className={`text-xs font-medium ${lensMeta.color}`}>{lensMeta.label}</div>
        <p className="mt-2 text-[15px] leading-relaxed text-sand-200">{item[lens]}</p>
      </div>
    </div>
  );
}

function HeroArt() {
  const l = CAST.linear, r = CAST.sensitive;
  return (
    <svg viewBox="0 0 420 150" className="mx-auto w-full max-w-md" role="img" aria-label="兩個人之間，有一條正在流動的暖色絲線">
      <defs><linearGradient id="thread" x1="0" x2="1"><stop offset="0" stopColor={l.stroke} /><stop offset="1" stopColor={r.stroke} /></linearGradient></defs>
      <circle cx="210" cy="70" r="62" fill="#E8973A" opacity=".12" />
      <path className="thread" d="M 96,84 C 150,30 180,120 210,74 S 280,30 324,84" fill="none" stroke="url(#thread)" strokeWidth="3" strokeLinecap="round" strokeDasharray="14 8" />
      <path d="M210 62 c -5 -9 -18 -4 -14 6 c 2 6 9 10 14 14 c 5 -4 12 -8 14 -14 c 4 -10 -9 -15 -14 -6 z" fill="#D9596A" opacity=".85" />
      {[[70, l], [350, r]].map(([cx, c]) => (
        <g key={cx}>
          <circle cx={cx} cy={58} r={17} fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
          <path d={`M ${cx - 30},128 Q ${cx - 30},86 ${cx},86 Q ${cx + 30},86 ${cx + 30},128 Z`} fill={c.fill} stroke={c.stroke} strokeWidth="2.5" />
        </g>
      ))}
    </svg>
  );
}

function Mechanisms() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {MECHANISMS.map((m) => (
        <div key={m.title} className="rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-300"><m.icon className="h-5 w-5" /></span>
            <h3 className="font-display text-lg font-semibold text-sand-50">{m.title}</h3>
          </div>
          <div className="mt-4 space-y-2 text-sm leading-relaxed">
            <p className="rounded-2xl rounded-bl-sm bg-cyan-400/10 px-3 py-2 text-sand-200"><span className="mr-1 text-xs font-medium text-cyan-300">這一邊以為</span>{m.he}</p>
            <p className="rounded-2xl rounded-br-sm bg-amber-400/15 px-3 py-2 text-sand-200"><span className="mr-1 text-xs font-medium text-amber-300">另一邊感受</span>{m.she}</p>
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-sm text-sand-400"><Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />{m.note}</p>
        </div>
      ))}
    </div>
  );
}

function Landing({ onStart, onChat }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
      <header className="fade-up text-center">
        <HeroArt />
        <div className="mt-4 text-xs tracking-[0.35em] text-sand-400">THE COMMUNICATION SPECTRUM</div>
        <h1 className="font-display mt-5 text-4xl font-semibold leading-tight text-sand-50 sm:text-6xl">
          溝通光譜
          <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-violet-300 to-amber-300 bg-clip-text text-2xl text-transparent sm:text-4xl">在終焉之前</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-sand-300">
          <span className="font-display text-lg text-sand-100">嗨，先坐一下，喝口熱的。</span><br />
          沒有人是木頭，也沒有人無理取鬧。<br className="hidden sm:block" />
          大多數感情不是死於一場大吵，而是死於一百次沒被接住的小訊號。<br className="hidden sm:block" />
          這裡不分對錯，也不找戰犯。只想陪你用一段對話，走過光譜上的每一個位置，看看每一種人心裡在想什麼。
        </p>
        <div className="mx-auto mt-8 h-1.5 max-w-md rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 opacity-80" />
        <div className="mx-auto mt-2 flex max-w-md justify-between text-xs text-sand-500"><span>理性任務</span><span>情感共鳴</span></div>
        <PrimaryButton onClick={onStart} className="mt-9">進入雙視角互動劇場</PrimaryButton>
        <div><button type="button" onClick={onChat} className="mt-4 text-sm text-sand-500 underline decoration-sand-700 underline-offset-4 hover:text-sand-300">或先用一段對話認識光譜</button></div>
        <p className="mt-3 text-xs text-sand-500">三幕、六個抉擇，每人約十分鐘。你的每個選擇，都會改變下一段的開場。</p>
      </header>

      <section className="mt-24">
        <SectionTitle kicker="00 ／ FOUR QUIET DRIFTS" title="四個讓感情悄悄變冷的地方">
          它們都不是誰的錯，只是兩種愛人的方式，中間少了一個翻譯。你可能在其中看見自己，也可能看見你愛的那個人。
        </SectionTitle>
        <Mechanisms />
      </section>

      <section className="mt-24">
        <SectionTitle kicker="01 ／ SPECTRUM" title="雙軸光譜：你們站在哪裡？">
          橫軸是「在乎怎麼表達」：左邊的任務端習慣用做事，右邊的情感端習慣用感受，中間是兩邊會合的地方。縱軸是「人在不在」：關係裡還有沒有一個清楚的自己。同一個人在不同時候，也會站到不同的位置。
        </SectionTitle>
        <SpectrumMap />
      </section>

      <section className="mt-24">
        <SectionTitle kicker="02 ／ PRISM LAB" title="訊號折射實驗室">
          選一句你一定聽過（或說過）的話，再切換三面稜鏡。說出口的、被聽到的、和真正發生的，是三件不同的事。
        </SectionTitle>
        <PrismLab />
      </section>

      <section className="mt-24 rounded-2xl border border-sand-800 bg-gradient-to-br from-sand-900 to-sand-950 p-8 text-center">
        <Coffee className="mx-auto mb-3 h-7 w-7 text-amber-300" />
        <h2 className="font-display text-2xl font-semibold text-sand-50">看懂折射之後，親自走一遍</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-sand-400">你會走進同一段感情的三個夜晚。你可以選擇成為他，也可以選擇成為她。慢慢來，這裡沒有人會評分你。</p>
        <PrimaryButton onClick={onChat} className="mt-6">開始一段對話</PrimaryButton>
        <div><button type="button" onClick={onStart} className="mt-4 text-sm text-sand-500 underline decoration-sand-700 underline-offset-4 hover:text-sand-300">或直接進入雙視角互動劇場</button></div>
      </section>
    </div>
  );
}

/* ------------------------------ 視圖二：視角設定 ---------------------------- */

function Setup({ mode, setMode, perspective, setPerspective, xray, setXray, onBegin, onBack }) {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-14 sm:px-6">
      <button type="button" onClick={onBack} className="mb-6 text-xs text-sand-500 hover:text-sand-300">← 回到首頁</button>
      <SectionTitle kicker="SETUP" title="選擇你要走進誰的心裡">同一段感情，兩個人經歷的是兩個故事。選一個視角開始；結束後，很推薦換另一邊再走一次——理解，常常是從「原來你那時候是這樣想的」開始的。</SectionTitle>

      <div role="radiogroup" aria-label="體驗方式" className="mb-6 grid gap-3 sm:grid-cols-2">
        {[
          { id: "pair", icon: Users, title: "兩個人一起", text: "輪流用同一支手機，各走一個視角。兩人都走完後，一起看雙人對照與聊天卡。" },
          { id: "solo", icon: User, title: "我先自己走一遍", text: "一個人體驗其中一個視角，看完自己的診斷報告。" },
        ].map((m) => (
          <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} onClick={() => setMode(m.id)} className={`flex items-start gap-3 rounded-3xl border p-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${mode === m.id ? "border-rose-400/70 bg-rose-400/10" : "border-sand-800 bg-sand-900/80 hover:border-sand-600"}`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-400/20 text-rose-300"><m.icon className="h-5 w-5" /></span>
            <span><span className="block text-base font-semibold text-sand-50">{m.title}</span><span className="mt-1 block text-sm leading-relaxed text-sand-400">{m.text}</span></span>
          </button>
        ))}
      </div>
      {mode === "pair" && <p className="mb-3 text-sm leading-relaxed text-sand-400">第一位先選一個視角，第二位會自動走另一邊。<span className="text-sand-200">小建議：各自選「比較不像自己」的那一邊</span>，會更容易懂對方。</p>}

      <div role="radiogroup" aria-label="體驗視角" className="grid gap-4 sm:grid-cols-2">
        {Object.values(PERSPECTIVES).map((p) => {
          const on = perspective === p.id;
          const c = CAST[p.you];
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPerspective(p.id)}
              className={`relative rounded-2xl border p-6 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${on ? (p.id === "A" ? "border-cyan-400/70 bg-cyan-400/5" : "border-amber-400/70 bg-amber-400/5") : "border-sand-800 bg-sand-900/60 hover:border-sand-600"}`}
            >
              {p.recommended && <span className="absolute right-4 top-4 rounded-full bg-cyan-400/15 px-2 py-0.5 text-[11px] font-medium text-cyan-300">預設推薦</span>}
              <svg viewBox="0 0 80 80" className="h-14 w-14" aria-hidden="true">
                <circle cx="40" cy="26" r="13" fill={c.fill} stroke={c.stroke} strokeWidth="2" />
                <path d="M 14,74 Q 14,44 40,44 Q 66,44 66,74 Z" fill={c.fill} stroke={c.stroke} strokeWidth="2" />
              </svg>
              <div className={`mt-3 text-base font-semibold ${c.text}`}>{p.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-sand-400">{p.blurb}</p>
              <div className={`mt-4 flex items-center gap-1.5 text-xs ${on ? "text-sand-200" : "text-sand-600"}`}>
                <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${on ? "border-sand-200 bg-sand-200" : "border-sand-600"}`}>{on && <Check className="h-3 w-3 text-sand-900" />}</span>
                {on ? "已選擇" : "選擇這個視角"}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-sand-100"><Brain className="h-4 w-4 text-amber-300" />伴侶腦內 X 光透視（上帝視角）</div>
          <XrayToggle xray={xray} setXray={setXray} />
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className={`rounded-xl border p-4 ${xray ? "border-amber-400/40 bg-amber-400/5 text-sand-200" : "border-sand-800 text-sand-500"}`}>
            <div className="font-medium">開啟</div>
            <p className="mt-1 leading-relaxed">即時看見對方的內心 OS、訊號粒子的真實形狀、心電圖振幅與終焉沙漏。適合想「學會看」的你。</p>
          </div>
          <div className={`rounded-xl border p-4 ${!xray ? "border-sand-400/50 bg-sand-400/5 text-sand-200" : "border-sand-800 text-sand-500"}`}>
            <div className="font-medium">關閉</div>
            <p className="mt-1 leading-relaxed">只看得見對方表面的回應——就像真實的戀愛。所有漏接的訊號，到結算頁才一次揭曉。適合想體驗「斷崖感」的你。</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center"><PrimaryButton onClick={onBegin}>開始第一幕</PrimaryButton></div>
    </div>
  );
}

/* ------------------------------ 視圖三：互動劇場 ---------------------------- */

const TONE_STYLE = {
  warm: { chip: "bg-amber-400/15 text-amber-300", border: "border-amber-400/50" },
  cold: { chip: "bg-sand-500/20 text-sand-300", border: "border-sand-500/60" },
  spike: { chip: "bg-rose-500/15 text-rose-300", border: "border-rose-400/50" },
};

function Bubble({ who, text, perspective, delay = 0 }) {
  const p = PERSPECTIVES[perspective];
  if (who === "narr") {
    return <p className="fade-up text-sm leading-relaxed text-sand-400" style={{ animationDelay: `${delay}s` }}>{text}</p>;
  }
  const mine = who === "you";
  const c = CAST[mine ? p.you : p.partner];
  return (
    <div className={`fade-up flex ${mine ? "justify-end" : "justify-start"}`} style={{ animationDelay: `${delay}s` }}>
      <div className={`max-w-[85%] rounded-2xl border px-4 py-3 text-[15px] leading-relaxed text-sand-100 ${mine ? "rounded-br-sm" : "rounded-bl-sm"}`} style={{ borderColor: `${c.stroke}66`, background: c.fill }}>
        <div className={`mb-1 text-xs font-medium ${c.text}`}>{mine ? `你（${c.name}）` : c.name}</div>
        {text}
      </div>
    </div>
  );
}

function Theater({ perspective, xray, setXray, choices, shownIdx, answered, onChoose, onNext, onQuit }) {
  const acts = SCRIPT[perspective];
  const act = acts[shownIdx];
  const chosen = answered ? act.options[choices[shownIdx]] : null;
  const state = useMemo(() => computeState(perspective, choices), [perspective, choices]);
  const partner = CAST[PERSPECTIVES[perspective].partner];
  const isLast = shownIdx === acts.length - 1;
  const meta = { ...ACT_META[Math.floor(shownIdx / 2)], ...(act.meta || {}) };
  const scene = act.bridge && shownIdx > 0 ? [{ who: "narr", text: act.bridge[acts[shownIdx - 1].options[choices[shownIdx - 1]].tone] }, ...act.scene] : act.scene;
  const ActIcon = meta.icon;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <ol className="flex items-center gap-2" aria-label="劇幕進度">
          {acts.map((a, i) => (
            <li key={i} aria-current={i === shownIdx ? "step" : undefined} className={`flex items-center gap-2 text-xs ${i === shownIdx ? "text-sand-100" : i < shownIdx ? "text-sand-400" : "text-sand-600"}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${i === shownIdx ? "border-amber-300 text-amber-300" : i < shownIdx ? "border-sand-500 bg-sand-700" : "border-sand-700"}`}>{i < shownIdx ? <Check className="h-3 w-3" /> : i + 1}</span>
              {i < acts.length - 1 && <span className="h-px w-4 bg-sand-700 sm:w-8" />}
            </li>
          ))}
        </ol>
        <div className="flex items-center gap-2">
          <XrayToggle xray={xray} setXray={setXray} compact />
          <button type="button" onClick={onQuit} className="rounded-full border border-sand-800 px-3 py-1.5 text-xs text-sand-500 hover:text-sand-300">離開</button>
        </div>
      </div>

      <RelationshipDashboard perspective={perspective} state={state} xray={xray} animKey={choices.length} />

      <article key={shownIdx} className="mt-6 rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-300"><ActIcon className="h-7 w-7" /></span>
          <div>
            <div className="text-xs tracking-[0.2em] text-amber-300">{act.act}・{act.part}</div>
            <h2 className="font-display mt-0.5 text-2xl font-semibold text-sand-50">《{act.title}》</h2>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-sand-400">
              <span className="rounded-full bg-sand-800/70 px-2.5 py-0.5">{meta.when}</span>
              <span className="rounded-full bg-sand-800/70 px-2.5 py-0.5">{meta.where}</span>
              <span className="rounded-full bg-sand-800/70 px-2.5 py-0.5">{act.focus}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {scene.map((l, i) => <Bubble key={i} who={l.who} text={l.text} perspective={perspective} delay={answered ? 0 : i * 0.35} />)}
        </div>

        {!answered && (
          <div className="fade-up mt-7" style={{ animationDelay: `${scene.length * 0.35}s` }}>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-sand-300"><MessageCircle className="h-4 w-4 text-cyan-300" />你會怎麼回？<span className="text-xs font-normal text-sand-500">沒有標準答案，選你最可能說出口的那一句。</span></div>
            <div className="space-y-3">
              {act.options.map((o, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChoose(i)}
                  className="group flex w-full items-start gap-3 rounded-xl border border-sand-700 bg-sand-950/60 px-4 py-3.5 text-left text-[15px] leading-relaxed text-sand-200 transition hover:border-sand-400 hover:bg-sand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sand-600 text-xs text-sand-400 group-hover:border-sand-300 group-hover:text-sand-100">{"ABC"[i]}</span>
                  <span>「{o.say}」</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {answered && (
          <div className="mt-5 space-y-3">
            <Bubble who="you" text={chosen.say} perspective={perspective} />
            <Bubble who="partner" text={chosen.surface} perspective={perspective} delay={0.5} />

            {xray ? (
              <div className="fade-up space-y-3" style={{ animationDelay: "1.1s" }}>
                <div className="rounded-2xl border border-dashed border-amber-400/50 bg-amber-400/5 px-4 py-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-amber-300"><Brain className="h-3.5 w-3.5" />{partner.name}的內心 OS</div>
                  <p className="text-[15px] italic leading-relaxed text-amber-50/90">{chosen.inner}</p>
                </div>
                <div className={`rounded-xl border bg-sand-950/60 px-4 py-3 ${TONE_STYLE[chosen.tone].border}`}>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TONE_STYLE[chosen.tone].chip}`}>{chosen.tag}</span>
                  <p className="mt-2 text-sm leading-relaxed text-sand-300">{chosen.review}</p>
                </div>
              </div>
            ) : (
              <p className="fade-up flex items-center gap-2 pt-1 text-xs text-sand-500" style={{ animationDelay: "1.1s" }}>
                <EyeOff className="h-3.5 w-3.5" />你只聽得見對方說出口的話。這句回應背後是什麼？結算時揭曉。
              </p>
            )}

            <div className="fade-up pt-4 text-right" style={{ animationDelay: "1.5s" }}>
              <PrimaryButton onClick={onNext}>{isLast ? "查看診斷報告" : acts[shownIdx + 1].act === act.act ? "這一幕還沒結束" : `進入${acts[shownIdx + 1].act}`}</PrimaryButton>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

/* ------------------------------ 視圖四／五：報告 ---------------------------- */

function RadarChart({ dims, dims2 }) {
  const C = 160, R = 105;
  const axes = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const poly = (scale) => axes.map(([x, y]) => `${C + x * R * scale},${C + y * R * scale}`).join(" ");
  const data = axes.map(([x, y], i) => `${C + x * R * (dims[i] / 100)},${C + y * R * (dims[i] / 100)}`).join(" ");
  const labelPos = [[C, C - R - 26], [C + R + 12, C - 4], [C, C + R + 24], [C - R - 12, C - 4]];
  const anchors = ["middle", "start", "middle", "end"];
  return (
    <svg viewBox="-60 0 440 320" className="w-full max-w-md" role="img" aria-label={`四維度溝通雷達圖：${DIMS.map((d, i) => `${d.label} ${Math.round(dims[i])} 分`).join("、")}`}>
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3B8C8C" stopOpacity=".45" /><stop offset="1" stopColor="#E8973A" stopOpacity=".45" /></linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((s) => <polygon key={s} points={poly(s)} fill="none" stroke="#D9C8AD" strokeWidth="1" />)}
      {axes.map(([x, y], i) => <line key={i} x1={C} y1={C} x2={C + x * R} y2={C + y * R} stroke="#D9C8AD" strokeWidth="1" />)}
      {dims2 && <polygon points={axes.map(([x, y], i) => `${C + x * R * (dims2[i] / 100)},${C + y * R * (dims2[i] / 100)}`).join(" ")} fill="rgba(232,151,58,.25)" stroke="#E8973A" strokeWidth="2.5" strokeLinejoin="round" />}
      <polygon points={data} fill={dims2 ? "rgba(59,140,140,.25)" : "url(#radarFill)"} stroke={dims2 ? "#3B8C8C" : "#33291F"} strokeWidth={dims2 ? 2.5 : 2} strokeLinejoin="round" />
      {axes.map(([x, y], i) => <circle key={i} cx={C + x * R * (dims[i] / 100)} cy={C + y * R * (dims[i] / 100)} r="4" fill="#33291F" />)}
      {DIMS.map((d, i) => (
        <g key={d.key}>
          <text x={labelPos[i][0]} y={labelPos[i][1]} textAnchor={anchors[i]} fill="#33291F" fontSize="13" fontWeight="600">{d.label}</text>
          <text x={labelPos[i][0]} y={labelPos[i][1] + 16} textAnchor={anchors[i]} fontSize="13" fontWeight="700"><tspan fill={dims2 ? "#2F6F73" : "#B4610F"}>{Math.round(dims[i])}</tspan>{dims2 && <tspan fill="#B4610F">{` ／ ${Math.round(dims2[i])}`}</tspan>}</text>
        </g>
      ))}
    </svg>
  );
}

function RiskGauge({ risk, level }) {
  const color = { low: "#2F7A54", mid: "#B4610F", high: "#B8404F" }[level];
  const label = { low: "暖流暢通", mid: "訊號衰減中", high: "終焉臨界" }[level];
  const r = 70, circ = Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 180 104" className="w-56" role="img" aria-label={`感情終焉風險指數 ${risk}，${label}`}>
        <path d="M 20 94 A 70 70 0 0 1 160 94" fill="none" stroke="#EADFCB" strokeWidth="12" strokeLinecap="round" />
        <path d="M 20 94 A 70 70 0 0 1 160 94" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(risk / 100) * circ} ${circ}`} style={{ transition: "stroke-dasharray 1.2s ease" }} />
        <text x="90" y="80" textAnchor="middle" fill="#33291F" fontSize="38" fontWeight="700">{risk}</text>
        <text x="90" y="98" textAnchor="middle" fill="#8C7A66" fontSize="10">／100</text>
      </svg>
      <div className="mt-1 rounded-full px-3 py-1 text-sm font-semibold" style={{ color, background: `${color}1f` }}>{label}</div>
    </div>
  );
}

function Translator({ defaultTab }) {
  const [tab, setTab] = useState(defaultTab);
  const [dIdx, setDIdx] = useState(0);
  const [cIdx, setCIdx] = useState(0);
  const tabs = [
    { id: "decoder", label: "給直線／傳統大男人的解碼手冊", on: "border-cyan-400/60 bg-cyan-400/10 text-cyan-200" },
    { id: "converter", label: "給高敏伴侶的高解析度指令轉換器", on: "border-amber-400/60 bg-amber-400/10 text-amber-200" },
  ];
  return (
    <div className="rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-5 sm:p-7">
      <div role="tablist" aria-label="跨光譜雙向翻譯機" className="grid gap-2 sm:grid-cols-2">
        {tabs.map((t) => (
          <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`rounded-xl border px-4 py-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${tab === t.id ? t.on : "border-sand-800 text-sand-400 hover:text-sand-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "decoder" && (
        <div role="tabpanel" className="fade-up mt-6">
          <h4 className="text-sm font-semibold text-cyan-300">一、看懂隱形求救：她說的 → 其實是</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {DECODER.map((d, i) => (
              <button key={d.heard} type="button" aria-pressed={i === dIdx} onClick={() => setDIdx(i)} className={`rounded-full border px-3 py-1.5 text-left text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${i === dIdx ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-100" : "border-sand-700 text-sand-400 hover:text-sand-200"}`}>{d.heard}</button>
            ))}
          </div>
          <div key={dIdx} className="fade-up mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-rose-400/30 bg-rose-400/5 p-4">
              <div className="text-xs font-medium text-rose-300">真正的訊號</div>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-200">{DECODER[dIdx].decoded}</p>
            </div>
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4">
              <div className="text-xs font-medium text-emerald-300">你可以這樣接</div>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-200">{DECODER[dIdx].reply}</p>
            </div>
          </div>

          <h4 className="mt-8 text-sm font-semibold text-cyan-300">二、戒斷清單：把舊句型換掉</h4>
          <ul className="mt-3 space-y-3">
            {DETOX.map((d) => (
              <li key={d.bad} className="rounded-xl border border-sand-800 bg-sand-950/60 p-4">
                <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
                  <span className="text-sand-500 line-through decoration-rose-400/60">{d.bad}</span>
                  <ChevronRight className="hidden h-4 w-4 shrink-0 text-sand-600 sm:block" />
                  <span className="font-medium text-sand-100">{d.good}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-sand-400">{d.why}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-xl border border-sand-800 bg-sand-950/60 p-4 text-sm leading-relaxed text-sand-300">
            <span className="font-semibold text-cyan-300">一個判準：</span>當她變得「很好相處」——不吵、不問、不要求——請不要鬆一口氣，請主動去找她。安靜不是和平，是倒數。
          </p>
        </div>
      )}

      {tab === "converter" && (
        <div role="tabpanel" className="fade-up mt-6">
          <h4 className="text-sm font-semibold text-amber-300">選一句你常說（或常吞下去）的話，轉成對方能執行的邀請</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {CONVERTER.map((c, i) => (
              <button key={c.vague} type="button" aria-pressed={i === cIdx} onClick={() => setCIdx(i)} className={`rounded-full border px-3 py-1.5 text-left text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${i === cIdx ? "border-amber-400/60 bg-amber-400/10 text-amber-100" : "border-sand-700 text-sand-400 hover:text-sand-200"}`}>{c.vague}</button>
            ))}
          </div>
          <div key={cIdx} className="fade-up mt-4 space-y-3">
            <div className="rounded-xl border border-sand-700 bg-sand-950/60 p-4">
              <div className="text-xs font-medium text-sand-400">為什麼他接不住</div>
              <p className="mt-1.5 text-sm leading-relaxed text-sand-300">{CONVERTER[cIdx].why}</p>
            </div>
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-300"><Sparkles className="h-3.5 w-3.5" />高解析度版本</div>
              <p className="mt-1.5 text-[15px] leading-relaxed text-sand-100">{CONVERTER[cIdx].hires}</p>
            </div>
          </div>

          <h4 className="mt-8 text-sm font-semibold text-amber-300">轉換公式</h4>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
            {[["情境", "哪一個具體的時刻"], ["感受", "我當時／現在的感覺"], ["一個動作", "看得見、做得到的事"], ["時間框", "什麼時候、做多久"]].map(([t, s], i) => (
              <div key={t} className="rounded-xl border border-sand-800 bg-sand-950/60 p-3">
                <div className="text-xs text-sand-500">{i + 1}</div>
                <div className="font-semibold text-sand-100">{t}</div>
                <div className="mt-0.5 text-xs text-sand-400">{s}</div>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-xl border border-sand-800 bg-sand-950/60 p-4 text-sm leading-relaxed text-sand-300">
            <span className="font-semibold text-amber-300">這不是「為什麼都要我教」。</span>說清楚不代表你的需要比較廉價，而是給對方一次真正做到的機會。如果清楚說了、對方仍一再不接——那也是一個很重要的答案。
          </p>
        </div>
      )}
    </div>
  );
}

function Report({ perspective, choices, xray, onRestart, onSwitch, onHome, embedded }) {
  const acts = SCRIPT[perspective];
  const state = useMemo(() => computeState(perspective, choices), [perspective, choices]);
  const verdict = VERDICTS[perspective][state.level];
  const picked = acts.map((a, i) => a.options[choices[i]]);
  const missedCount = picked.filter((o) => o.missed).length;
  const overwrite = picked.some((o) => o.overwrite);
  const partner = CAST[PERSPECTIVES[perspective].partner];
  const other = perspective === "A" ? "B" : "A";

  return (
    <div className={embedded ? "" : "mx-auto max-w-4xl px-4 pb-24 pt-14 sm:px-6"}>
      <header className="fade-up text-center">
        <div className="text-xs tracking-[0.3em] text-sand-400">DIAGNOSTIC REPORT</div>
        <h1 className="font-display mt-3 text-3xl font-semibold text-sand-50 sm:text-4xl">你的溝通光譜診斷</h1>
        {!xray && <p className="mt-3 text-sm text-amber-300/90">你全程關閉了 X 光。以下，是你當時看不見的一切。</p>}
      </header>

      <section className="fade-up mt-10 rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-6 sm:p-8" style={{ animationDelay: ".15s" }}>
        <div className="text-xs font-medium tracking-widest text-sand-500">尾聲</div>
        <p className="font-display mt-2 text-[17px] leading-loose text-sand-200">{EPILOGUES[perspective][state.level]}</p>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-6">
          <h2 className="mb-2 self-start text-sm font-semibold text-sand-200">四維度溝通雷達圖</h2>
          <RadarChart dims={state.dims} />
        </div>
        <div className="flex flex-col rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-sand-200"><ShieldAlert className="h-4 w-4 text-rose-300" />感情終焉風險指數</h2>
          <div className="mt-4"><RiskGauge risk={state.risk} level={state.level} /></div>
          <div className="mt-5 text-center">
            <div className="text-xs text-sand-500">你的溝通樣貌</div>
            <div className="font-display mt-1 text-xl font-semibold text-sand-50">{verdict.title}</div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-sand-300">{verdict.text}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-sand-950/70 p-2"><div className="text-lg font-semibold text-sand-100">{missedCount}／{acts.length}</div><div className="text-sand-500">漏接的訊號</div></div>
            <div className="rounded-lg bg-sand-950/70 p-2"><div className="text-lg font-semibold text-sand-100">{Math.round(state.quiet)}%</div><div className="text-sand-500">終焉沙漏</div></div>
            <div className="rounded-lg bg-sand-950/70 p-2"><div className="text-lg font-semibold text-sand-100">{state.vit <= 10 ? "死線" : Math.round(state.vit)}</div><div className="text-sand-500">關係生命力</div></div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        {DIMS.map((d, i) => (
          <div key={d.key} className="rounded-xl border border-sand-800 bg-sand-900/60 p-4">
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-semibold text-sand-100">{d.label} <span className="ml-1 text-xs font-normal text-sand-500">{d.en}</span></div>
              <div className="text-sm font-semibold tabular-nums text-amber-300">{Math.round(state.dims[i])}</div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-400" style={{ width: `${state.dims[i]}%` }} /></div>
            <p className="mt-2 text-xs leading-relaxed text-sand-400">{d[perspective]}</p>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <SectionTitle kicker="REPLAY" title="劇本回顧覆盤">逐幕拆解：你說了什麼、對方表面回了什麼、而她／他心裡真正發生了什麼。</SectionTitle>
        <ol className="space-y-5">
          {acts.map((a, i) => {
            const o = picked[i];
            const best = a.options.find((x) => x.tone === "warm");
            return (
              <li key={i} className={`rounded-2xl border bg-sand-900/60 p-5 sm:p-6 ${TONE_STYLE[o.tone].border}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs tracking-widest text-sand-500">{a.act}・{a.part}</span>
                  <h3 className="font-display text-lg font-semibold text-sand-50">《{a.title}》</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE_STYLE[o.tone].chip}`}>{o.tag}</span>
                  {o.missed ? <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-300">訊號漏接</span> : <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">訊號接住</span>}
                  {o.overwrite && <span className="rounded-full bg-rose-500/25 px-2 py-0.5 text-xs font-semibold text-rose-200">觸發記憶覆寫</span>}
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  <div><dt className="text-xs text-sand-500">你說</dt><dd className="mt-0.5 leading-relaxed text-sand-200">「{o.say}」</dd></div>
                  <div><dt className="text-xs text-sand-500">{partner.name}表面回應</dt><dd className="mt-0.5 leading-relaxed text-sand-200">「{o.surface}」</dd></div>
                  <div className="rounded-xl border border-dashed border-amber-400/40 bg-amber-400/5 p-3"><dt className="flex items-center gap-1.5 text-xs font-medium text-amber-300"><Brain className="h-3.5 w-3.5" />{partner.name}真實的內心 OS</dt><dd className="mt-1 italic leading-relaxed text-amber-50/90">{o.inner}</dd></div>
                  <div><dt className="text-xs text-sand-500">解析</dt><dd className="mt-0.5 leading-relaxed text-sand-300">{o.review}</dd></div>
                  {o.tone !== "warm" && (
                    <div className="rounded-xl bg-sand-950/70 p-3"><dt className="text-xs font-medium text-emerald-300">另一種可能</dt><dd className="mt-1 leading-relaxed text-sand-300">「{best.say}」</dd></div>
                  )}
                </dl>
              </li>
            );
          })}
        </ol>

        <div className={`mt-5 rounded-2xl border p-5 sm:p-6 ${overwrite ? "border-rose-400/50 bg-rose-500/5" : "border-emerald-400/30 bg-emerald-500/5"}`}>
          <h3 className={`text-sm font-semibold ${overwrite ? "text-rose-300" : "text-emerald-300"}`}>峰終定律：這段感情最後會被怎麼記得？</h3>
          <p className="mt-2 text-sm leading-relaxed text-sand-300">
            {overwrite
              ? "第三幕的那個夜晚成了這段關係的『終』。人的記憶不是平均值——最後的難堪，會回頭替所有回憶重新上色："
              : "你守住了『終』。無論最後是否走下去，這些回憶都還保有原本的顏色："}
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {MEMORIES.map((m) => (
              <li key={m} className={`rounded-lg border px-3 py-2 text-sm ${overwrite ? "border-rose-400/20 bg-sand-950/70 text-sand-500" : "border-amber-400/30 bg-amber-400/5 text-amber-100"}`}>
                <span className={overwrite ? "line-through decoration-rose-400/70" : ""}>{m}</span>
                {overwrite && <span className="ml-2 text-xs text-rose-300">→「原來他／她一直是這樣的人」</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <SectionTitle kicker="TRANSLATOR" title="跨光譜雙向翻譯機">
          <span className="inline-flex items-center gap-1.5"><Languages className="h-4 w-4 text-violet-300" />兩個人不是不相愛，只是說著不同解析度的語言。這裡有兩本手冊，建議兩邊都翻一翻。</span>
        </SectionTitle>
        <Translator defaultTab={perspective === "A" ? "decoder" : "converter"} />
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-amber-400/40 bg-amber-400/10 shadow-warm p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300"><Mail className="h-4 w-4" />給你的一封短信</div>
          <p className="font-display mt-4 text-[17px] leading-loose text-sand-100">{LETTERS[perspective][state.level]}</p>
          <p className="font-display mt-4 text-right text-sm text-sand-400">——寫在終焉之前</p>
        </div>
        <div className="rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-300"><Heart className="h-4 w-4" />這週可以試的三件小事</div>
          <ol className="mt-4 space-y-3">
            {PRACTICES[perspective].map((t, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-sand-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-400/20 text-xs font-semibold text-rose-300">{i + 1}</span>{t}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className={embedded ? "hidden" : "mt-14 flex flex-wrap items-center justify-center gap-3"}>
        <PrimaryButton onClick={onSwitch}>換成{CAST[PERSPECTIVES[other].you].name}的視角再走一次</PrimaryButton>
        <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 rounded-full border border-sand-700 px-5 py-3 text-sm text-sand-300 transition hover:border-sand-500 hover:text-sand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><RotateCcw className="h-4 w-4" />同視角重來</button>
        <button type="button" onClick={onHome} className="rounded-full px-4 py-3 text-sm text-sand-500 hover:text-sand-300">回到首頁</button>
      </div>
      <p className="mt-8 text-center text-xs leading-relaxed text-sand-600">本體驗為心理教育用途的互動敘事，非臨床診斷工具。<br />如果你正處在讓你不安全的關係裡，請優先尋求專業協助。</p>
    </div>
  );
}

/* ------------------------------ 雙人模式：交接與對照 ------------------------ */

const TALK_CARDS = [
  "剛剛哪一句「內心 OS」，最像你曾經有過、卻沒說出口的話？",
  "我說「都可以」或「沒事」的時候，你通常怎麼理解？其實我的意思是……",
  "有沒有哪一次，你希望我在，但我沒有發現？",
  "我做過哪一件小事，讓你覺得被接住了？",
  "快吵起來的時候，你希望我們怎麼暫停？多久之後回來談？",
  "這一週，我們各自想試哪一件小事？",
];

function Handoff({ nextPerspective, onBegin }) {
  const c = CAST[PERSPECTIVES[nextPerspective].you];
  return (
    <div className="mx-auto max-w-xl px-4 pb-24 pt-20 text-center sm:px-6">
      <div className="fade-up rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-8">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-400/20 text-rose-300"><Users className="h-8 w-8" /></span>
        <h1 className="font-display mt-5 text-2xl font-semibold text-sand-50">第一位走完了</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-sand-300">請把手機交給對方。<br />結果先保密，等兩個人都走完，再一起打開。</p>
        <p className="mt-5 rounded-2xl bg-sand-950 px-4 py-3 text-sm leading-relaxed text-sand-400">第二位會走<span className={`font-semibold ${c.text}`}>{c.name}</span>的視角：{PERSPECTIVES[nextPerspective].blurb}</p>
        <PrimaryButton onClick={onBegin} className="mt-7">我是第二位，開始</PrimaryButton>
      </div>
    </div>
  );
}

function PairReport({ results, xray, onRestart, onHome }) {
  const [tab, setTab] = useState("pair");
  const st = { A: computeState("A", results.A), B: computeState("B", results.B) };
  const tabs = [{ id: "pair", label: "雙人對照" }, { id: "A", label: "柏翰視角報告" }, { id: "B", label: "語安視角報告" }];
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-12 sm:px-6">
      <header className="fade-up text-center">
        <div className="text-xs tracking-[0.3em] text-sand-400">TOGETHER</div>
        <h1 className="font-display mt-3 text-3xl font-semibold text-sand-50 sm:text-4xl">你們的雙人對照</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-sand-400">這不是成績單，也沒有誰贏誰輸。它只是一張地圖，讓你們看見彼此站在哪裡、中間隔著什麼。</p>
      </header>

      <div role="tablist" aria-label="報告切換" className="mt-8 grid grid-cols-3 gap-2">
        {tabs.map((t) => (
          <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`rounded-full border px-2 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${tab === t.id ? "border-amber-400 bg-amber-400/20 text-amber-200" : "border-sand-800 bg-sand-900/80 text-sand-400"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "pair" ? (
        <div className="fade-up">
          <section className="mt-6 grid gap-4 sm:grid-cols-2">
            {["A", "B"].map((k) => {
              const c = CAST[PERSPECTIVES[k].you];
              const v = VERDICTS[k][st[k].level];
              return (
                <div key={k} className="rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-6">
                  <div className={`text-xs font-medium ${c.text}`}>走{c.name}視角的人</div>
                  <div className="font-display mt-1 text-xl font-semibold text-sand-50">{v.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-sand-300">{v.text}</p>
                  <div className="mt-3 text-xs text-sand-500">終焉風險 {st[k].risk}／100・漏接 {SCRIPT[k].filter((a, i) => a.options[results[k][i]].missed).length}／{SCRIPT[k].length}</div>
                </div>
              );
            })}
          </section>

          <section className="mt-6 flex flex-col items-center rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-6">
            <h2 className="self-start text-sm font-semibold text-sand-200">兩個人的溝通雷達</h2>
            <RadarChart dims={st.A.dims} dims2={st.B.dims} />
            <div className="flex gap-5 text-xs text-sand-400">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />柏翰視角</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" />語安視角</span>
            </div>
            <p className="mt-3 text-center text-xs leading-relaxed text-sand-500">兩個形狀重疊的地方，是你們已經有默契的地方；差最多的那一角，就是最值得聊的地方。</p>
          </section>

          <section className="mt-14">
            <SectionTitle kicker="SAME NIGHT, TWO STORIES" title="同一個晚上，兩種經歷">每一幕，左邊是走柏翰視角的人說的話，右邊是走語安視角的人說的話。底下是對方當時沒說出口的心聲。</SectionTitle>
            <ol className="space-y-5">
              {SCRIPT.A.map((_, i) => (
                <li key={i} className="rounded-3xl border border-sand-800 bg-sand-900/80 shadow-warm p-5">
                  <div className="text-xs tracking-widest text-sand-500">{SCRIPT.A[i].act}・{SCRIPT.A[i].part}</div>
                  <h3 className="font-display text-lg font-semibold text-sand-50">《{SCRIPT.A[i].title}》</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {["A", "B"].map((k) => {
                      const o = SCRIPT[k][i].options[results[k][i]];
                      const me = CAST[PERSPECTIVES[k].you], pa = CAST[PERSPECTIVES[k].partner];
                      return (
                        <div key={k} className="rounded-2xl border p-4" style={{ borderColor: `${me.stroke}66`, background: me.fill }}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-xs font-medium ${me.text}`}>{me.name}說</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE_STYLE[o.tone].chip}`}>{o.tag}</span>
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-sand-100">「{o.say}」</p>
                          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-sand-400"><Brain className="h-3.5 w-3.5" />{pa.name}心裡想的</div>
                          <p className="mt-1 text-sm italic leading-relaxed text-sand-300">{o.inner}</p>
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-14">
            <SectionTitle kicker="LET'S TALK" title="一起聊聊">挑一兩張就好。一個人說的時候，另一個人只要聽，先不解釋、不反駁。</SectionTitle>
            <ol className="grid gap-3 sm:grid-cols-2">
              {TALK_CARDS.map((q, i) => (
                <li key={i} className="flex gap-3 rounded-3xl border border-amber-400/40 bg-amber-400/10 p-5">
                  <span className="font-display text-2xl font-semibold text-amber-300">{i + 1}</span>
                  <p className="font-display text-[16px] leading-relaxed text-sand-100">{q}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-14">
            <SectionTitle kicker="TRANSLATOR" title="跨光譜雙向翻譯機">兩本手冊，一人一本。也可以交換著看：看看對方那一本，是怎麼描述你的。</SectionTitle>
            <Translator defaultTab="decoder" />
          </section>
        </div>
      ) : (
        <div key={tab} className="mt-8"><Report perspective={tab} choices={results[tab]} xray={xray} embedded /></div>
      )}

      <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 rounded-full border border-sand-700 px-5 py-3 text-sm text-sand-300 transition hover:border-sand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><RotateCcw className="h-4 w-4" />交換視角再走一次</button>
        <button type="button" onClick={onHome} className="rounded-full px-4 py-3 text-sm text-sand-500 hover:text-sand-300">回到首頁</button>
      </div>
    </div>
  );
}

/* ------------------------------ 光譜對話（主體驗） --------------------------- */
/* 引導者「小譯」以一問一答，帶使用者依序走過光譜上的五個位置。內容為預先寫好的腳本。 */

/* 走訪順序：任務端兩站 → 情感端兩站 → 回到中間。x 是該位置在光譜橫軸上的百分比。
 * 文中的「他」泛指站在這個位置的人，不分性別；另一方一律稱「對方」。 */
const STOPS = [
  {
    id: "outsource", name: "任務外包", color: "#3B8C8C", x: 10, side: "任務端", motto: "用「做事」代替「在場」",
    line: "行程你比較會排，交給你決定就好，錢我出。",
    feel: [
      { label: "很體貼啊，哪裡有問題？", reply: "對說的人來說，這真的是體貼。問題不在心意，而在這份心意寄到的時候，包裝變了。" },
      { label: "有點被丟下的感覺", reply: "你抓到了。聽的人常常就是這個感覺：事情被交辦了，人卻沒有來。" },
      { label: "這句話我常說", reply: "那你一定是很可靠的人。接下來不是要糾正你，是想讓你看看這句話寄到對方手上的樣子。" },
    ],
    why: ["站在這裡的人，從小學到的是：愛一個人，就是把事情扛好、把錢賺夠、不給對方添麻煩。", "所以「你排，我出錢」在他的字典裡是信任，也是最有效率的分工。他沒有在偷懶，他是真的覺得這樣對對方最好。"],
    heard: ["對方聽到的卻是：「這是你的專案，不是我們的。」", "對方查了三個晚上的民宿，想要的不是有人買單，而是有人坐下來一起期待。被外包的不只是行程，還有「一起」這兩個字。"],
    near: ["想靠近他，別說「你都不參與」，那對他來說太模糊了。給他具體的一塊：「第二天早上交給你排，我想去一個你喜歡的地方。」", "如果你就站在這裡：不用全包，認領一小塊就好。「民宿傳給我看，早餐我來找。」"],
    learned: "原來那句「你決定就好」裡面，裝的是信任。看得見這一點，就比較不會只聽到敷衍。",
  },
  {
    id: "drift", name: "隨波逐流", color: "#6E9FB0", x: 30, side: "任務端", motto: "用「配合」代替「自己」",
    line: "都可以啊，看你，你喜歡就好。",
    feel: [
      { label: "很好相處啊", reply: "一開始真的是。但想像一下，連續三年，每一餐、每一趟旅行、每一個決定，都是你一個人在選。" },
      { label: "久了會有點累", reply: "對，那種累有個名字，叫決策的孤獨。所有選擇的重量，都在一個人身上。" },
      { label: "我只是不想起衝突", reply: "我懂。很多說「都可以」的人不是沒有想法，而是很早就學會：有想法，會帶來麻煩。" },
    ],
    why: ["站在這裡的人，可能在一個「乖、不吵、配合」才會被喜歡的環境裡長大。", "久了，他不是在隱藏自己的喜好，而是真的不太確定自己喜歡什麼。說「都可以」的當下，他是真心想讓對方開心。"],
    heard: ["對方會開始想：「我到底在跟誰談戀愛？」", "當一個人永遠沒有意見，對方面對的就像一面鏡子，只照得見自己。久了會覺得孤單，甚至好奇：如果沒有我，這個人自己想去哪裡？"],
    near: ["想靠近他，別問開放題。給他小小的二選一，然後認真對待他的答案：「拉麵還是咖哩？你選的我都想試。」讓他慢慢發現，有想法是安全的。", "如果你就站在這裡：說「都可以」之前停三秒，找出一個再小都好的偏好，說出來。「我今天想吃熱的。」這樣就夠了。"],
    learned: "原來「都可以」的背後，常常是一個很怕添麻煩的人。",
  },
  {
    id: "quiet", name: "安靜離職", color: "#C2697B", x: 90, side: "情感端", motto: "把感受「收起來」",
    line: "沒事，我自己處理好了，你忙你的。",
    feel: [
      { label: "聽起來很獨立、很懂事", reply: "大部分人都這麼想，所以這是光譜上最容易被錯過的位置。" },
      { label: "感覺其實有事", reply: "你的天線很好。「處理好了」和「沒事」，其實是兩件不一樣的事。" },
      { label: "我也常這樣說", reply: "那你大概已經試過很多次了吧。先跟你說一聲：辛苦了。" },
    ],
    why: ["站在這裡的人，不是一開始就這樣的。他說過、暗示過，也吵過。", "每一次沒被接住，他就把期待調低一格。到最後，自己處理，比再失望一次不痛。這句話不是冷淡，是他保護自己的最後一道門。"],
    heard: ["對方聽到的是好消息：「沒事、很獨立、我們很穩定。」於是安心地繼續忙。", "沒有爭吵被當成了感情好。但其實，還願意抱怨的人，才是還在投資的人。"],
    near: ["想靠近他，不要追問「到底怎麼了」逼他解釋。出現就好：「不用現在講，我買宵夜過去，在旁邊陪你。」", "如果你就站在這裡：你的需要沒有消失，只是還沒被聽懂。再說一次，但這次附上說明書：「我不需要你解決，我需要你聽我講十分鐘。」"],
    learned: "原來「沒事」是一扇快要關上的門，不是一句報平安。",
  },
  {
    id: "interrogate", name: "高壓逼問", color: "#D9414F", x: 70, side: "情感端", motto: "把感受「丟出去」",
    line: "你現在就給我講清楚！我現在就要知道答案！",
    feel: [
      { label: "好有壓迫感", reply: "對，身體會比腦袋先反應：心跳加快、想逃，或整個人當機。這時候說出口的，都不會是真心話。" },
      { label: "但事情總要講清楚吧", reply: "要講清楚，這個需要完全合理。只是「要談」可以堅持，「現在」可以放手。" },
      { label: "我急起來也會這樣", reply: "謝謝你願意承認。這通常不是兇，是太害怕失去。" },
    ],
    why: ["站在這裡的人看起來最強勢，其實是光譜上最慌的人。平常再冷靜的人，慌起來也可能滑到這裡。", "他感覺到對方在遠離，卻不知道為什麼，那種不確定讓他受不了。逼問是他唯一會的求救方式：「拜託告訴我發生什麼事，我才知道怎麼修。」"],
    heard: ["對方聽到的是：「我被審問了。」牆會立刻升起來。", "更可惜的是，人對一段感情的記憶，常常由最後一幕決定。一場難堪的逼問，會回頭把之前所有的好，都重新上色。"],
    near: ["想靠近他，他需要的是一個確定的時間，而不是立刻的答案：「我現在講不出來，但明天晚上，我一定跟你講完。」", "如果你就站在這裡：先說出底下那句真話：「我很慌，我怕失去你。」然後把時間還給對方：「你什麼時候可以談？」"],
    learned: "原來最兇的那一句話底下，是最害怕的那個人。",
  },
  {
    id: "cocreate", name: "過程共謀", color: "#E8973A", x: 50, side: "交會區", motto: "有我，也有我們",
    line: "民宿傳給我看看。第二天早上交給我，我想帶你去一個地方。",
    feel: [
      { label: "聽了會很開心", reply: "因為這句話裡同時有兩個東西：一個有想法的「我」，和一個想一起的「我們」。" },
      { label: "這也太理想了吧", reply: "它不是一種個性，是一個可以練習的動作。沒有人整天都站在這裡，包括我。" },
      { label: "我想學這樣說", reply: "好消息是，它的配方很簡單。問我「可以怎麼靠近」就會告訴你。" },
    ],
    why: ["站在這裡的人不是比較會說話，而是同時守住了兩件事：知道自己要什麼，也好奇對方要什麼。", "他不把配合當成愛，也不把效率當成愛。"],
    heard: ["對方聽到的是：「這是我們的事。」就這麼簡單。", "不用猜、不用一個人扛，也看得見眼前這個人是誰。"],
    near: ["配方只有三步：說一個自己的想法，問一個對方的想法，認領一塊一起做。", "不必一次到位。從兩端的任何一個位置，往中間挪一小步，就夠了。"],
    learned: "原來它不是天分，只是一個小小的、可以練習的動作。",
  },
];

const CHAT_HOME = [
  { id: "outsource", label: "你決定就好，我出錢", reply: "嗯，把事情交給信任的人。記下來了。", step: "你一開始選的是「你決定就好，我出錢」。下一次，試著多認領一小塊。" },
  { id: "drift", label: "都可以啊，看你", reply: "嗯，以對方開心為優先。記下來了。", step: "你一開始選的是「都可以啊」。下一次，先說出一個小小的偏好。" },
  { id: "quiet", label: "沒關係，我自己排就好", reply: "嗯，習慣自己來。記下來了。", step: "你一開始選的是「我自己排就好」。下一次，試著邀一個人進來。" },
  { id: "cocreate", label: "我想去一個地方，你呢？", reply: "嗯，有自己的想法，也想聽對方的。記下來了。", step: "你一開始選的是「我想去一個地方，你呢？」。你已經站在交會區了，記得偶爾回頭，等一等還在路上的人。" },
];

const CHAT_QUESTIONS = [
  { key: "why", label: "為什麼會這樣說？" },
  { key: "heard", label: "對方聽到的是什麼？" },
  { key: "near", label: "可以怎麼靠近？" },
];

const g = (text) => ({ from: "guide", text });

function stationIntro(i, home) {
  const st = STOPS[i];
  return [
    { from: "station", stop: i },
    g(["第一站，在任務端。站在這裡的人，常常這樣說：", "第二站，還在任務端，但往下走了一點。站在這裡的人，常常這樣說：", "現在換到光譜的另一頭，情感端。站在這裡的人，常常這樣說：", "第四站，同樣在情感端。站在這裡的人，慌起來會這樣說：", "最後一站，回到光譜的中間，兩端會合的地方。站在這裡的人會說："][i]),
    { from: "quote", stop: i },
    ...(home === st.id ? [g("這是你一開始選的位置。接下來的話，有一部分是說給你聽的。")] : []),
    g("聽到這句話，你的第一個感覺是？"),
  ];
}

function SpectrumChat({ onTheater, onHome }) {
  const [msgs, setMsgs] = useState([]);
  const [queue, setQueue] = useState([]);
  const [stage, setStage] = useState({ kind: "intro", stop: -1, asked: [] });
  const [home, setHome] = useState(null);
  const started = useRef(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    setQueue([
      g("嗨，我是小譯。我的工作，是幫站在不同位置的人翻譯彼此的話。"),
      g("接下來我想陪你沿著一條「溝通光譜」走一趟。光譜的一端是任務端：習慣用做事來表達在乎。另一端是情感端：習慣用感受來表達在乎。"),
      g("我們先在任務端走兩站，再到情感端走兩站，最後回到中間。沒有好人壞人，也不分男女，同一個人在不同時候，會站到不同的位置。"),
      g("出發前先問你一題：伴侶問「連假要去哪？」的時候，你最可能怎麼回？"),
    ]);
  }, []);

  useEffect(() => {
    if (!queue.length) return undefined;
    const m = queue[0];
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduce ? 80 : Math.min(1500, 450 + (m.text ? m.text.length * 14 : 300));
    const t = setTimeout(() => {
      setMsgs((x) => [...x, m]);
      setQueue((q) => q.slice(1));
    }, delay);
    return () => clearTimeout(t);
  }, [queue]);

  useEffect(() => {
    if (msgs.length > 2 && endRef.current) endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, queue.length]);

  const send = (userText, guideMsgs, nextStage) => {
    setMsgs((x) => [...x, { from: "user", text: userText }]);
    setQueue(guideMsgs);
    setStage(nextStage);
  };

  const ready = queue.length === 0 && msgs.length > 0;
  let options = [];
  if (ready && stage.kind === "intro") {
    options = CHAT_HOME.map((h) => ({ label: h.label, run: () => { setHome(h.id); send(h.label, [g(h.reply), g("等一下走到你的位置時，我會提醒你。好，出發。"), ...stationIntro(0, h.id)], { kind: "feel", stop: 0, asked: [] }); } }));
  } else if (ready && stage.kind === "feel") {
    const st = STOPS[stage.stop];
    options = st.feel.map((f) => ({ label: f.label, run: () => send(f.label, [g(f.reply), g("關於這個位置，你可以問我下面任何一題，順序隨你。")], { ...stage, kind: "explore" }) }));
  } else if (ready && stage.kind === "explore") {
    const st = STOPS[stage.stop];
    const last = stage.stop === STOPS.length - 1;
    options = CHAT_QUESTIONS.filter((q) => !stage.asked.includes(q.key)).map((q) => ({ label: q.label, run: () => send(q.label, st[q.key].map(g), { ...stage, asked: [...stage.asked, q.key] }) }));
    if (stage.asked.length > 0) {
      options.push({
        label: last ? "五站都走完了" : "去下一站",
        next: true,
        run: () =>
          last
            ? send("五站都走完了", [g("謝謝你陪我走完。"), g("你有沒有發現：前四個位置的人，其實都在保護某樣東西。怕添麻煩、怕起衝突、怕再失望、怕失去。沒有一個是不愛。"), g("走完這一趟，哪一個位置，你現在比較能理解了？")], { kind: "final", stop: stage.stop, asked: [] })
            : send("去下一站", stationIntro(stage.stop + 1, home), { kind: "feel", stop: stage.stop + 1, asked: [] }),
      });
    }
  } else if (ready && stage.kind === "final") {
    options = STOPS.map((st) => ({ label: st.name, run: () => send(st.name, [g(st.learned), g("理解不等於同意，也不代表你要照單全收。只是當你看得見對方站在哪裡，就比較知道要往哪裡伸手。"), g("還有，人不會永遠待在同一個位置。累的時候、怕的時候、被好好愛著的時候，我們都會移動。"), g(CHAT_HOME.find((h) => h.id === home).step), g("今天就到這裡。謝謝你願意花時間，去懂跟你不一樣的人。")], { kind: "done", stop: stage.stop, asked: [] }) }));
  }

  const current = stage.stop;
  return (
    <div className="mx-auto flex max-w-xl flex-col px-4 pb-16 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 border-b border-sand-800 bg-sand-950/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between text-xs text-sand-500">
          <button type="button" onClick={onHome} className="hover:text-sand-300">← 首頁</button>
          <span>{current < 0 ? "溝通光譜之旅" : `第 ${current + 1} 站／共 ${STOPS.length} 站`}</span>
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-sand-500"><span>任務端</span><span>情感端</span></div>
        <ol className="relative mt-1 h-9" aria-label="光譜上的五個位置">
          <span aria-hidden="true" className="absolute left-0 right-0 top-[5px] h-1 rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-400 opacity-50" />
          {STOPS.map((st, i) => {
            const seen = i < current || stage.kind === "final" || stage.kind === "done";
            const on = i === current && !seen;
            return (
              <li key={st.id} aria-current={on ? "step" : undefined} className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1" style={{ left: `${st.x}%` }}>
                <span className="h-3.5 w-3.5 rounded-full border-2" style={{ borderColor: st.color, background: seen || on ? st.color : "#FAF3E7", boxShadow: on ? `0 0 0 4px ${st.color}44` : "none" }} />
                <span className={`whitespace-nowrap text-[11px] ${on ? "font-semibold text-sand-100" : seen ? "text-sand-300" : "text-sand-500"}`}>{st.name}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-5 flex flex-col gap-3" role="log" aria-live="polite">
        {msgs.map((m, i) => {
          if (m.from === "user") {
            return <div key={i} className="fade-up flex justify-end"><div className="max-w-[82%] rounded-3xl rounded-br-md bg-gradient-to-r from-[#A8432F] to-[#B85C1C] px-4 py-2.5 text-[15px] leading-relaxed text-[#FFF8EC]">{m.text}</div></div>;
          }
          if (m.from === "station") {
            const st = STOPS[m.stop];
            return (
              <div key={i} className="fade-up my-3 flex items-center gap-3 rounded-3xl border bg-sand-900 p-4 shadow-warm" style={{ borderColor: `${st.color}88` }}>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold text-[#FFF8EC]" style={{ background: st.color }}>{m.stop + 1}</span>
                <div>
                  <div className="font-display text-xl font-semibold text-sand-50">{st.name}</div>
                  <div className="text-sm text-sand-400">{st.side}・{st.motto}</div>
                </div>
              </div>
            );
          }
          if (m.from === "quote") {
            const st = STOPS[m.stop];
            return <div key={i} className="fade-up ml-10 max-w-[82%] rounded-3xl border-l-4 px-4 py-3" style={{ borderColor: st.color, background: `${st.color}1f` }}><p className="font-display text-[17px] leading-relaxed text-sand-50">「{st.line}」</p></div>;
          }
          const first = i === 0 || msgs[i - 1].from !== "guide";
          return (
            <div key={i} className="fade-up flex items-end gap-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-amber-400 font-display text-sm font-bold text-[#FFF8EC] ${first ? "" : "invisible"}`} aria-hidden="true">譯</span>
              <div className="max-w-[82%] rounded-3xl rounded-bl-md border border-sand-800 bg-sand-900 px-4 py-2.5 text-[15px] leading-relaxed text-sand-100 shadow-warm">{m.text}</div>
            </div>
          );
        })}
        {queue.length > 0 && (
          <div className="flex items-end gap-2" aria-label="小譯正在輸入">
            <span className="h-8 w-8 shrink-0" />
            <div className="flex gap-1 rounded-3xl rounded-bl-md border border-sand-800 bg-sand-900 px-4 py-3.5">
              {[0, 1, 2].map((d) => <span key={d} className="typing-dot h-1.5 w-1.5 rounded-full bg-sand-500" style={{ animationDelay: `${d * 0.15}s` }} />)}
            </div>
          </div>
        )}
      </div>

      {options.length > 0 && (
        <div className="fade-up mt-5 flex flex-col items-end gap-2">
          <div className="text-xs text-sand-500">選一個回覆</div>
          {options.map((o) => (
            <button key={o.label} type="button" onClick={o.run} className={`max-w-[88%] rounded-3xl border px-4 py-2.5 text-right text-[15px] leading-relaxed transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${o.next ? "border-sand-600 bg-sand-800 font-medium text-sand-100" : "border-amber-400 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20"}`}>
              {o.label}{o.next && <ArrowRight className="ml-1 inline h-4 w-4" />}
            </button>
          ))}
        </div>
      )}

      {ready && stage.kind === "done" && (
        <div className="fade-up mt-8 rounded-3xl border border-sand-800 bg-sand-900/80 p-6 text-center shadow-warm">
          <p className="text-sm leading-relaxed text-sand-400">想親自站進其中一個位置，演一遍三個晚上的故事嗎？</p>
          <PrimaryButton onClick={onTheater} className="mt-4">進入互動劇場</PrimaryButton>
          <div><button type="button" onClick={onHome} className="mt-3 text-sm text-sand-500 hover:text-sand-300">回到首頁</button></div>
        </div>
      )}
      <div ref={endRef} className="h-6" />
    </div>
  );
}

/* ---------------------------------- 主元件 --------------------------------- */

export default function App() {
  const [view, setView] = useState("landing"); // landing | setup | theater | handoff | report | pairReport
  const [mode, setMode] = useState("pair"); // pair 兩人輪流 | solo 一個人
  const [perspective, setPerspective] = useState("A");
  const [xray, setXray] = useState(true);
  const [choices, setChoices] = useState([]);
  const [pending, setPending] = useState(null); // 已選擇但尚未按「下一幕」的選項
  const [results, setResults] = useState({ A: null, B: null }); // 雙人模式：兩個視角各自的選擇

  const go = (v) => {
    setView(v);
    window.scrollTo({ top: 0 });
  };
  const begin = (p = perspective, fresh = true) => {
    setPerspective(p);
    setChoices([]);
    setPending(null);
    if (fresh) setResults({ A: null, B: null });
    go("theater");
  };
  const other = perspective === "A" ? "B" : "A";

  const shownChoices = pending === null ? choices : [...choices, pending];
  const handleNext = () => {
    const next = [...choices, pending];
    setChoices(next);
    setPending(null);
    if (next.length < SCRIPT[perspective].length) return window.scrollTo({ top: 0, behavior: "smooth" });
    if (mode === "solo") return go("report");
    const merged = { ...results, [perspective]: next };
    setResults(merged);
    go(merged[other] ? "pairReport" : "handoff");
  };

  return (
    <div className="relative min-h-screen bg-sand-950 text-sand-100 antialiased">
      <style>{GLOBAL_CSS}</style>
      <Backdrop />
      <main className="relative">
        {view === "landing" && <Landing onStart={() => go("setup")} onChat={() => go("chat")} />}
        {view === "chat" && <SpectrumChat onTheater={() => go("setup")} onHome={() => go("landing")} />}
        {view === "setup" && <Setup mode={mode} setMode={setMode} perspective={perspective} setPerspective={setPerspective} xray={xray} setXray={setXray} onBegin={() => begin()} onBack={() => go("landing")} />}
        {view === "theater" && (
          <Theater perspective={perspective} xray={xray} setXray={setXray} choices={shownChoices} shownIdx={choices.length} answered={pending !== null} onChoose={setPending} onNext={handleNext} onQuit={() => go("setup")} />
        )}
        {view === "handoff" && <Handoff nextPerspective={other} onBegin={() => begin(other, false)} />}
        {view === "report" && (
          <Report perspective={perspective} choices={choices} xray={xray} onRestart={() => begin()} onSwitch={() => begin(other)} onHome={() => go("landing")} />
        )}
        {view === "pairReport" && <PairReport results={results} xray={xray} onRestart={() => go("setup")} onHome={() => go("landing")} />}
      </main>
    </div>
  );
}
