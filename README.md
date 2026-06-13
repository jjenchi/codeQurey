# CodeQuery

讓非技術人員（客服/業務）用自然語言查詢程式碼資訊的 Web App。

基於 Cursor SDK，使用者在網頁上用中文提問，系統自動搜尋 GitHub repo 的程式碼並用非技術語言回答。

---

## 給 Jackie 的快速指南

### 你拿到這個 repo 之後，要做什麼？

#### 第一步：了解系統

先讀這三份文件（按順序）：

1. **`架構設計.md`** — 系統怎麼運作、為什麼這樣設計
2. **`管理頁面設計.md`** — 帳號角色（admin/editor/viewer）、權限、操作紀錄
3. **`部署清單.md`** — 完整的部署步驟（從 AWS 帳號到上線）

#### 第二步：準備環境設定檔

這個 repo 裡有些檔案**故意不包含在內**（因為含有密碼和金鑰）。部署前你需要自己建立：

**1. `backend/.env`（後端環境變數）**

在 `backend/` 資料夾下建立 `.env` 檔，內容如下：

```
CURSOR_API_KEY=你的_Cursor_API_Key
PORT=5001
JWT_SECRET=隨機長字串_用來簽JWT_token
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

- `CURSOR_API_KEY`：到 https://cursor.com/settings 取得
- `JWT_SECRET`：自己想一個長字串，例如 `my_super_secret_key_2026`
- SMTP 相關：等設定 AWS SES 寄信時再填（忘記密碼功能用的）

**2. `codequery-key.pem`（SSH 金鑰）**

這是連線到 EC2 主機的金鑰檔。如果是全新部署，會在 AWS 建立 EC2 時自動下載。把它放到專案根目錄。

#### 第三步：部署到 EC2

完整步驟在 `部署清單.md`，分五個階段：

| 階段 | 內容 | 誰做 |
|------|------|------|
| 第一階段 | 申請 AWS 帳號 | 你自己在瀏覽器操作 |
| 第二階段 | 建立 EC2 主機 | 你自己在 AWS Console 操作 |
| 第三階段 | 安裝軟體與部署程式 | **可以請 Cursor AI 幫你做**（見下方說明） |
| 第四階段 | 設定 SMTP 寄信 | 待補充 |
| 第五階段 | 設定網域 | 選擇性，先用 IP 就好 |

### 哪些步驟可以請 Cursor AI 幫你做？

第三階段的所有步驟，你都可以在 Cursor 裡直接對 AI 說：

> 「幫我執行部署清單第三階段」

Cursor AI 會幫你：
1. 用 SSH 連線到 EC2
2. 安裝 Node.js、Git、PM2
3. 上傳程式碼
4. 安裝 npm 依賴
5. 初始化管理員帳號
6. 啟動後端

**前提條件**：
- `codequery-key.pem` 已放在專案根目錄
- `backend/.env` 已填好
- 你已經完成第一、二階段（AWS 帳號和 EC2 主機已建好）
- 你知道 EC2 的公有 IP 位址

你也可以一步步來，例如：
- 「幫我 SSH 到 EC2 主機，IP 是 xx.xx.xx.xx」
- 「幫我在 EC2 上安裝 Node.js 和 PM2」
- 「幫我把程式碼上傳到 EC2」
- 「幫我重啟 EC2 上的 PM2」

### 日常維護（改程式碼之後）

改完程式碼，對 Cursor AI 說：

> 「幫我把 server.mjs 部署到 EC2 並重啟」

它會執行：
```bash
scp -i codequery-key.pem backend/server.mjs ec2-user@<IP>:~/codequery/backend/
ssh -i codequery-key.pem ec2-user@<IP> "pm2 restart codequery"
```

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

---

## 目前部署狀態

| 項目 | 值 |
|------|------|
| EC2 IP | `35.78.107.255` |
| 查詢頁面 | `http://35.78.107.255:5001/index.html` |
| 管理頁面 | `http://35.78.107.255:5001/admin.html` |
| AI Model | `claude-opus-4-7` |
| 初始管理員 | jjenchi |
