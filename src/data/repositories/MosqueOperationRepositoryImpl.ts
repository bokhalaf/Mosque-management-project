import { MosqueOperation, MosqueOperationModule, MosqueOperationsStats } from "../../domain/entities/MosqueOperation";
import {
  IMosqueOperationRepository,
  GetMosqueOperationsParams,
  MosqueOperationsResult,
} from "../../domain/repositories/IMosqueOperationRepository";
import { BASE_URL, getAuthHeaders as getSharedAuthHeaders } from "../http/apiClient";

export class MosqueOperationRepositoryImpl implements IMosqueOperationRepository {

  private getAuthHeaders(): HeadersInit {
    return getSharedAuthHeaders();
  }

  async getMosqueOperations(params: GetMosqueOperationsParams): Promise<MosqueOperationsResult> {
    const { isSuperAdmin, page = 1, perPage = 15, module: selectedModule = 'all', dateFrom = '', dateTo = '' } = params;

    const queryParams = new URLSearchParams();

    if (page > 1) queryParams.append('page', String(page));
    if (perPage !== 15) queryParams.append('per_page', String(perPage));
    if (selectedModule && selectedModule !== 'all') {
      queryParams.append('module', selectedModule);
    }
    if (dateFrom && dateFrom.trim()) {
      queryParams.append('date_from', dateFrom.trim());
    }
    if (dateTo && dateTo.trim()) {
      queryParams.append('date_to', dateTo.trim());
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const endpoint = isSuperAdmin
      ? `${BASE_URL}/admin/mosque-operations${queryString}`
      : `${BASE_URL}/dashboard/mosque-manager/mosque-operations${queryString}`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json) {
      throw new Error(json?.message || 'فشل في استرداد سجل عمليات المساجد من السيرفر');
    }

    let rawItems: any[] = [];
    if (Array.isArray(json)) {
      rawItems = json;
    } else if (Array.isArray(json.data)) {
      rawItems = json.data;
    } else if (Array.isArray(json.data?.data)) {
      rawItems = json.data.data;
    } else if (Array.isArray(json.items)) {
      rawItems = json.items;
    } else if (Array.isArray(json.operations)) {
      rawItems = json.operations;
    }

    const formatted: MosqueOperation[] = rawItems.map((item: any, idx: number) => ({
      id: item.id || `op-${idx + 1}`,
      module: (item.module || item.type || 'general') as MosqueOperationModule,
      action: item.action || item.event || item.operation || 'تحديث سجل',
      title: item.title || item.name || item.description || 'عملية إدارية',
      description: item.description || item.note || item.notes || '',
      mosque_id: item.mosque_id || item.mosque?.id,
      mosque_name: item.mosque_name || item.mosque?.name || 'جامع المنطقة',
      user_name: item.user_name || item.user?.name || item.changed_by || 'مدير النظام',
      user_role: item.user_role || item.role || '',
      old_status: item.old_status,
      new_status: item.new_status,
      amount: item.amount ? Number(item.amount) : undefined,
      currency: item.currency || 'SYP',
      created_at: item.created_at || item.changed_at || item.date || new Date().toISOString(),
    }));

    // Pagination extraction
    const total = json.pagination?.total || json.data?.total || json.total || formatted.length;
    const last = json.pagination?.last_page || json.data?.last_page || json.last_page || 1;

    // Compute stats
    const stats: MosqueOperationsStats = {
      total,
      complaints_count: formatted.filter(o => o.module === 'complaints').length,
      maintenance_count: formatted.filter(o => o.module === 'maintenance').length,
      donations_count: formatted.filter(o => o.module === 'donations').length,
      sermons_count: formatted.filter(o => o.module === 'sermons').length,
      mosques_count: formatted.filter(o => o.module === 'mosques').length,
    };

    return {
      operations: formatted,
      stats,
      totalCount: total,
      lastPage: Math.max(1, last),
    };
  }
}
