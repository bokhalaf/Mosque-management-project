// ==============================
// Data — MosqueTaskRepositoryImpl
// ==============================

import {
  MosqueTask,
  CreateMosqueTaskPayload,
  UpdateMosqueTaskPayload,
  MosqueTaskDateTab,
  MosqueTaskCategory,
  MosqueTaskStatus,
  MosqueTaskPriority,
} from '../../domain/entities/MosqueTask';
import { IMosqueTaskRepository } from '../../domain/repositories/IMosqueTaskRepository';

const BASE_URL = "https://mms-backend-rose.vercel.app/api";

export class MosqueTaskRepositoryImpl implements IMosqueTaskRepository {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private mapTask(item: any): MosqueTask {
    const isCompleted = !!(item.is_completed || item.completed || item.status === 'done' || item.status === 'completed');
    const status: MosqueTaskStatus = isCompleted ? 'done' : (item.status || 'todo');

    let category: MosqueTaskCategory = 'prayer_worship';
    const cat = String(item.category || item.type || '').toLowerCase();
    if (cat.includes('clean') || cat.includes('نظاف')) category = 'cleaning';
    else if (cat.includes('maint') || cat.includes('صيان')) category = 'maintenance';
    else if (cat.includes('event') || cat.includes('فعال') || cat.includes('activ')) category = 'activity';
    else if (cat.includes('admin') || cat.includes('إدار')) category = 'administrative';
    else if (cat.includes('prayer') || cat.includes('عباد')) category = 'prayer_worship';

    const priority: MosqueTaskPriority = item.is_important ? 'high' : (item.priority || 'medium');
    const description = item.notes || item.description || "";

    return {
      id: item.id || item.task_id || String(Date.now()),
      mosque_id: Number(item.mosque_id || 1),
      task_name: item.title || item.task_name || item.name || "مهمة مسجد",
      title: item.title || item.task_name || item.name || "مهمة مسجد",
      description,
      category,
      priority,
      due_date: item.due_date || item.date || new Date().toISOString().split('T')[0],
      due_time: item.due_time || item.time || "10:00",
      time: item.due_time || item.time || "10:00",
      status,
      is_completed: isCompleted,
      assigned_to: item.assigned_to || item.user_name || item.employee_name || null,
      day_offset: Number(item.day_offset ?? item.offset ?? 0),
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  private extractItems(json: any): any[] {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.data)) return json.data;
    if (json.data && Array.isArray(json.data.data)) return json.data.data;
    if (json.data && typeof json.data === 'object') {
      const vals = Object.values(json.data).find(v => Array.isArray(v));
      if (vals) return vals as any[];
    }
    return [];
  }

