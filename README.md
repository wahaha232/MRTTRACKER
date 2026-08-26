# 🚇 METRO QUEST — 台北捷運即時列車行控中心

一個以 **8-bit 復古遊戲地圖**呈現台北捷運路網的即時列車追蹤儀表板。
每一台列車都有自己的旅程，透過 `requestAnimationFrame` 平滑模擬（或即時資料）在
「像素世界地圖」上移動，搭配 CRT 掃描線、像素風 UI、路線/列車控制與多語系介面。

> **DEMO**：https://wahaha232.github.io/MRTTRACKER/

---

## ✨ 功能特色

- **雙資料模式**
  - **Demo Mode**：內建 128 台模擬列車橫跨六條路線，含到站、行進、低機率延誤。
  - **Live Mode**：串接臺北捷運官方 Open Data API（需自行申請 API 金鑰）。
- **六條真實路線**：淡水信義線、板南線、松山新店線、中和新蘆線、文湖線、環狀線
  （含新北投 / 小碧潭 / 蘆洲 / 新莊支線）。
- **8-bit 像素世界**：深藍夜空、星空、月亮、雲朵、遠山、森林、島嶼與建築。
- **平滑動畫**：以 `requestAnimationFrame` 量測實際幀間隔做位置插值，不累積誤差。
- **列車 / 車站互動**：點選列車或車站可查看即時行車資訊、到站提示、延誤警示與音效。
- **多語系**：繁體中文 / English 一鍵切換。
- **響應式**：桌上型三欄儀表板 → 平板 / 手機改為底部浮動控制列與下方抽屜（bottom sheet）。
- **CRT 復古體驗**：掃描線 overlay、像素字型、音效回饋。

---

## 🚀 快速開始

環境需求：**Node.js 18+**（建議 20+）

```bash
# 1. 安裝相依套件
npm install

# 2. 本機開發伺服器（http://localhost:5173）
npm run dev

# 3. 型別檢查 + 產出正式 build（輸出至 dist/）
npm run build

# 4. 預覽正式 build
npm run preview
```

其他指令：

```bash
npm test          # 執行 Vitest 單元測試（一次性）
npm run test:watch # 監看模式執行測試
```

### 設定檔

複製 `.env.example` 為 `.env` 後依需求填寫，本機 dev 不需任何設定即可用 Demo Mode。

---

## 📡 Live Mode（臺北捷運官方 Open Data API）

要啟用「即時列車」資料需向臺北捷運申請 API 金鑰。

### 重要資安說明

> ⚠️ **API 金鑰絕不能設定為 `VITE_` 開頭的環境變數。**
> Vite 會把所有 `VITE_` 開頭變數靜態打包進公開的前端 JS bundle，
> 任何人打開瀏覽器 DevTools 或下載 bundle 檔就能看到金鑰。

正確做法是透過 **伺服器端 proxy / Edge server**（例如 nginx、Cloudflare Worker、
AWS Lambda@Edge）持有金鑰，再被瀏覽器轉發到官方 API：

1. **前端（本專案）只做兩件事**
   - `VITE_METRO_API_BASE_URL`：設定「非機密」的 proxy 端點（同源路徑 `/metro`
     或你自己架設的 proxy URL），瀏覽器只打這個路徑。
   - 前端程式碼**不讀取、不發送**任何 API 金鑰（金鑰已從前端完全移除）。
2. **伺服器端 proxy** 設定非-VITE 的 `METRO_API_KEY`，在伺服器端注入
   `Authorization: Bearer <金鑰>` 後再轉發到官方 API。
3. 本機開發時，`vite.config.ts` 已內建 dev proxy：瀏覽器連 `/metro`，
   金鑰由 dev server 注入（不會進 bundle）。

未設定 Live 時網站會自動 fallback 到 Demo Mode，並顯示連線警示。

---

## 🧩 AdSense 廣告（選用）

專案已內建廣告位架構（`.env.example` 有說明）：

- `VITE_ADS_ENABLED=false`（預設）時顯示「AD · 廣告位置保留」占位方塊，不載入任何廣告。
- 想正式投放：在 Google AdSense 後台建立廣告單元，取得 `VITE_ADS_CLIENT` 與各
  slot id，設為 `VITE_ADS_ENABLED=true` 後重新 build。

---

## 📂 專案結構

```
├── .github/workflows/   GitHub Actions（測試 + build + 部署 Pages）
├── public/              靜態資源：favicon、404.html、robots.txt、sitemap.xml
├── src/
│   ├── components/      頭部 / 地圖 / 路線 / 列車 / 車站彈窗 / 廣告等 UI 元件
│   ├── data/            路線、車站（含座標）、行車時間資料
│   ├── i18n/            繁中 / 英文翻譯字典
│   ├── services/        Metro API 客戶端、mock 引擎、資料轉接器
│   ├── store/           中央 Metro Store（Context + rAF 統一更新）
│   ├── styles/          pixel / metro / CRT 樣式表
│   ├── utils/           時間、列車位置演算、路線幾何、音效工具
│   └── types.ts         型別定義
├── index.html           進入點（含 OG / Twitter Card meta）
├── vite.config.ts       Vite 設定（含 dev proxy）
├── vitest.config.ts     Vitest 測試設定
└── package.json
```

---

## 🛠 技術棧

<table>
<tr><td><b>框架</b></td><td>React 18</td></tr>
<tr><td><b>語言</b></td><td>TypeScript 5</td></tr>
<tr><td><b>建置</b></td><td>Vite 5</td></tr>
<tr><td><b>路由</b></td><td>React Router 6（GitHub Pages 子路徑 basename）</td></tr>
<tr><td><b>測試</b></td><td>Vitest 2</td></tr>
<tr><td><b>部署</b></td><td>GitHub Actions → GitHub Pages</td></tr>
</table>

---

## 🚦 CI / 部署

`main` 分支每次 push 都會觸發 `.github/workflows/deploy.yml`：

1. `npm ci` 安裝相依
2. `npm test` 執行全部單元測試（失敗即中止）
3. `npm run build` 型別檢查並產出 `dist/`
4. 上傳並部署到 GitHub Pages

---

## 📝 授權

本專案為個人練習 / 展示專案；列車資料依作者程式內部模擬或臺北捷運 Open Data
API。詳細授權請見各依賴套件與官方 Open Data 授權條款。
