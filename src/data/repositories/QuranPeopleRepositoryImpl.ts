// ==============================
// Data — QuranPeopleRepositoryImpl
// ==============================

import { QuranPerson, SendInvitationPayload, QuranPeopleStats } from "../../domain/entities/QuranPeople";
import { IQuranPeopleRepository } from "../../domain/repositories/IQuranPeopleRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";

export class QuranPeopleRepositoryImpl implements IQuranPeopleRepository {
  public lastUsersRawResponse: any = null;
  public lastDashboardRawResponse: any = null;

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? (localStorage.getItem("auth_token") || localStorage.getItem("token")) : null;
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // ── 1. getPeople (GET /api/users ONLY - Swagger listUsers with Pagination) ────
  async getPeople(params?: { role?: string; status?: string; q?: string; page?: number; per_page?: number }): Promise<{ data: QuranPerson[]; pagination: { currentPage: number; lastPage: number; total: number; perPage: number } }> {
    this.lastUsersRawResponse = null;
    const apiPeople: QuranPerson[] = [];
    let paginationMeta = {
      currentPage: params?.page || 1,
      lastPage: 1,
      total: 0,
      perPage: params?.per_page || 5,
    };

    try {
      const url = new URL(`${BASE_URL}/users`);

      if (params?.q && params.q.trim()) {
        url.searchParams.append('search', params.q.trim());
      }
      if (params?.status && params.status !== 'all') {
        url.searchParams.append('status', params.status);
      }
      if (params?.role && params.role !== 'all') {
        url.searchParams.append('role', params.role);
      }
      if (params?.page) {
        url.searchParams.append('page', String(params.page));
      }
      if (params?.per_page) {
        url.searchParams.append('per_page', String(params.per_page));
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getAuthHeaders(),
      }).catch(() => null);

      if (response) {
        const json = await response.json().catch(() => null);
        this.lastUsersRawResponse = json;

        if (response.ok && json) {
          const items = Array.isArray(json) ? json : (json.data || []);
          const perPage = params?.per_page || 5;
          const page = params?.page || 1;

          let paginatedItems = items;

          if (json.pagination) {
            paginationMeta = {
              currentPage: Number(json.pagination.current_page || page),
              lastPage: Number(json.pagination.last_page || Math.ceil((json.pagination.total || items.length) / perPage) || 1),
              total: Number(json.pagination.total || items.length),
              perPage: Number(json.pagination.per_page || perPage),
            };

            if (items.length > perPage) {
              const start = (page - 1) * perPage;
              paginatedItems = items.slice(start, start + perPage);
            }
          } else {
            const total = items.length;
            const lastPage = Math.max(1, Math.ceil(total / perPage));
            const start = (page - 1) * perPage;
            paginatedItems = items.slice(start, start + perPage);

            paginationMeta = {
              currentPage: page,
              lastPage,
              total,
              perPage,
            };
          }

          if (Array.isArray(paginatedItems)) {
            paginatedItems.forEach((usr: any) => {
              const primaryRole = Array.isArray(usr.roles) && usr.roles.length > 0
                ? usr.roles[0]
                : (usr.role || 'student');

              apiPeople.push({
                id: usr.id,
                name: usr.name || `${usr.first_name || ''} ${usr.last_name || ''}`.trim() || 'مستخدم',
                email: usr.email || '',
                phone: usr.phone || '',
                role: primaryRole as any,
                circle_name: usr.circle_name || (primaryRole === 'teacher' ? 'حلقة القرآن والتعليم' : primaryRole === 'halaqa_supervisor' ? 'إشراف المجمع' : 'حلقة القرآن'),
                status: usr.status || 'active',
                joined_date: usr.created_at?.split(' ')[0] || usr.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                mosque_id: usr.mosque_id,
              });
            });
          }
        }
      }
    } catch (e) {
      console.warn("API listUsers (/api/users) error:", e);
    }

