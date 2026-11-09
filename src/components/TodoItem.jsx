import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Check, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  AlertCircle, 
  User, 
  X, 
  Save, 
  Flag 
} from 'lucide-react';

const PRIORITY_BADGES = {
  high: { label: '高優先', bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/60' },
  medium: { label: '中優先', bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/60' },
  low: { label: '低優先', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60' }
};

export default function TodoItem({ 
  todo, 
  onToggle, 
  onUpdate, 
  onDelete, 
  members = [], 
  currentUser 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title || '');
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState(todo.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || '');
  const [editAssignedToUid, setEditAssignedToUid] = useState(todo.assignedTo?.uid || '');

  const handleToggleCheck = (e) => {
    e.stopPropagation();
    if (!todo.completed) {
      // Trigger confetti celebration on completion
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899']
      });
    }
    onToggle(todo.id, todo.completed);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const selectedMember = members.find(m => m.uid === editAssignedToUid);
    await onUpdate(todo.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      priority: editPriority,
      dueDate: editDueDate || null,
      assignedTo: selectedMember ? {
        uid: selectedMember.uid,
        displayName: selectedMember.displayName || 'Anonymous',
        email: selectedMember.email || '',
        photoURL: selectedMember.photoURL || ''
      } : null
    });
    setIsEditing(false);
  };

  // Due date format & status
  let dueDateText = '';
  let isOverdue = false;
  let isToday = false;
  if (todo.dueDate) {
    const today = new Date().toISOString().split('T')[0];
    if (todo.dueDate === today) {
      dueDateText = '今天到期';
      isToday = true;
    } else if (todo.dueDate < today && !todo.completed) {
      dueDateText = `已逾期 (${todo.dueDate})`;
      isOverdue = true;
    } else {
      dueDateText = todo.dueDate;
    }
  }

  const priorityStyle = PRIORITY_BADGES[todo.priority] || PRIORITY_BADGES.medium;

  return (
    <div className={`
      group relative bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all duration-200
      ${todo.completed 
        ? 'border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 opacity-75' 
        : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md'}
    `}>
      {isEditing ? (
        /* Edit Mode Form */
        <form onSubmit={handleSaveEdit} className="space-y-3">
          <input
            type="text"
            required
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-sm font-semibold px-3 py-2 rounded-xl border border-indigo-400 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
            autoFocus
          />
          <textarea
            rows={2}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="備註說明..."
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none resize-none"
          />

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="low">低優先度</option>
              <option value="medium">中優先度</option>
              <option value="high">高優先度</option>
            </select>

            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            />

            {members.length > 0 && (
              <select
                value={editAssignedToUid}
                onChange={(e) => setEditAssignedToUid(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="">未指派</option>
                {members.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.displayName || m.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>儲存</span>
            </button>
          </div>
        </form>
      ) : (
        /* Normal View */
        <div className="flex items-start space-x-3.5">
          {/* Custom Checkbox */}
          <button
            type="button"
            onClick={handleToggleCheck}
            className={`
              mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all flex-shrink-0
              ${todo.completed 
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30' 
                : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800'}
            `}
            title={todo.completed ? '標記為未完成' : '標記為完成'}
          >
            {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {/* Title */}
              <h4 className={`text-sm font-semibold tracking-tight transition-all ${
                todo.completed 
                  ? 'line-through text-slate-400 dark:text-slate-500' 
                  : 'text-slate-800 dark:text-slate-100'
              }`}>
                {todo.title}
              </h4>

              {/* Priority Badge */}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityStyle.bg}`}>
                {priorityStyle.label}
              </span>

              {/* Due Date Badge */}
              {dueDateText && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center space-x-1 border ${
                  isOverdue 
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 font-semibold' 
                    : isToday 
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60'
                }`}>
                  <Calendar className="w-3 h-3" />
                  <span>{dueDateText}</span>
                </span>
              )}
            </div>

            {/* Description if present */}
            {todo.description && (
              <p className={`text-xs mt-1 leading-relaxed ${
                todo.completed ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'
              }`}>
                {todo.description}
              </p>
            )}

            {/* Collaboration Meta: Assignee + Creator/Completer */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5 pt-2 border-t border-slate-100/80 dark:border-slate-800/60 text-[11px] text-slate-400 dark:text-slate-500">
              
              {/* Assignee Badge */}
              {todo.assignedTo ? (
                <div className="flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-full text-slate-700 dark:text-slate-300 font-medium">
                  {todo.assignedTo.photoURL ? (
                    <img 
                      src={todo.assignedTo.photoURL} 
                      alt={todo.assignedTo.displayName} 
                      className="w-3.5 h-3.5 rounded-full object-cover" 
                    />
                  ) : (
                    <User className="w-3 h-3 text-indigo-500" />
                  )}
                  <span>指派給：{todo.assignedTo.displayName || todo.assignedTo.email?.split('@')[0]}</span>
                </div>
              ) : (
                <span className="text-slate-400 dark:text-slate-600">未指派</span>
              )}

              {/* Creator info */}
              {todo.createdBy && (
                <span>
                  由 <span className="font-medium text-slate-600 dark:text-slate-400">{todo.createdBy.displayName || '成員'}</span> 建立
                </span>
              )}

              {/* Completed info */}
              {todo.completed && todo.completedBy && (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ 由 {todo.completedBy.displayName || '成員'} 完成
                </span>
              )}
            </div>
          </div>

          {/* Action buttons (Edit & Delete) */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
              title="編輯待辦"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('確定要刪除這筆待辦事項嗎？')) {
                  onDelete(todo.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="刪除待辦"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
