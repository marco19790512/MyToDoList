# MyToDoList - 多人即時協作待辦清單 (Firebase Web App)

專為團隊與多人協作設計的現代化待辦事項應用程式。支援 **Google 帳號一鍵登入**、**多人即時同步**、**看板分享代碼與專屬邀請連結**、**任務指派**、**優先級分類**、**到期日提醒**以及**深淺色模式**。

專案已預先綁定 Firebase 專案：`my-to-do-list-7d60c`。

---

## ✨ 核心功能特色

1. **Google 帳號授權登入**
   - 透過 Firebase Authentication (Google Provider) 一鍵登入。
   - 自動同步使用者暱稱、頭像與 Email。
   - 支援自動偵測未啟用 Google 登入或未授權網域的友善提示。

2. **多人即時協作 (Multiplayer Real-time Sync)**
   - 基於 Cloud Firestore 即時監聽器 (`onSnapshot`)。
   - 一人新增、勾選、編輯或刪除待辦，所有在線成員畫面即時同步更新！
   - 完成事項時具有歡慶彩帶特效 (Confetti)。

3. **靈活的看板分享與協作模式**
   - **專屬 6 碼邀請碼**：每張看板具備獨立 6 位英數字邀請代碼 (例如：`K8M2P9`)，隊友在側邊欄輸入代碼即可立即加入。
   - **一鍵直達邀請連結**：支援 `?join=XXXXXX` 網址參數，朋友點擊連結登入後直接自動加入該看板。
   - **Email 邀請**：可直接在成員管理視窗輸入好友的 Google Email 授權協作。
   - **權限區分**：清楚標記「建立者」與「協作者」，並顯示現有成員頭像與列表。

4. **任務管理與細緻篩選**
   - **優先度**：高優先 (紅)、中優先 (黃)、低優先 (灰)。
   - **成員指派**：可將任務指派給清單內的特定成員，並即時顯示負責人頭像。
   - **標籤與進度**：頂部顯示即時完成進度條 (例如 `62%`)。
   - **快速過濾**：全部、進行中、已完成、與我相關。
   - **關鍵字搜尋 & 排序**：支援最新建立、最高優先度、到期日排序。

5. **視覺化 Firebase 設定引導**
   - 系統已內建 Firebase 設定小幫手與即時指引視窗。
   - 支援於 UI 介面右上角「設定」中一鍵貼上 Firebase 設定物件，儲存後立即生效，無須重啟伺服器。

---

## 🚀 快速啟動指南

### 1. 啟動本機開發伺服器

請在專案目錄執行：

```bash
cd C:\Users\marco\.gemini\antigravity\scratch\MyToDoList
npm run dev
```

開啟瀏覽器前往：`http://localhost:5173`

---

## ⚙️ Firebase 專案設定說明 (`my-to-do-list-7d60c`)

專案已設定 `projectId: my-to-do-list-7d60c` 與相關網域，您僅需在 Firebase 控制台完成以下三步：

### 第一步：取得 Web 應用程式 API Key 與 App ID

1. 前往 [Firebase 控制台專案設定](https://console.firebase.google.com/project/my-to-do-list-7d60c/settings/general)。
2. 在「**一般**」分頁往下滑至「**您的應用程式**」。
3. 若尚未建立，請點選「**新增應用程式 (&lt;/&gt; Web)**」並命名為 `MyToDoList`。
4. 複製產生的設定值，填入專案根目錄的 `.env` 檔案中：
   ```env
   VITE_FIREBASE_API_KEY=你的_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=my-to-do-list-7d60c.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=my-to-do-list-7d60c
   VITE_FIREBASE_STORAGE_BUCKET=my-to-do-list-7d60c.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=你的_SENDER_ID
   VITE_FIREBASE_APP_ID=你的_APP_ID
   ```
   *(亦可直接在網頁右上角的「設定」圖示中貼上設定物件，系統會自動儲存於 localStorage)*

### 第二步：開啟 Google 登入功能

1. 前往 [Authentication > Sign-in method](https://console.firebase.google.com/project/my-to-do-list-7d60c/authentication/providers)。
2. 點選「**Google**」，切換為「**啟用**」。
3. 設定專案支援電子郵件後點擊「**儲存**」。
4. 檢查「**設定 (Settings) > 授權網域 (Authorized domains)**」是否已包含 `localhost`。

### 第三步：建立 Cloud Firestore 資料庫

1. 前往 [Cloud Firestore 控制台](https://console.firebase.google.com/project/my-to-do-list-7d60c/firestore)。
2. 點擊「**建立資料庫 (Create database)**」，位置可選鄰近地區（如 `asia-east1` 台灣）。
3. 進入「**規則 (Rules)**」分頁，貼上專案內的 `firestore.rules` 規則：
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
4. 點選「**發布 (Publish)**」。

---

## 📁 專案架構

```text
MyToDoList/
├── .env                  # Firebase 環境變數設定
├── .env.example          # 環境變數範例檔
├── firestore.rules       # Cloud Firestore 安全性驗證規則
├── package.json          # 專案依賴 (React 18, Firebase 11, Tailwind, Lucide)
├── tailwind.config.js    # Tailwind 設定
├── vite.config.js        # Vite 打包與代碼拆分設定
└── src/
    ├── main.jsx          # 應用程式入口
    ├── App.jsx           # 主頁面、狀態控制與看板導航
    ├── index.css         # 全域樣式與字型設定
    ├── firebase.js       # Firebase 初始化與配置管理
    ├── context/
    │   └── AuthContext.jsx       # Google 登入與使用者狀態管理
    ├── services/
    │   ├── listsService.js      # 看板清單建立、邀請碼、加入、刪除
    │   └── todosService.js      # 待辦事項即時同步 (CRUD, 完成切換, 指派)
    └── components/
        ├── Navbar.jsx           # 頂部導航列、深淺色切換、Google 登入狀態
        ├── Sidebar.jsx          # 清單看板切換、輸入邀請碼、建立看板
        ├── TodoList.jsx         # 任務列表主區塊、篩選分頁、進度條、搜尋
        ├── TodoItem.jsx         # 單一任務卡片、勾選彩帶、指派人、優先度、內聯編輯
        ├── AddTodoForm.jsx      # 快速新增待辦事項表單
        ├── CreateListModal.jsx  # 建立看板彈窗 (顏色主題、名稱、說明)
        ├── ShareListModal.jsx   # 分享邀請彈窗 (6碼邀請碼、專屬直達連結、成員列表)
        ├── ConfigModal.jsx      # Firebase API Key 設定彈窗 (支援一鍵貼上解析)
        └── SetupGuideModal.jsx  # 完整 Firebase 設定步驟指南彈窗
```
