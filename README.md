# iNCCU 首頁設計原型

依 `../規劃相關/iNccu改良後首頁截圖.png` 與月曆樣式製作的第一版。網站使用原生 HTML、CSS、JavaScript，不需 npm 安裝或編譯，可直接部署 GitHub Pages。

## 本機預覽

在本資料夾執行：

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

開啟 <http://127.0.0.1:4173/>。也可以直接開啟 `index.html`；建議用伺服器預覽，以便瀏覽器穩定儲存排序。Noto Sans TC 使用 Google Fonts，需要網路；無法取得時使用本機無襯線字體。

## 實作範圍

1. 沿用參考圖的深藍頁首、淺藍背景、左大右小區塊。桌機右上月曆、右下新聞；手機垂直排列。
2. 頁首沿用 iNCCU、個人資訊、設定、編輯、Information 素材；四個功能僅展示，尚未啟用。
3. 常用系統依「由左至右，再由上至下」排列，灰色加號「其他功能」永遠在最後；灰色圖塊縮小至與現有圖示的可見範圍相近。隨區塊寬度使用 2–4 欄。
4. 「調整排序」開啟搖晃與移除叉叉；桌機拖曳時以藍色直線表示插入位置，放開才更新順序。鍵盤／手機可使用前移、後移按鈕。移除及關閉的圓形按鈕使用置中的 CSS 叉叉，滑鼠移入會變深、略向下移，並提供文字提示。
5. 「其他功能」可依校務 Web 分類瀏覽與搜尋；點圖示或文字直接開啟服務，「＋ 快捷」加入首頁，已加入的工具仍可開啟但不能重複加入。首頁預設 11 個：我的課表、全校課程查詢系統、Moodle 45、學生請假系統、我的繳費單、我的全人、活動報名系統、政大圖書館、成績查詢、宿舍統一入口、NCCU郵件信箱。清單共 22 個入口，其中宿舍統一入口包含 5 個文字連結。
6. 排序與新增／移除立即存入 `localStorage`。設定限同一瀏覽器、同一網站來源，不會同步到其他裝置。儲存狀態目前不顯示在首頁。
7. 首頁的常用服務說明、工具數量、排列說明及儲存狀態保留在 HTML／JavaScript 註解中，方便日後需要時恢復；工具數量與儲存狀態不會被程式重新顯示。
8. 圖示 hover 或鍵盤聚焦會顯示功能提示；有截圖的服務另開本機截圖，其他服務另開指定網站。宿舍統一入口先開啟直式小視窗；關閉後回到原入口，若從「其他功能」開啟則保留原工具目錄。
9. 行事曆可在 **2026 年 10–12 月**間切換，左欄顯示該月學期週次；假日日期與假日日程標紅。有日程的日期可點選，右側對應事項會標示。考試週日期使用整格底色，一般日程只以圓點提示；今天以外框標示。右側日程清單固定高度並可垂直捲動，事項多時不會撐高區塊。
10. 10 月期中考連到成績查詢；11 月停修連到選課系統、繳費及輔系雙主修連到對應入口；12 月校園馬拉松連到活動報名、學雜費減免連到助學金申請、期末考連到成績查詢。Google 按鈕開啟日曆訂閱入口，需使用者在 Google 登入並確認新增；本頁不直接修改 Google 帳號。
11. 新聞有三則建置中內容、前後箭頭、圓點／短線頁碼、可點擊的整張圖文卡片與詳細展示頁。

校曆事件依提供資料手動設定，沒有自動同步校方；新聞沒有後端內容管理或即時資料。

## 行事曆維護

行事曆起始月份由 `calendar.year`、`calendar.month` 和 `calendar.events` 決定。可切換月份另列在 `calendar.months`，每月設定 `firstWeek` 及 `events`。事件用 `day`、`weekday`、`week` 呈現；日期區間加上 `endDay`、`endWeekday`。一般期間事件只會在頭尾日期顯示圓點；考試事件加上 `exam: true`，會將整段日期標為考試週。國定假日設定 `holiday: true`，月曆所有假日日期及對應日程會標紅。要連到既有資訊系統，事件項目填入 `toolId`，例如 `grades`、`registration`、`aid`，不要重複硬編寫目的地。

