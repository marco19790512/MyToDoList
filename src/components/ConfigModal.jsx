import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Save, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Code,
  ShieldCheck
} from 'lucide-react';
import { getStoredConfig, saveFirebaseConfig, clearStoredFirebaseConfig } from '../firebase';

export default function ConfigModal({ isOpen, onClose }) {
  const current = getStoredConfig();
  const [config, setConfig] = useState(current);
  const [rawSnippet, setRawSnippet] = useState('');
  const [isRawMode, setIsRawMode] = useState(false);
  const [parseError, setParseError] = useState('');

  if (!isOpen) return null;

  const handleRawSnippetParse = () => {
    try {
      setParseError('');
      // Match object keys even if unquoted like apiKey: "..."
      let text = rawSnippet.trim();
      if (text.includes('const firebaseConfig =')) {
        text = text.replace(/const\s+firebaseConfig\s*=\s*/, '');
      }
      if (text.endsWith(';')) {
        text = text.slice(0, -1);
      }

      // Extract properties using regex
      const apiKeyMatch = text.match(/apiKey:\s*["']([^"']+)["']/);
      const authDomainMatch = text.match(/authDomain:\s*["']([^"']+)["']/);
      const projectIdMatch = text.match(/projectId:\s*["']([^"']+)["']/);
      const storageBucketMatch = text.match(/storageBucket:\s*["']([^"']+)["']/);
      const messagingSenderIdMatch = text.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const appIdMatch = text.match(/appId:\s*["']([^"']+)["']/);

      if (!apiKeyMatch) {
        throw new Error('無法從貼上的文字中解析出 apiKey，請檢查格式。');
      }

      const parsedConfig = {
        apiKey: apiKeyMatch ? apiKeyMatch[1] : config.apiKey,
        authDomain: authDomainMatch ? authDomainMatch[1] : config.authDomain,
        projectId: projectIdMatch ? projectIdMatch[1] : config.projectId,
        storageBucket: storageBucketMatch ? storageBucketMatch[1] : config.storageBucket,
        messagingSenderId: messagingSenderIdMatch ? messagingSenderIdMatch[1] : config.messagingSenderId,
        appId: appIdMatch ? appIdMatch[1] : config.appId
      };

      setConfig(parsedConfig);
      setIsRawMode(false);
    } catch (e) {
      setParseError(e.message || '解析失敗，請手動填寫欄位。');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!config.apiKey.trim()) {
      alert('請填入 Firebase API Key');
      return;
    }
    saveFirebaseConfig(config);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Firebase 專案設定
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                專案：<span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">my-to-do-list-7d60c</span>
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

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              輸入方式
            </span>
            <button
              type="button"
              onClick={() => setIsRawMode(!isRawMode)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{isRawMode ? '切換為分項欄位' : '一鍵貼上 Firebase 設定物件'}</span>
            </button>
          </div>

          {isRawMode ? (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                請在下方貼上 Firebase 控制台的 <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">firebaseConfig</code> 程式碼：
              </label>
              <textarea
                rows={7}
                placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "my-to-do-list-7d60c.firebaseapp.com",\n  projectId: "my-to-do-list-7d60c",\n  appId: "1:..."\n};`}
                value={rawSnippet}
                onChange={(e) => setRawSnippet(e.target.value)}
                className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {parseError && (
                <p className="text-xs text-rose-500 font-medium">{parseError}</p>
              )}
              <button
                type="button"
                onClick={handleRawSnippetParse}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
              >
                自動解析並帶入欄位
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  API Key <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="AIzaSy..."
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project ID
                </label>
                <input
                  type="text"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Auth Domain
                </label>
                <input
                  type="text"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  App ID
                </label>
                <input
                  type="text"
                  placeholder="1:123456789:web:abcdef"
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('確定要重置為預設設定嗎？')) {
                      clearStoredFirebaseConfig();
                    }
                  }}
                  className="text-xs text-rose-500 hover:text-rose-600 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>清除自訂設定</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>儲存並重新載入</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
