import React, { useState, useMemo } from 'react';
import TodoItem from './TodoItem';
import AddTodoForm from './AddTodoForm';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  ListTodo,
  Share2,
  Users
} from 'lucide-react';

export default function TodoList({ 
  currentList, 
  todos, 
  onAddTodo, 
  onToggleTodo, 
  onUpdateTodo, 
  onDeleteTodo, 
  onClearCompleted,
  onOpenShareModal,
  currentUser 
}) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'completed' | 'mine'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created'); // 'created' | 'priority' | 'dueDate'

  // Filter & Sort Logic
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // Tab filter
      if (filterTab === 'pending' && todo.completed) return false;
      if (filterTab === 'completed' && !todo.completed) return false;
      if (filterTab === 'mine') {
        const isAssigned = todo.assignedTo?.uid === currentUser?.uid;
        const isCreated = todo.createdBy?.uid === currentUser?.uid;
        if (!isAssigned && !isCreated) return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = todo.title?.toLowerCase().includes(query);
        const descMatch = todo.description?.toLowerCase().includes(query);
        const assigneeMatch = todo.assignedTo?.displayName?.toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !assigneeMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priority') {
        const weight = { high: 3, medium: 2, low: 1 };
        return (weight[b.priority] || 2) - (weight[a.priority] || 2);
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      // default: latest created first
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
  }, [todos, filterTab, searchQuery, sortBy, currentUser]);

  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const members = currentList?.members || [];

  return (
    <div className="space-y-6">
      
      {/* Board Banner / Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {currentList?.name || '待辦清單'}
              </h2>
              <button
                onClick={() => onOpenShareModal(currentList)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 rounded-full text-xs font-semibold transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>邀請成員協作</span>
              </button>
            </div>
            {currentList?.description && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                {currentList.description}
              </p>
            )}
          </div>

          {/* Members Avatars preview */}
          <div 
            onClick={() => onOpenShareModal(currentList)}
            className="flex items-center space-x-2 cursor-pointer group bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 transition self-start sm:self-auto"
            title="點擊查看所有協作成員"
          >
            <div className="flex -space-x-2 overflow-hidden">
              {members.slice(0, 4).map((m, idx) => (
                <div key={m.uid || idx} className="inline-block ring-2 ring-white dark:ring-slate-900 rounded-full">
                  {m.photoURL ? (
                    <img src={m.photoURL} alt={m.displayName} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center">
                      {(m.displayName || m.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {members.length} 位協作者
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                完成進度 ({completedCount} / {totalCount})
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add Todo Input Component */}
      <AddTodoForm 
        onAddTodo={onAddTodo} 
        members={members} 
        currentUser={currentUser} 
      />

      {/* Controls: Search, Tabs & Sort */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-2xl w-fit">
          {[
            { id: 'all', label: '全部', count: totalCount },
            { id: 'pending', label: '進行中', count: totalCount - completedCount },
            { id: 'completed', label: '已完成', count: completedCount },
            { id: 'mine', label: '與我相關' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center space-x-2">
          {/* Search box */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋待辦事項..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none text-xs"
            >
              <option value="created">最新建立</option>
              <option value="priority">最高優先</option>
              <option value="dueDate">到期日</option>
            </select>
          </div>

          {/* Batch clear completed */}
          {completedCount > 0 && (
            <button
              onClick={() => {
                if (window.confirm(`確定要清除已完成的 ${completedCount} 個事項嗎？`)) {
                  onClearCompleted();
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
              title="清除所有已完成事項"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Todo Items List */}
      <div className="space-y-2.5">
        {filteredTodos.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <ListTodo className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {searchQuery ? '沒有找到符合搜尋的待辦事項' : '目前尚無待辦事項'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery ? '請嘗試更換關鍵字' : '在上方輸入框輸入任務並按 Enter，即可與團隊成員即時協作！'}
            </p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggleTodo}
              onUpdate={onUpdateTodo}
              onDelete={onDeleteTodo}
              members={members}
              currentUser={currentUser}
            />
          ))
        )}
      </div>

    </div>
  );
}
