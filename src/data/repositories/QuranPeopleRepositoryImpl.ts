// ==============================
// Data — QuranPeopleRepositoryImpl
// ==============================

import { QuranPerson, SendInvitationPayload, QuranPeopleStats } from "../../domain/entities/QuranPeople";
import { IQuranPeopleRepository } from "../../domain/repositories/IQuranPeopleRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";

const STORAGE_KEY_PEOPLE = "quran_people_unified_cache";

// Initial seed data for Mosque Quran Circles Staff & Students
const INITIAL_PEOPLE: QuranPerson[] = [
  {
    id: 1,
    name: "الشيخ عبد الله بن محمد العتيبي",
    email: "a.alotaibi@mosque.com",
    phone: "0501234567",
    role: "teacher",
    circle_name: "حلقة الإمام الحصري للحفظ المكثف",
    status: "active",
    joined_date: "2025-01-15",
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "الأستاذ د. فهد بن عبد العزيز السلمان",
    email: "f.alsalman@mosque.com",
    phone: "0559876543",
    role: "halaqa_supervisor",
    circle_name: "إدارة مجمع حلقات المسجد الجامع",
    status: "active",
    joined_date: "2024-11-01",
    created_at: "2024-11-01T08:30:00Z",
  },
  {
    id: 3,
    name: "الطالب عبدالرحمن محمد الغامدي",
    email: "a.alghamdi@student.com",
    phone: "0561122334",
    role: "student",
    circle_name: "حلقة الشاطبي لإتقان التلاوة",
    status: "active",
    joined_date: "2025-02-10",
    created_at: "2025-02-10T14:20:00Z",
  },
  {
    id: 4,
    name: "الشيخ يوسف بن إبراهيم الحسون",
    email: "y.alhassoun@mosque.com",
    phone: "0543344556",
    role: "teacher",
    circle_name: "حلقة نافع المدني للجاليات",
    status: "active",
    joined_date: "2025-03-01",
    created_at: "2025-03-01T09:15:00Z",
  },
  {
    id: 5,
    name: "الطالب عمر خالد الدوسري",
    email: "o.aldossary@student.com",
    phone: "0507788990",
    role: "student",
    circle_name: "حلقة الإمام الحصري للحفظ المكثف",
    status: "active",
    joined_date: "2025-03-12",
    created_at: "2025-03-12T16:00:00Z",
  },
  {
    id: 6,
    name: "الشيخ د. خالد بن سليمان الدريس",
    email: "k.aldrees@mosque.com",
    phone: "0582233445",
    role: "halaqa_supervisor",
    circle_name: "إشراف الحلقة النموذجية المسائية",
    status: "pending_invitation",
    joined_date: "2026-08-01",
    created_at: "2026-08-01T11:00:00Z",
  }
];

