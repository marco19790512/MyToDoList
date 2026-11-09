import React, { useState } from 'react';
import { 
  FolderPlus, 
  KeyRound, 
  Users, 
  Trash2, 
  LogOut, 
  CheckCircle2, 
  Share2, 
  Hash, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ 
  lists, 
  activeListId, 
  onSelectList, 
  onOpenCreateModal, 
  onOpenShareModal,
  onJoinByCode,
  onDeleteList,
  onLeaveList,
  currentUser,
  isOpen,
  onClose
}) {
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    try {
      setIsJoining(true);
      setJoinError('');
      await onJoinByCode(joinCodeInput.trim().toUpperCase());
      setJoinCodeInput('');
    } catch (err) {
      setJoinError(err.message || '加入失敗');
    } finally {
      setIsJoining(false);
    }
  };

  const colorMap = {
    indigo: 'bg-indigo-500 text-indigo-500',
    violet: 'bg-violet-500 text-violet-500',
    emerald: 'bg-emerald-500 text-emerald-500',
    rose: 'bg-rose-500 text-rose-500',
    amber: 'bg-amber-500 text-amber-500',
    blue: 'bg-blue-500 text-blue-500',
    cyan: 'bg-cyan-500 text-cyan-500'
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-wider uppercase text-slate-400 dark:text-slate-500">
              待辦清單看板
            </span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
              {lists.length}
            </span>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2.5 py-1.5 rounded-lg transition"
            title="新增清單"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>建立</span>
          </button>
        </div>

        {/* Lists Navigation */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {lists.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400 dark:text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">尚未建立任何清單</p>
              <button
                onClick={onOpenCreateModal}
                className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium underline"
              >
                建立第一張清單
              </button>
            </div>
          ) : (
            lists.map((list) => {
              const isActive = list.id === activeListId;
              const isOwner = currentUser && list.ownerId === currentUser.uid;
              const dotClass = colorMap[list.color] ? colorMap[list.color].split(' ')[0] : 'bg-indigo-500';

              return (
                <div
                  key={list.id}
                  onClick={() => {
                    onSelectList(list.id);
                    onClose?.();
                  }}
                  className={`
                    group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all
                    ${isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100 shadow-sm border border-indigo-200/80 dark:border-indigo-800/80' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'}
                  `}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotClass} flex-shrink-0 ring-2 ring-white dark:ring-slate-900`} />
                    <div className="truncate">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-950 dark:text-white' : ''}`}>
                        {list.name}
                      </p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {list.memberUids?.length || 1} 人
                        </span>
                        {list.shareCode && (
                          <span className="font-mono bg-slate-200/60 dark:bg-slate-800 px-1 rounded text-[10px]">
                            {list.shareCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions on hover or active */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenShareModal(list);
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition"
                      title="分享與成員"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {isOwner ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`確定要刪除「${list.name}」清單嗎？此操作將同時刪除所有待辦事項。`)) {
                            onDeleteList(list.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition"
                        title="刪除清單"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`確定要退出「${list.name}」協作清單嗎？`)) {
                            onLeaveList(list.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-950/50 text-slate-400 hover:text-amber-600 transition"
                        title="退出協作"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Join by Code Form at Bottom */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <form onSubmit={handleJoinSubmit} className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
              <span>輸入邀請碼加入協作</span>
            </label>
            <div className="flex space-x-1.5">
              <input
                type="text"
                placeholder="6 碼代碼 (例: K8M2P9)"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1 px-3 py-1.5 text-xs font-mono tracking-widest bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
              />
              <button
                type="submit"
                disabled={isJoining || joinCodeInput.length < 4}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition active:scale-95"
              >
                {isJoining ? '加入中' : '加入'}
              </button>
            </div>
            {joinError && (
              <p className="text-[11px] text-rose-500 font-medium leading-tight">
                {joinError}
              </p>
            )}
          </form>
        </div>
      </aside>
    </>
  );
}
