// ==============================
// Data — MosqueRepositoryImpl
// ==============================

import {
  MosqueDetail,
  UpdateMosquePayload,
  MosqueSpace,
  CreateSpacePayload,
  MosqueFacility,
} from "../../domain/entities/Mosque";
import { IMosqueRepository } from "../../domain/repositories/IMosqueRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";
const STORAGE_KEY_MOSQUE = "mosque_details_unified_cache";

const DEFAULT_FACILITIES: MosqueFacility[] = [
  { id: 1, name: "موقف سيارات متسعة", description: "مواقف خاصة للمصلين تتسع لعدد كبير من السيارات", is_enabled: true },
  { id: 2, name: "مصلى للنساء مع مدخل مستقل", description: "مصلى مستقل للنساء مزود بالشاشات والسماعات", is_enabled: true },
  { id: 3, name: "برادات برودة المياه وسقيا الزمزم", description: "وحدات مياه مبردة وسقيا عامة في مداخل المسجد", is_enabled: true },
  { id: 4, name: "تجهيزات وممرات ذوي الاحتياجات الخاصة", description: "رمبات ومرافق مجهزة خصيصاً لكبار السن وذوي الإعاقة", is_enabled: true },
  { id: 5, name: "مكتبة إسلامية عامة", description: "مكتبة زاخرة بأمهات الكتب والمراجع الدينية", is_enabled: true },
  { id: 6, name: "دورات مياه وموضأ متطور", description: "مواضئ حديثة ونظيفة مع صيانة دورية على مدار الساعة", is_enabled: true },
  { id: 7, name: "تجهيزات ومغسلة الجنائز", description: "قاعة ومغسلة مجهزة لإكرام وتجهيز الجنائز", is_enabled: true },
  { id: 8, name: "خدمة الواي فاي العامة", description: "شبكة إنترنت مجانية للزوار والباحثين", is_enabled: false },
];

const DEFAULT_MOSQUE: MosqueDetail = {
  id: 20,
  name: "مسجد الرحمة الجامع",
  working_hours: "04:30 AM - 10:30 PM",
  status: "active",
  is_featured: true,
  city: "الرياض",
  district: "حي النزهة",
  address: "طريق الملك فهد - حي النزهة - الرياض",
  latitude: "30.04440000",
  longitude: "31.23570000",
  imam: "الشيخ د. عبد العزيز بن فهد العتيبي",
  khatib: "الشيخ د. محمد بن إبراهيم آل الشيخ",
  spaces: [
    { id: 1, mosque_id: 20, name: "مصلى الرجال الرئيسي", capacity: 1500, description: "القاعة المركزية للصلوات الخمس وجمعة" },
    { id: 2, mosque_id: 20, name: "مصلى النساء العلوي", capacity: 400, description: "مصلى النساء المزود بالشاشات والسماعات" },
    { id: 3, mosque_id: 20, name: "قاعة الحلقات القرآنية", capacity: 200, description: "قاعة تعليم التلاوة والتجويد" },
  ],
  facilities: DEFAULT_FACILITIES,
};

