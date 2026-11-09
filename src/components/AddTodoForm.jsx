import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Flag, 
  User, 
  ChevronDown, 
  ChevronUp, 
  AlignLeft,
  Sparkles
} from 'lucide-react';

const PRIORITIES = [
  { id: 'low', label: '低', color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
  { id: 'medium', label: '中', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60' },
  { id: 'high', label: '高', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60' }
];

export default function AddTodoForm({ onAddTodo, members = [], currentUser }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedToUid, setAssignedToUid] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const selectedMember = members.find(m => m.uid === assignedToUid);

      await onAddTodo({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        assignedTo: selectedMember ? {
          uid: selectedMember.uid,
          displayName: selectedMember.displayName || 'Anonymous',
          email: selectedMember.email || '',
          photoURL: selectedMember.photoURL || ''
        } : null
      });

      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedToUid('');
      setIsExpanded(false);
    } catch (err) {
      console.error(err);
      alert('新增失敗：' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-4 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
      <form onSubmit={handleSubmit}>
        {/* Main Title Input */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <input
            type="text"
            placeholder="新增待辦事項... (按 Enter 送出)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="flex-1 text-sm bg-transparent placeholder-slate-400 dark:placeholder-slate-500 text-slate-800 dark:text-slate-100 focus:outline-none font-medium"
          />
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isExpanded ? '收起選項' : '展開詳細選項'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expandable Options */}
        {isExpanded && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in duration-200">
            {/* Optional Description */}
            <div className="flex items-start space-x-2">
              <AlignLeft className="w-4 h-4 text-slate-400 mt-2 flex-shrink-0" />
              <textarea
                rows={2}
                placeholder="補充詳細備註或說明..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Quick Meta Controls (Priority, Due Date, Assignee) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              
              {/* Priority Picker */}
              <div className="flex items-center space-x-1.5 text-xs">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">優先度:</span>
                <div className="flex space-x-1">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition ${
                        priority === p.id 
                          ? `${p.color} ring-1 ring-inset ring-current shadow-xs` 
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date Picker */}
              <div className="flex items-center space-x-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Assignee Picker */}
              {members.length > 0 && (
                <div className="flex items-center space-x-1.5 text-xs">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={assignedToUid}
                    onChange={(e) => setAssignedToUid(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">指派成員 (無)</option>
                    {members.map((m) => (
                      <option key={m.uid} value={m.uid}>
                        {m.displayName || m.email} {m.uid === currentUser?.uid ? '(我)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Submit & Cancel footer */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                收起
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50 transition"
              >
                {isSubmitting ? '新增中...' : '確認新增'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
