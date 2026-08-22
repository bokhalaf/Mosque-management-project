// ==============================
// Data — TameemRepositoryImpl
// ==============================

import { 
  Tameem, 
  TameemRecipient, 
  CreateTameemPayload, 
  CreateTameemForMosquePayload, 
  UpdateTameemPayload 
} from "../../domain/entities/Tameem";
import { ITameemRepository, PaginatedTameems } from "../../domain/repositories/ITameemRepository";

export const BASE_URL = "https://mms-backend-rose.vercel.app/api";

const MOCK_TAMEEMS: Tameem[] = [
  {
    id: 10,
    title: "تعميم بشأن مواعيد الصلاة وصيانة المكيفات",
    content: "يُعلم جميع أئمة ومسؤولي المساجد بضرورة التأكد من جاهزية المصليات وصيانة أجهزة التكييف والالتزام بالمواعيد الرسمية المعتمدة لصلاة الجمعة والجماعات.",
    sender_id: 2,
    sender_name: "مديرية شؤون المساجد",
    target_role: "mosque_manager",
    created_at: "2026-08-19",
    updated_at: "2026-08-19",
    is_read: false,
    priority: "high",
    recipients: [
      {
        id: 5,
        name: "الشيخ أحمد محمد",
        is_read: false,
        read_at: null,
      },
      {
        id: 6,
        name: "الشيخ خالد العمر",
        is_read: true,
        read_at: "2026-08-19T17:33:47.126Z",
      },
      {
        id: 7,
        name: "الأستاذ حسن المنصور",
        is_read: false,
        read_at: null,
      },
    ],
  },
  {
    id: 11,
    title: "تعميم بشأن تنظيم حملات التبرع المصرحة وتوثيق السجلات",
    content: "يمنع منعاً باتاً جمع التبرعات النقدية في صحن المسجد دون التنسيق مع الجمعيات المعتمدة وإدخال كافة العمليات عبر الموديل الرقمي الموحد للتبرعات.",
    sender_id: 2,
    sender_name: "الإدارة العامة للأوقاف",
    target_role: "all",
    created_at: "2026-08-15",
    updated_at: "2026-08-15",
    is_read: true,
    read_at: "2026-08-16T10:15:00.000Z",
    priority: "urgent",
    recipients: [
      {
        id: 5,
        name: "الشيخ أحمد محمد",
        is_read: true,
        read_at: "2026-08-16T10:15:00.000Z",
      },
    ],
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
    const recipientsRaw = Array.isArray(item.recipients) ? item.recipients : [];
    const recipients: TameemRecipient[] = recipientsRaw.map((r: any) => ({
      id: r.id ?? r.recipient_id ?? r.user_id,
      name: r.name || r.user?.name || `مستخدم #${r.id || r.user_id}`,
      email: r.email || r.user?.email,
      role: r.role || r.user?.role,
      is_read: Boolean(r.is_read || r.read || (r.read_at !== null && r.read_at !== undefined)),
      read_at: r.read_at || null,
    }));

    // Find current user id from localStorage
    let currentUserId: any = null;
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("auth_user");
        if (userStr) {
          const u = JSON.parse(userStr);
          currentUserId = u.id || u.user_id;
        }
      } catch (e) {}
    }

    // Determine is_read for the current user:
    // 1. Check if user is in recipients list and has is_read = true
    // 2. If top-level item.is_read is true or item.read_at exists
    // 3. If any recipient is read
    let isRead = false;
    let readAt: string | null = null;

    const userRecipient = currentUserId ? recipients.find(r => String(r.id) === String(currentUserId)) : null;
    if (userRecipient) {
      isRead = Boolean(userRecipient.is_read);
      readAt = userRecipient.read_at || null;
    } else if (item.is_read === true) {
      isRead = true;
      readAt = item.read_at || null;
    } else if (item.read_at) {
      isRead = true;
      readAt = item.read_at;
    } else if (recipients.length > 0) {
      // If any recipient is marked read
      const anyRead = recipients.find(r => r.is_read);
      if (anyRead) {
        isRead = true;
        readAt = anyRead.read_at || null;
      }
    }

    return {
      id: item.id,
      title: item.title || item.subject || 'تعميم إداري',
      content: item.content || item.description || item.body || '',
      sender_id: item.sender_id || item.user_id,
      sender_name: item.sender?.name || item.sender_name || (item.sender_id ? `الإدارة / المرسل #${item.sender_id}` : undefined),
      recipients,
      target_role: item.target_role || item.role || 'all',
      mosque_id: item.mosque_id,
      mosque_name: item.mosque_name || item.mosque?.name,
      created_at: item.created_at ? item.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      updated_at: item.updated_at ? item.updated_at.split('T')[0] : undefined,
      is_read: isRead,
      read_at: readAt,
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
              currentPage: json.pagination?.currentPage || json.pagination?.current_page || json.meta?.current_page || page,
              totalPages: json.pagination?.totalPages || json.pagination?.last_page || json.meta?.last_page || Math.max(1, Math.ceil(formatted.length / limit)),
              totalItems: json.pagination?.totalItems || json.pagination?.total || json.meta?.total || formatted.length,
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

  // ── 1b. getMyTameems (GET /api/tameems/my-tameems) ──────────────────
  // Returns all circulars received by the authenticated mosque manager (myTameems)
  async getMyTameems(page: number = 1, limit: number = 10): Promise<PaginatedTameems> {
    try {
      const response = await fetch(`${BASE_URL}/tameems/my-tameems?page=${page}&per_page=${limit}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log(`GET /api/tameems/my-tameems Response:`, json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

        const formatted = items.map(item => this.formatTameem(item));
        return {
          data: formatted,
          pagination: {
            currentPage: json.pagination?.current_page || json.pagination?.currentPage || page,
            totalPages: json.pagination?.last_page || json.pagination?.totalPages || Math.max(1, Math.ceil(formatted.length / limit)),
            totalItems: json.pagination?.total || json.pagination?.totalItems || formatted.length,
            itemsPerPage: limit,
          },
        };
      }

      if (response.status === 403 || response.status === 401) {
        // If the authenticated user is an Admin/Region Manager, the backend returns 403 for my-tameems.
        // Seamlessly fallback to GET /api/tameems (listTameems) which is the admin circulars endpoint.
        console.warn("User does not have mosque_manager role for my-tameems, falling back to GET /api/tameems for Admin");
        return await this.getTameems(page, limit);
      }
    } catch (e) {
      console.warn("Error fetching my-tameems, falling back to getTameems:", e);
      return await this.getTameems(page, limit);
    }
    return {
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: limit,
      },
    };
  }

  // ── 1c. getSentTameems (GET /api/tameems/sent) ─────────────────────
  // Returns all circulars sent by the authenticated mosque manager (sentTameems)
  async getSentTameems(page: number = 1, limit: number = 10): Promise<PaginatedTameems> {
    try {
      const response = await fetch(`${BASE_URL}/tameems/sent?page=${page}&per_page=${limit}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log(`GET /api/tameems/sent Response:`, json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

        const formatted = items.map(item => this.formatTameem(item));
        return {
          data: formatted,
          pagination: {
            currentPage: json.pagination?.current_page || json.pagination?.currentPage || page,
            totalPages: json.pagination?.last_page || json.pagination?.totalPages || Math.max(1, Math.ceil(formatted.length / limit)),
            totalItems: json.pagination?.total || json.pagination?.totalItems || formatted.length,
            itemsPerPage: limit,
          },
        };
      }

      if (response.status === 403 || response.status === 401) {
        // If the authenticated user is an Admin/Region Manager, fallback to GET /api/tameems
        console.warn("User does not have mosque_manager role for sent tameems, falling back to GET /api/tameems for Admin");
        return await this.getTameems(page, limit);
      }
    } catch (e) {
      console.warn("Error fetching sent tameems, falling back to getTameems:", e);
      return await this.getTameems(page, limit);
    }
    return {
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
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

      if (response.ok && json && json.status !== false && json.data) {
        return this.formatTameem(json.data || json);
      }
    } catch (e) {
      console.warn(`Error fetching tameem #${id}:`, e);
    }

    // Smart fallback: if direct lookup is forbidden or unavailable for non-admin, search within received and sent circulars
    try {
      const myResult = await this.getMyTameems(1, 100);
      const myMatch = myResult.data.find(t => String(t.id) === String(id));
      if (myMatch) return myMatch;

      const sentResult = await this.getSentTameems(1, 100);
      const sentMatch = sentResult.data.find(t => String(t.id) === String(id));
      if (sentMatch) return sentMatch;
    } catch (e) {
      console.warn("Fallback circular search note:", e);
    }

    const match = MOCK_TAMEEMS.find(t => String(t.id) === String(id));
    if (match) return match;
    throw new Error(`تعذر العثور على التعميم #${id}`);
  }

  // ── 3. storeTameem (POST /api/tameems) — Super Admin ────────────────
  async createTameem(payload: CreateTameemPayload): Promise<Tameem> {
    const bodyObj: any = {
      title: payload.title.trim(),
      content: payload.content.trim(),
    };

    if (payload.all_mosque_managers) {
      bodyObj.all_mosque_managers = true;
    } else if (payload.recipient_ids && payload.recipient_ids.length > 0) {
      bodyObj.recipient_ids = payload.recipient_ids;
    } else {
      bodyObj.all_mosque_managers = true;
    }

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
    const err: any = new Error(errMsg);
    err.serverResponse = json;
    throw err;
  }

  // ── 3b. storeTameemForMosque (POST /api/tameems/for-mosque) — Mosque Manager ──
  // The mosque is derived automatically from the authenticated manager (managedMosque); no mosque_id is required.
  // All IDs in recipient_ids must belong to users with role = halaqa_supervisor or teacher who belong to the same mosque as the sender.
  // Exactly one of recipient_ids or the "all" flags must be provided.
  async createTameemForMosque(payload: CreateTameemForMosquePayload): Promise<Tameem> {
    const bodyObj: any = {
      title: payload.title.trim(),
      content: payload.content.trim(),
    };

    // Exactly one of recipient_ids or one of the "all" flags must be provided
    if (payload.all_staff) {
      bodyObj.all_staff = true;
    } else if (payload.all_teachers) {
      bodyObj.all_teachers = true;
    } else if (payload.all_supervisors) {
      bodyObj.all_supervisors = true;
    } else if (payload.recipient_ids && payload.recipient_ids.length > 0) {
      bodyObj.recipient_ids = payload.recipient_ids;
    } else {
      bodyObj.all_staff = true;
    }

    console.log("POST /api/tameems/for-mosque Payload:", bodyObj);

    const response = await fetch(`${BASE_URL}/tameems/for-mosque`, {
      method: "POST",
      headers: this.getAuthHeaders(false),
      body: JSON.stringify(bodyObj),
    });

    const json = await response.json().catch(() => null);
    console.log("POST /api/tameems/for-mosque Response:", json);

    if (response.ok && json && json.status !== false) {
      return this.formatTameem(json.data || json);
    }

    const errMsg = json?.message || (json?.errors ? Object.values(json.errors).flat().join(', ') : `فشل إرسال التعميم للمسجد (HTTP ${response.status})`);
    const err: any = new Error(errMsg);
    err.serverResponse = json;
    throw err;
  }

  // ── 4. updateTameem (PUT /api/tameems/{id}) ─────────────────────────
  async updateTameem(id: string | number, payload: UpdateTameemPayload): Promise<Tameem> {
    const bodyObj: any = {};
    if (payload.title) bodyObj.title = payload.title.trim();
    if (payload.content) bodyObj.content = payload.content.trim();
    if (payload.recipient_ids && payload.recipient_ids.length > 0) {
      bodyObj.recipient_ids = payload.recipient_ids;
    }

    console.log(`PUT /api/tameems/${id} Payload:`, bodyObj);

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
    const err: any = new Error(errMsg);
    err.serverResponse = json;
    throw err;
  }

  // ── 5. deleteTameem (DELETE /api/tameems/{id}) ──────────────────────
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

  // ── 6. markTameemAsRead (PATCH /api/tameems/{id}/read) ──────────────
  // Marks the tameem as read for the authenticated mosque manager
  async markTameemAsRead(id: string | number): Promise<void> {
    const response = await fetch(`${BASE_URL}/tameems/${id}/read`, {
      method: "PATCH",
      headers: this.getAuthHeaders(false),
    });

    const json = await response.json().catch(() => null);
    console.log(`PATCH /api/tameems/${id}/read Response:`, json);

    if (response.ok && json?.status !== false) {
      return;
    }

    // Fallback try POST if PATCH failed
    const postRes = await fetch(`${BASE_URL}/tameems/${id}/read`, {
      method: "POST",
      headers: this.getAuthHeaders(false),
    });
    const postJson = await postRes.json().catch(() => null);
    if (postRes.ok && postJson?.status !== false) {
      return;
    }

    const errMsg = json?.message || postJson?.message || `فشل تعيين التعميم كمقروء (HTTP ${response.status})`;
    throw new Error(errMsg);
  }
}
