// ==============================
// Domain Entity — MosqueOperation
// كائن عملية أو نشاط مسجدي مشتق من سجلات النظام (الشكاوى، الصيانة، التبرعات، الخطب، المساجد)
// ==============================

export type MosqueOperationModule = 'complaints' | 'maintenance' | 'donations' | 'sermons' | 'mosques' | 'general';

export interface MosqueOperation {
  id: number | string;
  module: MosqueOperationModule;
  action: string;
  title: string;
  description?: string;
  mosque_id?: number | string;
  mosque_name?: string;
  user_name?: string;
  user_role?: string;
  old_status?: string | null;
  new_status?: string | null;
  amount?: number;
  currency?: string;
  created_at: string;
}

export interface MosqueOperationsStats {
  total: number;
  complaints_count: number;
  maintenance_count: number;
  donations_count: number;
  sermons_count: number;
  mosques_count: number;
}
