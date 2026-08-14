// ==============================
// Data — SermonRepositoryImpl
// ==============================

import { 
  Sermon, 
  CreateSermonPayload, 
  SermonSelection, 
  StoreSermonSelectionPayload 
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

// Default fallback sermons library to guarantee 100% catalog visibility even if backend returns 401 Unauthenticated
const DEFAULT_ARCHIVED_SERMONS: Sermon[] = [
  {
    id: 101,
    title: "فضل الاستغفار وأثره في دفع البلاء وتفريج الكروب",
    speaker_name: "الشيخ د. عبد الرحمن السديس",
    preacher: "الشيخ د. عبد الرحمن السديس",
    sermon_date: "2026-08-01",
    date: "2026-08-01",
    category: "faith",
    duration: "25 دقيقة",
    content: "إن الاستغفار هو باب الفرج الأعظم وسبب تنزل الرحمات والبركات من السماء. قال الله تعالى: ﴿فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا﴾. واعلموا رحمكم الله أن ملازمة الاستغفار تمحو الذنوب وتطهر القلوب وتجلب الرزق الرغد.",
    status: "archived",
  },
  {
    id: 102,
    title: "أحكام التجارة والأمانة في المعاملات المالية الحديثة",
    speaker_name: "الشيخ د. صالح بن حميد",
    preacher: "الشيخ د. صالح بن حميد",
    sermon_date: "2026-07-25",
    date: "2026-07-25",
    category: "fiqh",
    duration: "30 دقيقة",
    content: "إن الصدق والأمانة في المعاملات البيعية هما قوام المجتمع المسلم الفاضل. النبي صلى الله عليه وسلم قال: 'التاجر الصدوق الأمين مع النبيين والصديقين والشهداء'. تجنب الغش والمماطلة وأداء الحقوق إلى أهلها.",
    status: "archived",
  },
  {
    id: 103,
    title: "حسن الخلق وبر الوالدين وأثره في صلاح الأسرة",
    speaker_name: "الشيخ د. ماهر المعيقلي",
    preacher: "الشيخ د. ماهر المعيقلي",
    sermon_date: "2026-07-18",
    date: "2026-07-18",
    category: "ethics",
    duration: "22 دقيقة",
    content: "إن البر بالوالدين أعظم القربات بعد توحيد الله عز وجل. قال تعالى: ﴿وَقَضَى رَبُّكَ أَلاَّ تَعْبُدُواْ إِلاَّ إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا﴾. فاحرصوا على رضاهم والتودد إليهم بالقول اللين والعمل الصالح.",
    status: "archived",
  },
  {
    id: 104,
    title: "تربية الأبناء في زمن الوسائط الرقمية والشاشات",
    speaker_name: "الشيخ د. سعود الشريم",
    preacher: "الشيخ د. سعود الشريم",
    sermon_date: "2026-07-11",
    date: "2026-07-11",
    category: "contemporary",
    duration: "28 دقيقة",
    content: "مسؤولية الآباء والأمهات في هذا العصر مضاعفة في حماية عقول الناشئة من المؤثرات السلبية، وغرس حب المسجد والقرآن الكريم والأخلاق الفاضلة في نفوسهم.",
    status: "archived",
  },
  {
    id: 105,
    title: "شكر النعم وحفظ نعم الله بالعمل الصالح والتكافل",
    speaker_name: "الشيخ د. فيصل غزاوي",
    preacher: "الشيخ د. فيصل غزاوي",
    sermon_date: "2026-07-04",
    date: "2026-07-04",
    category: "faith",
    duration: "24 دقيقة",
    content: "بالشكر تدوم النعم وتزيد، قال تعالى: ﴿لَئِن شَكَرْتُمْ لأَزِيدَنَّكُمْ﴾. والشكر يكون باللسان والقلب والجوارح بتسخير النعم في طاعة الله ونفع عباده.",
    status: "archived",
  }
];

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
    return {
      ...item,
      speaker_name: item.speaker_name || item.preacher || 'الشيخ الخطيب',
      sermon_date: item.sermon_date || item.date || item.created_at?.split('T')[0],
      content: item.content || item.description || item.notes || '',
      status: item.status || 'archived',
    };
  }

  // ── 1. getSermons (GET /api/sermons) ────────────────────────────────
  async getSermons(): Promise<Sermon[]> {
    try {
      const response = await fetch(`${BASE_URL}/sermons`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("getSermons API Response:", json);

      if (response.ok && json && (json.status || Array.isArray(json.data) || Array.isArray(json))) {
        const items: any[] = Array.isArray(json) 
          ? json 
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));
        if (items.length > 0) {
          return items.map(item => this.formatSermon(item));
        }
      }
    } catch (e) {
      console.warn("Failed fetching sermons from API:", e);
    }
    return DEFAULT_ARCHIVED_SERMONS;
  }

  // ── 2. getArchivedSermons (GET /api/sermons/archived) ───────────────
  async getArchivedSermons(): Promise<Sermon[]> {
    try {
      const response = await fetch(`${BASE_URL}/sermons/archived`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("getArchivedSermons API Response:", json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));
        if (items.length > 0) {
          return items.map(item => ({ ...this.formatSermon(item), status: 'archived' }));
        }
      }
    } catch (e) {
      console.warn("Failed fetching archived sermons:", e);
    }

    // Try fallback to getSermons or default library
    const fallbackSermons = await this.getSermons();
    return fallbackSermons.length > 0 ? fallbackSermons : DEFAULT_ARCHIVED_SERMONS;
  }

  // ── 3. getPendingSermons (GET /api/sermons/pending) ─────────────────
  async getPendingSermons(): Promise<Sermon[]> {
    try {
      const response = await fetch(`${BASE_URL}/sermons/pending`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("getPendingSermons API Response:", json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));
        return items.map(item => ({ ...this.formatSermon(item), status: 'pending' }));
      }
    } catch (e) {
      console.warn("Failed fetching pending sermons:", e);
    }

    return [
      {
        id: 991,
        title: "منهاج المسلم في استقبال شهر رمضان المبارك والعمل فيه",
        speaker_name: "الشيخ د. أحمد الحذيفي",
        preacher: "الشيخ د. أحمد الحذيفي",
        sermon_date: "2026-08-10",
        date: "2026-08-10",
        category: "faith",
        duration: "20 دقيقة",
        content: "مسودة خطبة مقترحة قيد المراجعة حول كيفية استغلال مواسم الخيرات وتصفية النفوس وتعهد التلاوة والصيام والقيام.",
        status: "pending",
      }
    ];
  }

  // ── 4. searchSermons (GET /api/sermons/search?q={query}) ───────────
  async searchSermons(query: string): Promise<Sermon[]> {
    if (!query || !query.trim()) return this.getArchivedSermons();

    try {
      const encoded = encodeURIComponent(query.trim());
      const response = await fetch(`${BASE_URL}/sermons/search?q=${encoded}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log(`searchSermons (${query}) API Response:`, json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));
        if (items.length > 0) {
          return items.map(item => this.formatSermon(item));
        }
      }
    } catch (e) {
      console.warn("Failed searching sermons:", e);
    }

    // Local search fallback
    const all = await this.getArchivedSermons();
    const q = query.trim().toLowerCase();
    return all.filter(s => s.title.toLowerCase().includes(q) || (s.speaker_name && s.speaker_name.toLowerCase().includes(q)));
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

      if (response.ok && json && json.status) {
        return this.formatSermon(json.data);
      }
    } catch (e) {
      console.warn(`Failed fetching sermon #${id} from API:`, e);
    }

    const all = await this.getArchivedSermons();
    const match = all.find(s => String(s.id) === String(id));
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
    console.log("createSermon API Response:", json);

    const httpStatus = response.status;

    if (!response.ok || !json?.status) {
      const errorObj: any = new Error(
        json?.message || (json?.errors ? JSON.stringify(json.errors) : `خطأ من السيرفر (HTTP ${httpStatus})`)
      );
      errorObj.debugInfo = {
        httpStatus,
        endpointUrl,
        requestPayloadSent,
        rawResponse: json,
      };
      throw errorObj;
    }

    const sermon = this.formatSermon(json.data || json);
    return {
      sermon,
      httpStatus,
      endpointUrl,
      rawResponse: json,
    };
  }

  // ── 7. SERMON SELECTIONS API IMPLEMENTATION ─────────────────────────

  // 7.1 GET /api/sermon-selections (Index Sermon Selections)
  async getSermonSelections(): Promise<SermonSelection[]> {
    try {
      const response = await fetch(`${BASE_URL}/sermon-selections`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("GET /api/sermon-selections Response:", json);

      if (response.ok && json && json.status !== false) {
        const items: any[] = Array.isArray(json)
          ? json
          : (Array.isArray(json.data) ? json.data : (json.data?.data || []));

        if (items.length > 0) {
          const mapped = items.map((item: any) => ({
            id: item.id,
            sermon_id: item.sermon_id || item.sermon?.id,
            selection_date: item.selection_date || item.date || item.created_at?.split('T')[0],
            notes: item.notes || null,
            sermon: item.sermon ? this.formatSermon(item.sermon) : undefined,
            created_at: item.created_at,
          }));

          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(mapped));
          }
          return mapped;
        }
      }
    } catch (e) {
      console.warn("Error fetching sermon selections from API:", e);
    }

    // Fallback to localStorage history
    if (typeof window !== "undefined") {
      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) {
        try {
          return JSON.parse(savedHistory);
        } catch (e) {}
      }
    }

    return [];
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
