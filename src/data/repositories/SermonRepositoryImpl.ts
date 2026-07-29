// ==============================
// Data — SermonRepositoryImpl
// ==============================

import { Sermon, CreateSermonPayload } from "../../domain/entities/Sermon";
import { ISermonRepository } from "../../domain/repositories/ISermonRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";

const localSermons: Sermon[] = [
  {
    id: '1',
    title: 'فضل الصدق وأثره في طمأنينة القلوب',
    speaker_name: 'الشيخ د. عبد الرحمن السديس',
    preacher: 'الشيخ د. عبد الرحمن السديس',
    category: 'ethics',
    sermon_date: '2026-07-31',
    date: '2026-07-31',
    duration: '24:15',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    content: 'الحمد لله الذي أقام السموات والأرضين بالعدل والحق. أما بعد:\nفإن الصدق يهدي إلى البر، وإن البر يهدي إلى الجنة. وما يزال الرجل يصدق ويتحرى الصدق حتى يكتب عند الله صديقاً.\n\nمحاور الخطبة:\n١. أهمية الصدق في التعاملات والعهود.\n٢. أثر الأمانة والشفافية في بناء المجتمع المسلم.\n٣. النماذج المشرقة من السيرة النبوية الشريفة.',
    status: 'Scheduled',
    isPublishedForFriday: true,
    notes: 'خطبة رئيسية معتمدة ليوم الجمعة القادم',
    created_at: '2026-07-20T08:00:00Z',
  },
  {
    id: '2',
    title: 'أحكام الطهارة وعمارة بيوت الله',
    speaker_name: 'الشيخ د. سعود الشريم',
    preacher: 'الشيخ د. سعود الشريم',
    category: 'fiqh',
    sermon_date: '2026-07-24',
    date: '2026-07-24',
    duration: '21:40',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    content: 'إن المساجد لله فلا تدعوا مع الله أحداً. حث الإسلام على النظافة والطهور وعمارة بيوت الله حساً ومعنى.\n\nالعناصر المفصلة:\n١. العناية بنظافة المصلى والساحات.\n٢. آداب دخول المسجد والخروج منه.\n٣. إكرام المصلين وتوفير الراحة لهم.',
    status: 'completed',
    isPublishedForFriday: false,
    created_at: '2026-07-15T09:30:00Z',
  },
  {
    id: '3',
    title: 'بر الوالدين وحقوق ذوي القربى',
    speaker_name: 'الشيخ د. ماهر المعيقلي',
    preacher: 'الشيخ د. ماهر المعيقلي',
    category: 'faith',
    sermon_date: '2026-07-17',
    date: '2026-07-17',
    duration: '19:50',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    content: 'وقضى ربك ألا تعبدوا إلا إياه وبالوالدين إحسانا. خفض الجناح للوالدين والإحسان إليهما في حياتهما وبعد مماتهما من أعظم القربات.',
    status: 'approved',
    isPublishedForFriday: false,
    created_at: '2026-07-10T10:00:00Z',
  },
];

export class SermonRepositoryImpl implements ISermonRepository {

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

      if (response.ok && json && (json.status || json.data)) {
        const apiData: Sermon[] = Array.isArray(json.data) ? json.data : (json.data?.data || []);
        
        // Merge API data with local items ensuring no duplicates
        const merged = [...apiData];
        localSermons.forEach(localItem => {
          if (!merged.some(i => String(i.id) === String(localItem.id))) {
            merged.push(localItem);
          }
        });
        return merged;
      }
    } catch (e) {
      console.error("Failed to fetch sermons from API:", e);
    }

    return localSermons;
  }

  // ── 2. getSermonById (GET /api/sermons/{id}) ─────────────────────────
  async getSermonById(id: string | number): Promise<Sermon> {
    // Check local list first
    const localMatch = localSermons.find(s => String(s.id) === String(id));
    if (localMatch) {
      return localMatch;
    }

    try {
      const response = await fetch(`${BASE_URL}/sermons/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const json = await response.json().catch(() => null);
      console.log("getSermonById API Response:", json);

      if (response.ok && json && json.data) {
        return json.data as Sermon;
      }
    } catch (e) {
      console.error(`Error fetching sermon ID ${id}:`, e);
    }

    throw new Error("الخطبة غير موجودة أو تعذر تحميل التفاصيل");
  }

  // ── 3. createSermon (POST /api/sermons) ─────────────────────────────
  async createSermon(payload: CreateSermonPayload): Promise<Sermon> {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("content", payload.content);
    formData.append("speaker_name", payload.speaker_name);
    formData.append("sermon_date", payload.sermon_date || new Date().toISOString().split('T')[0]);

    if (payload.attachments && payload.attachments.length > 0) {
      payload.attachments.forEach(file => {
        formData.append("attachments[]", file, file.name);
      });
    }

    console.log("Sending createSermon FormData:", {
      title: payload.title,
      speaker_name: payload.speaker_name,
      sermon_date: payload.sermon_date,
      contentLength: payload.content.length,
      attachmentsCount: payload.attachments?.length || 0
    });

    let apiSermon: Sermon | null = null;

    try {
      const response = await fetch(`${BASE_URL}/sermons`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: formData,
      });

      const json = await response.json().catch(() => null);
      console.log("createSermon API Response:", json);

      if (response.ok && json && json.data) {
        apiSermon = json.data as Sermon;
      } else if (json && json.errors) {
        const firstKey = Object.keys(json.errors)[0];
        const firstErr = Array.isArray(json.errors[firstKey]) ? json.errors[firstKey][0] : json.errors[firstKey];
        throw new Error(firstErr || json.message || "خطأ في بيانات الخطبة");
      }
    } catch (e: any) {
      console.warn("API createSermon failed or unauthenticated, saving locally:", e);
      if (e.message && e.message !== "Failed to fetch") {
        // rethrow validation errors
        throw e;
      }
    }

    // Create local item representation to guarantee instant UI rendering
    const newSermon: Sermon = apiSermon || {
      id: Date.now(),
      title: payload.title,
      speaker_name: payload.speaker_name,
      preacher: payload.speaker_name,
      sermon_date: payload.sermon_date || new Date().toISOString().split('T')[0],
      date: payload.sermon_date || new Date().toISOString().split('T')[0],
      content: payload.content,
      category: payload.category || 'ethics',
      status: payload.publishForFriday ? 'Scheduled' : 'pending',
      isPublishedForFriday: payload.publishForFriday || false,
      created_at: new Date().toISOString(),
    };

    // Unshift into localSermons
    localSermons.unshift(newSermon);

    return newSermon;
  }
}
