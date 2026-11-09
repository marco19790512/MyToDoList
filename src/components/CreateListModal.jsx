import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

const COLOR_OPTIONS = [
  { id: 'indigo', label: '靛藍', bg: 'bg-indigo-500', ring: 'ring-indigo-500' },
  { id: 'violet', label: '紫色', bg: 'bg-violet-500', ring: 'ring-violet-500' },
  { id: 'emerald', label: '翠綠', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { id: 'rose', label: '玫瑰紅', bg: 'bg-rose-500', ring: 'ring-rose-500' },
  { id: 'amber', label: '琥珀黃', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { id: 'blue', label: '天藍', bg: 'bg-blue-500', ring: 'ring-blue-500' },
  { id: 'cyan', label: '青色', bg: 'bg-cyan-500', ring: 'ring-cyan-500' }
];

export default function CreateListModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        color: selectedColor
      });
      setName('');
      setDescription('');
      setSelectedColor('indigo');
      onClose();
    } catch (err) {
      console.error(err);
      alert('建立清單失敗：' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
              建立新的協作清單
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              清單名稱 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="例：Q4 產品研發、家庭採購清單、旅遊規劃"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              備註說明 (選填)
            </label>
            <textarea
              rows={2}
              placeholder="簡短描述這個清單的用途或合作對象..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              選擇主題顏色
            </label>
            <div className="flex items-center space-x-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all flex items-center justify-center ${
                    selectedColor === c.id ? `ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${c.ring}` : 'opacity-80 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition"
            >
              {isSubmitting ? '建立中...' : '建立清單'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
