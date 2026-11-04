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
3. 常用系統依欄「由上至下，再由左至右」排列，新增工具永遠在最後。隨區塊寬度使用 2–4 欄。
4. 「調整排序」開啟搖晃與移除叉叉；桌機支援拖曳，鍵盤／手機可使用前移、後移按鈕。移除後可重新加入。
5. 「新增工具」可依校務 Web 分類瀏覽與搜尋，已加入的工具不能重複加入。首頁預設 11 個，清單共 16 個服務。
6. 排序與新增／移除立即存入 `localStorage`。設定限同一瀏覽器、同一網站來源，不會同步到其他裝置。無法儲存時頁面會說明，但操作仍可使用。
7. 圖示 hover 或鍵盤聚焦會顯示功能提示；有截圖的服務另開本機截圖，其他服務另開指定網站。
8. 月曆固定展示 **2026 年 11 月**、第 9–13 週與提供的四組日程。有圓點的日期可點選，右側對應事項會標示。只有真實日期落在本月時才顯示今天框線。
9. 停修連到選課系統，繳費及輔系雙主修連到對應截圖。Google 按鈕開啟日曆訂閱入口，需使用者在 Google 登入並確認新增；本頁不直接修改 Google 帳號。
10. 新聞有三則建置中內容、前後箭頭、圓點／短線頁碼、可點擊的整張圖文卡片與詳細展示頁。

校曆事件依提供資料手動設定，沒有自動同步校方；新聞沒有後端內容管理或即時資料。

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

目前分類依完整校務 Web 截圖的「學術服務／財務服務／資訊服務」整理；Moodle、圖書館、軟體、VPN 等補充入口依用途歸類，後續可調整。

## 目的地對照

| 工具 | 目的地 |
| --- | --- |
| 所有校務 Web 系統入口 | `所有校務Web資訊系統截圖.png` |
| 我的課表 | `我的課表截圖.png` |
| 教學意見調查 | `教學意見調查截圖.png` |
| 成績查詢 | `成績查詢系統截圖.png` |
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
| 學生請假系統 | 暫連完整 Web 截圖中的「資訊服務」，尚無獨立截圖 |

## 給美術的待補項目

- **學生請假系統**：需要獨立圖示與系統截圖，目前沿用完整 Web 素材。
- **新聞圖片**：目前使用本次繪製的 SVG 臨時插畫；有正式新聞後替換照片即可。不是校方正式建築圖。
- **低解析圖示**：原有 GIF（Web、圖書館、全校課程查詢、VPN）放大後較模糊，可補同款高解析透明圖；現階段忠於既有素材。
- Noto Sans TC 已套用全站。新增按鈕、Google 的 G、前後箭頭及移除叉叉使用文字／CSS，不需另交圖片。

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

本次驗收已通過 Chromium 自動化測試與 JavaScript 語法檢查，響應式寬度包含 320、390、768、850、1024、1280、1766px；另檢視 1440px 桌機、390px 手機、新增工具與編輯模式截圖。外部需登入的校務網站及 Google 實際訂閱未登入操作；驗證範圍是目的地與本原型互動。Safari／Firefox 尚未個別驗收。

## 參考

- [政大年度行事曆](https://www.nccu.edu.tw/p/426-1000-14.php?Lang=zh-tw)：頁面連出的 Google 校曆使用 `acanccu@gmail.com`。
- [GitHub Pages 官方建立網站說明](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)：本專案以靜態網站方式部署。
