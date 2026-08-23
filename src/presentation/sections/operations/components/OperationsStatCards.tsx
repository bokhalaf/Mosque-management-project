'use client';

// ==============================
// Component — OperationsStatCards
// بطاقات الإحصائيات السريعة للعمليات (مطابقة لبطاقات الداشبورد والتبرعات)
// ==============================

import React from 'react';
import { Activity, MessageSquareWarning, Wrench, DollarSign, BookOpen, Building2 } from 'lucide-react';
import { MosqueOperationsStats } from '../../../../domain/entities/MosqueOperation';

interface OperationsStatCardsProps {
  stats: MosqueOperationsStats;
  loading: boolean;
  selectedModule: string;
  onSelectModule: (module: string) => void;
}

export function OperationsStatCards({
  stats,
  loading,
  selectedModule,
  onSelectModule,
}: OperationsStatCardsProps) {
  const cards = [
    {
      id: 'all',
      title: 'إجمالي العمليات',
      value: stats.total,
      icon: Activity,
      color: 'text-primary bg-primary/10 border-primary/20 hover:border-primary/40',
      activeBorder: 'border-primary ring-2 ring-primary/20',
      desc: 'سجل الأنشطة الموحد',
    },
    {
      id: 'donations',
      title: 'حركات التبرع',
      value: stats.donations_count,
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20',
      desc: 'تسجيل التبرعات والحملات',
    },
    {
      id: 'maintenance',
      title: 'عمليات الصيانة',
      value: stats.maintenance_count,
      icon: Wrench,
      color: 'text-amber-600 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20',
      desc: 'تحديثات ومعالجة الأعطال',
    },
    {
      id: 'complaints',
      title: 'تغييرات الشكاوى',
      value: stats.complaints_count,
      icon: MessageSquareWarning,
      color: 'text-rose-600 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/20',
      desc: 'متابعة البلاغات والتصعيد',
    },
    {
      id: 'sermons',
      title: 'اعتمادات الخطب',
      value: stats.sermons_count,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20',
      desc: 'قرارات ومراجعات الخطباء',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedModule === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectModule(card.id)}
            disabled={loading}
            className={`p-5 rounded-3xl bg-card border text-right transition-all duration-300 shadow-2xs group relative overflow-hidden ${
              isSelected ? card.activeBorder : 'border-border/80 hover:border-border hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${card.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              {isSelected && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  نشط
                </span>
              )}
            </div>

            <p className="text-xs font-bold text-muted-foreground">{card.title}</p>
            <h3 className="text-2xl font-black text-foreground mt-1 tracking-tight">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-muted animate-pulse rounded-lg" />
              ) : (
                card.value.toLocaleString('ar-SA')
              )}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">{card.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
