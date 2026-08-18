// ==============================
// Data — MosqueRepositoryImpl (Super Admin Mosques Management)
// ==============================

import { MosqueDetail, UpdateMosquePayload } from "../../domain/entities/Mosque";
import { IMosqueRepository, PaginatedMosques, CreateMosquePayload } from "../../domain/repositories/IMosqueRepository";

export const BASE_URL = "https://mms-backend-rose.vercel.app/api";

const MOCK_MOSQUES: MosqueDetail[] = [
  {
    id: 1,
    name: "جامع الملك فهد الكبير",
    city: "الرياض",
    district: "حي العليا",
    address: "طريق الملك فهد، مقابل برج المملكة",
    status: "active",
    is_featured: true,
    working_hours: "24 ساعة",
    imam: "الشيخ د. عبد الرحمن السديس",
    khatib: "الشيخ د. صالح بن حميد",
    image: "https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=800&q=80",
    spaces: [
      { id: 1, mosque_id: 1, name: "المصلى الرئيسي للرجال", capacity: 3500 },
      { id: 2, mosque_id: 1, name: "مصلى النساء العلوي", capacity: 1200 },
    ],
    facilities: [
      { id: 1, name: "مواقف سيارات قبو", is_enabled: true },
      { id: 2, name: "مصعد كهربائي لكبار السن", is_enabled: true },
      { id: 3, name: "مكتبة إسلامية مركزية", is_enabled: true },
    ],
  },
  {
    id: 2,
    name: "مسجد الراجحي النموذجي",
    city: "الرياض",
    district: "حي الروضة",
    address: "شارع عبيدة بن الحارث",
    status: "active",
    is_featured: true,
    working_hours: "من أذان الفجر حتى صلاة العشاء",
    imam: "الشيخ ناصر القطامي",
    khatib: "د. ياسر الدوسري",
    image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80",
    spaces: [
      { id: 3, mosque_id: 2, name: "المصلى السفلي", capacity: 2000 },
    ],
    facilities: [
      { id: 4, name: "منظومة تكييف مائي متطورة", is_enabled: true },
      { id: 5, name: "قسم مغسلة الموتى", is_enabled: true },
    ],
  },
  {
    id: 3,
    name: "جامع السلام التاريخي",
    city: "جدة",
    district: "حي البلد القديم",
    address: "شارع الذهب، المظلوم",
    status: "maintenance",
    is_featured: false,
    working_hours: "أوقات الصلوات الخمس",
    imam: "الشيخ خالد الغامدي",
    khatib: "د. علي بادحدح",
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&q=80",
    spaces: [],
    facilities: [],
  },
  {
    id: 4,
    name: "مسجد التوحيد",
    city: "الدمام",
    district: "حي الشاطئ",
    address: "طريق كورنيش الدمام",
    status: "active",
    is_featured: false,
    working_hours: "أوقات الصلوات الخمس",
    imam: "الشيخ فهد العتيبي",
    khatib: "الشيخ بدر المطيري",
    image: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=80",
    spaces: [],
    facilities: [],
  },
];

export class MosqueRepositoryImpl implements IMosqueRepository {
  private getAuthHeaders(isFormData: boolean = false): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private formatMosque(item: any): MosqueDetail {
    return {
      id: item.id,
      name: item.name || item.title || 'مسجد جامعي',
      city_id: item.city_id,
      district_id: item.district_id,
      city: item.city?.name || item.city || item.city_name || 'الرياض',
      district: item.district?.name || item.district || item.district_name || '',
      address: item.address || 'العنوان الرئيسي للمسجد',
      latitude: item.latitude || item.lat,
      longitude: item.longitude || item.lng,
      status: item.status || (item.is_active ? 'active' : 'inactive'),
      is_featured: Boolean(item.is_featured || item.featured),
      working_hours: item.working_hours || 'من الفجر إلى العشاء',
      imam: item.imam || item.imam_name || 'الشيخ الإمام',
      khatib: item.khatib || item.khatib_name || 'الشيخ الخطيب',
      manager_id: item.manager_id,
      image: item.image || item.image_url || 'https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=800&q=80',
      spaces: item.spaces || [],
      facilities: item.facilities || [],
      updated_at: item.updated_at,
    };
  }