切換月份會重繪日曆與右側日程；可互動日期會標示並對應右側日程，選取時以外框提示。月份標題同列顯示月份、年份與學年學期，月份最大、年份次之、學期資訊最小；兩側按鈕尺寸一致，標示相鄰月並處理跨年（12 月之後顯示 1 月）。目前實作月份範圍外的按鈕會停用。右側日程清單固定高度並可垂直捲動。圖例、週次、日程、截止標示及完整行事曆連結使用 CSS 變數 `--calendar-copy-size`，截止標籤與日期、週次以相同 flex 間距靠左排列。

考試週底色由 `styles.css` 的 `.day-number.is-exam` 控制；如需調整深淺，在該規則修改 `background`，並維持日期文字與底色有足夠對比。一般日程圓點由 `.day-number.has-event-dot::after` 控制。月份按鈕大小調整 `.month-step`；右側清單高度調整 `.calendar-panel` 的 `--agenda-height`。

## 檔案分工

| 檔案 | 修改用途 |
| --- | --- |
| `index.html` | 首頁區塊、標題、對話框結構 |
| `styles.css` | 色彩、尺寸、格線、手機版與編輯動畫 |
| `data.js` | 工具名稱、分類、提示、圖示、目的地、預設工具、月曆與新聞內容 |
| `app.js` | 工具編輯、瀏覽器儲存、拖曳、月曆與輪播互動 |
| `news.html`、`news.js` | 新聞建置中詳細頁 |
| `assets/icons/` | 使用者提供的原有圖示副本，保留原檔名 |
| `assets/screenshots/` | 使用者提供的系統截圖副本，保留原檔名 |
| `assets/campus-placeholder.svg` | 本次以 SVG 繪製的臨時校園插畫 |
| `tests/test_portal.py` | Playwright 瀏覽器驗收 |
| `DEPLOYMENT.md` | GitHub push 與 Pages 部署步驟 |

`webpage/` 內包含網站所需素材，不依賴上層資料夾。全部使用相對路徑，可放在 GitHub Pages 的專案子路徑。

## 維護工具清單

在 `data.js` 的 `tools` 陣列新增一筆資料：

```js
{
  id: 'new-service', // 唯一、固定的英文識別碼
  name: '新服務',
  category: '資訊服務', // 對應 categories 中的分類
  icon: '新服務icon.png', // 放在 assets/icons/
  screenshot: '新服務截圖.png', // 放在 assets/screenshots/
  tip: '這個服務可以做什麼。'
}
```

若是正式網站，使用 `url: 'https://...'` 取代 `screenshot`，不要同時填兩者。希望新訪客首頁就有該工具時，將 `id` 加到 `defaultFavorites`。既有訪客的自選清單優先，不會被新版預設覆蓋。

若是群組入口，改用 `children`，不要同時設定入口本身的 `screenshot` 或 `url`：

```js
{
  id: 'service-group',
  name: '服務群組',
  category: '資訊服務',
  icon: '服務群組icon.png',
  tip: '選擇需要的子系統。',
  children: [
    { name: '子系統一', screenshot: '子系統一截圖.png' },
    { name: '子系統二', url: 'https://example.com/' }
  ]
}
```

`app.js` 的 `toolLauncher()` 共用首頁與工具目錄的開啟邏輯；`openServices()` 將群組子項目呈現為文字超連結。群組只佔一個快捷，子項目不個別加入首頁。`insertionAt()` 根據滑鼠位置求得插入間隙，放開後換算移除來源後的索引；不交換兩個圖示，也不在拖曳途中寫入儲存。

目前分類沿用「校務入口／學術服務／財務服務／資訊服務」。校務建言放於校務入口；學生請假歸學術服務；群組訊息、問卷、服務台、宿舍及信箱依用途放於資訊服務，屬原型分類，不代表完整複製校方選單。

## 目的地對照

