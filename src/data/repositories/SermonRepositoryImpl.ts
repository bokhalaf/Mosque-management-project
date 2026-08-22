// ==============================
// Data — SermonRepositoryImpl
// ==============================

import { 
  Sermon, 
  CreateSermonPayload, 
  SermonSelection, 
  StoreSermonSelectionPayload,
  PaginatedSermons
} from "../../domain/entities/Sermon";
import { ISermonRepository } from "../../domain/repositories/ISermonRepository";

export const BASE_URL = "https://mms-backend-rose.vercel.app/api";

const STORAGE_KEY_UPCOMING = "selected_friday_sermon_persistent";
const STORAGE_KEY_HISTORY = "sermon_selections_history_persistent";

export interface SermonCreateApiResponse {
  sermon: Sermon;
  httpStatus: number;
  endpointUrl: string;
  rawResponse: any;
}

const MOCK_ARCHIVED_SERMONS: Sermon[] = [
  { id: 101, title: "أهمية الصدق في المعاملات والتجارة", speaker_name: "د. عبد الله الصالح", sermon_date: "2026-05-10", category: "ethics", content: "إن الصدق من أعظم الأخلاق التي حث عليها الإسلام في القرآن الكريم والسنة النبوية الشريفة، ويمتد أثره الصالح على الأفراد والمجتمعات.", status: "archived" },
  { id: 102, title: "فضل بر الوالدين وأثره في نماء العمر والبركة", speaker_name: "الشيخ محمد العلي", sermon_date: "2026-05-03", category: "faith", content: "بر الوالدين باب من أبواب الجنة العظيمة، وطاعتهما مقرونة بالطاعة لله تعالى في محكم التنزيل.", status: "archived" },
  { id: 103, title: "حقوق الجار والأخوة في الإسلام", speaker_name: "الشيخ إبراهيم الخالد", sermon_date: "2026-04-26", category: "ethics", content: "ما زال جبريل يوصي بالنبي عليه الصلاة والسلام بالجار حتى ظن أنه سيعرثه، لحرمة الجار وعظيم حقه.", status: "archived" },
  { id: 104, title: "أهمية الوقت وإدارته في حياة المسلم", speaker_name: "د. سلمان الفايز", sermon_date: "2026-04-19", category: "contemporary", content: "الوقت هو الحياة، والانشغال بما ينفع في الدنيا والآخرة هو هدي النبي صلى الله عليه وسلم.", status: "archived" },
  { id: 105, title: "الاعتصام بحبل الله والتكاتف المجتمعي", speaker_name: "الشيخ عثمان الحامد", sermon_date: "2026-04-12", category: "faith", content: "إن الأمة الإسلامية كالبنيان المرصوص يشد بعضه بعضاً في السراء والضراء.", status: "archived" },
  { id: 106, title: "أحكام الزكاة والصدقات وأثرها في تطهير المال", speaker_name: "د. سعد الشثري", sermon_date: "2026-04-05", category: "fiqh", content: "الزكاة ركن حصين من أركان الإسلام، تطهر الأموال وتزكي النفوس وتواسي الفقراء.", status: "archived" },
  { id: 107, title: "التوكل على الله وأسبابه في تيسير الرزق", speaker_name: "الشيخ حمد المبارك", sermon_date: "2026-03-29", category: "faith", content: "من يتوكل على الله فهو حسبه، والتوكل يجمع بين الأخذ بالأسباب والصحيح والاعتماد على المسبب سبحانه.", status: "archived" },
  { id: 108, title: "أثر الصلاة في تهذيب النفس والسلوك", speaker_name: "الشيخ صالح السدلان", sermon_date: "2026-03-22", category: "faith", content: "إن الصلاة تنهى عن الفحشاء والمنكر، وهي عمود الدين والصلة المباشرة بين العبد وربه.", status: "archived" },
  { id: 109, title: "تربية الأبناء على القيم الأخلاقية والإسلامية", speaker_name: "د. عمر الراشد", sermon_date: "2026-03-15", category: "ethics", content: "الناشئة هم أمل الأمة ومستقبلها، وتربيتهم على القواعد الإيمانية الصحيحة واجب الآباء والأمهات.", status: "archived" },
  { id: 110, title: "فضل تلاوة القرآن الكريم وتدبر آياته", speaker_name: "الشيخ فهد الدوسري", sermon_date: "2026-03-08", category: "faith", content: "خيركم من تعلم القرآن وعلمه، وقراءة القرآن بركة وطمأنينة للقلوب والبيوت.", status: "archived" },
  { id: 111, title: "أحكام الصيام والقيام في شهر رمضان المبارك", speaker_name: "د. أحمد النفيس", sermon_date: "2026-03-01", category: "occasions", content: "موسم الخيرات والرحمات، ومضاعفة الأجور بالصيام والقيام والصدقات.", status: "archived" },
  { id: 112, title: "التسامح والعفو وأثرهما في نشر السلام النفسي", speaker_name: "الشيخ خالد الخليفي", sermon_date: "2026-02-22", category: "ethics", content: "فمن عفا وأصلح فأجره على الله، والسلام الداخلي ينبع من طهارة القلب ونقاء الصدر.", status: "archived" },
];

