import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Key, 
  Database, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

export default function SetupGuideModal({ isOpen, onClose }) {
  const [copiedRules, setCopiedRules] = useState(false);

  if (!isOpen) return null;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES_SNIPPET);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Firebase 專案設定與 Google 登入指南
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                專案代碼：<span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">my-to-do-list-7d60c</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs leading-relaxed">
          
          {/* Step 1: Web App Config */}
          <div className="flex items-start space-x-3.5">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
              1
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-indigo-500" />
                  取得 Web 應用程式 API Key
                </h4>
                <a
                  href="https://console.firebase.google.com/project/my-to-do-list-7d60c/settings/general"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  前往控制台專案設定 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                進入 <span className="font-semibold text-slate-700 dark:text-slate-300">專案設定 &gt; 一般 &gt; 您的應用程式</span>。若尚未建立 Web 應用程式，請點擊「新增應用程式 (&lt;/&gt;)」並命名。複製包含 <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">apiKey</code> 與 <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">appId</code> 的設定，貼至本系統右上角的「設定」或專案的 <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.env</code> 檔案中。
              </p>
            </div>
          </div>

          {/* Step 2: Enable Google Auth */}
          <div className="flex items-start space-x-3.5">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
              2
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  啟用 Google 登入 (Authentication)
                </h4>
                <a
                  href="https://console.firebase.google.com/project/my-to-do-list-7d60c/authentication/providers"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  前往驗證提供者設定 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                1. 進入 <span className="font-semibold text-slate-700 dark:text-slate-300">Authentication &gt; Sign-in method</span>。<br />
                2. 點選 <span className="font-semibold text-slate-700 dark:text-slate-300">Google</span> 提供者，切換為「啟用」。<br />
                3. 設定專案支援電子郵件後儲存。<br />
                4. 於 <span className="font-semibold text-slate-700 dark:text-slate-300">Authentication &gt; Settings &gt; Authorized domains</span> 確認已包含 <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">localhost</code>。
              </p>
            </div>
          </div>

          {/* Step 3: Enable Firestore Database */}
          <div className="flex items-start space-x-3.5">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
              3
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-amber-500" />
                  建立 Cloud Firestore 資料庫與安全性規則
                </h4>
                <a
                  href="https://console.firebase.google.com/project/my-to-do-list-7d60c/firestore"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  前往 Firestore 控制台 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                點擊「建立資料庫 (Create database)」，選擇地區 (例如 asia-east1 台灣或 us-central1)。在「規則 (Rules)」頁籤中貼上以下驗證規則即可讓所有已登入的使用者即時協作：
              </p>
              
              <div className="relative mt-2">
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {FIRESTORE_RULES_SNIPPET}
                </pre>
                <button
                  onClick={handleCopyRules}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-medium flex items-center space-x-1"
                >
                  {copiedRules ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>複製規則</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition"
          >
            了解並關閉
          </button>
        </div>
      </div>
    </div>
  );
}
