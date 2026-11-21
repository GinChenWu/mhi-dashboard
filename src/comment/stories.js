/* 「先別急著留言」的三則貼文。人物與情節皆為虛構，取材自常見的網路爭議。
 * shot.lines：cropped 為 true 的，是原貼文截圖裡沒有的部分；time 只在打開全貌後顯示。
 * options：五種留言草稿。heat 為 true 代表會把場面推得更熱（跟著罵、酸、反過來罵發文的人）。
 * layers：依序是「沒被截到的部分」「發文的前一天」「後來」。 */

export const STORIES = [
  {
    id: "birthday",
    topic: "感情",
    post: {
      handle: "momo_0412", initial: "M", color: "#C2697B", time: "3 小時",
      text: "交往三年，生日換來這一句。我真的累了。",
      likes: "2.4 萬", replies: "3,180", reposts: "4,012",
    },
    shot: {
      kind: "chat", caption: "對話截圖",
      lines: [
        { side: "them", text: "我爸剛推進手術室，醫生說要六個小時", time: "09:12", cropped: true },
        { side: "them", text: "對不起，今天真的走不開", time: "09:13", cropped: true },
        { side: "me", text: "今天是我生日", time: "09:20" },
        { side: "them", text: "喔 那你自己去吃好一點的", time: "09:21" },
        { side: "them", text: "週末我補你，我訂了你說過的那間", time: "09:21", cropped: true },
        { side: "them", text: "真的對不起", time: "09:22", cropped: true },
      ],
      note: "原貼文只截了中間兩句。前面兩句和後面兩句，都在同一個畫面裡。",
    },
    topComments: [
      { name: "yun.yun", text: "這種人不分，留著過年嗎", likes: "1.2 萬" },
      { name: "kai_chen", text: "三年欸，快逃", likes: "8,431" },
      { name: "littlefox", text: "截圖存證，讓大家認識一下", likes: "5,002" },
    ],
    options: [
      { id: "pile", heat: true, text: "這種人不分，留著過年嗎？" },
      { id: "snark", heat: true, text: "至少有叫你吃好一點，很貼心了啦（笑）" },
      { id: "counter", heat: true, text: "只截兩句就上來討拍，另一半也滿可憐的。" },
      { id: "ask", heat: false, text: "這兩句的前後，還有說什麼嗎？" },
      { id: "wait", heat: false, text: "（先不留言，往下看。）" },
    ],
    dayBefore: [
      { who: "發文的人", text: "這個月已經是第三次被臨時取消。上一次是對方加班，再上一次是對方忘了。生日前一晚，自己把訂好的餐廳退掉，沒有跟任何人說。那句「我真的累了」，不是為了今天這一次。" },
      { who: "被截圖的人", text: "父親兩週前檢查出問題，一直沒有說，因為「不想讓生日變得很沉重」。手術前一晚，在醫院的陪病椅上睡了三個小時。" },
    ],
    after: [
      "貼文被轉了四千多次。有人從頭貼認出被截圖的人，把公司名稱貼在留言區。",
      "發文的人當晚十一點刪了文，但截圖已經在別的地方傳開。",
      "兩個人原本約好週末好好談。那個週末，一個人在醫院，另一個人在回陌生人的私訊。",
    ],
    closing: "兩個人的委屈都是真的。只是留言區只看得到其中兩句。",
  },
  {
    id: "overtime",
    topic: "職場",
    post: {
      handle: "pm_daily_log", initial: "P", color: "#3B8C8C", time: "昨天",
      text: "新人來第一週，天天六點整消失。昨晚傳訊息要個檔案，已讀不回。我們以前哪敢這樣。",
      likes: "1.8 萬", replies: "2,406", reposts: "1,950",
    },
    shot: {
      kind: "chat", caption: "訊息截圖",
      lines: [
        { side: "me", text: "那份報價單可以傳給我嗎", time: "21:47" },
        { side: "sys", text: "已讀", time: "21:52" },
        { side: "them", text: "早安，報價單在這。另外我把上週的也整理成同一份了。", time: "隔天 08:03", cropped: true },
        { side: "them", text: "📎 報價單_整理版.xlsx", time: "隔天 08:03", cropped: true },
      ],
      note: "原貼文截掉了時間，也截掉了隔天早上八點的回覆。",
    },
    topComments: [
      { name: "old_school_88", text: "現在年輕人就是這樣", likes: "9,214" },
      { name: "hr_bao", text: "試用期直接請他走", likes: "6,077" },
      { name: "nine2five", text: "下班還傳訊息，慣老闆無誤", likes: "5,930" },
    ],
    options: [
      { id: "pile", heat: true, text: "試用期就這樣，之後還得了？直接請走。" },
      { id: "snark", heat: true, text: "六點整消失，時間觀念很好啊（笑）" },
      { id: "counter", heat: true, text: "下班還傳訊息要檔案，難怪留不住人。" },
      { id: "ask", heat: false, text: "訊息是幾點傳的？那份檔案很急嗎？" },
      { id: "wait", heat: false, text: "（先不留言，往下看。）" },
    ],
    dayBefore: [
      { who: "發文的人", text: "部門上個月走了兩個人，缺額一直沒補。這三週都是十點以後才離開公司。傳那則訊息的時候人還在辦公室，只是想在睡前把事情清掉。那句「我們以前哪敢這樣」，有一半是在說自己。" },
      { who: "被截圖的人", text: "每天六點要趕去安親班接弟弟，家裡只有自己能接。面試的時候說過，主管也答應了。看到訊息的時候正在洗碗，心想明天一早第一件事就處理。" },
    ],
    after: [
      "有同事把貼文轉到公司的群組。新人認出那是在說自己。",
      "第三週，新人離開了這間公司。發文的人又多接了一個人的工作。",
      "那則貼文還在。底下每天都有新的留言，一邊喊「草莓族」，一邊喊「慣老闆」。",
    ],
    closing: "一個是撐了太久的人，一個是有難處卻不敢再多說的人。留言區把他們變成了兩個詞。",
  },
  {
    id: "restaurant",
    topic: "公共場合",
    post: {
      handle: "quiet_table", initial: "Q", color: "#73569D", time: "5 小時",
      text: "小孩在店裡尖叫半小時，家長完全不管。我看了一眼還被瞪。可以不要帶出來嗎？",
      likes: "3.1 萬", replies: "4,725", reposts: "6,388",
    },
    shot: {
      kind: "timeline", caption: "12 秒的影片",
      lines: [
        { side: "sys", text: "小孩開始哭。家長抱起來，走到店外。", time: "12:10", cropped: true },
        { side: "sys", text: "回到座位。五分鐘後又哭，家長第二次帶出去。", time: "12:18", cropped: true },
        { side: "sys", text: "小孩在座位上尖叫，家長低頭翻包包。", time: "12:24" },
        { side: "sys", text: "家長請店員打包，提早結帳離開。", time: "12:31", cropped: true },
      ],
      note: "貼出來的 12 秒，是 12:24 那一段。「半小時」是從第一次哭算到離開，其中一半的時間，他們不在店裡。",
    },
    topComments: [
      { name: "no_kids_zone", text: "管不好就不要生", likes: "1.5 萬" },
      { name: "foodie_lin", text: "這種家長最可怕", likes: "9,870" },
      { name: "mama_bear", text: "誰小時候沒吵過？厭童的人才可怕", likes: "7,412" },
    ],
    options: [
      { id: "pile", heat: true, text: "管不好就不要帶出門，別人花錢不是來聽尖叫的。" },
      { id: "snark", heat: true, text: "家長：我的小孩很乖（指）" },
      { id: "counter", heat: true, text: "誰小時候沒吵過？看一眼就發文公審，也太玻璃心。" },
      { id: "ask", heat: false, text: "這半小時裡，家長都沒有任何動作嗎？" },
      { id: "wait", heat: false, text: "（先不留言，往下看。）" },
    ],
    dayBefore: [
      { who: "發文的人", text: "連續上了兩個大夜班。這是這一週唯一一頓坐下來吃的飯，特地挑了一間以安靜出名的店。看那一眼的時候，其實是累到在發呆。" },
      { who: "被拍的人", text: "孩子對聲音和陌生的環境很敏感，在家練習了三個月，才第一次出門吃飯。那個「瞪」，是發現有人在拍的時候愣住了。翻包包，是在找孩子的耳罩。" },
    ],
    after: [
      "影片被轉到地方社團，有人認出那間店和那一家人。",
      "那位家長後來半年沒有再帶孩子進餐廳。",
      "發文的人收到很多支持，也收到很多罵「厭童」的私訊，最後把帳號關了。店門口多了一張「請留意孩童音量」的告示。",
    ],
    closing: "一個人只想安靜吃一頓飯，一個人只想試著出門一次。兩個都不是壞人，但留言區需要一個。",
  },
];

/* 每一則的四個階段 */
export const STAGES = ["第一眼", "沒被截到的", "前一天", "後來"];

/* 留言前的三個問題：最後的小卡 */
export const QUESTIONS = ["我看到的，是全部嗎？", "發文的前一天，發生了什麼事？", "畫面另一邊，是不是也是一個人？"];
