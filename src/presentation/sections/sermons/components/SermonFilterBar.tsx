// ==============================
// Sermons — SermonFilterBar Component
// شريط البحث + filter pills للتصنيفات (مع دعم تصنيف غير ذلك وبحث الـ API)
// ==============================

import React from 'react';
import { BookOpen, Search } from 'lucide-react';

interface Category {
  id: string;
  label: string;
}

const categoriesList: Category[] = [
  { id: 'all', label: 'جميع الخطب' },
  { id: 'creed_faith', label: 'عقيدة وإيمانيات' },
  { id: 'jurisprudence_rulings', label: 'فقه وأحكام' },
  { id: 'ethics_conduct', label: 'أخلاق وسلوك' },
  { id: 'contemporary_issues', label: 'قضايا معاصرة' },
  { id: 'occasions_seasons', label: 'مناسبات ومواسم' },
  { id: 'other', label: 'غير ذلك' },
];

interface SermonFilterBarProps {
  searchQuery: string;
  selectedCategory: string;
  onSetSearchQuery: (v: string) => void;
  onSetCategory: (v: string) => void;
}

export function SermonFilterBar({
  searchQuery,
  selectedCategory,
  onSetSearchQuery,
  onSetCategory,
}: SermonFilterBarProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4 font-['Cairo']">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-base font-black text-foreground">مكتبة الخطب</h3>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSetSearchQuery(e.target.value)}
            placeholder="ابحث في مكتبة الخطب أو اسم الخطيب..."
            className="w-full pl-4 pr-10 py-2.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
        {categoriesList.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSetCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