  // ── 1. getMosques (GET /api/mosques) ──────────────────────────────
  async getMosques(page: number = 1, limit: number = 10): Promise<PaginatedMosques> {
    try {
      const response = await fetch(`${BASE_URL}/mosques?page=${page}&per_page=${limit}&limit=${limit}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("GET /api/mosques Response:", json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

        const formatted = items.map(item => this.formatMosque(item));
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
      console.warn("Error fetching mosques from API:", e);
    }

    return {
      data: MOCK_MOSQUES,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: MOCK_MOSQUES.length,
        itemsPerPage: limit,
      },
    };
  }

  // ── 2. searchMosques (GET /api/mosques/search) ─────────────────────
  async searchMosques(query: string, page: number = 1, limit: number = 10): Promise<PaginatedMosques> {
    if (!query || !query.trim()) return this.getMosques(page, limit);

    try {
      const response = await fetch(`${BASE_URL}/mosques/search?q=${encodeURIComponent(query.trim())}&page=${page}&per_page=${limit}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log(`GET /api/mosques/search?q=${query} Response:`, json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

        const formatted = items.map(item => this.formatMosque(item));
        return {
          data: formatted,
          pagination: {
            currentPage: page,
            totalPages: Math.max(1, Math.ceil(formatted.length / limit)),
            totalItems: formatted.length,
            itemsPerPage: limit,
          },
        };
      }
    } catch (e) {
      console.warn(`Error searching mosques for "${query}":`, e);
    }

    const q = query.trim().toLowerCase();
    const filtered = MOCK_MOSQUES.filter(m => 
      m.name.toLowerCase().includes(q) ||
      (m.city && m.city.toLowerCase().includes(q)) ||
      (m.district && m.district.toLowerCase().includes(q)) ||
      (m.imam && m.imam.toLowerCase().includes(q))
    );

    return {
      data: filtered,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: filtered.length,
        itemsPerPage: limit,
      },
    };
  }

