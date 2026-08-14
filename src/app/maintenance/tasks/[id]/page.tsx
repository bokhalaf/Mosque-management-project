"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MaintenanceTaskDetailsSection } from "../../../../presentation/sections/maintenance";
import { EditMaintenanceModal } from "../../../../presentation/sections/maintenance/components/EditMaintenanceModal";
import { MaintenanceRepositoryImpl } from "../../../../data/repositories/MaintenanceRepositoryImpl";
import { MaintenanceRequestItem } from "../../../../domain/entities/Maintenance";
import { useToast } from "../../../components/ui/Toast";

const maintenanceRepo = new MaintenanceRepositoryImpl();

export default function MaintenanceTaskDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();

  const [editingItem, setEditingItem] = useState<MaintenanceRequestItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (item: MaintenanceRequestItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = async (id: string | number, payload: any) => {
    setIsSubmitting(true);
    try {
      await maintenanceRepo.updateMaintenanceRequest(id, payload);
      setEditingItem(null);
      showToast("تم تعديل طلب الصيانة بنجاح ✏️", "success");
      // Refresh details data cleanly without full browser page reload
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء حفظ التعديلات", "error");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await maintenanceRepo.deleteMaintenanceRequest(deletingId);
      setDeletingId(null);
      showToast("تم حذف طلب الصيانة بنجاح ✨", "success");
      router.push("/maintenance/tasks");
    } catch (err: any) {
      showToast(err.message || "حدث خطأ أثناء حذف الطلب", "error");
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <>
      <MaintenanceTaskDetailsSection
        taskId={id}
        onBack={() => router.push("/maintenance/tasks")}
        onEdit={handleEdit}
        onDelete={(taskId) => setDeletingId(taskId)}
        refreshKey={refreshKey}
      />


      {/* Edit Modal */}
      <EditMaintenanceModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        isSubmitting={isSubmitting}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 text-right space-y-4 font-['Cairo']">
            <h3 className="text-base font-black text-foreground">تأكيد حذف طلب الصيانة</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              هل أنت متأكد من رغبتك في حذف هذا الطلب؟ لا يمكن التراجع عن هذه العملية بعد التأكيد.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-muted text-foreground font-bold text-xs rounded-xl hover:bg-muted/80 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white font-bold text-xs rounded-xl hover:bg-red-600 transition-colors shadow-md disabled:opacity-50"
              >
                {isDeleting && (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                <span>نعم، حذف الطلب</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
