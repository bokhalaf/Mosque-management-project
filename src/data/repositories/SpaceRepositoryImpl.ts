// ==============================
// Data Repository — SpaceRepositoryImpl
// متصل بنقاط النهاية الرسمية للقاعات /api/mosques/{mosque}/spaces
// ==============================

import { ISpaceRepository } from '../../domain/repositories/ISpaceRepository';
import { MosqueSpace, CreateSpacePayload, UpdateSpacePayload } from '../../domain/entities/Space';

const BASE_URL = 'https://mms-backend-rose.vercel.app/api';

export class SpaceRepositoryImpl implements ISpaceRepository {
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': 'ar',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // ── 1. List Mosque Spaces (GET /api/mosques/{mosque}/spaces) ──
  async getMosqueSpaces(mosqueId: number | string): Promise<MosqueSpace[]> {
    const url = `${BASE_URL}/mosques/${mosqueId}/spaces`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const json = await res.json().catch(() => null);
      console.log(`GET /api/mosques/${mosqueId}/spaces Response:`, json);

      if (res.ok && json) {
        const items = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

        return items.map((item: any) => ({
          id: Number(item.id),
          mosque_id: Number(item.mosque_id || mosqueId),
          name: String(item.name || ''),
          capacity: Number(item.capacity || 0),
          created_at: item.created_at,
          updated_at: item.updated_at,
        }));
      }

      if (res.status === 404 || res.status === 403) {
        return [];
      }
    } catch (e) {
      console.warn(`Error fetching spaces for mosque #${mosqueId}:`, e);
    }
    return [];
  }

  // ── 2. Get Single Space (GET /api/mosques/{mosque}/spaces/{space}) ──
  async getSingleSpace(mosqueId: number | string, spaceId: number | string): Promise<MosqueSpace> {
    const url = `${BASE_URL}/mosques/${mosqueId}/spaces/${spaceId}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      throw new Error(json?.message || `تعذر جلب بيانات القاعة #${spaceId}`);
    }

    const item = json.data || json;
    return {
      id: Number(item.id),
      mosque_id: Number(item.mosque_id || mosqueId),
      name: String(item.name || ''),
      capacity: Number(item.capacity || 0),
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  // ── 3. Create Space (POST /api/mosques/{mosque}/spaces) ──
  async createSpace(mosqueId: number | string, payload: CreateSpacePayload): Promise<MosqueSpace> {
    const url = `${BASE_URL}/mosques/${mosqueId}/spaces`;
    const body = {
      name: payload.name.trim(),
      capacity: Number(payload.capacity),
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      let errMsg = json?.message || 'فشل إنشاء القاعة بالسيرفر';
      if (json?.data && typeof json.data === 'object') {
        errMsg = Object.values(json.data).flat().join(' | ');
      }
      throw new Error(errMsg);
    }

    const item = json.data || json;
    return {
      id: Number(item.id || Date.now()),
      mosque_id: Number(item.mosque_id || mosqueId),
      name: String(item.name || payload.name),
      capacity: Number(item.capacity || payload.capacity),
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
    };
  }

  // ── 4. Update Space (PUT /api/mosques/{mosque}/spaces/{space}) ──
  async updateSpace(mosqueId: number | string, spaceId: number | string, payload: UpdateSpacePayload): Promise<MosqueSpace> {
    const url = `${BASE_URL}/mosques/${mosqueId}/spaces/${spaceId}`;
    const body: Record<string, any> = {};
    if (payload.name !== undefined) body.name = payload.name.trim();
    if (payload.capacity !== undefined) body.capacity = Number(payload.capacity);

    const res = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      let errMsg = json?.message || 'فشل تحديث بيانات القاعة بالسيرفر';
      if (json?.data && typeof json.data === 'object') {
        errMsg = Object.values(json.data).flat().join(' | ');
      }
      throw new Error(errMsg);
    }

    const item = json.data || json;
    return {
      id: Number(item.id || spaceId),
      mosque_id: Number(item.mosque_id || mosqueId),
      name: String(item.name || payload.name || ''),
      capacity: Number(item.capacity || payload.capacity || 0),
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  // ── 5. Delete Space (DELETE /api/mosques/{mosque}/spaces/{space}) ──
  async deleteSpace(mosqueId: number | string, spaceId: number | string): Promise<boolean> {
    const url = `${BASE_URL}/mosques/${mosqueId}/spaces/${spaceId}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      throw new Error(json?.message || `فشل حذف القاعة #${spaceId}`);
    }

    return true;
  }
}