export class QuranPeopleRepositoryImpl implements IQuranPeopleRepository {

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
      } catch (e) { }
    }
    return 1;
  }

  private getLocalPeople(): QuranPerson[] {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_PEOPLE);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) { }
      }
      localStorage.setItem(STORAGE_KEY_PEOPLE, JSON.stringify(INITIAL_PEOPLE));
    }
    return INITIAL_PEOPLE;
  }

  private saveLocalPeople(list: QuranPerson[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PEOPLE, JSON.stringify(list));
    }
  }

  // ── 1. getPeople (Students, Teachers, Managers) ─────────────────────
  async getPeople(params?: { role?: string; q?: string }): Promise<QuranPerson[]> {
    let apiPeople: QuranPerson[] = [];

    // 1. Try GET /api/students & GET /api/teachers endpoints
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        fetch(`${BASE_URL}/students`, { headers: this.getAuthHeaders() }).catch(() => null),
        fetch(`${BASE_URL}/teachers`, { headers: this.getAuthHeaders() }).catch(() => null),
      ]);

      if (studentsRes && studentsRes.ok) {
        const stJson = await studentsRes.json();
        const stItems = Array.isArray(stJson) ? stJson : (stJson.data || []);
        stItems.forEach((st: any) => {
          apiPeople.push({
            id: st.id || Date.now(),
            name: st.name || st.full_name || 'طالب',
            email: st.email || '',
            phone: st.phone || st.phone_number || '',
            role: 'student',
            circle_name: st.circle_name || 'حلقة القرآن',
            status: st.status || 'active',
            joined_date: st.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          });
        });
      }

      if (teachersRes && teachersRes.ok) {
        const tcJson = await teachersRes.json();
        const tcItems = Array.isArray(tcJson) ? tcJson : (tcJson.data || []);
        tcItems.forEach((tc: any) => {
          apiPeople.push({
            id: tc.id || Date.now(),
            name: tc.name || tc.full_name || 'معلم',
            email: tc.email || '',
            phone: tc.phone || tc.phone_number || '',
            role: tc.role || 'teacher',
            circle_name: tc.circle_name || 'حلقة الحفظ والتعليم',
            status: tc.status || 'active',
            joined_date: tc.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          });
        });
      }

    } catch (e) {
      console.warn("Error fetching people from API:", e);
    }

    // Merge with persistent local people list
    const localList = this.getLocalPeople();
    const mergedMap = new Map<string, QuranPerson>();

    localList.forEach(p => mergedMap.set(String(p.id), p));
    apiPeople.forEach(p => mergedMap.set(String(p.id), p));

    let result = Array.from(mergedMap.values());

    if (params?.role && params.role !== 'all') {
      result = result.filter(p => p.role === params.role);
    }

    if (params?.q && params.q.trim()) {
      const q = params.q.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        (p.circle_name && p.circle_name.toLowerCase().includes(q))
      );
    }

    return result;
  }

  // ── 2. getStats ─────────────────────────────────────────────────────
  async getStats(): Promise<QuranPeopleStats> {
    const people = await this.getPeople();
    return {
      total_students: people.filter(p => p.role === 'student').length,
      total_teachers: people.filter(p => p.role === 'teacher').length,
      total_supervisors: people.filter(p => p.role === 'halaqa_supervisor').length,
      pending_invitations: people.filter(p => p.status === 'pending_invitation').length,
    };
  }

  // ── 3. sendInvitation (POST /api/invitations/send) ──────────────────
  async sendInvitation(payload: SendInvitationPayload): Promise<{ success: boolean; message: string; invitation?: any }> {
    const mosqueId = payload.mosque_id || this.getMosqueId();

    const requestBody = {
      mosque_id: Number(mosqueId),
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      name: payload.name,
      notes: payload.notes || undefined,
    };

    console.log("POST /api/invitations/send Payload:", requestBody);

    let apiSuccess = false;
    let apiMessage = "تم إرسال دعوة التسجيل بنجاح";
    let apiResponse = null;

    try {
      const response = await fetch(`${BASE_URL}/invitations/send`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody),
      });

      const json = await response.json().catch(() => null);
      console.log("POST /api/invitations/send Response:", json);
      apiResponse = json;

      if (response.ok && (json?.status || json?.message)) {
        apiSuccess = true;
        apiMessage = json.message || "تم إرسال الدعوة بنجاح عبر السيرفر";
      } else if (json?.message) {
        apiMessage = json.message;
      }
    } catch (e: any) {
      console.warn("Error calling POST /api/invitations/send:", e);
    }

    // Add new invited person to local state
    const newPerson: QuranPerson = {
      id: Date.now(),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      circle_name: payload.role === 'halaqa_supervisor' ? 'إشراف الحلقات' : 'حلقة القرآن',
      status: 'pending_invitation',
      joined_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      notes: payload.notes,
      mosque_id: mosqueId,
    };

    const currentList = this.getLocalPeople();
    currentList.unshift(newPerson);
    this.saveLocalPeople(currentList);

    return {
      success: true,
      message: apiMessage,
      invitation: apiResponse || newPerson,
    };
  }

  // ── 4. resendInvitation ─────────────────────────────────────────────
  async resendInvitation(id: string | number): Promise<void> {
    const list = this.getLocalPeople();
    const target = list.find(p => String(p.id) === String(id));
    if (target) {
      await this.sendInvitation({
        mosque_id: target.mosque_id || this.getMosqueId(),
        email: target.email,
        phone: target.phone,
        role: target.role as 'teacher' | 'halaqa_supervisor',
        name: target.name,
      });
    }
  }
}
