'use client';

// ==============================
// Presentation Component — TaskQuickAddBar
// ==============================

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { MosqueTaskCategory } from '../../../../domain/entities/MosqueTask';

interface TaskQuickAddBarProps {
  onAdd: (payload: { title: string; category: MosqueTaskCategory; time: string }) => Promise<void>;
}

export function TaskQuickAddBar({ onAdd }: TaskQuickAddBarProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MosqueTaskCategory>('prayer_worship');
  const [time, setTime] = useState('10:00');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onAdd({ title: title.trim(), category, time });
      setTitle('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3 font-['Cairo']"
    >
      <div className="flex-1 w-full">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="إضافة مهمة سريعة لليوم (مثال: تفقد التكييف، تجهيز مكبرات الصوت...)"
          className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/70"
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
        <select
          value={category}
          onChange={(e: any) => setCategory(e.target.value)}
          className="px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all"
        >
          <option value="prayer_worship">صلاة وعبادة</option>
          <option value="cleaning">نظافة</option>
          <option value="maintenance">صيانة</option>
          <option value="activity">فعالية</option>
          <option value="administrative">إداري</option>
        </select>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="px-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary transition-all"
        />

        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{loading ? 'إضافة...' : 'إضافة'}</span>
        </button>
      </div>
    </form>
  );
}
