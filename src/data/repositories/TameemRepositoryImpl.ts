// ==============================
// Data — TameemRepositoryImpl
// ==============================

import { Tameem, CreateTameemPayload, UpdateTameemPayload } from "../../domain/entities/Tameem";
import { ITameemRepository, PaginatedTameems } from "../../domain/repositories/ITameemRepository";

export const BASE_URL = "https://mms-backend-rose.vercel.app/api";

const MOCK_TAMEEMS: Tameem[] = [
  {
    id: 1,
    title: "توجيهات آلية فتح وإغلاق المسجد وصيانة المكيفات قبل صلاة الجمعة",
    content: "نود إحاطة جميع مدراء ومسؤولي المساجد بضرورة التأكد من تجهيز جميع أجهزة التكييف والإنارة ونظافة المصليات قبل صلاة الجمعة بساعتين على الأقل، والالتزام بأوقات الإغلاق النظامية.",
    target_role: "mosque_manager",
    created_at: "2026-05-15",
    is_read: false,
    priority: "high",
  },
  {
    id: 2,
    title: "تعميم بشأن تنظيم حملات التبرع المصرحة وتوثيق السجلات",
    content: "يمنع منعاً باتاً جمع التبرعات النقدية في صحن المسجد دون التنسيق مع الجمعيات المعتمدة وإدخال كافة العمليات عبر الموديل الرقمي الموحد للتبرعات.",
    target_role: "all",
    created_at: "2026-05-10",
    is_read: true,
    read_at: "2026-05-11",
    priority: "urgent",
  },
  {
    id: 3,
    title: "جدول الصيانة الدورية لمنظومة مكبرات الصوت وأجهزة الآذان",
    content: "يبدأ الفريق الفني اعتبارا من الأسبوع القادم زيارات التفقّد الدوري للمكبرات الصوتية، نرجو من مدراء المساجد تقديم التسهيلات وتوثيق أية ملاحظات في لوحة التحكم.",
    target_role: "mosque_manager",
    created_at: "2026-05-01",
    is_read: true,
    read_at: "2026-05-02",
    priority: "normal",
  },
];

export class TameemRepositoryImpl implements ITameemRepository {
  private getAuthHeaders(isFormData: boolean = false): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private formatTameem(item: any): Tameem {
    return {
      id: item.id,
      title: item.title || item.subject || 'تعميم إداري',
      content: item.content || item.description || item.body || '',
      target_role: item.target_role || item.role || 'all',
      mosque_id: item.mosque_id,
      mosque_name: item.mosque_name || item.mosque?.name,
      created_at: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      updated_at: item.updated_at,
      is_read: Boolean(item.is_read || item.read),
      read_at: item.read_at,
      priority: item.priority || 'normal',
      attachments: item.attachments || [],
    };
  }

