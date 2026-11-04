# 將 iNCCU 原型部署到 GitHub Pages

目前完成的是本機網站，尚未建立遠端 repository、push 或公開部署。建議只把 `DesignCrit2/webpage/` 當作獨立 Git 專案，避免把其他課程檔案一起上傳。

## 上傳前先處理系統截圖

`assets/screenshots/成績查詢系統截圖.png` 已確認含有姓名。其他課表、繳費單、獎助學金等截圖也請逐張檢查，將姓名、學號、個人課表或金額等不想公開的資訊遮蔽，再覆蓋網站資料夾中的副本。原始素材在 `../規劃相關/`，可以保留原檔。

這一輪未修改截圖內容，也未上傳。請在第一次 commit／push 前完成檢查；Git 會保存歷史，事後只刪除網頁上的圖片不會移除既有 commit 中的原檔。依 [GitHub Pages 官方說明](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)，一般 Pages 網站是公開可存取的。

## 建立 GitHub repository

登入 GitHub，建立一個新的 repository，例如 `inccu-homepage`。

- 使用 GitHub Free 時選擇 Public，才能以一般方式使用 Pages。
- 為了與下列本機首次 push 流程一致，建立空 repository，不預先加入 README、`.gitignore` 或 license。
- 複製 repository 的 HTTPS URL，例如 `https://github.com/YOUR-USERNAME/inccu-homepage.git`。

## 第一次 push

在終端切換到本次網站資料夾（依電腦上的實際路徑調整）：

```sh
cd '/Volumes/Macintosh HD/Users/admin/Documents/NCCU課程/1151DesignTheory/DesignCrit2/webpage'
git init -b main
git status
git add index.html styles.css data.js app.js news.html news.js assets .nojekyll .gitignore README.md DEPLOYMENT.md tests
git diff --cached --stat
git commit -m "DesignTheory: add iNCCU homepage prototype"
```

確認 staged 檔案只有網站內容，且圖片已完成公開版本處理。接著把以下 URL 改成你的實際 repository URL：

```sh
git remote add origin https://github.com/YOUR-USERNAME/inccu-homepage.git
git push -u origin main
```

GitHub 的 HTTPS 驗證需使用已設定的憑證管理員、GitHub CLI 或 personal access token；不要把 token 寫入網址、程式碼或這份文件。

如果已經有 Git repository 或 `origin`，先查看 `git status`、`git remote -v`，不要重複初始化或覆寫既有遠端設定。

## 啟用 Pages

在 GitHub repository 內開啟 **Settings → Pages**：

1. Build and deployment 的 Source 選 **Deploy from a branch**。
2. Branch 選 **main**，資料夾選 **/ (root)**。
3. 按 Save，等待部署完成。
4. 頁面顯示 Visit site 後開啟。專案網址通常是 `https://YOUR-USERNAME.github.io/inccu-homepage/`。

網站無需 build command。`.nojekyll` 已準備好，直接發佈 HTML、CSS、JavaScript 與素材即可。操作依據：[GitHub Pages 建立網站](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)。

## 分享給同學前

- 用 Pages 網址確認首頁、所有圖示與系統截圖正常載入。
- 點新增工具、排序、重新整理，確認設定能保留。
- 確認停修與輔系雙主修連結、Google 校曆入口。
- 用手機查看版面，確認新聞卡片能切換並進入建置中頁。

外部服務仍可能要求政大登入，這不影響本原型。Google 日曆按鈕會前往 Google 訂閱流程，需要使用者自行登入確認；不代表網站已代使用者完成訂閱。

## 後續更新

在同一資料夾修改後先本機預覽，再只加入這次要更新的檔案，例如：

```sh
git status
git add data.js styles.css
git diff --cached
git commit -m "DesignTheory: update homepage tools and layout"
git push
```

Pages 會重新部署。若新增圖示或截圖，也要將對應素材加入 commit。
