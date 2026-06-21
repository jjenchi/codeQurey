# CodeQuery

讓非技術人員（客服/業務）用自然語言查詢程式碼資訊的 Web App。

基於 Cursor SDK，使用者在網頁上用中文提問，系統自動搜尋 GitHub repo 的程式碼並用非技術語言回答。

---

## 快速開始

### 第零步：讓 Cursor AI 帶你

用 Cursor 打開這個資料夾後，開 AI chat 說：

> 「我剛 clone 了這個專案，請引導我完成首次設定」

Cursor 會自動讀取 `.cursorrules`，知道整個專案的架構和設定流程，一步步帶你做。

以下是完整的手動步驟（你也可以每一步都請 Cursor AI 幫忙）：

### 第一步：取得 Cursor API Key

1. 到 https://cursor.com 註冊 **Cursor Pro**（$20/月）
2. 到 https://cursor.com/settings 找到 API Key，複製下來

### 第二步：建立環境設定檔

在 `backend/` 資料夾下建立 `.env` 檔：

```
CURSOR_API_KEY=你剛才複製的_API_Key
PORT=8090
JWT_SECRET=自己想一個長字串_例如_my_super_secret_2026
```

（`JWT_SECRET` 是登入驗證用的簽章密鑰，隨便一個長字串就好）

### 第三步：建立 AWS EC2 主機

照 `部署清單.md` 的第一、二階段操作（申請 AWS 帳號 + 建立 EC2）。

完成後你會拿到：
- 一個 **EC2 公有 IP**（例如 `13.xxx.xxx.xxx`）
- 一個 **codequery-key.pem** 金鑰檔（放到專案根目錄）

### 第四步：更新 .cursorrules 裡的 IP

打開 `.cursorrules`，把所有 `<你的EC2公有IP>` 替換成你的實際 IP。

或者直接對 Cursor AI 說：

> 「幫我把 .cursorrules 裡的 IP 全部改成 13.xxx.xxx.xxx」

### 第五步：部署程式到 EC2

對 Cursor AI 說：

> 「幫我執行部署清單第三階段」

它會自動幫你：SSH 連線 → 安裝 Node.js/PM2 → 上傳程式碼 → 安裝依賴 → 啟動後端。

### 第六步：建立管理員帳號

對 Cursor AI 說：

> 「幫我在 EC2 上初始化管理員帳號，帳號 XXX 密碼 XXX email XXX」

### 完成！

- 查詢頁面：`http://你的IP:8090/index.html`
- 管理頁面：`http://你的IP:8090/admin.html`

查詢頁右上角有 **「清除對話」** 按鈕，可清空畫面並開始全新對話（下一個提問不會帶入之前的上下文）。

---

## Git 倉庫

| Remote | 用途 |
|--------|------|
| `origin` | 你的 repo（`jjenchi/codeQurey`），日常 push 用這個 |
| `charles` | Charles 的原始 repo（`charlesjr0719dev/codequery`），**僅供 fetch 參考，不可 push** |

Clone 專案：

```bash
git clone https://github.com/jjenchi/codeQurey.git
```

---

## 日常維護

改完程式碼後，對 Cursor AI 說：

> 「幫我把修改過的檔案部署到 EC2 並重啟」

---

## 設計文件

修改程式碼前，建議先讀：

1. **`架構設計.md`** — 系統怎麼運作、為什麼這樣設計
2. **`管理頁面設計.md`** — 帳號角色（admin/editor/viewer）、權限、操作紀錄
3. **`部署清單.md`** — 完整部署步驟、AI Model 設定、月費估算

---

## 檔案結構

```
CodeQuery/
├── README.md                  ← 你正在看的這個檔案
├── .cursorrules               ← Cursor AI 的專案指引（自動讀取）
├── .gitignore                 ← Git 排除規則
│
├── backend/
│   ├── server.mjs             ← Express 後端（所有 API）
│   ├── init-admin.mjs         ← 初始化管理員帳號的腳本
│   ├── package.json           ← npm 依賴清單
│   └── .env                   ← 環境變數（不在 repo 裡，需自建）
│
├── frontend/
│   ├── index.html             ← 查詢頁面（含登入畫面）
│   └── admin.html             ← 管理頁面（專案/帳號/紀錄管理）
│
├── 架構設計.md                ← 系統架構、版本演進、設計決策
├── 管理頁面設計.md            ← 角色權限、API 端點、帳號規則
└── 部署清單.md                ← 完整部署步驟、AI Model 設定、月費估算
```

以下檔案會在運行時產生，**不在 repo 裡**：

```
├── codequery-key.pem          ← SSH 金鑰（從 AWS 下載）
├── projects.json              ← 專案設定（透過管理頁面操作）
├── users.json                 ← 帳號資料（密碼以 bcrypt hash 儲存）
├── admin-logs.json            ← 操作紀錄
├── admin-logs-archive.json    ← 操作紀錄備份
└── repos/                     ← 自動 clone 的 GitHub repo
```

---

## 安全機制

| 機制 | 說明 |
|------|------|
| 登入驗證 | 查詢頁面和管理頁面都需要帳號密碼登入（JWT） |
| 角色分層 | admin（全部權限）、editor（管理專案）、viewer（僅查詢） |
| Rate Limiting | 每使用者每分鐘最多 10 次查詢 |
| 程式碼防護（Regex） | 攔截明顯的程式碼請求和 prompt injection |
| 程式碼防護（AI） | 用 composer-2.5 分類器攔截多語言繞過和間接提取 |
| 子資料夾隔離 | 選擇子資料夾後，Agent 被限制只搜尋該資料夾 |
| 密碼加密 | bcrypt hash，不存明碼 |
| 敏感檔案隔離 | .env、.pem、users.json 等不進 Git |
