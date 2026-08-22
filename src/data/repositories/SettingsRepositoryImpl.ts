// ==============================
// Data Repository — SettingsRepositoryImpl
// متصل بنقاط النهاية الرسمية للإعدادات /api/settings و /api/settings/exchange-rate
// ==============================

import { ISettingsRepository } from '../../domain/repositories/ISettingsRepository';
import { SystemSetting, ExchangeRateResponse } from '../../domain/entities/Settings';

const BASE_URL = 'https://mms-backend-rose.vercel.app/api';

export class SettingsRepositoryImpl implements ISettingsRepository {
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

  // ── 1. Get All Settings (GET /api/settings) ──
  async getSettings(): Promise<SystemSetting[]> {
    const url = `${BASE_URL}/settings`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const json = await res.json().catch(() => null);
      console.log('GET /api/settings Response:', json);

      if (res.ok && json) {
        const items = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

        return items.map((item: any) => ({
          key: String(item.key || ''),
          value: String(item.value || ''),
          description: item.description,
          updated_at: item.updated_at,
        }));
      }
    } catch (e) {
      console.warn('Error fetching settings:', e);
    }
    return [];
  }

  // ── 2. Update Exchange Rate (PUT /api/settings/exchange-rate) ──
  async updateExchangeRate(rate: number): Promise<ExchangeRateResponse> {
    const url = `${BASE_URL}/settings/exchange-rate`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ rate: Number(rate) }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || (json && json.status === false)) {
      throw new Error(json?.message || 'فشل تحديث سعر الصرف بالسيرفر');
    }

    const data = json.data || json;
    return {
      message: data.message || 'تم تحديث سعر الصرف بنجاح.',
      key: data.key || 'usd_to_syp_rate',
      new_rate: Number(data.new_rate || rate),
      unit: data.unit || `1 USD = ${Number(data.new_rate || rate).toLocaleString()} SYP`,
    };
  }
}
