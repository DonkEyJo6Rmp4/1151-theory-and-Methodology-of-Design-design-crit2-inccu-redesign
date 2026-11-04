/* 所有工具、連結與展示內容集中於此；新增工具不必修改 app.js。 */
window.PORTAL_DATA = {
  storageKey: 'inccu-favorite-tools-v1',
  categories: ['校務入口', '學術服務', '財務服務', '資訊服務'],
  defaultFavorites: ['web', 'timetable', 'grades', 'moodle', 'tuition', 'holistic', 'scholarship', 'registration', 'courses', 'library', 'evaluation'],
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
    // 尚無專用素材，暫沿用 Web 圖示與完整系統截圖。
    { id: 'leave', name: '學生請假系統', category: '資訊服務', icon: '所有校務系統Web入口icon.png', screenshot: '所有校務Web資訊系統截圖.png', tip: '透過校務 Web「資訊服務」進入學生請假系統；目前展示完整 Web 截圖。' }
  ],
  calendar: {
    year: 2026,
    month: 11,
    firstWeek: 9,
    semester: '115 學年度・第 1 學期',
    calendarId: 'acanccu@gmail.com',
    officialUrl: 'https://www.nccu.edu.tw/p/426-1000-14.php?Lang=zh-tw#gsc.tab=0',
    // 本月內容依使用者提供的學校行事曆，不會自動同步校方資料。
    events: [
      { day: 2, weekday: '一', week: 9, items: [
        { text: '申請停修開始日', url: 'https://selectcourse.nccu.edu.tw/regcourse/' },
        { text: '校務會議' }
      ] },
      { day: 13, weekday: '五', week: 10, important: true, items: [
        { text: '申請停修截止日', url: 'https://selectcourse.nccu.edu.tw/regcourse/' },
        { text: '學士班提前畢業申請截止日' },
        { text: '繳交學分費暨語言設備使用費截止日', screenshot: '我的繳費單截圖.png' }
      ] },
      { day: 20, weekday: '五', week: 11, items: [
        { text: '學期 2/3 退費基準日' },
        { text: '輔系、雙主修上網放棄修習截止日', screenshot: '輔系雙主修申請修讀放棄修讀系統截圖.png' }
      ] },
      { day: 25, weekday: '三', week: 12, items: [{ text: '行政會議' }] }
    ]
  },
  news: [
    { id: 'campus', label: '校園新聞', category: 'CAMPUS / 校園動態', title: '校園大小事，即將在這裡相遇。', summary: '校園新聞專區建置中。未來將收錄政大最新消息，讓每一則值得關注的故事，都離你更近。' },
    { id: 'notices', label: '重要資訊', category: 'NOTICE / 重要公告', title: '重要的消息，不再錯過。', summary: '重要資訊專區建置中。未來將整理校務公告、申請提醒與服務異動，方便你快速掌握。' },
    { id: 'activities', label: '活動快訊', category: 'EXPLORE / 校園活動', title: '在課堂之外，發現更多可能。', summary: '活動快訊專區建置中。未來將帶來講座、展覽與校園活動，探索屬於你的政大日常。' }
  ]
};