let MOCK_PENDING_SERMONS: Sermon[] = [
  { id: 201, title: "أهمية التراحم والتعاطف في المجتمع", speaker_name: "الشيخ بدر المطيري", sermon_date: "2026-05-15", category: "ethics", content: "التراحم بين أفراد المجتمع يعزز المحبة والتكافل الإنساني ويدعم الضعفاء والمحتاجين.", status: "pending" },
  { id: 202, title: "فضل ذكر الله وأثره في طمأنينة القلوب", speaker_name: "د. عبد العزيز التميمي", sermon_date: "2026-05-14", category: "faith", content: "ألا بذكر الله تطمئن القلوب، والذكر الحكيم يجلب السكينة ويدفع الهموم والغموم.", status: "pending" },
  { id: 203, title: "الوفاء بالعهود والأمانات في المعاملات", speaker_name: "الشيخ خالد القحطاني", sermon_date: "2026-05-12", category: "ethics", content: "الأمانة خلق كريم والوفاء بالعهد من صفات المؤمنين الصادقين في دينهم ودنياهم.", status: "pending" },
  { id: 204, title: "أهمية طلب العلم وتزكية النفوس", speaker_name: "د. يوسف الشمري", sermon_date: "2026-05-11", category: "faith", content: "يرفع الله الذين آمنوا منكم والذين أوتوا العلم درجات، والعلم النافع يزكي الروح والعمل.", status: "pending" },
  { id: 205, title: "الحث على العمل الكسب الحلال", speaker_name: "الشيخ ناصر الزهراني", sermon_date: "2026-05-10", category: "contemporary", content: "الكسب الحلال بركة في الرزق وطهارة للجسد وإجابة للدعوات.", status: "pending" },
  { id: 206, title: "صيانة اللسان وحفظ الجوارح عن الحرام", speaker_name: "الشيخ سلطان العتيبي", sermon_date: "2026-05-09", category: "ethics", content: "من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت، وحفظ اللسان سلامة للدين والدنيا.", status: "pending" },
  { id: 207, title: "أحكام الطهارة والصلاة في السفر", speaker_name: "د. ماجد الغامدي", sermon_date: "2026-05-08", category: "fiqh", content: "تيسيرات الشريعة الإسلامية في السفر والمواقف الاستثنائية رحمة بالعباد.", status: "pending" },
  { id: 208, title: "أثر الاستغفار والتدبر في كشف الكرب", speaker_name: "الشيخ راشد الخاطر", sermon_date: "2026-05-07", category: "faith", content: "من لزم الاستغفار جعل الله له من كل ضيق مخرجاً ومن كل هم فرجاً ورزقه من حيث لا يحتسب.", status: "pending" },
];

const processedSermonIds = new Set<string | number>();

export class SermonRepositoryImpl implements ISermonRepository {

  private getAuthHeaders(isFormData: boolean = false): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Helper to map API sermon format safely
  private formatSermon(item: any): Sermon {
    const rawStatus = item.status || (item.is_pending ? 'pending' : (item.is_approved ? 'approved' : 'archived'));
    return {
      ...item,
      speaker_name: item.speaker_name || item.preacher || 'الشيخ الخطيب',
      sermon_date: item.sermon_date || item.date || item.created_at?.split('T')[0],
      content: item.content || item.description || item.notes || '',
      status: rawStatus,
    };
  }

