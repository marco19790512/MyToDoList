import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  UserPlus, 
  Users, 
  Shield, 
  Mail,
  ExternalLink
} from 'lucide-react';

export default function ShareListModal({ isOpen, onClose, list, onInviteEmail }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  if (!isOpen || !list) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}?join=${list.shareCode}`;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setIsInviting(true);
      await onInviteEmail(list.id, inviteEmail.trim());
      setInviteSuccess(true);
      setInviteEmail('');
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (err) {
      alert('邀請失敗：' + err.message);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                分享與成員協作
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                清單：<span className="font-semibold text-slate-700 dark:text-slate-200">{list.name}</span>
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

        <div className="p-5 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Quick Share (Code + Direct URL) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              即時分享方式
            </h4>

            {/* 6-character Code */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">清單專屬邀請代碼</p>
                <p className="text-xl font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {list.shareCode || '------'}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(list.shareCode, 'code')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition active:scale-95"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">已複製</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>複製代碼</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct URL */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div className="truncate mr-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">一鍵直達邀請連結</p>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate mt-0.5 max-w-xs">
                  {shareUrl}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(shareUrl, 'link')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition active:scale-95 flex-shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>已複製</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>複製連結</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Invite by Email */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>透過 Email 授權協作</span>
            </h4>
            <form onSubmit={handleInviteSubmit} className="flex space-x-2">
              <input
                type="email"
                placeholder="輸入對方的 Google Email (例: friend@gmail.com)"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition"
              >
                {isInviting ? '加入中...' : '加入'}
              </button>
            </form>
            {inviteSuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>已成功將此 Email 加入清單協作成員！</span>
              </p>
            )}
          </div>

          {/* Section 3: Current Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>現有成員 ({list.members?.length || 1})</span>
              </h4>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
              {(list.members || [{
                uid: list.ownerId,
                displayName: list.ownerName || '建立者',
                email: list.ownerEmail || '',
                photoURL: list.ownerPhoto || '',
                role: 'owner'
              }]).map((m, idx) => {
                const isOwner = m.role === 'owner' || m.uid === list.ownerId;
                return (
                  <div key={m.uid || idx} className="p-3 flex items-center justify-between bg-white dark:bg-slate-900">
                    <div className="flex items-center space-x-3 truncate">
                      {m.photoURL ? (
                        <img 
                          src={m.photoURL} 
                          alt={m.displayName} 
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                          {(m.displayName || m.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {m.displayName || '未命名成員'}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {m.email}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                      isOwner 
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60' 
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60'
                    }`}>
                      {isOwner ? (
                        <>
                          <Shield className="w-3 h-3" />
                          <span>建立者</span>
                        </>
                      ) : (
                        <span>協作者</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
}