  // ── 3. getMosqueById (GET /api/mosques/{id}) ───────────────────────
  async getMosqueById(id: string | number): Promise<MosqueDetail> {
    try {
      const response = await fetch(`${BASE_URL}/mosques/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log(`GET /api/mosques/${id} Response:`, json);

      if (response.ok && json && json.status !== false) {
        return this.formatMosque(json.data || json);
      }
    } catch (e) {
      console.warn(`Error fetching mosque #${id}:`, e);
    }

    const match = MOCK_MOSQUES.find(m => String(m.id) === String(id));
    if (match) return match;
    throw new Error(`تعذر العثور على المسجد #${id}`);
  }

  // ── 4. getFeaturedMosques (GET /api/mosques/featured) ──────────────
  async getFeaturedMosques(): Promise<MosqueDetail[]> {
    try {
      const response = await fetch(`${BASE_URL}/mosques/featured`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("GET /api/mosques/featured Response:", json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

        return items.map(item => this.formatMosque(item));
      }
    } catch (e) {
      console.warn("Error fetching featured mosques:", e);
    }

    return MOCK_MOSQUES.filter(m => m.is_featured);
  }

  // ── 5. createMosque (POST /api/mosques) ───────────────────────────
  async createMosque(payload: CreateMosquePayload): Promise<MosqueDetail> {
    const isFile = payload.image instanceof File;

    let response: Response;
    if (isFile || payload.image) {
      const formData = new FormData();
      formData.append('name', payload.name);
      if (payload.city_id) formData.append('city_id', String(payload.city_id));
      if (payload.district_id) formData.append('district_id', String(payload.district_id));
      if (payload.latitude !== undefined && payload.latitude !== '') formData.append('latitude', String(payload.latitude));
      if (payload.longitude !== undefined && payload.longitude !== '') formData.append('longitude', String(payload.longitude));
      if (payload.working_hours) formData.append('working_hours', payload.working_hours);
      if (payload.status) formData.append('status', payload.status);
      if (payload.is_featured !== undefined) formData.append('is_featured', payload.is_featured ? '1' : '0');
      if (payload.imam) formData.append('imam', payload.imam);
      if (payload.khatib) formData.append('khatib', payload.khatib);
      if (payload.manager_id) formData.append('manager_id', String(payload.manager_id));
      if (payload.address) formData.append('address', payload.address);
      if (isFile) {
        formData.append('image', payload.image as File);
      }

      console.log("POST /api/mosques (FormData)");
      response = await fetch(`${BASE_URL}/mosques`, {
        method: "POST",
        headers: this.getAuthHeaders(true),
        body: formData,
      });
    } else {
      const bodyObj: Record<string, any> = {
        name: payload.name,
        city_id: payload.city_id || 1,
        ...(payload.district_id ? { district_id: payload.district_id } : {}),
        ...(payload.latitude ? { latitude: Number(payload.latitude) } : {}),
        ...(payload.longitude ? { longitude: Number(payload.longitude) } : {}),
        working_hours: payload.working_hours || 'أوقات الصلوات',
        status: payload.status || 'active',
        is_featured: payload.is_featured || false,
        ...(payload.imam ? { imam: payload.imam } : {}),
        ...(payload.khatib ? { khatib: payload.khatib } : {}),
        ...(payload.manager_id ? { manager_id: Number(payload.manager_id) } : {}),
        ...(payload.address ? { address: payload.address } : {}),
      };

      console.log("POST /api/mosques (JSON) Payload:", bodyObj);
      response = await fetch(`${BASE_URL}/mosques`, {
        method: "POST",
        headers: this.getAuthHeaders(false),
        body: JSON.stringify(bodyObj),
      });
    }

    const json = await response.json().catch(() => null);
    console.log("POST /api/mosques Response:", json);

    if (response.ok && json && json.status !== false) {
      return this.formatMosque(json.data || json);
    }

    const errMsg = json?.message || (json?.errors ? Object.values(json.errors).flat().join(', ') : `فشل إضافة المسجد (HTTP ${response.status})`);
    throw new Error(errMsg);
  }

  // ── 6. updateMosque (PUT /api/mosques/{id}) ───────────────────────
  async updateMosque(id: string | number, payload: UpdateMosquePayload): Promise<MosqueDetail> {
    const isFile = payload.image instanceof File;
    let response: Response;

    if (isFile) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      if (payload.name) formData.append('name', payload.name);
      if (payload.city_id) formData.append('city_id', String(payload.city_id));
      if (payload.district_id) formData.append('district_id', String(payload.district_id));
      if (payload.latitude !== undefined) formData.append('latitude', String(payload.latitude));
      if (payload.longitude !== undefined) formData.append('longitude', String(payload.longitude));
      if (payload.working_hours) formData.append('working_hours', payload.working_hours);
      if (payload.status) formData.append('status', payload.status);
      if (payload.is_featured !== undefined) formData.append('is_featured', payload.is_featured ? '1' : '0');
      if (payload.imam) formData.append('imam', payload.imam);
      if (payload.khatib) formData.append('khatib', payload.khatib);
      if (payload.manager_id) formData.append('manager_id', String(payload.manager_id));
      if (payload.address) formData.append('address', payload.address);
      formData.append('image', payload.image as File);

      response = await fetch(`${BASE_URL}/mosques/${id}`, {
        method: "POST", // Laravel POST with _method=PUT for multipart
        headers: this.getAuthHeaders(true),
        body: formData,
      });
    } else {
      response = await fetch(`${BASE_URL}/mosques/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(false),
        body: JSON.stringify(payload),
      });
    }

    const json = await response.json().catch(() => null);
    console.log(`PUT /api/mosques/${id} Response:`, json);

    if (response.ok && json && json.status !== false) {
      return this.formatMosque(json.data || json);
    }

    const errMsg = json?.message || (json?.errors ? Object.values(json.errors).flat().join(', ') : `فشل تعديل المسجد #${id} (HTTP ${response.status})`);
    throw new Error(errMsg);
  }

  // ── Helper Aliases for single mosque hook ──
  async getMosqueDetails(id: string | number): Promise<MosqueDetail> {
    return this.getMosqueById(id);
  }

  async updateMosqueDetails(id: string | number, payload: UpdateMosquePayload): Promise<MosqueDetail> {
    return this.updateMosque(id, payload);
  }

  async createSpace(mosqueId: string | number, payload: any): Promise<any> {
    return {
      id: Date.now(),
      mosque_id: mosqueId,
      name: payload.name,
      capacity: payload.capacity || 100,
      description: payload.description || '',
    };
  }

  async deleteSpace(mosqueId: string | number, spaceId: string | number): Promise<void> {
    return;
  }

  // ── 7. deleteMosque (DELETE /api/mosques/{id}) ─────────────────────
  async deleteMosque(id: string | number): Promise<void> {
    const response = await fetch(`${BASE_URL}/mosques/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(false),
    });

    const json = await response.json().catch(() => null);
    console.log(`DELETE /api/mosques/${id} Response:`, json);

    if (!response.ok && response.status !== 200 && response.status !== 204 && response.status !== 404) {
      throw new Error(json?.message || `فشل حذف المسجد #${id} من السيرفر (HTTP ${response.status})`);
    }
  }

  // ── 8. updateMosqueStatus (PATCH /api/mosques/{id}/status) ─────────
  async updateMosqueStatus(id: string | number, status: 'active' | 'inactive' | 'maintenance' | 'closed'): Promise<void> {
    const urlsToTry = [
      { url: `${BASE_URL}/mosques/${id}/status`, method: "PATCH" },
      { url: `${BASE_URL}/mosques/${id}/status`, method: "PUT" },
      { url: `${BASE_URL}/admin/mosques/${id}/status`, method: "PATCH" },
    ];

    let success = false;
    let lastError: string | null = null;

    for (const item of urlsToTry) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: this.getAuthHeaders(false),
          body: JSON.stringify({ status }),
        });
        const json = await response.json().catch(() => null);
        console.log(`${item.method} ${item.url} Response:`, json);

        if (response.ok && json?.status !== false) {
          success = true;
          break;
        }
        if (json?.message) lastError = json.message;
      } catch (e: any) {
        console.warn(`Error updating status for mosque #${id}:`, e);
        lastError = e.message;
      }
    }