  private buildPaginatedResult(items: Sermon[], page: number = 1, limit: number = 6, serverPagination?: any): PaginatedSermons {
    // If backend returns a valid pagination object (e.g. json.pagination)
    if (serverPagination && typeof serverPagination === 'object' && !Array.isArray(serverPagination)) {
      const totalItems = serverPagination.totalItems ?? serverPagination.total ?? serverPagination.total_items ?? items.length;
      const totalPages = serverPagination.totalPages ?? serverPagination.last_page ?? serverPagination.total_pages ?? Math.max(1, Math.ceil(totalItems / limit));
      const currentPage = serverPagination.currentPage ?? serverPagination.current_page ?? page;
      const itemsPerPage = serverPagination.itemsPerPage ?? serverPagination.per_page ?? serverPagination.limit ?? limit;

      return {
        data: items, // Server already sliced data to requested page and limit
        pagination: {
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
        },
      };
    }

    // Local slicing fallback (when offline or mock data)
    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const currentPage = Math.min(totalPages, Math.max(1, page));
    const startIndex = (currentPage - 1) * limit;
    const sliced = items.slice(startIndex, startIndex + limit);

    return {
      data: sliced,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  // ── 1. getSermons (GET /api/sermons) ────────────────────────────────
  async getSermons(page: number = 1, limit: number = 6): Promise<PaginatedSermons> {
    try {
      const response = await fetch(`${BASE_URL}/sermons?page=${page}&per_page=${limit}&limit=${limit}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("getSermons API Response:", json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json) 
          ? json 
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));
        const formatted = items.map(item => this.formatSermon(item));
        return this.buildPaginatedResult(formatted, page, limit, json.pagination || json.meta);
      }
    } catch (e) {
      console.warn("Failed fetching sermons from API:", e);
    }
    return this.buildPaginatedResult(MOCK_ARCHIVED_SERMONS, page, limit);
  }

  // ── 2. getArchivedSermons (GET /api/sermons/archived) ───────────────
  async getArchivedSermons(page: number = 1, limit: number = 6): Promise<PaginatedSermons> {
    try {
      const response = await fetch(`${BASE_URL}/sermons/archived?page=${page}&per_page=${limit}&limit=${limit}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("getArchivedSermons API Response:", json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));
        const formatted = items.map(item => ({ ...this.formatSermon(item), status: 'archived' }));
        return this.buildPaginatedResult(formatted, page, limit, json.pagination || json.meta);
      }
    } catch (e) {
      console.warn("Failed fetching archived sermons:", e);
    }

    return this.buildPaginatedResult(MOCK_ARCHIVED_SERMONS, page, limit);
  }

  // ── 3. getPendingSermons (GET /api/sermons/pending) ─────────────────
  async getPendingSermons(page: number = 1, limit: number = 6): Promise<PaginatedSermons> {
    try {
      const response = await fetch(`${BASE_URL}/sermons/pending?page=${page}&per_page=${limit}&limit=${limit}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("getPendingSermons API Response:", json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));
        const formatted = items.map(item => ({ ...this.formatSermon(item), status: 'pending' }));
        return this.buildPaginatedResult(formatted, page, limit, json.pagination || json.meta);
      }
    } catch (e) {
      console.warn("Failed fetching pending sermons:", e);
    }

    return this.buildPaginatedResult(MOCK_PENDING_SERMONS, page, limit);
  }

  // ── 4. searchSermons (GET /api/sermons/search) ───────────────────────
  async searchSermons(query?: string, page: number = 1, limit: number = 6, category?: string): Promise<PaginatedSermons> {
    const hasQuery = query && query.trim();
    const hasCategory = category && category !== 'all';

    if (!hasQuery && !hasCategory) return this.getArchivedSermons(page, limit);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('per_page', String(limit));
      queryParams.append('limit', String(limit));

      if (hasQuery) {
        queryParams.append('keyword', query.trim());
      }
      if (hasCategory) {
        queryParams.append('category', category);
      }

      const response = await fetch(`${BASE_URL}/sermons/search?${queryParams.toString()}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log(`searchSermons (${query}, cat=${category}) API Response:`, json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));
        if (items.length > 0) {
          const formatted = items.map(item => this.formatSermon(item));
          return this.buildPaginatedResult(formatted, page, limit, json.pagination || json.meta);
        }
      }
    } catch (e) {
      console.warn("Failed searching sermons:", e);
    }

    // Local search fallback
    const q = hasQuery ? query.trim().toLowerCase() : '';
    const filtered = MOCK_ARCHIVED_SERMONS.filter(s => {
      if (hasCategory && s.category !== category) return false;
      if (hasQuery) {
        return (
          s.title.toLowerCase().includes(q) ||
          (s.speaker_name && s.speaker_name.toLowerCase().includes(q))
        );
      }
      return true;
    });
    return this.buildPaginatedResult(filtered, page, limit);
  }