    return {
      data: apiPeople,
      pagination: paginationMeta,
    };
  }

  // ── 2. getStats (GET /api/dashboard/mosque-manager/statistics) ──────
  async getStats(): Promise<QuranPeopleStats> {
    this.lastDashboardRawResponse = null;

    try {
      const response = await fetch(`${BASE_URL}/dashboard/mosque-manager/statistics`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      }).catch(() => null);

      if (response) {
        const json = await response.json().catch(() => null);
        this.lastDashboardRawResponse = json;

        if (response.ok && json) {
          const dataObj = json.data || json;
          const kpi = dataObj.kpi_cards || dataObj.cards || dataObj;

          let total_students = Number(kpi.total_students ?? kpi.students_count ?? 0);
          let total_teachers = Number(kpi.total_teachers ?? kpi.teachers_count ?? 0);
          let total_volunteers = Number(kpi.total_volunteers ?? kpi.volunteers_count ?? kpi.volunteers ?? 0);
          let pending_invitations = Number(kpi.pending_invitations ?? kpi.pending_invitations_count ?? 0);
          let total_supervisors = Number(kpi.total_supervisors ?? kpi.total_halaqas ?? 0);

          // If counts are 0, populate from /api/users & /api/invitations
          if (!total_students && !total_teachers) {
            const [usersRes, invRes] = await Promise.all([
              fetch(`${BASE_URL}/users`, { method: "GET", headers: this.getAuthHeaders() }).catch(() => null),
              fetch(`${BASE_URL}/invitations?status=pending`, { method: "GET", headers: this.getAuthHeaders() }).catch(() => null),
            ]);

            if (usersRes && usersRes.ok) {
              const usersJson = await usersRes.json().catch(() => null);
              const items: any[] = Array.isArray(usersJson) ? usersJson : (usersJson.data || []);
              items.forEach((u: any) => {
                const roles: string[] = Array.isArray(u.roles) ? u.roles : [u.role || 'student'];
                if (roles.includes('student')) total_students++;
                if (roles.includes('teacher')) total_teachers++;
                if (roles.includes('volunteer')) total_volunteers++;
                if (roles.includes('halaqa_supervisor') || roles.includes('mosque_manager')) total_supervisors++;
                if (u.status === 'pending_invitation' || u.status === 'pending') pending_invitations++;
              });
            }

            if (invRes && invRes.ok) {
              const invJson = await invRes.json().catch(() => null);
              const invItems = Array.isArray(invJson) ? invJson : (invJson.data || []);
              if (Array.isArray(invItems) && invItems.length > 0) {
                pending_invitations = invItems.length;
              }
            }
          }

          return {
            total_students,
            total_teachers,
            total_supervisors,
            total_volunteers,
            pending_invitations,
          };
        }
      }
    } catch (e) {
      console.warn("getStats API fetch error:", e);
    }

    return {
      total_students: 0,
      total_teachers: 0,
      total_supervisors: 0,
      total_volunteers: 0,
      pending_invitations: 0,
    };
  }

  private extractErrorMessage(json: any, fallback: string): string {
    if (!json) return fallback;

    if (json.data && typeof json.data === "object" && !Array.isArray(json.data)) {
      const details: string[] = [];
      Object.values(json.data).forEach((val: any) => {
        if (Array.isArray(val)) {
          details.push(...val);
        } else if (typeof val === "string") {
          details.push(val);
        }
      });
      if (details.length > 0) {
        return details.join(" — ");
      }
    }

    if (json.message && json.message !== "Validation error.") {
      return json.message;
    }

    return json.message || fallback;
  }

  // ── 3. sendInvitation ─────────────────────────────────────────────────
  async sendInvitation(payload: SendInvitationPayload): Promise<{ success: boolean; message: string; invitation?: any }> {
    const url = `${BASE_URL}/invitations/send`;
    try {
      const body: Record<string, any> = {
        email: payload.email,
        role: payload.role,
      };
      if (payload.mosque_id !== undefined && payload.mosque_id !== null && payload.mosque_id !== '') {
        body.mosque_id = Number(payload.mosque_id);
      }
      if (payload.name) body.name = payload.name;
      if (payload.phone) body.phone = payload.phone;
      if (payload.notes) body.notes = payload.notes;

      const response = await fetch(url, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const json = await response.json().catch(() => null);

      if (response.ok && json && json.status !== false) {
        return {
          success: true,
          message: json.message || "تم إرسال دعوة الانضمام بنجاح",
          invitation: json.data || json,
        };
      } else {
        return {
          success: false,
          message: this.extractErrorMessage(json, "تعذر إرسال الدعوة من السيرفر"),
        };
      }
    } catch (e: any) {
      return {
        success: false,
        message: e.message || "حدث خطأ غير متوقع أثناء إرسال الدعوة",
      };
    }
  }

  // ── 4. resendInvitation ───────────────────────────────────────────────
  async resendInvitation(id: string | number): Promise<void> {
    await this.resendInvitationApi(id);
  }

  // ── 4.1 getInvitations (GET /api/invitations) ──────────────────────────
  async getInvitations(status?: string): Promise<{ data: any[]; rawResponse?: any }> {
    try {
      const url = new URL(`${BASE_URL}/invitations`);
      if (status && status !== 'all') {
        url.searchParams.append('status', status);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getAuthHeaders(),
      }).catch(() => null);

      if (response) {
        const json = await response.json().catch(() => null);
        if (response.ok && json) {
          const items = Array.isArray(json) ? json : (json.data || []);
          return { data: items, rawResponse: json };
        }
      }
    } catch (e) {
      console.warn("API listInvitations error:", e);
    }
    return { data: [], rawResponse: null };
  }

  // ── 4.2 resendInvitationApi (POST /api/invitations/{id}/resend) ───────
  async resendInvitationApi(invitationId: string | number): Promise<{ success: boolean; message: string; rawResponse?: any }> {
    const url = `${BASE_URL}/invitations/${invitationId}/resend`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      if (response.ok && json && json.status !== false) {
        return {
          success: true,
          message: json.message || "تمت إعادة إرسال الدعوة بنجاح وتمديد صلاحيتها.",
          rawResponse: json,
        };
      } else {
        const errorMsg = this.extractErrorMessage(json, "تعذر إعادة إرسال الدعوة (قد تكون مقبولة بالفعل أو غير مسموح بإعادة إرسالها)");
        return {
          success: false,
          message: errorMsg,
          rawResponse: json,
        };
      }
    } catch (e: any) {
      return {
        success: false,
        message: e.message || "حدث خطأ أثناء إعادة إرسال الدعوة",
      };
    }
  }

  // ── 4.3 deleteInvitationApi (DELETE /api/invitations/{id}) ────────
  async deleteInvitationApi(invitationId: string | number): Promise<{ success: boolean; message: string; rawResponse?: any }> {
    const url = `${BASE_URL}/invitations/${invitationId}`;
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      if (response.ok && json && json.status !== false) {
        return {
          success: true,
          message: json.message || "تم إلغاء وحذف الدعوة بنجاح.",
          rawResponse: json,
        };
      } else {
        const errorMsg = this.extractErrorMessage(json, "تعذر إلغاء الدعوة (لا يمكن إلغاء دعوة تم قبولها أو دعوة لم تقم بإنشائها)");
        return {
          success: false,
          message: errorMsg,
          rawResponse: json,
        };
      }
    } catch (e: any) {
      return {
        success: false,
        message: e.message || "حدث خطأ أثناء إلغاء الدعوة",
      };
    }
  }

  // ── 5. updatePersonStatus ─────────────────────────────────────────────
  async updatePersonStatus(id: string | number, status: 'active' | 'pending_invitation' | 'inactive'): Promise<boolean> {
    const res = await this.changeUserStatus(id, status === 'pending_invitation' ? 'inactive' : status);
    return res.success;
  }

  // ── 6. changeUserStatus (PATCH /api/users/{user}/status) ─────────────
  async changeUserStatus(userId: string | number, status: 'active' | 'inactive'): Promise<{ success: boolean; message: string; rawResponse?: any }> {
    const url = `${BASE_URL}/users/${userId}/status`;
    let apiSuccess = false;
    let apiMessage = status === 'active' ? 'تم تفعيل الحساب بنجاح' : 'تم تجميد الحساب بنجاح';
    let apiResponse = null;

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      const json = await response.json().catch(() => null);
      apiResponse = json;

      if (response.ok && json && json.status !== false) {
        apiSuccess = true;
        apiMessage = json.message || apiMessage;
      } else {
        apiSuccess = false;
        apiMessage = this.extractErrorMessage(json, json?.message || 'تعذر تغيير حالة الحساب');
      }
    } catch (e: any) {
      console.warn("API changeUserStatus error:", e);
      apiSuccess = false;
      apiMessage = e.message || 'حدث خطأ في الاتصال أثناء تغيير حالة الحساب';
    }

    return {
      success: apiSuccess,
      message: apiMessage,
      rawResponse: apiResponse,
    };
  }

  // ── 7. deletePerson (DELETE /api/users/{id}) ─────────────────────────
  async deletePerson(id: string | number): Promise<boolean> {
    const url = `${BASE_URL}/users/${id}`;
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch (e) {
      console.warn("Delete user error:", e);
      return false;
    }
  }
}
