'use client';

import React from 'react';
import {
  Calendar, Clock, Trash2, Edit, User, Sparkles, MapPin, Mic, GraduationCap, Trophy, Layers
} from 'lucide-react';
import { DawahProgram, MosqueSpace } from '../../../../domain/entities/DawahProgram';

interface DawahProgramCardProps {
  program: DawahProgram;
  spaces: MosqueSpace[];
  onOpenSchedules: (program: DawahProgram) => void;
  onOpenEdit: (program: DawahProgram) => void;
  onDelete: (id: number | string) => void;
  deletingId: number | string | null;
}

export function DawahProgramCard({
  program,
  spaces,
  onOpenSchedules,
  onOpenEdit,
  onDelete,
  deletingId,
}: DawahProgramCardProps) {
  const spaceObj = spaces.find((s) => Number(s.id) === Number(program.space_id));
  const spaceName = spaceObj?.name || 'المصلى الرئيسي للرجال';

  // Gray / Neutral badge for program type
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'course':
        return { label: 'دورة علمية', icon: GraduationCap };
      case 'competition':
      case 'compition':
        return { label: 'مسابقة دعوية', icon: Trophy };
      case 'lecture':
        return { label: 'محاضرة / درس', icon: Mic };
      default:
        return { label: 'نشاط دعوي', icon: Layers };
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'advanced':
        return 'مستوى متقدم';
      case 'intermediate':
        return 'مستوى متوسط';
      case 'beginner':
      default:
        return 'مستوى عام / مبتدئ';
    }
  };

  const typeInfo = getTypeBadge(program.type);
  const TypeIcon = typeInfo.icon;
  const isDeleting = deletingId === program.id;

  const schedulesCount = program.schedules?.length || 0;

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden font-['Cairo']">
      {/* Featured ribbon in distinctive green */}
      {program.is_featured && (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black px-3 py-0.5 rounded-br-xl flex items-center gap-1 shadow-sm shadow-emerald-600/30">
          <Sparkles className="w-3 h-3 text-emerald-200" />
          <span>مميز</span>
        </div>
      )}

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <TypeIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{typeInfo.label}</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-muted/60 text-muted-foreground border border-border/60">
              {getLevelBadge(program.level)}
            </span>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              program.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {program.status === 'active' ? 'نشط' : 'متوقف'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {program.program_name}
        </h3>

        {/* Description */}
        {program.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3.5 leading-relaxed">
            {program.description}
          </p>
        )}

        {/* Details grid */}
        <div className="bg-muted/40 rounded-xl p-3 mb-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <User className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground">المحاضر:</span>
            <span className="font-bold truncate">{program.presenter}</span>
          </div>

          <div className="flex items-center gap-2 text-foreground font-medium">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground">المكان:</span>
            <span className="truncate">{spaceName}</span>
          </div>

          <div className="flex items-center gap-2 text-foreground font-medium">
            <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground">الجلسات المجدولة:</span>
            <span className="font-bold text-primary">{schedulesCount} جلسة</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions (with Gray 'إدارة الجلسات' Button) */}
      <div className="border-t border-border/60 pt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenSchedules(program)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-muted/80 hover:bg-muted text-foreground border border-border rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span>إدارة الجلسات ({schedulesCount})</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenEdit(program)}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all border border-transparent hover:border-border"
            title="تعديل البرنامج"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(program.id)}
            disabled={isDeleting}
            className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
            title="حذف البرنامج"
          >
            <Trash2 className={`w-4 h-4 ${isDeleting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