  // ── 5. getSermonById (GET /api/sermons/{id}) ─────────────────────────
  async getSermonById(id: string | number): Promise<Sermon> {
    try {
      const response = await fetch(`${BASE_URL}/sermons/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("getSermonById API Response:", json);

      if (response.ok && json) {
        // Handle both wrapped response {status, data} and direct object
        const sermonData = (json.data && typeof json.data === 'object' && json.data.id) ? json.data : json;
        if (sermonData && sermonData.id) {
          return this.formatSermon(sermonData);
        }
      }
    } catch (e) {
      console.warn(`Failed fetching sermon #${id} from API:`, e);
    }

    // 1. Check pending sermons list
    const pending = await this.getPendingSermons(1, 100);
    const matchPending = pending.data.find(s => String(s.id) === String(id));
    if (matchPending) return { ...matchPending, status: 'pending' };

    // 2. Check archived sermons list
    const all = await this.getArchivedSermons(1, 100);
    const match = all.data.find(s => String(s.id) === String(id));
    if (match) return match;

    throw new Error(`فشل جلب تفاصيل الخطبة #${id}`);
  }

  // ── 6. createSermon (POST /api/sermons) ─────────────────────────────
  async createSermon(payload: CreateSermonPayload): Promise<Sermon> {
    const resDebug = await this.createSermonWithDebug(payload);
    return resDebug.sermon;
  }

  async createSermonWithDebug(payload: CreateSermonPayload): Promise<SermonCreateApiResponse> {
    const todayStr = new Date().toISOString().split('T')[0];
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const endpointUrl = `${BASE_URL}/sermons`;

    let response: Response;
    let requestPayloadSent: any;

    if (payload.attachments && payload.attachments.length > 0) {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("content", payload.content);
      formData.append("speaker_name", payload.speaker_name);
      formData.append("sermon_date", payload.sermon_date || todayStr);
      if (payload.category) formData.append("category", payload.category);

      payload.attachments.forEach(file => {
        formData.append("attachments[]", file, file.name);
      });

      requestPayloadSent = {
        title: payload.title,
        speaker_name: payload.speaker_name,
        sermon_date: payload.sermon_date || todayStr,
        contentLength: payload.content.length,
        attachmentsCount: payload.attachments.length
      };

      response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
    } else {
      const jsonBody = {
        title: payload.title,
        content: payload.content,
        speaker_name: payload.speaker_name,
        sermon_date: payload.sermon_date || todayStr,
        category: payload.category || undefined,
      };

      requestPayloadSent = jsonBody;

      response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(jsonBody),
      });
    }

    const json = await response.json().catch(() => null);
    console.log("POST /api/sermons Response:", json);

    if (response.ok && json && json.status !== false) {
      const sermonObj = this.formatSermon(json.data || json);
      return {
        sermon: sermonObj,
        httpStatus: response.status,
        endpointUrl,
        rawResponse: json,
      };
    }

