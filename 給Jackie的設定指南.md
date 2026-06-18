# CodeQuery 設定指南

這份指南會帶你從零開始，把 CodeQuery 部署到你自己的 AWS 主機上。

大部分步驟都可以請 Cursor AI 幫你做——你只需要跟它說話就好。

---

## 事前準備（你需要先搞定這些）

### 1. 安裝 Cursor

- 到 https://cursor.com 下載安裝
- 訂閱 **Cursor Pro**（$20/月），才能用 API

### 2. 取得 Cursor API Key

- 登入後到 https://cursor.com/settings
- 找到 API Key，複製下來（等一下會用到）

### 3. 申請 AWS 帳號

- 到 https://aws.amazon.com/ 點「Create an AWS Account」
- 需要：email、信用卡、手機收驗證碼
- 選免費方案（Basic support - Free）
- 新帳號前 12 個月有免費額度

### 4. 在 AWS 建立 EC2 主機

登入 AWS Console 後：

1. 右上角區域選 **亞太區域（東京）ap-northeast-1**
2. 搜尋「EC2」→ 點進去 → 「啟動執行個體」
3. 名稱：`CodeQuery`
4. AMI：`Amazon Linux 2023`（預設那個）
5. 執行個體類型：`t3.micro`（免費）或 `t3.small`（效能較好，約 $15/月）
6. 金鑰對：點「建立新的金鑰對」→ 名稱 `codequery-key` → 類型 RSA → 格式 .pem → 建立
   - ⚠️ 瀏覽器會下載一個 `codequery-key.pem`，**這個檔案很重要，不要弄丟**
7. 防火牆：✅ 允許 SSH 流量、✅ 允許 HTTP 流量
8. 儲存空間：預設 8 GB 不用改
9. 點「啟動執行個體」

啟動後，到執行個體列表找到 CodeQuery，記下**公有 IPv4 位址**（例如 `13.xxx.xxx.xxx`）。

---

## 正式開始（以下都在 Cursor 裡操作）

### 步驟 1：下載專案

打開終端機（Terminal），輸入：

```
git clone https://github.com/charlesjr0719dev/codequery.git
```

### 步驟 2：用 Cursor 打開專案

打開 Cursor → File → Open Folder → 選剛才下載的 `codequery` 資料夾

### 步驟 3：建立環境設定檔

對 Cursor AI 說：

> 幫我在 backend 資料夾下建立 .env 檔，內容如下：
> ```
> CURSOR_API_KEY=（貼上你的 API Key）
> PORT=5001
> JWT_SECRET=（自己想一個長字串，例如 jackie_codequery_secret_2026）
> SMTP_HOST=
> SMTP_PORT=587
> SMTP_USER=
> SMTP_PASS=
> SMTP_FROM=
> ```

### 步驟 4：放入 SSH 金鑰

把剛才下載的 `codequery-key.pem` 檔案，放到專案根目錄（跟 README.md 同一層）。

### 步驟 5：更新 IP

對 Cursor AI 說：

> 幫我把 .cursorrules 和部署清單.md 裡所有的 `<你的EC2公有IP>` 替換成 `（貼上你的 EC2 IP）`

### 步驟 6：部署程式到 EC2

對 Cursor AI 說：

> 幫我執行部署清單第三階段

它會自動幫你：
- SSH 連到 EC2
- 安裝 Node.js、Git、PM2
- 上傳所有程式碼
- 安裝依賴套件
- 啟動後端

等它跑完就好。

### 步驟 7：建立管理員帳號

對 Cursor AI 說：

> 幫我在 EC2 上執行 init-admin.mjs，帳號是 `你要的帳號` 密碼是 `你要的密碼` email 是 `你的email`

### 步驟 8：驗證

打開瀏覽器：

- 查詢頁面：`http://你的IP:5001/index.html`
- 管理頁面：`http://你的IP:5001/admin.html`

用剛才建的管理員帳號登入，能進去就代表成功了！

---

## 之後改程式碼怎麼辦？

改完之後，對 Cursor AI 說：

> 幫我把修改過的檔案部署到 EC2 並重啟

就這樣，一句話搞定。

---

## 之後要新增查詢用的帳號怎麼辦？

登入管理頁面（admin.html）→ 帳號管理 → 新增帳號

- 給客服/業務用的帳號，權限選 **Viewer**（只能查詢，不能改設定）
- 給開發人員的帳號，權限選 **Editor**（能管理專案）

---

## 遇到問題怎麼辦？

對 Cursor AI 說：

> 幫我看 EC2 上的 PM2 log

它會幫你撈錯誤訊息，然後你可以直接把錯誤訊息貼給它，讓它幫你修。

---

## 費用估算

| 項目 | 月費 |
|------|------|
| Cursor Pro | $20 |
| EC2 t3.micro | 免費（前 12 個月）→ 之後約 $8/月 |
| EC2 t3.small（建議） | 約 $15/月 |
| Cursor SDK token | 依用量（通常幾美元） |
| **合計** | **約 $20-40/月** |
