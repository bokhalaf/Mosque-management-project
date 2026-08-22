'use client';

// ==============================
// Presentation Component — InviteStaffModal
// نافذة إرسال دعوة انضمام (مع دعم دعوة مدير مسجد للسوبر أدمن واختيار المسجد)
// ==============================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, UserPlus, Send, RefreshCw, AlertCircle, Shield, GraduationCap, 
  Building2, Search, CheckCircle2, Info 
} from 'lucide-react';
import { SendInvitationPayload } from '../../../../domain/entities/QuranPeople';
import { MosqueRepositoryImpl } from '../../../../data/repositories/MosqueRepositoryImpl';

interface InviteStaffModalProps {
  onClose: () => void;
  onSendInvitation: (payload: SendInvitationPayload) => Promise<any>;
  isSuperAdmin?: boolean;
  initialMosqueId?: number | string;
  initialRole?: 'mosque_manager' | 'teacher' | 'halaqa_supervisor';
  mosquesList?: Array<{ id: number | string; name: string; city?: string; district?: string }>;
}

export function InviteStaffModal({ 
  onClose, 
  onSendInvitation,
  isSuperAdmin: propIsSuperAdmin,
  initialMosqueId,
  initialRole,
  mosquesList: propMosquesList,
}: InviteStaffModalProps) {
  // Determine if Super Admin (from prop or localStorage)
  const isSuperAdmin = useMemo(() => {
    if (typeof propIsSuperAdmin === 'boolean') return propIsSuperAdmin;
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          const u = JSON.parse(userStr);
          const roles = Array.isArray(u.roles) ? u.roles : (u.role ? [u.role] : []);
          return roles.includes('super_admin') || Boolean(u.is_super_admin);
        }
      } catch (e) {}
    }
    return false;
  }, [propIsSuperAdmin]);

  // Role State: Default to mosque_manager if Super Admin, otherwise teacher
  const [role, setRole] = useState<'mosque_manager' | 'teacher' | 'halaqa_supervisor'>(() => {
    if (initialRole) return initialRole;
    return isSuperAdmin ? 'mosque_manager' : 'teacher';
  });

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Mosque Selection State for Super Admin / Mosque Manager
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | number>(initialMosqueId || '');
  const [mosques, setMosques] = useState<Array<{ id: number | string; name: string; city?: string; district?: string }>>(propMosquesList || []);
  const [loadingMosques, setLoadingMosques] = useState<boolean>(false);
  const [mosqueSearch, setMosqueSearch] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch mosques if not provided and needed for Super Admin
  useEffect(() => {
    if (propMosquesList && propMosquesList.length > 0) {
      setMosques(propMosquesList);
      if (!selectedMosqueId && !initialMosqueId && propMosquesList[0]) {
        setSelectedMosqueId(propMosquesList[0].id);
      }
      return;
    }

    if (isSuperAdmin || role === 'mosque_manager') {
      const loadMosquesData = async () => {
        setLoadingMosques(true);
        try {
          const mosqueRepo = new MosqueRepositoryImpl();
          const res = await mosqueRepo.getMosques({ page: 1, limit: 100 });
          setMosques(res.data || []);
          if (!selectedMosqueId && res.data && res.data.length > 0 && !initialMosqueId) {
            setSelectedMosqueId(res.data[0].id);
          }
        } catch (e) {
          console.warn('Could not load mosques list:', e);
        } finally {
          setLoadingMosques(false);
        }
      };
      loadMosquesData();
    }
  }, [isSuperAdmin, role, propMosquesList, selectedMosqueId, initialMosqueId]);

  // Filtered Mosques for search
  const filteredMosques = useMemo(() => {
    if (!mosqueSearch.trim()) return mosques;
    const q = mosqueSearch.toLowerCase();
    return mosques.filter(m => 
      m.name.toLowerCase().includes(q) || 
      (m.city && m.city.toLowerCase().includes(q)) ||
      (m.district && m.district.toLowerCase().includes(q))
    );
  }, [mosques, mosqueSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني للمدعو');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('يرجى إدخال بريد إلكتروني صالح (مثال: user@example.com)');
      return;
    }

    // If Super Admin or Role is mosque_manager, mosque_id is required
    if ((isSuperAdmin || role === 'mosque_manager') && !selectedMosqueId) {
      setError('يرجى تحديد المسجد المستهدف لتعيين مدير المسجد / الكادر له');
      return;
    }

    setSubmitting(true);

    try {
      const payload: SendInvitationPayload = {
        email: email.trim(),
        role: role,
        ...(selectedMosqueId ? { mosque_id: Number(selectedMosqueId) } : {}),
        ...(name.trim() ? { name: name.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      };

      await onSendInvitation(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'فشل إرسال الدعوة عبر السيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-['Cairo'] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-foreground">إرسال دعوة انضمام</h2>
                {isSuperAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
                    مدير النطاق (سوبر أدمن)
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isSuperAdmin
                  ? 'دعوة مدير مسجد لربطه بالمسجد أو إضافة كادر إداري'
                  : 'دعوة معلم قرآن أو مشرف حلقة عبر خادم السيرفر المباشر'}
              </p>
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
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">تنبيه في الإرسال:</span>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="text-xs font-black text-foreground block mb-2">
              الصفة / الدور المطلوب دعوته <span className="text-rose-500">*</span>
            </label>
            <div className={`grid gap-2.5 ${isSuperAdmin ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
              
              {/* Option 1: Mosque Manager (Available for Super Admin) */}
              {isSuperAdmin && (
                <label
                  className={`flex flex-col gap-1.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                    role === 'mosque_manager'
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20 shadow-sm'
                      : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="mosque_manager"
                    checked={role === 'mosque_manager'}
                    onChange={() => setRole('mosque_manager')}
                    className="hidden"
                  />
                  <div className="flex items-center justify-between">
                    <Building2 className={`w-4 h-4 ${role === 'mosque_manager' ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                    {role === 'mosque_manager' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <span className="text-xs font-black text-foreground">مدير مسجد</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">إدارة شؤون المسجد والكوادر</span>
                </label>
              )}

              {/* Option 2: Halaqa Supervisor */}
              <label
                className={`flex flex-col gap-1.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  role === 'halaqa_supervisor'
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20 shadow-sm'
                    : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="halaqa_supervisor"
                  checked={role === 'halaqa_supervisor'}
                  onChange={() => setRole('halaqa_supervisor')}
                  className="hidden"
                />
                <div className="flex items-center justify-between">
                  <Shield className={`w-4 h-4 ${role === 'halaqa_supervisor' ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                  {role === 'halaqa_supervisor' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                </div>
                <span className="text-xs font-black text-foreground">مشرف حلقات</span>
                <span className="text-[10px] text-muted-foreground leading-tight">الإشراف ومتابعة الحلقات</span>
              </label>

              {/* Option 3: Teacher */}
              <label
                className={`flex flex-col gap-1.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  role === 'teacher'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={role === 'teacher'}
                  onChange={() => setRole('teacher')}
                  className="hidden"
                />
                <div className="flex items-center justify-between">
                  <GraduationCap className={`w-4 h-4 ${role === 'teacher' ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                  {role === 'teacher' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <span className="text-xs font-black text-foreground">معلم قرآن</span>
                <span className="text-[10px] text-muted-foreground leading-tight">تحفيظ وتدريس القرآن</span>
              </label>

            </div>
          </div>

          {/* Mosque Selection for Super Admin or when inviting a Mosque Manager */}
          {(isSuperAdmin || role === 'mosque_manager') && (
            <div className="space-y-1.5 p-3.5 bg-muted/20 border border-border/80 rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>تحديد المسجد المستهدف <span className="text-rose-500">*</span></span>
                </label>
                {loadingMosques && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    جاري جلب المساجد...
                  </span>
                )}
              </div>

              {mosques.length > 5 && (
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mosqueSearch}
                    onChange={(e) => setMosqueSearch(e.target.value)}
                    placeholder="ابحث بالاسم أو الحي..."
                    className="w-full pr-8 pl-3 py-1.5 bg-background border border-input rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}

              <select
                value={selectedMosqueId}
                onChange={(e) => setSelectedMosqueId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-background border border-input rounded-xl text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer"
              >
                <option value="" disabled>-- اختر المسجد --</option>
                {filteredMosques.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.city ? `(${m.city}${m.district ? ` - ${m.district}` : ''})` : ''} #{m.id}
                  </option>
                ))}
              </select>

              {role === 'mosque_manager' && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                  <Info className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>ملاحظة: يسمح بمدير مسجد واحد نشط أو معلق لكل مسجد.</span>
                </p>
              )}
            </div>
          )}

          {/* Email (Required) */}
          <div>
            <label className="text-xs font-black text-foreground block mb-1">
              البريد الإلكتروني للمدعو <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/30 outline-none font-mono text-left"
              dir="ltr"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              سيتم إرسال رابط الدعوة الرسمية لإنشاء الحساب إلى هذا البريد مباشرة.
            </p>
          </div>

          {/* Optional: Full Name and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                الاسم الكامل (اختياري)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: الشيخ عبد الله بن سالم"
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                رقم الجوال (اختياري)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/30 outline-none font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              ملاحظات أو توصيات إضافية (اختياري)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تعيين مديراً لمسجد الهدى - النطاق الشرقي"
              className="w-full px-3.5 py-2.5 bg-muted/30 border border-input rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/30 outline-none resize-none"
            />
          </div>

          {/* Action Footer */}
          <div className="p-4 border-t border-border bg-muted/10 flex items-center justify-between gap-2 -mx-5 -mb-5 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-black text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري إرسال الدعوة...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>إرسال الدعوة بالسيرفر</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