    const errorMsg = json?.message || `فشل تقديم الخطبة للسيرفر (HTTP ${response.status})`;
    const errorObj: any = new Error(errorMsg);
    errorObj.debugInfo = {
      httpStatus: response.status,
      endpointUrl,
      requestPayloadSent,
      rawResponse: json || { message: errorMsg },
    };
    throw errorObj;
  }

  // ── 6.1 deleteSermon (DELETE /api/sermons/{id}) ─────────────────────
  async deleteSermon(id: string | number): Promise<void> {
    processedSermonIds.add(id);
    processedSermonIds.add(String(id));
    MOCK_PENDING_SERMONS = MOCK_PENDING_SERMONS.filter(s => String(s.id) !== String(id));
    try {
      const response = await fetch(`${BASE_URL}/sermons/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(false),
      });

      const json = await response.json().catch(() => null);
      console.log(`DELETE /api/sermons/${id} Response:`, json);

      if (!response.ok && response.status !== 404 && response.status !== 200 && response.status !== 204) {
        throw new Error(json?.message || `فشل حذف الخطبة #${id}`);
      }
    } catch (e: any) {
      console.warn(`Error deleting sermon #${id} from API:`, e);
      throw e;
    }
  }

  // ── 6.2 getMostSelectedSermons (GET /api/sermons/most-selected) ────
  async getMostSelectedSermons(): Promise<Sermon | Sermon[] | null> {
    const urlsToTry = [
      `${BASE_URL}/sermons/most-selected`,
      `${BASE_URL}/sermons/most_selected`,
      `${BASE_URL}/admin/sermons/most-selected`,
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
          const dataObj = json.data || json;
          if (Array.isArray(dataObj)) {
            if (dataObj.length > 0) {
              return dataObj.map(item => this.formatSermon(item));
            }
          } else if (dataObj && (dataObj.id || dataObj.title)) {
            return this.formatSermon(dataObj);
          }
        }
      } catch (e) {
        console.warn(`Failed fetching most selected sermons from ${url}:`, e);
      }
    }

    return null;
  }

  // ── 6.3 approveSermon (POST /api/sermons/{id}/approve) ──────────────
  async approveSermon(id: string | number): Promise<void> {
    const urlsToTry = [
      { url: `${BASE_URL}/sermons/${id}/approve`, method: "POST" },
      { url: `${BASE_URL}/sermons/${id}/approve`, method: "PUT" },
      { url: `${BASE_URL}/sermons/${id}/approve`, method: "PATCH" },
      { url: `${BASE_URL}/admin/sermons/${id}/approve`, method: "POST" },
      { url: `${BASE_URL}/sermons/approve/${id}`, method: "POST" },
    ];

    let lastError: string | null = null;
    for (const item of urlsToTry) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: this.getAuthHeaders(),
        });
        const json = await response.json().catch(() => null);
        console.log(`${item.method} ${item.url} Response:`, json);

        if (response.ok && json?.status !== false) {
          return;
        }
        if (json?.message) {
          lastError = json.message;
        }
      } catch (e: any) {
        console.warn(`Error calling approve endpoint ${item.url}:`, e);
        lastError = e.message;
      }
    }
  }

  // ── 6.4 rejectSermon (POST /api/sermons/{id}/reject) ────────────────
  async rejectSermon(id: string | number, reason?: string): Promise<void> {
    const notesValue = reason || 'يرجى مراجعة وتعديل الخطبة';
    const bodyData = JSON.stringify({
      notes: notesValue,
      reason: notesValue,
      rejection_reason: notesValue,
    });

    const urlsToTry = [
      { url: `${BASE_URL}/sermons/${id}/reject`, method: "POST" },
      { url: `${BASE_URL}/sermons/${id}/reject`, method: "PUT" },
      { url: `${BASE_URL}/sermons/${id}/reject`, method: "PATCH" },
      { url: `${BASE_URL}/admin/sermons/${id}/reject`, method: "POST" },
      { url: `${BASE_URL}/sermons/reject/${id}`, method: "POST" },
    ];

    let lastError: string | null = null;
    for (const item of urlsToTry) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: this.getAuthHeaders(),
          body: bodyData,
        });
        const json = await response.json().catch(() => null);
        console.log(`${item.method} ${item.url} Response:`, json);

        if (response.ok && json?.status !== false) {
          return;
        }
        if (json?.message) {
          lastError = json.message;
        }
      } catch (e: any) {
        console.warn(`Error calling reject endpoint ${item.url}:`, e);
        lastError = e.message;
      }
    }
  }


  // ── 7. Sermon Selections API ──────────────────────────────────────────
  
  // 7.1 GET /api/sermon-selections (Selections History)
  async getSermonSelections(params?: { from_date?: string; to_date?: string }): Promise<SermonSelection[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.from_date) queryParams.append('from_date', params.from_date);
      if (params?.to_date) queryParams.append('to_date', params.to_date);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const response = await fetch(`${BASE_URL}/sermon-selections${queryString}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("GET /api/sermon-selections Response:", json);

      let selectionsList: SermonSelection[] = [];

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

        if (items.length > 0) {
          selectionsList = items.map((item: any) => ({
            id: item.id,
            sermon_id: item.sermon_id || item.sermon?.id,
            selection_date: item.selection_date || item.date || item.created_at?.split('T')[0],
            notes: item.notes || null,
            sermon: item.sermon ? this.formatSermon(item.sermon) : undefined,
            created_at: item.created_at,
          }));

          if (typeof window !== "undefined" && !queryString) {
            localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(selectionsList));
          }
        }
      }

      if (selectionsList.length === 0 && typeof window !== "undefined") {
        const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
        if (savedHistory) {
          try {
            selectionsList = JSON.parse(savedHistory);
          } catch (e) {}
        }
      }

      // Filter by date range if provided
      if (params?.from_date || params?.to_date) {
        selectionsList = selectionsList.filter(item => {
          const itemDate = item.selection_date;
          if (!itemDate) return true;
          if (params.from_date && itemDate < params.from_date) return false;
          if (params.to_date && itemDate > params.to_date) return false;
          return true;
        });
      }

      return selectionsList;
    } catch (e) {
      console.warn("Error fetching sermon selections from API:", e);
      return [];
    }
  }

  // 7.2 GET /api/sermon-selections/upcoming (Upcoming Sermon Selection)
  async getUpcomingSermonSelection(): Promise<SermonSelection | null> {
    try {
      const response = await fetch(`${BASE_URL}/sermon-selections/upcoming`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("GET /api/sermon-selections/upcoming Response:", json);

      if (response.ok && json && json.status !== false) {
        const data = json.data || json;
        if (data && (data.id || data.sermon_id)) {
          const selection: SermonSelection = {
            id: data.id || Date.now(),
            sermon_id: data.sermon_id || data.sermon?.id,
            selection_date: data.selection_date || data.date || new Date().toISOString().split('T')[0],
            notes: data.notes || null,
            sermon: data.sermon ? this.formatSermon(data.sermon) : undefined,
            created_at: data.created_at,
          };
          
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_UPCOMING, JSON.stringify(selection));
          }
          return selection;
        }
      }
    } catch (e) {
      console.warn("Error fetching upcoming sermon selection:", e);
    }

    // Fallback to persistent localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_UPCOMING);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }

    return null;
  }

  // 7.3 POST /api/sermon-selections (Store Sermon Selection)
  async storeSermonSelection(payload: StoreSermonSelectionPayload): Promise<SermonSelection> {
    const todayStr = new Date().toISOString().split('T')[0];
    const bodyObj = {
      sermon_id: Number(payload.sermon_id),
      selection_date: payload.selection_date || todayStr,
      notes: payload.notes || undefined,
    };

    console.log("POST /api/sermon-selections Payload:", bodyObj);

    let createdSelection: SermonSelection | null = null;

    try {
      const response = await fetch(`${BASE_URL}/sermon-selections`, {
        method: "POST",
        headers: this.getAuthHeaders(false),
        body: JSON.stringify(bodyObj),
      });

      const json = await response.json().catch(() => null);
      console.log("POST /api/sermon-selections Response:", json);

      if (response.ok && json && json.status !== false) {
        const data = json.data || json;
        createdSelection = {
          id: data.id || Date.now(),
          sermon_id: payload.sermon_id,
          selection_date: payload.selection_date || todayStr,
          notes: payload.notes || null,
          sermon: data.sermon ? this.formatSermon(data.sermon) : undefined,
          created_at: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn("Error storing sermon selection on API:", e);
    }

    const fallbackSelection: SermonSelection = createdSelection || {
      id: Date.now(),
      sermon_id: payload.sermon_id,
      selection_date: payload.selection_date || todayStr,
      notes: payload.notes || null,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_UPCOMING, JSON.stringify(fallbackSelection));

      // Append to history list
      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      let historyList: SermonSelection[] = [];
      if (savedHistory) {
        try { historyList = JSON.parse(savedHistory); } catch (e) {}
      }
      historyList.unshift(fallbackSelection);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyList));
    }

    return fallbackSelection;
  }

  // 7.4 DELETE /api/sermon-selections/{id} (Delete Sermon Selection)
  async deleteSermonSelection(id: string | number): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/sermon-selections/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(false),
      });

      const json = await response.json().catch(() => null);
      console.log(`DELETE /api/sermon-selections/${id} Response:`, json);
    } catch (e) {
      console.warn(`Error deleting sermon selection #${id}:`, e);
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY_UPCOMING);

      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) {
        try {
          let historyList: SermonSelection[] = JSON.parse(savedHistory);
          historyList = historyList.filter(s => String(s.id) !== String(id));
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyList));
        } catch (e) {}
      }
    }
  }
}
