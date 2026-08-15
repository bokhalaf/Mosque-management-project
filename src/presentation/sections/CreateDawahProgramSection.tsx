// ==============================
// Dawah Programs — CreateDawahProgramSection Component
// صفحة إضافة برنامج دعوي وجدولة الجلسات مطابقة للـ OpenAPI ونظام التصميم الموحد
// ==============================

import React, { useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  BookOpen, Mic, GraduationCap, Trophy, Layers,
  Calendar, Clock, User, Plus, Trash2, Info, Sparkles,
  CheckCircle2, ArrowRight, Loader2, Building2
} from "lucide-react";
import { useDawahPrograms } from "../hooks/useDawahPrograms";
import { useToast } from "../../app/components/ui/Toast";
import { DawahProgramType, DawahProgramLevel, DawahProgramStatus } from "../../domain/entities/DawahProgram";

interface CreateDawahProgramSectionProps {
  onBack: () => void;
}

interface ScheduleItemState {
  id: string;
  title: string;
  notes: string;
  date: string;
  start_time: string;
  end_time: string;
}

export function CreateDawahProgramSection({ onBack }: CreateDawahProgramSectionProps) {
  const { createProgram, myMosque, spaces } = useDawahPrograms();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Main Form Data
  const [formData, setFormData] = useState<{
    program_name: string;
    presenter: string;
    type: DawahProgramType;
    level: DawahProgramLevel;
    space_id: number;
    description: string;
    is_featured: boolean;
  }>({
    program_name: '',
    presenter: '',
    type: 'course',
    level: 'beginner',
    space_id: 1,
    description: '',
    is_featured: false,
  });

  // Automatically select the first space from API when loaded
  React.useEffect(() => {
    if (spaces && spaces.length > 0) {
      setFormData(prev => ({
        ...prev,
        space_id: prev.space_id && spaces.some(s => s.id === prev.space_id) ? prev.space_id : spaces[0].id,
      }));
    }
  }, [spaces]);

  // Schedules Array State (OpenAPI requires at least 1 schedule)
  const [schedules, setSchedules] = useState<ScheduleItemState[]>([
    {
      id: '1',
      title: 'الجلسة الافتتاحية',
      notes: 'المقدمة والتعريف بأهداف البرنامج ومحاوره',
      date: todayStr,
      start_time: '16:30',
      end_time: '18:00',
    },
  ]);

  // Add new schedule entry
  const handleAddSchedule = () => {
    const nextNum = schedules.length + 1;
    setSchedules(prev => [
      ...prev,
      {
        id: String(Date.now()),
        title: `الجلسة رقم ${nextNum}`,
        notes: '',
        date: todayStr,
        start_time: '16:30',
        end_time: '18:00',
      }
    ]);
  };

  // Remove a schedule entry
  const handleRemoveSchedule = (id: string) => {
    if (schedules.length === 1) {
      showToast('يجب وجود جلسة واحدة على الأقل في البرنامج', 'error');
      return;
    }
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // Update schedule field
  const handleUpdateSchedule = (id: string, field: keyof ScheduleItemState, value: string) => {
    setSchedules(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.program_name.trim()) {
      showToast('يرجى إدخال اسم البرنامج الدعوي', 'error');
      return;
    }
    if (!formData.presenter.trim()) {
      showToast('يرجى إدخال اسم المحاضر أو المقدم', 'error');
      return;
    }
    if (schedules.length === 0) {
      showToast('يرجى إضافة جلسة واحدة على الأقل في جدول المواعيد', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const payloadSchedules = schedules.map(s => ({
        title: s.title.trim() || undefined,
        notes: s.notes.trim() || undefined,
        date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
      }));

      await createProgram({
        program_name: formData.program_name.trim(),
        presenter: formData.presenter.trim(),
        type: formData.type,
        level: formData.level,
        status: 'active',
        space_id: Number(formData.space_id),
        description: formData.description.trim(),
        is_featured: formData.is_featured,
        schedules: payloadSchedules,
      });

      showToast('تم إنشاء ونشر البرنامج الدعوي بنجاح! 🕌', 'success');
      onBack();
    } catch (err: any) {
      console.error('Create Dawah Program failed:', err);
      showToast(err.message || 'حدث خطأ أثناء حفظ البرنامج الدعوي', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-16">
      {/* ── Page Header with Top Actions ── */}
      <PageHeader
        title="إضافة برنامج دعوي جديد"
        description="تسجيل وإطلاق نشاط دعوي أو دورة علمية أو محاضرة مع جدولة الجلسات والمواعيد."
        breadcrumbs={[
          { label: "الأنشطة والدعوة" },
          { label: "البرامج الدعوية" },
          { label: "إضافة برنامج", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ ونشر البرنامج</span>
                </>
              )}
            </button>
          </div>
        }
      />

      <form onSubmit={handleSubmit} className="px-4 md:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── MAIN COLUMN (2 Columns Wide) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Basic Information Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">البيانات الأساسية للبرنامج</h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* Program Name */}
                <div>
                  <label className="block font-bold text-foreground mb-1.5">اسم البرنامج أو النشاط الدعوي *</label>
                  <input
                    type="text"
                    required
                    value={formData.program_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, program_name: e.target.value }))}
                    placeholder="مثال: شرح الأربعين النووية، دورة التجويد والإتقان..."
                    className="w-full px-4 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Type & Level Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground mb-1.5">نوع النشاط *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as DawahProgramType }))}
                      className="w-full px-4 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground cursor-pointer"
                    >
                      <option value="course">دورة علمية منهجية</option>
                      <option value="lecture">محاضرة / درس إيماني</option>
                      <option value="competition">مسابقة وأنشطة حفظ</option>
                      <option value="other">نشاط دعوي آخر</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1.5">المستوى المستهدف *</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as DawahProgramLevel }))}
                      className="w-full px-4 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground cursor-pointer"
                    >
                      <option value="beginner">مبتدئ (عامة المصلين)</option>
                      <option value="intermediate">متوسط (طلاب العلم)</option>
                      <option value="advanced">متقدم (متخصص)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-foreground mb-1.5">وصف ومحاور البرنامج الدعوي (اختياري)</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="اكتب نبذة موجزة عن موضوع البرنامج، والمحاور التي سيتم تناولها، والمخرجات المتوقعة للمشاركين..."
                    className="w-full p-4 bg-muted border border-border focus:border-primary rounded-xl text-xs font-medium outline-none text-foreground placeholder:text-muted-foreground resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* 2. Presenter & Space Location Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <User className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">المحاضر ومكان الانعقاد بالمسجد</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground mb-1.5">اسم المحاضر / الشيخ المقدم *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.presenter}
                      onChange={(e) => setFormData(prev => ({ ...prev, presenter: e.target.value }))}
                      placeholder="مثال: الشيخ د. عبد العزيز الفهد"
                      className="w-full px-4 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    القاعة أو المصلى {myMosque?.name ? `(${myMosque.name})` : ''} *
                  </label>
                  <select
                    value={formData.space_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, space_id: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-muted border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground cursor-pointer"
                  >
                    {spaces && spaces.length > 0 ? (
                      spaces.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.capacity ? `(السعة: ${s.capacity} مصلٍ/شخص)` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={1}>المصلى الرئيسي للرجال</option>
                        <option value={2}>مكتبة المسجد وقاعة المحاضرات</option>
                        <option value={3}>مصلى النساء</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Schedules Builder Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-bold text-foreground">جدول الجلسات والمواعيد (Program Schedules)</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">حدد تاريخ ووقت انعقاد كل جلسة في البرنامج</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddSchedule}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة جلسة أخرى</span>
                </button>
              </div>

              {/* Schedule List */}
              <div className="space-y-4">
                {schedules.map((schedule, idx) => (
                  <div
                    key={schedule.id}
                    className="p-4 bg-muted/40 border border-border rounded-2xl space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={schedule.title}
                          onChange={(e) => handleUpdateSchedule(schedule.id, 'title', e.target.value)}
                          placeholder="عنوان الجلسة (مثال: الجلسة الأولى - المقدمة)"
                          className="bg-transparent border-b border-transparent focus:border-primary font-bold text-xs text-foreground outline-none px-1 py-0.5"
                        />
                      </div>

                      {schedules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSchedule(schedule.id)}
                          className="p-1 text-muted-foreground hover:text-red-500 rounded-lg transition-colors"
                          title="حذف هذه الجلسة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">تاريخ الجلسة *</label>
                        <input
                          type="date"
                          required
                          value={schedule.date}
                          onChange={(e) => handleUpdateSchedule(schedule.id, 'date', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">وقت البدء *</label>
                        <input
                          type="time"
                          required
                          value={schedule.start_time}
                          onChange={(e) => handleUpdateSchedule(schedule.id, 'start_time', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-muted-foreground mb-1">وقت الانتهاء *</label>
                        <input
                          type="time"
                          required
                          value={schedule.end_time}
                          onChange={(e) => handleUpdateSchedule(schedule.id, 'end_time', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={schedule.notes}
                        onChange={(e) => handleUpdateSchedule(schedule.id, 'notes', e.target.value)}
                        placeholder="ملاحظات أو تنبيهات للحضور بهذه الجلسة (اختياري)..."
                        className="w-full px-3 py-2 bg-background border border-border focus:border-primary rounded-xl text-[11px] outline-none text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddSchedule}
                className="w-full py-3 border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة جلسة أخرى للبرنامج الدعوي</span>
              </button>
            </div>

          </div>

          {/* ── SIDE COLUMN (1 Column Wide) ── */}
          <div className="space-y-6">

            {/* 1. Featured Program Toggle Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">تمييز البرنامج الدعوي</h3>
              </div>

              <div>
                <label className="flex items-start gap-3 cursor-pointer select-none p-3.5 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded-xl transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-border bg-background mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-xs text-foreground block">تعيين كبرنامج مميز (Featured ⭐)</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block leading-relaxed">
                      إبراز البرنامج في واجهة لوحة الإعلانات بالمسجد وفي صدارة الأنشطة للمصلين.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* 2. Guidelines & Instructions Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-sm border-b border-border pb-3">
                <Info className="w-5 h-5 shrink-0" />
                <h4>إرشادات إطلاق البرامج الدعوية</h4>
              </div>
              <ul className="text-xs text-muted-foreground space-y-3 list-disc list-inside leading-relaxed">
                <li>يرجى التأكد من عدم تعارض مواعيد الجلسات مع الصلوات المفروضة وأوقات الأذان.</li>
                <li>تحديد مكان الانعقاد (المصلى/القاعة) يضمن حجز القاعة وتجنب ازدواجية الأنشطة.</li>
                <li>يتم نشر البرنامج بحالة نشطة تلقائياً للمصلين فور الحفظ.</li>
              </ul>
            </div>

          </div>

        </div>

        {/* ── FORM FOOTER BUTTONS ── */}
        <div className="mt-8 pt-6 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="px-6 py-3 bg-card border border-border text-foreground hover:bg-muted rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحفظ والنشر...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ ونشر البرنامج الدعوي</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
