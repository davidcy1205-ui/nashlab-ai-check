# AI 導入補助健檢 — 正式網站部署包

這是一個**純靜態網站**（HTML/CSS/JS，無後端），可放到任何靜態主機。
以下由最簡單排到進階，任選一個。

---

## 方式 A｜最快上線，不用裝任何東西（推薦）
Netlify Drop — 直接把整個資料夾拖上去就有網址。

1. 打開 https://app.netlify.com/drop
2. 把這個 `nashlab-ai-check` **資料夾整個拖進去**（或拖 zip）
3. 等幾秒 → 立刻拿到一個公開網址（例如 `xxx.netlify.app`）
4. （選配）在 Site settings → Domain 綁你自己的網域

> 不需要寫程式、不需要指令列。改內容後重拖一次就更新。

---

## 方式 B｜GitHub Pages（免費、適合長期維護）
1. 開一個 GitHub repo，把資料夾內所有檔案上傳（`index.html` 要在根目錄）
2. repo → Settings → Pages → Source 選 `main` branch、`/ (root)`
3. 幾分鐘後網址為 `https://<帳號>.github.io/<repo>/`
4. 綁自訂網域：Pages 設定填網域，並在 DNS 加一筆 CNAME

## 方式 C｜Vercel / Cloudflare Pages
- 連 GitHub repo，Framework 選 **Other / 靜態**，輸出目錄 `.`（根目錄）即可。
- 本包已附 `vercel.json`、`netlify.toml`，通常免額外設定。

---

## 綁定你的網域（建議 tools.nashlab.tech）
1. 在主機平台新增 Custom domain：`tools.nashlab.tech`
2. 到你的網域 DNS 新增一筆 **CNAME**：`tools` → 指向平台給的位址
3. 等憑證簽發（自動 HTTPS）即完成

---

## ⚠️ 上線後務必改這一項（影響社群分享預覽）
本包預設網址為 `https://tools.nashlab.tech`。換成你的實際網址後，
請把下列檔案裡的這串網址一起替換，分享到 IG／LINE／FB 的預覽圖才會正確：
- `index.html`（`og:url`、`og:image`、`twitter:image`、`canonical`）
- `sitemap.xml`、`robots.txt`

（其餘不用動。分享縮圖是 `assets/og-image.png`。）

---

## 檔案結構
```
nashlab-ai-check/
├─ index.html              主頁（健檢工具）
├─ css/style.css
├─ js/app.js               5 個數字的即時計算邏輯
├─ assets/
│  ├─ logo.png             Nash Lab 橫式 logo
│  ├─ og-image.png         社群分享縮圖 1200×630
│  ├─ favicon.ico / *.png  網站圖示、加到主畫面圖示
├─ manifest.webmanifest    手機可「加到主畫面」
├─ robots.txt / sitemap.xml
├─ 404.html
├─ netlify.toml / vercel.json  部署設定
```

## CTA 按鈕想真的能點？
目前「留言『補助』」是示意按鈕。要導流可把 `index.html` 裡那顆
`<a class="pill">` 的 `href` 換成你的表單 / IG 私訊 / LINE 連結即可。
