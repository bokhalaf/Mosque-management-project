// ==============================
// Presentation — Hook
// useMaintenanceTaskActions: تعديل/حذف طلب صيانة عبر usecases (بدون قراءة/عرض بيانات)
// مخصص للاستخدام من صفحة تفاصيل الصيانة بدل استدعاء الـ repository مباشرة.
// ==============================

import { useMemo } from 'react';
import { getMaintenanceRepository } from '../../data/factories/repositoryFactory';
import { UpdateMaintenanceRequestUseCase } from '../../domain/usecases/maintenance/UpdateMaintenanceRequestUseCase';
import { DeleteMaintenanceRequestUseCase } from '../../domain/usecases/maintenance/DeleteMaintenanceRequestUseCase';
import { CreateMaintenancePayload, MaintenanceRequestItem } from '../../domain/entities/Maintenance';

export function useMaintenanceTaskActions() {
  const repository = useMemo(() => getMaintenanceRepository(), []);
  const updateUseCase = useMemo(() => new UpdateMaintenanceRequestUseCase(repository), [repository]);
  const deleteUseCase = useMemo(() => new DeleteMaintenanceRequestUseCase(repository), [repository]);

  const updateMaintenanceRequest = (
    id: string | number,
    payload: Partial<CreateMaintenancePayload> & { status?: string }
  ): Promise<MaintenanceRequestItem> => updateUseCase.execute(id, payload);

  const deleteMaintenanceRequest = (id: string | number): Promise<void> => deleteUseCase.execute(id);

  return { updateMaintenanceRequest, deleteMaintenanceRequest };
}
