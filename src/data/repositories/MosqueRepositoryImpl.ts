// ==============================
// Data — MosqueRepositoryImpl (Super Admin Mosques Management)
// ==============================

import { MosqueDetail, UpdateMosquePayload, GeoGovernorate } from "../../domain/entities/Mosque";
import { IMosqueRepository, PaginatedMosques, CreateMosquePayload, MosqueFilterOptions } from "../../domain/repositories/IMosqueRepository";

export const BASE_URL = "https://mms-backend-rose.vercel.app/api";

const DEFAULT_GEO_CATALOG: GeoGovernorate[] = [
  {
    id: 1,
    name: "دمشق",
    lat: 33.5138,
    lng: 36.2765,
    cities: [
      {
        id: 101,
        name: "دوما",
        lat: 33.5722,
        lng: 36.4022,
        districts: [
          { id: 1001, name: "المزة", lat: 33.5024, lng: 36.238 },
          { id: 1002, name: "الميدان", lat: 33.4912, lng: 36.3015 },
          { id: 1003, name: "كفرسوسة", lat: 33.4988, lng: 36.2745 },
          { id: 1004, name: "الصالحية", lat: 33.5285, lng: 36.2912 }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "ريف دمشق",
    lat: 33.55,
    lng: 36.35,
    cities: [
      {
        id: 201,
        name: "داريا",
        lat: 33.4583,
        lng: 36.2389,
        districts: [
          { id: 2001, name: "حي الفردوس", lat: 33.46, lng: 36.24 }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "حلب",
    lat: 36.2021,
    lng: 37.1343,
    cities: [
      {
        id: 301,
        name: "حلب المدينة",
        lat: 36.2021,
        lng: 37.1343,
        districts: [
          { id: 3001, name: "الشهباء", lat: 36.215, lng: 37.14 },
          { id: 3002, name: "سيف الدولة", lat: 36.195, lng: 37.12 }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "حمص",
    lat: 34.7324,
    lng: 36.7137,
    cities: [
      {
        id: 401,
        name: "حمص المدينة",
        lat: 34.7324,
        lng: 36.7137,
        districts: [
          { id: 4001, name: "الخالدية", lat: 34.74, lng: 36.71 }
        ]
      }
    ]
  }
];

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
    let whStr = '5:00 AM - 10:00 PM';
    if (typeof item.working_hours === 'string') {
      if (item.working_hours.startsWith('[') && item.working_hours.endsWith(']')) {
        try {
          const parsed = JSON.parse(item.working_hours);
          whStr = Array.isArray(parsed) ? parsed.join(' - ') : item.working_hours;
        } catch (e) {
          whStr = item.working_hours;
        }
      } else {
        whStr = item.working_hours;
      }
    } else if (Array.isArray(item.working_hours)) {
      whStr = item.working_hours.filter(Boolean).join(' - ');
    }

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
      working_hours: whStr,
      imam: item.imam || item.imam_name || 'الشيخ الإمام',
      khatib: item.khatib || item.khatib_name || 'الشيخ الخطيب',
      manager_id: item.manager_id,
      image: item.image || item.image_url || 'https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=800&q=80',
      spaces: item.spaces || [],
      facilities: item.facilities || [],
      updated_at: item.updated_at,
    };
  }

  // ── 1. getMosques (GET /api/mosques) with full server filtering & pagination ──
  async getMosques(optionsOrPage: MosqueFilterOptions | number = 1, limitParam: number = 6): Promise<PaginatedMosques> {
    const options: MosqueFilterOptions = typeof optionsOrPage === 'number'
      ? { page: optionsOrPage, limit: limitParam }
      : { page: 1, limit: 6, ...optionsOrPage };

    const page = options.page || 1;
    const limit = options.limit || 6;

    // 1. If featured filter is explicitly set to true, call /api/mosques/featured
    if (options.is_featured === true) {
      try {
        const featMosques = await this.getFeaturedMosques();
        let filtered = featMosques;
        if (options.status && options.status !== 'all') {
          filtered = filtered.filter(m => m.status === options.status);
        }
        if (options.search && options.search.trim()) {
          const q = options.search.trim().toLowerCase();
          filtered = filtered.filter(m =>
            m.name.toLowerCase().includes(q) ||
            (m.city && m.city.toLowerCase().includes(q)) ||
            (m.district && m.district.toLowerCase().includes(q)) ||
            (m.imam && m.imam.toLowerCase().includes(q))
          );
        }
        const totalItems = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / limit));
        const paginatedData = filtered.slice((page - 1) * limit, page * limit);
        return {
          data: paginatedData,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
            itemsPerPage: limit,
          },
        };
      } catch (e) {
        console.warn("Error fetching featured mosques:", e);
      }
    }

    // 2. If search query is present, call /api/mosques/search
    if (options.search && options.search.trim()) {
      return this.searchMosques(options.search.trim(), page, limit, options);
    }

    // 3. Build query string for GET /api/mosques
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', String(limit));

      if (options.status && options.status !== 'all') {
        params.append('status', options.status);
      }
      if (options.city_id !== undefined && options.city_id !== '' && options.city_id !== 'all') {
        params.append('city_id', String(options.city_id));
      }
      if (options.district_id !== undefined && options.district_id !== '' && options.district_id !== 'all') {
        params.append('district_id', String(options.district_id));
      }
      if (options.min_rating !== undefined) {
        params.append('min_rating', String(options.min_rating));
      }
      if (options.sort_by) {
        params.append('sort_by', options.sort_by);
      }
      if (options.sort_order) {
        params.append('sort_order', options.sort_order);
      }
      if (options.facility_id !== undefined) {
        params.append('facility_id', String(options.facility_id));
      }

      const url = `${BASE_URL}/mosques?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log(`GET /api/mosques?${params.toString()} Response:`, json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

        const formatted = items.map(item => this.formatMosque(item));
        
        const totalItems = json.pagination?.total ?? json.pagination?.totalItems ?? json.meta?.total ?? formatted.length;
        const totalPages = json.pagination?.last_page ?? json.pagination?.totalPages ?? json.meta?.last_page ?? Math.max(1, Math.ceil(totalItems / limit));
        const currentPage = json.pagination?.current_page ?? json.pagination?.currentPage ?? json.meta?.current_page ?? page;
        const itemsPerPage = json.pagination?.per_page ?? json.pagination?.itemsPerPage ?? limit;

        return {
          data: formatted,
          pagination: {
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage,
          },
        };
      }
    } catch (e) {
      console.warn("Error fetching mosques from API:", e);
    }

    // Fallback Mock with local filtering & pagination
    let filtered = MOCK_MOSQUES;
    if (options.status && options.status !== 'all') {
      filtered = filtered.filter(m => m.status === options.status);
    }
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const paginatedData = filtered.slice((page - 1) * limit, page * limit);

    return {
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  // ── 2. searchMosques (GET /api/mosques/search) ─────────────────────
  async searchMosques(query: string, page: number = 1, limit: number = 6, filters?: Partial<MosqueFilterOptions>): Promise<PaginatedMosques> {
    if (!query || !query.trim()) {
      return this.getMosques({ ...filters, page, limit });
    }

    try {
      const params = new URLSearchParams();
      params.append('q', query.trim());
      params.append('page', String(page));
      params.append('per_page', String(limit));

      if (filters?.city_id !== undefined && filters.city_id !== '' && filters.city_id !== 'all') {
        params.append('city_id', String(filters.city_id));
      }
      if (filters?.district_id !== undefined && filters.district_id !== '' && filters.district_id !== 'all') {
        params.append('district_id', String(filters.district_id));
      }
      if (filters?.facility_id !== undefined) {
        params.append('facility_id', String(filters.facility_id));
      }

      const url = `${BASE_URL}/mosques/search?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log(`GET /api/mosques/search?${params.toString()} Response:`, json);

      if (response.ok && json && json.status !== false) {
        let items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

        let formatted = items.map(item => this.formatMosque(item));

        // If status filter is also active on search results
        if (filters?.status && filters.status !== 'all') {
          formatted = formatted.filter(m => m.status === filters.status);
        }

        const totalItems = json.pagination?.total ?? json.pagination?.totalItems ?? formatted.length;
        const totalPages = json.pagination?.last_page ?? json.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / limit));
        const currentPage = json.pagination?.current_page ?? json.pagination?.currentPage ?? page;

        return {
          data: formatted,
          pagination: {
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage: limit,
          },
        };
      }
    } catch (e) {
      console.warn(`Error searching mosques for "${query}":`, e);
    }

    const q = query.trim().toLowerCase();
    let filtered = MOCK_MOSQUES.filter(m => 
      m.name.toLowerCase().includes(q) ||
      (m.city && m.city.toLowerCase().includes(q)) ||
      (m.district && m.district.toLowerCase().includes(q)) ||
      (m.imam && m.imam.toLowerCase().includes(q))
    );
    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(m => m.status === filters.status);
    }
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const paginatedData = filtered.slice((page - 1) * limit, page * limit);

    return {
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
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

  // Helper to normalize working_hours into array format expected by Laravel backend
  private normalizeWorkingHours(wh?: string | string[]): string[] {
    if (!wh) return ['5:00 AM - 10:00 PM'];
    if (Array.isArray(wh)) {
      const filtered = wh.filter(Boolean);
      return filtered.length > 0 ? filtered : ['5:00 AM - 10:00 PM'];
    }
    const str = String(wh).trim();
    if (!str) return ['5:00 AM - 10:00 PM'];
    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(Boolean);
          if (filtered.length > 0) return filtered;
        }
      } catch (e) {}
    }
    return [str];
  }

  // ── 5. createMosque (POST /api/mosques) ───────────────────────────
  async createMosque(payload: CreateMosquePayload): Promise<MosqueDetail> {
    const isFile = payload.image instanceof File;

    // Always use FormData — the endpoint is multipart/form-data (has image field)
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('city_id', String(Number(payload.city_id)));
    if (payload.district_id) formData.append('district_id', String(Number(payload.district_id)));
    if (payload.latitude !== undefined && payload.latitude !== '') formData.append('latitude', String(payload.latitude));
    if (payload.longitude !== undefined && payload.longitude !== '') formData.append('longitude', String(payload.longitude));
    
    // Send working_hours as string
    if (payload.working_hours) {
      formData.append('working_hours', String(payload.working_hours).trim());
    }

    formData.append('status', payload.status || 'active');
    formData.append('is_featured', payload.is_featured ? '1' : '0');
    if (payload.imam) formData.append('imam', payload.imam);
    if (payload.khatib) formData.append('khatib', payload.khatib);
    if (payload.manager_id) formData.append('manager_id', String(Number(payload.manager_id)));
    if (payload.address) formData.append('address', payload.address);
    if (isFile) formData.append('image', payload.image as File);

    console.log("POST /api/mosques (FormData) — fields:", {
      name: payload.name,
      city_id: payload.city_id,
      district_id: payload.district_id,
      status: payload.status,
      working_hours: payload.working_hours,
      hasImage: isFile,
    });

    const response = await fetch(`${BASE_URL}/mosques`, {
      method: "POST",
      headers: this.getAuthHeaders(true), // multipart, no Content-Type
      body: formData,
    });

    const json = await response.json().catch(() => null);
    console.log("POST /api/mosques Response:", json);

    if (response.ok && json && json.status !== false) {
      return this.formatMosque(json.data || json);
    }

    // Build human-readable error message
    let errMsg = json?.message || `فشل إضافة المسجد (HTTP ${response.status})`;
    const createValidationErrors = json?.errors || (json?.status === false && json?.data && typeof json.data === 'object' && !Array.isArray(json.data) ? json.data : null);
    if (createValidationErrors) {
      const detailed = Object.entries(createValidationErrors)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join(' | ');
      errMsg = `${errMsg} — [${detailed}]`;
    }

    // Attach the raw server response to the error for the debug inspector
    const err = new Error(errMsg) as any;
    err.validationErrors = createValidationErrors;
    err.serverResponse = json;
    throw err;
  }

  // ── 6. updateMosque (PUT /api/mosques/{id}) ───────────────────────
  async updateMosque(id: string | number, payload: UpdateMosquePayload): Promise<MosqueDetail> {
    const formData = new FormData();
    formData.append('_method', 'PUT');

    if (payload.name) formData.append('name', String(payload.name).trim());
    
    // Send working_hours as string
    if (payload.working_hours !== undefined) {
      formData.append('working_hours', String(payload.working_hours).trim());
    }

    if (payload.imam !== undefined && payload.imam !== null) formData.append('imam', String(payload.imam).trim());
    if (payload.khatib !== undefined && payload.khatib !== null) formData.append('khatib', String(payload.khatib).trim());
    if (payload.status) formData.append('status', String(payload.status));
    if (payload.is_featured !== undefined) formData.append('is_featured', payload.is_featured ? '1' : '0');
    if (payload.city_id) formData.append('city_id', String(payload.city_id));
    if (payload.district_id) formData.append('district_id', String(payload.district_id));
    if (payload.latitude !== undefined && payload.latitude !== '') formData.append('latitude', String(payload.latitude));
    if (payload.longitude !== undefined && payload.longitude !== '') formData.append('longitude', String(payload.longitude));
    if (payload.manager_id) formData.append('manager_id', String(payload.manager_id));
    if (payload.address) formData.append('address', String(payload.address).trim());

    if (payload.image instanceof File) {
      formData.append('image', payload.image);
    }

    const response = await fetch(`${BASE_URL}/mosques/${id}`, {
      method: "POST", // Laravel POST with _method=PUT to handle multipart FormData
      headers: this.getAuthHeaders(true),
      body: formData,
    });

    const json = await response.json().catch(() => null);
    console.log(`PUT /api/mosques/${id} Response:`, json);

    if (response.ok && json && json.status !== false) {
      return this.formatMosque(json.data || json);
    }

    let errMsg = json?.message || `فشل تعديل المسجد #${id} (رمز الخطأ: ${response.status})`;
    const validationErrors = json?.errors || (json?.status === false && json?.data && typeof json.data === 'object' && !Array.isArray(json.data) ? json.data : null);
    if (validationErrors) {
      const detailed = Object.entries(validationErrors)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join(' | ');
      errMsg = `${errMsg} — [${detailed}]`;
    }

    const err: any = new Error(errMsg);
    err.validationErrors = validationErrors;
    err.serverResponse = json;
    throw err;
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
  async getGeoCatalog(): Promise<GeoGovernorate[]> {

    try {
      const response = await fetch(`${BASE_URL}/geo`, {
        method: "GET",
        headers: this.getAuthHeaders(false),
      });

      const json = await response.json().catch(() => null);
      console.log("GET /api/geo Response:", json);
      if (response.ok && json && json.status !== false && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (e) {
      console.warn("Error fetching geo catalog from API, using fallback:", e);
    }
    return DEFAULT_GEO_CATALOG;
  }
}