    if (!success && lastError) {
      throw new Error(lastError);
    }
  }

  // ── 9. toggleMosqueFeatured (POST /api/mosques/{id}/featured) ──────
  async toggleMosqueFeatured(id: string | number): Promise<boolean> {
    let newStatus = true;
    const match = MOCK_MOSQUES.find(m => String(m.id) === String(id));
    if (match) {
      match.is_featured = !match.is_featured;
      newStatus = match.is_featured;
    }

    const urlsToTry = [
      { url: `${BASE_URL}/mosques/${id}/featured`, method: "POST" },
      { url: `${BASE_URL}/mosques/${id}/featured`, method: "PATCH" },
    ];

    for (const item of urlsToTry) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: this.getAuthHeaders(false),
          body: JSON.stringify({ is_featured: newStatus }),
        });
        const json = await response.json().catch(() => null);
        console.log(`${item.method} ${item.url} Response:`, json);

        if (response.ok && json?.status !== false) {
          break;
        }
      } catch (e) {
        console.warn(`Error toggling featured for mosque #${id}:`, e);
      }
    }

    return newStatus;
  }

  // ── 10. updateMosqueRating (PATCH /api/mosques/{id}/rating) ─────────
  async updateMosqueRating(id: string | number, rating: number): Promise<void> {
    const urlsToTry = [
      { url: `${BASE_URL}/mosques/${id}/rating`, method: "PATCH" },
      { url: `${BASE_URL}/mosques/${id}/rating`, method: "POST" },
    ];

    for (const item of urlsToTry) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: this.getAuthHeaders(false),
          body: JSON.stringify({ average_rating: Number(rating) }),
        });
        const json = await response.json().catch(() => null);
        console.log(`${item.method} ${item.url} Response:`, json);

        if (response.ok && json?.status !== false) {
          break;
        }
      } catch (e) {
        console.warn(`Error rating mosque #${id}:`, e);
      }
    }
  }

  // ── 11. getGeoCatalog (GET /api/geo) ─────────────────────────────
  async getGeoCatalog(): Promise<import('../../domain/entities/Mosque').GeoGovernorate[]> {
    try {
      const response = await fetch(`${BASE_URL}/geo`, {
        method: "GET",
        headers: this.getAuthHeaders(false),
      });

      const json = await response.json().catch(() => null);
      if (response.ok && json && json.status !== false && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (e) {
      console.warn("Error fetching geo catalog:", e);
    }
    return [];
  }
}