export class MosqueRepositoryImpl implements IMosqueRepository {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private getMosqueId(): number {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.mosque_id) return Number(user.mosque_id);
      } catch (e) {}
    }
    return 20;
  }

  private getLocalMosque(): MosqueDetail {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_MOSQUE);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      localStorage.setItem(STORAGE_KEY_MOSQUE, JSON.stringify(DEFAULT_MOSQUE));
    }
    return DEFAULT_MOSQUE;
  }

  private saveLocalMosque(data: MosqueDetail): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_MOSQUE, JSON.stringify(data));
    }
  }

  async getMosqueDetails(mosqueId?: number | string): Promise<MosqueDetail> {
    const id = mosqueId || this.getMosqueId();
    let apiData: MosqueDetail | null = null;

    try {
      const response = await fetch(`${BASE_URL}/mosques/${id}`, {
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.status && json.data) {
          const item = json.data;
          apiData = {
            id: item.id || id,
            name: item.name || "مسجد الرحمة الجامع",
            working_hours: item.working_hours || "04:30 AM - 10:30 PM",
            status: item.status || "active",
            is_featured: !!item.is_featured,
            city: item.city || "الرياض",
            district: item.district || "حي النزهة",
            address: item.address || "طريق الملك فهد - حي النزهة",
            latitude: item.latitude || "30.04440000",
            longitude: item.longitude || "31.23570000",
            imam: item.imam || "الشيخ د. عبد العزيز العتيبي",
            khatib: item.khatib || "الشيخ د. محمد آل الشيخ",
            spaces: item.spaces || [],
            facilities: item.facilities || [],
            updated_at: item.updated_at,
          };
        }
      }
    } catch (e) {
      console.warn("API getMosqueDetails failed, using local cache:", e);
    }

    const local = this.getLocalMosque();
    if (apiData) {
      const merged: MosqueDetail = {
        ...local,
        ...apiData,
        spaces: (apiData.spaces && apiData.spaces.length > 0) ? apiData.spaces : local.spaces,
        facilities: (apiData.facilities && apiData.facilities.length > 0) ? apiData.facilities : (local.facilities || DEFAULT_FACILITIES),
      };
      this.saveLocalMosque(merged);
      return merged;
    }

    return local;
  }

  async updateMosqueDetails(mosqueId: number | string, payload: UpdateMosquePayload): Promise<MosqueDetail> {
    const id = mosqueId || this.getMosqueId();

    try {
      await fetch(`${BASE_URL}/mosques/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (payload.facilities) {
        const enabledIds = payload.facilities.filter(f => f.is_enabled).map(f => Number(f.id));
        await fetch(`${BASE_URL}/mosques/${id}/facilities/sync`, {
          method: "POST",
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ facilities: enabledIds }),
        }).catch(() => null);
      }
    } catch (e) {
      console.warn("API updateMosqueDetails failed:", e);
    }

    const local = this.getLocalMosque();
    const updated: MosqueDetail = {
      ...local,
      ...payload,
      updated_at: new Date().toISOString(),
    };
    this.saveLocalMosque(updated);
    return updated;
  }

  async getSpaces(mosqueId: number | string): Promise<MosqueSpace[]> {
    const id = mosqueId || this.getMosqueId();
    try {
      const response = await fetch(`${BASE_URL}/mosques/${id}/spaces`, {
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.status && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("API getSpaces failed:", e);
    }

    const local = this.getLocalMosque();
    return local.spaces || [];
  }

  async createSpace(mosqueId: number | string, payload: CreateSpacePayload): Promise<MosqueSpace> {
    const id = mosqueId || this.getMosqueId();
    let created: MosqueSpace | null = null;

    try {
      const response = await fetch(`${BASE_URL}/mosques/${id}/spaces`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          mosque_id: Number(id),
          name: payload.name,
          capacity: Number(payload.capacity || 100),
          description: payload.description || "",
        }),
      });
      if (response.ok) {
        const json = await response.json();
        created = json.data || json;
      }
    } catch (e) {
      console.warn("API createSpace failed:", e);
    }

    if (!created) {
      created = {
        id: Date.now(),
        mosque_id: id,
        name: payload.name,
        capacity: payload.capacity || 100,
        description: payload.description,
        created_at: new Date().toISOString(),
      };
    }

    const local = this.getLocalMosque();
    if (!local.spaces) local.spaces = [];
    local.spaces.unshift(created);
    this.saveLocalMosque(local);

    return created;
  }

  async deleteSpace(mosqueId: number | string, spaceId: number | string): Promise<boolean> {
    const id = mosqueId || this.getMosqueId();

    try {
      await fetch(`${BASE_URL}/mosques/${id}/spaces/${spaceId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
    } catch (e) {
      console.warn("API deleteSpace failed:", e);
    }

    const local = this.getLocalMosque();
    if (local.spaces) {
      local.spaces = local.spaces.filter(s => String(s.id) !== String(spaceId));
      this.saveLocalMosque(local);
    }
    return true;
  }

  async getFacilities(mosqueId: number | string): Promise<MosqueFacility[]> {
    const local = this.getLocalMosque();
    return local.facilities || DEFAULT_FACILITIES;
  }

  async syncFacilities(mosqueId: number | string, facilityIds: (number | string)[]): Promise<boolean> {
    const id = mosqueId || this.getMosqueId();
    try {
      await fetch(`${BASE_URL}/mosques/${id}/facilities/sync`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ facilities: facilityIds }),
      });
    } catch (e) {
      console.warn("API syncFacilities failed:", e);
    }
    return true;
  }
}
