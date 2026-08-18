'use client';

import React, { useState } from 'react';
import { X, UserPlus, Send, RefreshCw, AlertCircle, Shield, GraduationCap } from 'lucide-react';
import { SendInvitationPayload } from '../../../../domain/entities/QuranPeople';

interface InviteStaffModalProps {
  onClose: () => void;
  onSendInvitation: (payload: SendInvitationPayload) => Promise<any>;
}

export function InviteStaffModal({ onClose, onSendInvitation }: InviteStaffModalProps) {
  const [form, setForm] = useState<{
    role: 'teacher' | 'halaqa_supervisor';
    name: string;
    email: string;
    phone: string;
    notes: string;
  }>({
    role: 'teacher',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('يرجى ملء جميع الحقول الإلزامية (الاسم، البريد الإلكتروني، ورقم الجوال)');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSendInvitation({
        mosque_id: 1,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        notes: form.notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل إرسال الدعوة عبر السيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-['Cairo'] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">إرسال دعوة انضمام</h2>
              <p className="text-xs text-muted-foreground">دعوة معلم قرآن أو مشرف حلقة عبر خادم السيرفر المباشر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-2">
              الصفة / الدور المطلوب دعوته <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  form.role === 'teacher'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={form.role === 'teacher'}
                  onChange={() => setForm({ ...form, role: 'teacher' })}
                  className="hidden"
                />
                <GraduationCap className="w-4 h-4" />
                <span className="text-xs font-bold">معلم ومقرئ قرآن</span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  form.role === 'halaqa_supervisor'
                    ? 'bg-purple-500/10 border-purple-500/40 text-purple-700 dark:text-purple-300'
                    : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="halaqa_supervisor"
                  checked={form.role === 'halaqa_supervisor'}
                  onChange={() => setForm({ ...form, role: 'halaqa_supervisor' })}
                  className="hidden"
                />
                <Shield className="w-4 h-4" />
                <span className="text-xs font-bold">مشرف حلقات</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              الاسم الكامل <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: الشيخ عبد الله بن سالم القرني"
              className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                البريد الإلكتروني <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="teacher@example.com"
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                رقم الجوال <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="05XXXXXXXX"
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              ملاحظات أو توصيات إضافية (اختياري)
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="مثال: ترشيح للإشراف على حلقة الإتقان المسائية"
              className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/30 outline-none resize-none"
            />
          </div>

          <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-2 -mx-5 -mb-5 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-sm"
            >
              {submitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>إرسال الدعوة بالسيرفر</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
