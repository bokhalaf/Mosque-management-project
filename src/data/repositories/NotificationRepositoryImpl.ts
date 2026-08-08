// ==============================
// Data — NotificationRepositoryImpl
// ==============================

import { AppNotification, NotificationStats } from "../../domain/entities/AppNotification";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app/api";
const STORAGE_KEY_NOTIFICATIONS = "app_notifications_unified_cache";

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    title: "تم قبول طلب الصيانة الطارئة",
    message: "تم الموافقة على طلب صيانة المكيفات بالقاعة الرئيسية، وفريق الصيانة متواجد في المسجد.",
    type: "maintenance",
    read_at: null,
    created_at: "قبل 10 دقائق",
    action_url: "/maintenance/tasks",
  },
  {
    id: 2,
    title: "تبرع جديد بقيمة 5,000 ريال",
    message: "تم استلام تبرع جديد لصالح مشروع ترميم المنارة من أحد المتبرعين الكرام.",
    type: "donation",
    read_at: null,
    created_at: "قبل ساعة واحدة",
    action_url: "/donations",
  },
  {
    id: 3,
    title: "اعتماد خطبة الجمعة القادمة",
    message: "تم اعتماد ومراجعة خطبة الجمعة بعنوان 'فضل العلم والعمل الصالح' بنجاح.",
    type: "sermon",
    read_at: "2026-08-08T10:00:00Z",
    created_at: "أمس، 04:30 م",
    action_url: "/sermons",
  },
  {
    id: 4,
    title: "دعوة تسجيل معلم جديدة",
    message: "تم إرسال دعوة التسجيل للمعلم عبد الله العتيبي وبانتظار استكمال بيانات الحساب.",
    type: "invitation",
    read_at: "2026-08-07T12:00:00Z",
    created_at: "06 أغسطس 2026",
    action_url: "/students",
  },
  {
    id: 5,
    title: "برنامج دعوي جديد: دورة التجويد",
    message: "تم إضافة دورة التجويد المتقدمة بنجاح إلى قائمة البرامج الدعوية بالمسجد.",
    type: "general",
    read_at: "2026-08-06T15:00:00Z",
    created_at: "05 أغسطس 2026",
    action_url: "/dawah",
  },
];

export class NotificationRepositoryImpl implements INotificationRepository {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private getLocalNotifications(): AppNotification[] {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
    return DEFAULT_NOTIFICATIONS;
  }

  private saveLocalNotifications(items: AppNotification[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(items));
    }
  }

  async getNotifications(): Promise<AppNotification[]> {
    let apiItems: AppNotification[] = [];
    let fetchSuccess = false;

    try {
      const res = await fetch(`${BASE_URL}/common/notifications`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status && Array.isArray(json.data)) {
          fetchSuccess = true;
          apiItems = json.data.map((item: any) => ({
            id: item.id,
            title: item.title || item.data?.title || "إشعار جديد",
            message: item.message || item.data?.message || item.body || "",
            type: item.type || "system",
            read_at: item.read_at || null,
            created_at: item.created_at || new Date().toLocaleTimeString('ar-SA'),
            action_url: item.action_url || item.data?.action_url || "/notifications",
          }));
        }
      }
    } catch (e) {
      console.warn("API getNotifications failed, using fallback:", e);
    }

    const localList = this.getLocalNotifications();
    const map = new Map<string | number, AppNotification>();
    localList.forEach(n => map.set(n.id, n));
    apiItems.forEach(n => map.set(n.id, n));

    const merged = Array.from(map.values());
    this.saveLocalNotifications(merged);
    return merged;
  }

  async markAsRead(id: number | string): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/common/notifications/${id}/read`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
    } catch (e) {
      console.warn("API markAsRead failed:", e);
    }

    const local = this.getLocalNotifications();
    const item = local.find(n => String(n.id) === String(id));
    if (item) {
      item.read_at = new Date().toISOString();
      this.saveLocalNotifications(local);
    }
    return true;
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/common/notifications/read-all`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
    } catch (e) {
      console.warn("API markAllAsRead failed:", e);
    }

    const local = this.getLocalNotifications();
    const now = new Date().toISOString();
    local.forEach(n => { n.read_at = n.read_at || now; });
    this.saveLocalNotifications(local);
    return true;
  }

  async deleteNotification(id: number | string): Promise<boolean> {
    try {
      await fetch(`${BASE_URL}/common/notifications/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
    } catch (e) {
      console.warn("API deleteNotification failed:", e);
    }

    const local = this.getLocalNotifications();
    const filtered = local.filter(n => String(n.id) !== String(id));
    this.saveLocalNotifications(filtered);
    return true;
  }

  async getStats(): Promise<NotificationStats> {
    const list = await this.getNotifications();
    const unread = list.filter(n => !n.read_at).length;
    return {
      unread_count: unread,
      total_count: list.length,
    };
  }
}
