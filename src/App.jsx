import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TodoList from './components/TodoList';
import CreateListModal from './components/CreateListModal';
import ShareListModal from './components/ShareListModal';
import ConfigModal from './components/ConfigModal';
import SetupGuideModal from './components/SetupGuideModal';

import { 
  subscribeUserLists, 
  createList, 
  joinListByCode, 
  inviteMemberByEmail, 
  deleteList, 
  leaveList 
} from './services/listsService';
import { 
  subscribeTodos, 
  addTodo, 
  toggleTodo, 
  updateTodo, 
  deleteTodo, 
  clearCompletedTodos 
} from './services/todosService';

import { 
  Sparkles, 
  Users, 
  CheckCircle2, 
  ShieldAlert, 
  AlertCircle,
  HelpCircle,
  LogIn
} from 'lucide-react';

export default function App() {
  const { currentUser, loading, authError, setAuthError, loginWithGoogle, isConfigured } = useAuth();

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Lists and active list
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [todos, setTodos] = useState([]);

  // Sidebar toggle for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sharingList, setSharingList] = useState(null);

  // Auto-prompt config modal on first run if config is missing
  useEffect(() => {
    if (!isConfigured) {
      setShowConfigModal(true);
    }
  }, [isConfigured]);

  // Subscribe to lists when user logs in
  useEffect(() => {
    if (!currentUser) {
      setLists([]);
      setActiveListId(null);
      setTodos([]);
      return;
    }

    const unsubscribe = subscribeUserLists(currentUser, (userLists) => {
      setLists(userLists);
      // Auto-select first list if none selected or selected was deleted
      setActiveListId((prev) => {
        if (prev && userLists.some(l => l.id === prev)) {
          return prev;
        }
        return userLists.length > 0 ? userLists[0].id : null;
      });
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handle invitation link (?join=CODE)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && currentUser) {
      handleJoinByCode(joinCode).then(() => {
        // Clear query param
        window.history.replaceState({}, document.title, window.location.pathname);
      }).catch(err => {
        alert(err.message);
      });
    }
  }, [currentUser]);

  // Subscribe to todos of active list
  useEffect(() => {
    if (!activeListId) {
      setTodos([]);
      return;
    }

    const unsubscribe = subscribeTodos(activeListId, (listTodos) => {
      setTodos(listTodos);
    });

    return () => unsubscribe();
  }, [activeListId]);

  const activeList = lists.find(l => l.id === activeListId) || null;

  // Actions
  const handleCreateList = async ({ name, description, color }) => {
    const newList = await createList({ name, description, color, currentUser });
    setActiveListId(newList.id);
  };

  const handleJoinByCode = async (code) => {
    const list = await joinListByCode(code, currentUser);
    setActiveListId(list.id);
  };

  const handleInviteEmail = async (listId, email) => {
    await inviteMemberByEmail(listId, email, currentUser);
  };

  const handleDeleteList = async (listId) => {
    await deleteList(listId, currentUser);
  };

  const handleLeaveList = async (listId) => {
    await leaveList(listId, currentUser);
  };

  const handleAddTodo = async (todoData) => {
    if (!activeListId) return;
    await addTodo(activeListId, todoData, currentUser);
  };

  const handleToggleTodo = async (todoId, currentCompleted) => {
    if (!activeListId) return;
    await toggleTodo(activeListId, todoId, currentCompleted, currentUser);
  };

  const handleUpdateTodo = async (todoId, updates) => {
    if (!activeListId) return;
    await updateTodo(activeListId, todoId, updates);
  };

  const handleDeleteTodo = async (todoId) => {
    if (!activeListId) return;
    await deleteTodo(activeListId, todoId);
  };

  const handleClearCompleted = async () => {
    if (!activeListId) return;
    await clearCompletedTodos(activeListId, todos);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Top Navigation */}
      <Navbar
        onOpenConfig={() => setShowConfigModal(true)}
        onOpenGuide={() => setShowGuideModal(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentList={activeList}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto">
        
        {/* Collaborative Lists Sidebar */}
        {currentUser && (
          <Sidebar
            lists={lists}
            activeListId={activeListId}
            onSelectList={setActiveListId}
            onOpenCreateModal={() => setShowCreateModal(true)}
            onOpenShareModal={(list) => setSharingList(list)}
            onJoinByCode={handleJoinByCode}
            onDeleteList={handleDeleteList}
            onLeaveList={handleLeaveList}
            currentUser={currentUser}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Work Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* Missing Firebase API Key Warning Banner */}
          {!isConfigured && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200">
                    尚未設定 Firebase API Key
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    已為您預設專案 <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 rounded">my-to-do-list-7d60c</code>，請填入 Web 應用程式的 API Key 即可開始使用 Google 登入與多人即時待辦功能。
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs flex-shrink-0 ml-2"
              >
                立即設定
              </button>
            </div>
          )}

          {/* Authentication Error Banner */}
          {authError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rose-800 dark:text-rose-200">
                    登入提示
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                    {authError}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuthError(null)}
                className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 font-semibold"
              >
                關閉
              </button>
            </div>
          )}

          {/* User not logged in state */}
          {!currentUser ? (
            <div className="max-w-2xl mx-auto my-12 text-center py-16 px-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/25">
                <Users className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                多人即時協作待辦清單
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
                專為團隊與多人協作打造。透過 Google 帳號一鍵登入，即時同步任務、指派隊友、掌握每項待辦的完成進度。
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={loginWithGoogle}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-md shadow-indigo-600/25 flex items-center justify-center space-x-2.5 transition active:scale-95"
                >
                  <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.41 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.59 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>使用 Google 帳號登入</span>
                </button>

                <button
                  onClick={() => setShowGuideModal(true)}
                  className="w-full sm:w-auto px-5 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl transition flex items-center justify-center space-x-1.5 text-sm"
                >
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span>Firebase 設定指南</span>
                </button>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800/80 text-left">
                <div className="p-3">
                  <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                    ⚡ 即時同步
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    基於 Cloud Firestore，一人勾選完成，全體協作者即時看見。
                  </p>
                </div>
                <div className="p-3">
                  <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                    🤝 專屬分享代碼
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    每張清單擁有 6 碼邀請碼或直達連結，快速拉好友進群協作。
                  </p>
                </div>
                <div className="p-3">
                  <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                    🎯 任務指派與優先度
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    支援指派隊友頭像、設定高/中/低優先度與到期日提醒。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Logged in: Main collaborative to-do board */
            <div className="max-w-4xl mx-auto">
              {activeList ? (
                <TodoList
                  currentList={activeList}
                  todos={todos}
                  onAddTodo={handleAddTodo}
                  onToggleTodo={handleToggleTodo}
                  onUpdateTodo={handleUpdateTodo}
                  onDeleteTodo={handleDeleteTodo}
                  onClearCompleted={handleClearCompleted}
                  onOpenShareModal={(list) => setSharingList(list)}
                  currentUser={currentUser}
                />
              ) : (
                <div className="text-center py-20">
                  <p className="text-sm text-slate-500 dark:text-slate-400">正在載入清單看板...</p>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Modals */}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateList}
      />

      <ShareListModal
        isOpen={Boolean(sharingList)}
        onClose={() => setSharingList(null)}
        list={sharingList}
        onInviteEmail={handleInviteEmail}
      />

      <ConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />

      <SetupGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

    </div>
  );
}
