// ==============================
// Maintenance — EditMaintenanceModal Component
// نافذة تعديل طلب صيانة (maintenance.update)
// ==============================

import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, AlertTriangle, Zap, Droplets, Hammer, Sparkles, Wrench, Paperclip, FileText } from 'lucide-react';
import { MaintenanceRequestItem } from '../../../../domain/entities/Maintenance';

const CATEGORIES = [
  { id: 'electrical', label: 'أعطال كهربائية', icon: Zap },
  { id: 'plumbing', label: 'سباكة وتمديدات', icon: Droplets },
  { id: 'carpentry', label: 'نجارة وأثاث', icon: Hammer },
  { id: 'cleaning', label: 'نظافة وعناية', icon: Sparkles },
  { id: 'other', label: 'أخرى', icon: Wrench },
];

const PRIORITIES = [
  { id: 'low', label: 'منخفضة (Low)' },
  { id: 'medium', label: 'متوسطة (Medium)' },
  { id: 'high', label: 'عالية (High)' },
  { id: 'urgent', label: 'حرجة (Urgent)' },
];

interface EditMaintenanceModalProps {
  item: MaintenanceRequestItem | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (id: string | number, payload: any) => Promise<void>;
}

export function EditMaintenanceModal({
  item,
  isOpen,
  isSubmitting,
  onClose,
  onSave,
}: EditMaintenanceModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setDescription(item.description || '');
      setCategory(item.category || 'other');
      setPriority(item.priority || 'medium');
      setNotes(item.notes || '');
      setError(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('يرجى تحديد عنوان الطلب');
      return;
    }

    try {
      setError(null);
      await onSave(item.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        notes: notes.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ التعديلات');
    }
  };

  const mNumber = item.maintenance_number || `MR-${item.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden font-['Cairo'] text-right">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div>
            <h3 className="text-base font-black text-foreground">تعديل طلب الصيانة #{mNumber}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">تحديث البيانات وربط الـ PUT API</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">عنوان الطلب *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs font-bold outline-none text-foreground"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">التصنيف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">الأولوية</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 bg-muted/60 border border-border focus:border-primary rounded-xl text-xs font-bold outline-none text-foreground cursor-pointer"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">وصف المشكلة</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs font-medium outline-none text-foreground resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">ملاحظات الفني / الإدارة</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="إضافة أي ملاحظات..."
              className="w-full px-4 py-2.5 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs font-medium outline-none text-foreground"
            />
          </div>

          {/* Attached Files (read-only display) */}
          {item.files && item.files.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">
                <span className="flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5" /> الملفات المرفقة ({item.files.length})</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {item.files.map((file: any) => (
                  <a
                    key={file.id}
                    href={file.file_path}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-xl text-xs font-bold text-foreground hover:border-primary/50 hover:text-primary transition-all group"
                  >
                    <FileText className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="max-w-[140px] truncate">{file.file_name || `مرفق_${file.id}`}</span>
                  </a>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">لتغيير المرفقات أنشئ طلباً جديداً أو تواصل مع الإدارة.</p>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-muted text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