| 工具 | 目的地 |
| --- | --- |
| 校務 Web 系統入口 | `所有校務Web資訊系統截圖.png` |
| 我的課表 | `我的課表截圖.png` |
| 教學意見調查 | `教學意見調查截圖.png` |
| 成績查詢 | `成績查詢系統截圖new.png` |
| 我的繳費單 | `我的繳費單截圖.png` |
| 不利處境學生助學金申請 | `不利處境學生助學金申請截圖.png` |
| 我的全人 | `全人系統截圖.png` |
| 個人獎助學金查詢 | `個人獎助學金查詢截圖.png` |
| 遺失物品查詢 | `https://m.nccu.edu.tw/claim/` |
| 活動報名系統 | `https://moltke.nccu.edu.tw/Registration/registration.do?action=conferenceList` |
| 全校課程查詢系統 | `https://qrysub.nccu.edu.tw/` |
| Moodle 45 | `https://moodle45.nccu.edu.tw/` |
| 政大圖書館 | `https://www.lib.nccu.edu.tw/` |
| 校園授權軟體 | `https://software.nccu.edu.tw/SoftwareM/` |
| VPN | `https://net.nccu.edu.tw/sslvpn/` |
| 學生請假系統 | `學生請假系統截圖.png` |
| 校務建言 | `校務建言截圖.png` |
| 全校群組訊息發送 | `全校群組訊息發送截圖.png`（尚未申請權限提示） |
| 萊Survey問卷 | `萊Survey問卷截圖.png` |
| 線上服務台 | `線上服務台截圖.png` |
| 宿舍統一入口 | 開啟下列 5 個服務的文字選單 |
| NCCU郵件信箱 | `https://nccu.edu.tw/indexs.html`（依需求指定） |

宿舍統一入口使用 `宿舍統一入口icon.png`，子項目不使用圖示：

| 子系統 | 目的地 |
| --- | --- |
| 學生住宿申請 | `學生住宿申請截圖.png` |
| 學生住宿申請結果查詢 | `學生住宿申請結果查詢截圖.png` |
| 宿舍請修 | `宿舍請修截圖.png` |
| 住宿證明書 | `住宿證明書截圖.png` |
| 宿舍包裹信件查詢 | `宿舍包裹信件查詢截圖.png` |

顯示名稱已移除「所有」前綴；原圖示、截圖檔名保留不變。截圖是展示素材，不能實際提交請假、住宿或其他申請。

## 給美術的待補項目

- 本次新增入口與學生請假系統已使用提供的 PNG 圖示／截圖，沒有額外製作圖片的需求。
- **新聞圖片**：目前使用本次繪製的 SVG 臨時插畫；有正式新聞後替換照片即可。不是校方正式建築圖。
- Web、圖書館、全校課程查詢、VPN 的入口目前已使用提供的 PNG 素材。
- Noto Sans TC 已套用全站。其他功能加號、Google 的 G、前後箭頭及移除叉叉使用文字／CSS，不需另交圖片。

## 瀏覽器驗收

若要重跑測試，在自己的 Python 虛擬環境安裝 Playwright 並準備 Chromium：

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install playwright
playwright install chromium
```

先在另一個終端啟動前述 4173 伺服器，再執行：

```sh
python tests/test_portal.py
```

測試涵蓋圖示、截圖連結、新增與重複防止、拖曳與按鈕排序、移除、重新整理保存、空清單、儲存損毀／不可用、月曆、輪播、手機觸控及減少動態效果。截圖存於 `test-results/`，已排除於 Git。

初版曾通過 Chromium 自動化驗收，響應式寬度包含 320、390、768、850、1024、1280、1766px；這不是本次改版的重新驗收結果。本次入口改版依專案指引不自動執行 Playwright 驗收，僅進行語法、素材路徑及修改範圍檢查與本機畫面預覽；測試腳本同步更新，待需要驗收時再執行。外部需登入的校務網站及 Google 實際訂閱未登入操作；Safari／Firefox 尚未個別驗收。

## 參考

- [政大年度行事曆](https://www.nccu.edu.tw/p/426-1000-14.php?Lang=zh-tw)：頁面連出的 Google 校曆使用 `acanccu@gmail.com`。
- [GitHub Pages 官方建立網站說明](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)：本專案以靜態網站方式部署。
