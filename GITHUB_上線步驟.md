# GitHub 上線步驟（含自動部署）

本包已內建 GitHub Actions，**推上去就會自動部署**，之後你只要換檔案再 commit，網站就自動更新。

## 一、建立 repo 並上傳（網頁操作，免指令）
1. 到 https://github.com/new 建一個新 repo（例：`nashlab-ai-check`），可設 Public。
2. 進入 repo → 點 **Add file → Upload files**。
3. 把本資料夾內**所有檔案與資料夾**（含隱藏的 `.github`、`.nojekyll`）拖進去。
   - 若網頁上傳看不到 `.github` / `.nojekyll`，改用「GitHub Desktop」把整個資料夾拖入後 commit 最保險。
4. 下方 **Commit changes**。

## 二、開啟 Pages（一次性）
1. repo → **Settings → Pages**
2. **Source** 選 **GitHub Actions**（不是 Deploy from a branch）
3. 回到 **Actions** 分頁，會看到 "Deploy to GitHub Pages" 正在跑，綠勾後
4. 網址會顯示在 Actions 的 deploy 步驟，或 Settings → Pages 最上方：
   `https://<你的帳號>.github.io/<repo>/`

## 三、之後要改內容
- 換掉對應檔案（例如改 `index.html` 或 `js/app.js`）→ commit → **自動重新部署**。
- 我每次給你新檔，你只要覆蓋上傳即可。

## 四、綁自己的網域（選配，建議 tools.nashlab.tech）
1. Settings → Pages → **Custom domain** 填 `tools.nashlab.tech` → Save
2. 到你的 DNS 加一筆 **CNAME**：`tools` → `<你的帳號>.github.io`
3. 勾選 **Enforce HTTPS**（憑證自動）

## 五、上線後改網址（影響分享預覽）
把 `index.html` 的 `og:url / og:image / twitter:image / canonical`，以及 `sitemap.xml`、`robots.txt` 內的
`https://tools.nashlab.tech` 換成你的實際網址（GitHub Pages 網址或自訂網域）。

---
### 想讓我「直接推送」怎麼辦？
目前連接器目錄沒有可用的 GitHub 連接器，所以我無法代你推送。等日後有官方 GitHub 連接器，你授權後即可；
在那之前，最順的循環是：**我給檔案 → 你覆蓋上傳 → Actions 自動部署**。
（請勿把 GitHub Token 貼到對話；若真要用，請在你自己的電腦用 GitHub Desktop 或 gh CLI。）
