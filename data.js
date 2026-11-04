/* 所有工具、連結與展示內容集中於此；新增工具不必修改 app.js。 */
window.PORTAL_DATA = {
  storageKey: 'inccu-favorite-tools-v1',
  categories: ['校務入口', '學術服務', '財務服務', '資訊服務'],
  // 需求清單重複列出學生請假系統；保留唯一項目，並沿用既有常用的成績查詢補足 11 個快捷。
  defaultFavorites: ['timetable', 'courses', 'moodle', 'leave', 'tuition', 'holistic', 'registration', 'library', 'grades', 'dorm', 'mail'],
  tools: [
    { id: 'web', name: '校務 Web 系統入口', category: '校務入口', icon: '所有校務系統Web入口icon.png', screenshot: '所有校務Web資訊系統截圖.png', tip: '查看完整校務 Web 學生資訊系統，包含學術、財務及資訊服務。' },
    { id: 'timetable', name: '我的課表', category: '學術服務', icon: '我的課表icon.png', screenshot: '我的課表截圖.png', tip: '查看本學期修課科目、上課時間與教室。' },
    { id: 'evaluation', name: '教學意見調查', category: '學術服務', icon: '教學意見調查icon.png', screenshot: '教學意見調查截圖.png', tip: '填寫本學期課程教學意見調查。' },
    { id: 'grades', name: '成績查詢', category: '學術服務', icon: '成績查詢icon.png', screenshot: '成績查詢系統截圖new.png', tip: '查詢學期成績、歷年修課紀錄與抵免資料。' },
    { id: 'tuition', name: '我的繳費單', category: '財務服務', icon: '我的繳費單icon.png', screenshot: '我的繳費單截圖.png', tip: '查詢學雜費、學分費等繳費資訊與繳費單。' },
    { id: 'aid', name: '不利處境學生助學金申請', category: '財務服務', icon: '不利處境學生助學金申請icon.png', screenshot: '不利處境學生助學金申請截圖.png', tip: '查看不利處境學生助學金申請項目與申請狀態。' },
    { id: 'holistic', name: '我的全人', category: '資訊服務', icon: '全人系統icon.png', screenshot: '全人系統截圖.png', tip: '查看全人學習紀錄與個人學習歷程。' },
    { id: 'scholarship', name: '個人獎助學金查詢', category: '財務服務', icon: '獎助學金查詢icon.png', screenshot: '個人獎助學金查詢截圖.png', tip: '查詢個人獎助學金與獲獎紀錄。' },
    { id: 'lost', name: '遺失物品查詢', category: '資訊服務', icon: '遺失物品查詢icon.png', url: 'https://m.nccu.edu.tw/claim/', tip: '查看校園拾獲物品與認領資訊。' },
    { id: 'registration', name: '活動報名系統', category: '資訊服務', icon: '活動報名系統icon.png', url: 'https://moltke.nccu.edu.tw/Registration/registration.do?action=conferenceList', tip: '瀏覽校內活動、講座與研討會，前往活動報名。' },
    { id: 'courses', name: '全校課程查詢系統', category: '學術服務', icon: '全校課程查詢系統icon.png', url: 'https://qrysub.nccu.edu.tw/', tip: '依學期、系所與關鍵字查詢課程及課程大綱。' },
    { id: 'moodle', name: 'Moodle 45', category: '學術服務', icon: 'moodle45icon.png', url: 'https://moodle45.nccu.edu.tw/', tip: '進入 Moodle 45 數位學習平台，查看教材與作業。' },
    { id: 'library', name: '政大圖書館', category: '資訊服務', icon: '圖書館icon.png', url: 'https://www.lib.nccu.edu.tw/', tip: '查詢館藏、電子資源及圖書館服務。' },
    { id: 'software', name: '校園授權軟體', category: '資訊服務', icon: '校園授權軟體icon.png', url: 'https://software.nccu.edu.tw/SoftwareM/', tip: '查看與下載校園授權軟體，依身分登入使用。' },
    { id: 'vpn', name: 'VPN', category: '資訊服務', icon: 'vpnicon.png', url: 'https://net.nccu.edu.tw/sslvpn/', tip: '查看校園 SSL VPN 遠端連線設定與使用說明。' },
    { id: 'leave', name: '學生請假系統', category: '學術服務', icon: '學生請假系統icon.png', screenshot: '學生請假系統截圖.png', tip: '申請學生假單、查詢請假紀錄與處理進度。' },
    { id: 'feedback', name: '校務建言', category: '校務入口', icon: '校務建言icon.png', screenshot: '校務建言截圖.png', tip: '提出校務建議、查詢歷史建言與學校回覆。' },
    { id: 'broadcast', name: '全校群組訊息發送', category: '資訊服務', icon: '全校群組訊息發送icon.png', screenshot: '全校群組訊息發送截圖.png', tip: '發送校內群組訊息；需先申請管理權限，目前展示權限提示畫面。' },
    { id: 'survey', name: '萊Survey問卷', category: '資訊服務', icon: '萊Survey問卷icon.png', screenshot: '萊Survey問卷截圖.png', tip: '建立與管理線上問卷，查看問卷清單。' },
    { id: 'helpdesk', name: '線上服務台', category: '資訊服務', icon: '線上服務台icon.png', screenshot: '線上服務台截圖.png', tip: '向電算中心提出問題諮詢，查詢申請與處理紀錄。' },
    {
      id: 'dorm', name: '宿舍統一入口', category: '資訊服務', icon: '宿舍統一入口icon.png',
      tip: '查看學生住宿申請、申請結果、宿舍請修、住宿證明書與包裹信件查詢。',
      // 群組工具只設定 children；每個子項目使用 screenshot 或 url。
      children: [
        { name: '學生住宿申請', screenshot: '學生住宿申請截圖.png' },
        { name: '學生住宿申請結果查詢', screenshot: '學生住宿申請結果查詢截圖.png' },
        { name: '宿舍請修', screenshot: '宿舍請修截圖.png' },
        { name: '住宿證明書', screenshot: '住宿證明書截圖.png' },
        { name: '宿舍包裹信件查詢', screenshot: '宿舍包裹信件查詢截圖.png' }
      ]
    },
    { id: 'mail', name: 'NCCU郵件信箱', category: '資訊服務', icon: 'NCCU郵件信箱icon.png', url: 'https://nccu.edu.tw/indexs.html', tip: '開啟指定的政大網站入口，前往 NCCU 郵件服務。' }
  ],
  calendar: {
    year: 2026,
    month: 11,
    firstWeek: 9,
    semester: '115 學年度・第 1 學期',
    calendarId: 'acanccu@gmail.com',
    officialUrl: 'https://www.nccu.edu.tw/p/426-1000-14.php?Lang=zh-tw#gsc.tab=0',
    // 校方資料為手動整理；週次與假日依提供的學校月曆截圖設定。
    events: [
      { day: 2, weekday: '一', week: 9, items: [
        { text: '申請停修開始日', url: 'https://selectcourse.nccu.edu.tw/regcourse/' },
        { text: '校務會議' }
      ] },
      { day: 13, weekday: '五', week: 10, deadline: true, items: [
        { text: '申請停修截止日', url: 'https://selectcourse.nccu.edu.tw/regcourse/' },
        { text: '學士班提前畢業申請截止日' },
        { text: '繳交學分費暨語言設備使用費截止日', screenshot: '我的繳費單截圖.png' }
      ] },
      { day: 20, weekday: '五', week: 11, deadline: true, items: [
        { text: '學期 2/3 退費基準日' },
        { text: '輔系、雙主修上網放棄修習截止日', screenshot: '輔系雙主修申請修讀放棄修讀系統截圖.png' }
      ] },
      { day: 25, weekday: '三', week: 12, items: [{ text: '行政會議' }] }
    ],
    months: {
      10: {
        firstWeek: 4,
        events: [
          { day: 9, endDay: 10, weekday: '五', endWeekday: '六', week: 5, holiday: true, items: [{ text: '補假／國慶日' }] },
          { day: 12, weekday: '一', week: 6, items: [{ text: '第 1 次教務會議' }] },
          { day: 16, weekday: '五', week: 6, items: [{ text: '學期 1/3 退費基準日' }] },
          { day: 25, endDay: 26, weekday: '日', endWeekday: '一', week: 8, holiday: true, items: [{ text: '臺灣光復暨金門古寧頭大捷紀念日／補假' }] },
          { day: 27, endDay: 30, weekday: '二', endWeekday: '五', week: 8, exam: true, items: [{ text: '期中隨堂考試', toolId: 'grades' }] }
        ]
      },
      11: { firstWeek: 9, events: null },
      12: {
        firstWeek: 13,
        events: [
          { day: 5, weekday: '六', week: 13, items: [{ text: '文化盃系際合唱比賽' }] },
          { day: 6, weekday: '日', week: 14, items: [{ text: '校園馬拉松（6:30–9:30 校園封路）', toolId: 'registration' }] },
          { day: 14, weekday: '一', week: 15, items: [
            { text: '第 2 次教務會議' }
          ] },
          { day: 14, endDay: 18, weekday: '一', endWeekday: '五', week: 15, deadline: true, items: [{ text: '學雜費減免預辦', toolId: 'aid' }] },
          { day: 18, weekday: '五', week: 15, deadline: true, items: [{ text: '申請休學、學位考試截止日' }] },
          { day: 21, endDay: 24, weekday: '一', endWeekday: '四', week: 16, exam: true, items: [{ text: '期末隨堂考試', toolId: 'grades' }] },
          { day: 25, weekday: '五', week: 16, holiday: true, items: [{ text: '行憲紀念日' }] },
          { day: 28, weekday: '一', week: 17, items: [{ text: '寒假開始／校務會議' }] }
        ]
      }
    }
  },
  news: [
    { id: 'campus', label: '校園新聞', category: 'CAMPUS / 校園動態', title: '校園大小事，即將在這裡相遇。', summary: '校園新聞專區建置中。未來將收錄政大最新消息，讓每一則值得關注的故事，都離你更近。' },
    { id: 'notices', label: '重要資訊', category: 'NOTICE / 重要公告', title: '重要的消息，不再錯過。', summary: '重要資訊專區建置中。未來將整理校務公告、申請提醒與服務異動，方便你快速掌握。' },
    { id: 'activities', label: '活動快訊', category: 'EXPLORE / 校園活動', title: '在課堂之外，發現更多可能。', summary: '活動快訊專區建置中。未來將帶來講座、展覽與校園活動，探索屬於你的政大日常。' }
  ]
};