  // ── 1. listTameems (GET /api/tameems) ──────────────────────────────
  async getTameems(page: number = 1, limit: number = 10): Promise<PaginatedTameems> {
    const urlsToTry = [
      `${BASE_URL}/tameems?page=${page}&per_page=${limit}&limit=${limit}`,
      `${BASE_URL}/tameems/my-tameems?page=${page}&per_page=${limit}`,
    ];

    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: this.getAuthHeaders(),
        });

        const json = await response.json().catch(() => null);
        console.log(`GET ${url} Response:`, json);

        if (response.ok && json && json.status !== false) {
          const items: any[] = Array.isArray(json)
            ? json
            : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

          const formatted = items.map(item => this.formatTameem(item));
          return {
            data: formatted,
            pagination: {
              currentPage: json.pagination?.currentPage || json.meta?.current_page || page,
              totalPages: json.pagination?.totalPages || json.meta?.last_page || Math.max(1, Math.ceil(formatted.length / limit)),
              totalItems: json.pagination?.totalItems || json.meta?.total || formatted.length,
              itemsPerPage: limit,
            },
          };
        }
      } catch (e) {
        console.warn(`Error fetching tameems from ${url}:`, e);
      }
    }

    // Fallback Mock
    return {
      data: MOCK_TAMEEMS,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: MOCK_TAMEEMS.length,
        itemsPerPage: limit,
      },
    };
  }

  // ── 2. getTameemById (GET /api/tameems/{id}) ────────────────────────
  async getTameemById(id: string | number): Promise<Tameem> {
    try {
      const response = await fetch(`${BASE_URL}/tameems/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log(`GET /api/tameems/${id} Response:`, json);

      if (response.ok && json && json.status !== false) {
        return this.formatTameem(json.data || json);
      }
    } catch (e) {
      console.warn(`Error fetching tameem #${id}:`, e);
    }

    const match = MOCK_TAMEEMS.find(t => String(t.id) === String(id));
    if (match) return match;
    throw new Error(`تعذر العثور على التعميم #${id}`);
  }

  // ── 3. storeTameem (POST /api/tameems) — Super Admin ────────────────
  async createTameem(payload: CreateTameemPayload): Promise<Tameem> {
    const recipients = (payload.recipient_ids && payload.recipient_ids.length > 0)
      ? payload.recipient_ids
      : [1, 2, 3];

    const bodyObj = {
      title: payload.title,
      content: payload.content,
      recipient_ids: recipients,
      target_role: payload.target_role || 'all',
      priority: payload.priority || 'normal',
      ...(payload.mosque_id ? { mosque_id: payload.mosque_id } : {}),
    };

    console.log("POST /api/tameems Payload:", bodyObj);

    const response = await fetch(`${BASE_URL}/tameems`, {
      method: "POST",
      headers: this.getAuthHeaders(false),
      body: JSON.stringify(bodyObj),
    });

    const json = await response.json().catch(() => null);
    console.log("POST /api/tameems Response:", json);

    if (response.ok && json && json.status !== false) {
      return this.formatTameem(json.data || json);
    }

    const errMsg = json?.message || (json?.errors ? Object.values(json.errors).flat().join(', ') : `فشل إضافة التعميم (HTTP ${response.status})`);
    throw new Error(errMsg);
  }

  // ── 4. updateTameem (PUT /api/tameems/{id}) — Super Admin ───────────
  async updateTameem(id: string | number, payload: UpdateTameemPayload): Promise<Tameem> {
    const bodyObj = {
      ...(payload.title ? { title: payload.title } : {}),
      ...(payload.content ? { content: payload.content } : {}),
      recipient_ids: (payload.recipient_ids && payload.recipient_ids.length > 0) ? payload.recipient_ids : [1, 2, 3],
    };

    const response = await fetch(`${BASE_URL}/tameems/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(false),
      body: JSON.stringify(bodyObj),
    });

    const json = await response.json().catch(() => null);
    console.log(`PUT /api/tameems/${id} Response:`, json);

    if (response.ok && json && json.status !== false) {
      return this.formatTameem(json.data || json);
    }

    const errMsg = json?.message || (json?.errors ? Object.values(json.errors).flat().join(', ') : `فشل تعديل التعميم #${id} (HTTP ${response.status})`);
    throw new Error(errMsg);
  }

  // ── 5. deleteTameem (DELETE /api/tameems/{id}) — Super Admin ────────
  async deleteTameem(id: string | number): Promise<void> {
    const response = await fetch(`${BASE_URL}/tameems/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(false),
    });

    const json = await response.json().catch(() => null);
    console.log(`DELETE /api/tameems/${id} Response:`, json);

    if (!response.ok && response.status !== 200 && response.status !== 204 && response.status !== 404) {
      throw new Error(json?.message || `فشل حذف التعميم #${id} من السيرفر (HTTP ${response.status})`);
    }
  }

  // ── 6. markTameemAsRead (PATCH /api/tameems/{id}/read) — Mosque Manager ─
  async markTameemAsRead(id: string | number): Promise<void> {
    const urlsToTry = [
      { url: `${BASE_URL}/tameems/${id}/read`, method: "PATCH" },
      { url: `${BASE_URL}/tameems/${id}/read`, method: "POST" },
      { url: `${BASE_URL}/tameems/${id}/mark-as-read`, method: "POST" },
    ];

    let success = false;
    let lastError: string | null = null;

    for (const item of urlsToTry) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: this.getAuthHeaders(false),
        });
        const json = await response.json().catch(() => null);
        console.log(`${item.method} ${item.url} Response:`, json);

        if (response.ok && json?.status !== false) {
          success = true;
          break;
        }
        if (json?.message) lastError = json.message;
      } catch (e: any) {
        console.warn(`Error marking tameem as read at ${item.url}:`, e);
        lastError = e.message;
      }
    }

    if (!success && lastError) {
      throw new Error(lastError);
    }
  }
}