  // GET /api/mosque/tasks
  async getMosqueTasks(params?: { mosque_id?: number; category?: string; date?: string; status?: string }): Promise<MosqueTask[]> {
    const urls = [
      `${BASE_URL}/mosque/tasks`,
      `${BASE_URL}/mosque-tasks`,
    ];

    for (const url of urls) {
      try {
        const query = new URLSearchParams();
        if (params?.category && params.category !== 'all') query.append('category', params.category);
        if (params?.date) query.append('date', params.date);
        if (params?.status && params.status !== 'all') query.append('status', params.status);

        const fullUrl = query.toString() ? `${url}?${query.toString()}` : url;
        const res = await fetch(fullUrl, { headers: this.getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          const items = this.extractItems(json);
          return items.map(item => this.mapTask(item));
        }
      } catch (e) {
        console.warn(`API getMosqueTasks (${url}) error:`, e);
      }
    }
    return [];
  }

  // GET /api/mosque/tasks/date-tabs
  async getDateTabs(): Promise<MosqueTaskDateTab[]> {
    const urls = [
      `${BASE_URL}/mosque/tasks/date-tabs`,
      `${BASE_URL}/mosque-tasks/date-tabs`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: this.getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          const items = this.extractItems(json);
          if (items.length > 0) {
            return items.map((item, idx) => ({
              key: item.key || String(idx),
              label: item.label || item.day_name || 'اليوم',
              date: item.date || new Date().toISOString().split('T')[0],
              day_offset: Number(item.day_offset ?? item.offset ?? idx),
              count: Number(item.count || item.tasks_count || 0),
            }));
          }
        }
      } catch (e) {
        console.warn(`API getDateTabs (${url}) error:`, e);
      }
    }
    return [];
  }

  // GET /api/mosque/tasks/next-week
  async getNextWeekTasks(): Promise<MosqueTask[]> {
    const urls = [
      `${BASE_URL}/mosque/tasks/next-week`,
      `${BASE_URL}/mosque-tasks/next-week`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: this.getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          const items = this.extractItems(json);
          return items.map(item => this.mapTask(item));
        }
      } catch (e) {
        console.warn(`API getNextWeekTasks (${url}) error:`, e);
      }
    }
    return [];
  }

  // GET /api/mosque/tasks/friday
  async getFridayTasks(): Promise<MosqueTask[]> {
    const urls = [
      `${BASE_URL}/mosque/tasks/friday`,
      `${BASE_URL}/mosque-tasks/friday`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: this.getAuthHeaders() });
        if (res.ok) {
          const json = await res.json();
          const items = this.extractItems(json);
          return items.map(item => this.mapTask(item));
        }
      } catch (e) {
        console.warn(`API getFridayTasks (${url}) error:`, e);
      }
    }
    return [];
  }

  // POST /api/mosque/tasks
  async createMosqueTask(payload: CreateMosqueTaskPayload): Promise<MosqueTask> {
    const url = `${BASE_URL}/mosque/tasks`;

    const bodyObj = {
      title: payload.title?.trim() || payload.task_name?.trim() || "مهمة مسجد جديدة",
      category: payload.category || 'prayer_worship',
      due_date: payload.due_date || new Date().toISOString().split('T')[0],
      due_time: payload.due_time || "10:00",
      is_completed: false,
      is_important: payload.priority === 'high',
      notes: payload.description?.trim() || null,
    };

    let lastError = "فشل إنشاء مهمة المسجد بالسيرفر";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bodyObj),
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json && json.status !== false) {
        const item = json.data || json;
        return this.mapTask(item);
      }

      if (json) {
        if (json.data && typeof json.data === 'object') {
          lastError = Object.entries(json.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ');
        } else if (json.message) {
          lastError = json.message;
        }
      } else {
        lastError = `خطأ من السيرفر (HTTP ${res.status})`;
      }
    } catch (e: any) {
      lastError = e.message || "حدث خطأ في الاتصال بالسيرفر";
    }

    throw new Error(lastError);
  }

  // PATCH /api/mosque/tasks/{id}
  async updateMosqueTask(id: number | string, payload: UpdateMosqueTaskPayload): Promise<MosqueTask> {
    const url = `${BASE_URL}/mosque/tasks/${id}`;

    const bodyObj: Record<string, any> = {};
    if (payload.title || payload.task_name) bodyObj.title = payload.title?.trim() || payload.task_name?.trim();
    if (payload.category) bodyObj.category = payload.category;
    if (payload.due_date) bodyObj.due_date = payload.due_date;
    if (payload.due_time) bodyObj.due_time = payload.due_time;
    if (payload.is_completed !== undefined) bodyObj.is_completed = Boolean(payload.is_completed);
    if (payload.priority) bodyObj.is_important = payload.priority === 'high';
    if (payload.description) bodyObj.notes = payload.description.trim();

    let lastError = "فشل تعديل مهمة المسجد بالسيرفر";

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bodyObj),
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json && json.status !== false) {
        const resItem = json.data || json;
        return this.mapTask(resItem);
      }

      if (json) {
        if (json.data && typeof json.data === 'object') {
          lastError = Object.entries(json.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ');
        } else if (json.message) {
          lastError = json.message;
        }
      } else {
        lastError = `خطأ من السيرفر (HTTP ${res.status})`;
      }
    } catch (e: any) {
      lastError = e.message || "حدث خطأ في الاتصال بالسيرفر";
    }

    throw new Error(lastError);
  }

  // PATCH /api/mosque/tasks/{id}/toggle-complete
  async toggleTaskComplete(id: number | string): Promise<MosqueTask> {
    const endpoints = [
      { url: `${BASE_URL}/mosque/tasks/${id}/toggle-complete`, method: "PATCH" },
      { url: `${BASE_URL}/mosque/tasks/${id}/toggle-complete`, method: "POST" },
      { url: `${BASE_URL}/mosque-tasks/${id}/toggle-complete`, method: "PATCH" },
      { url: `${BASE_URL}/mosque-tasks/${id}/toggle_complete`, method: "PATCH" },
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep.url, {
          method: ep.method,
          headers: this.getAuthHeaders(),
        });
        const json = await res.json().catch(() => null);
        if (res.ok && json) {
          const item = json.data || json;
          return this.mapTask(item);
        }
      } catch (e) {
        console.warn(`API toggleTaskComplete (${ep.url}) error:`, e);
      }
    }

    throw new Error("فشل تغيير حالة اكتمال المهمة بالسيرفر");
  }

  // DELETE /api/mosque/tasks/{id}
  async deleteMosqueTask(id: number | string): Promise<boolean> {
    const urls = [
      `${BASE_URL}/mosque/tasks/${id}`,
      `${BASE_URL}/mosque-tasks/${id}`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        });
        if (res.ok) return true;
      } catch (e) {
        console.warn(`API deleteMosqueTask (${url}) error:`, e);
      }
    }

    throw new Error("فشل حذف المهمة من السيرفر");
  }
}
