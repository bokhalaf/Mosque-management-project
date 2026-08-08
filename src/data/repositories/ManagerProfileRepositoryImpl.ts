// ==============================
// Data — ManagerProfileRepositoryImpl
// ==============================

import {
  ManagerProfile,
  UpdatePersonalProfilePayload,
  ChangePasswordPayload,
} from "../../domain/entities/ManagerProfile";
import { IManagerProfileRepository } from "../../domain/repositories/IManagerProfileRepository";

const STORAGE_KEY_PROFILE = "mosque_manager_profile_cache";

const DEFAULT_PROFILE: ManagerProfile = {
  // 1. Personal Identity
  avatar_url: "",
  full_name: "الشيخ د. فهد بن عبد العزيز السلمان",
  job_title: "مدير مسجد",
  phone: "0559876543",
  email: "f.alsalman@mosque.com",
  employee_id: "MNG-2026-882",
  national_id: "1098273645",
  language: "العربية (الرئيسية)",

  // 2. Associated Mosque Data
  mosque_id: 20,
  mosque_name: "مسجد الرحمة الجامع",
  mosque_image: "",
  city: "الرياض",
  district: "حي النزهة",
  address: "طريق الملك فهد - حي النزهة - الرياض",
  mosque_code: "MSQ-7049",
  mosque_status: "active",
  appointment_date: "2024-01-15",

  // 3. Account Security & Details
  username: "f_alsalman",
  created_at: "2024-01-10",
  last_login: "اليوم، 02:45 م (الرياض، المملكة العربية السعودية)",
  account_status: "active",
  verification_level: "verified",
  two_factor_enabled: true,

  // 4. Activity Log
  activities: [
    {
      id: 1,
      action: "تعديل بيانات المسجد",
      details: "تم تحديث الساعات التشغيلية واسم خطيب الجمعة",
      timestamp: "اليوم، 01:15 م",
      type: "update",
    },
    {
      id: 2,
      action: "إرسال دعوة تسجيل معلم",
      details: "تم إرسال دعوة انضمام للمعلم عبد الله العتيبي",
      timestamp: "أمس، 05:30 م",
      type: "create",
    },
    {
      id: 3,
      action: "تسجيل دخول جديد",
      details: "تم تسجيل الدخول بنجاح من متصفح Chrome (IP: 197.35.12.4)",
      timestamp: "06 أغسطس 2026، 09:10 ص",
      type: "security",
    },
    {
      id: 4,
      action: "تصدير تقرير التبرعات",
      details: "تم تصدير التقرير المالي الشهري لحملة ترميم المنارة",
      timestamp: "04 أغسطس 2026، 04:20 م",
      type: "report",
    },
  ],
};

export class ManagerProfileRepositoryImpl implements IManagerProfileRepository {
  private getLocalProfile(): ManagerProfile {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }

      // Check if logged in user exists in localStorage
      const userStr = localStorage.getItem("auth_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const dynamicProfile: ManagerProfile = {
            ...DEFAULT_PROFILE,
            full_name: user.name || DEFAULT_PROFILE.full_name,
            email: user.email || DEFAULT_PROFILE.email,
            phone: user.phone || DEFAULT_PROFILE.phone,
            mosque_name: user.mosque_name || DEFAULT_PROFILE.mosque_name,
          };
          localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(dynamicProfile));
          return dynamicProfile;
        } catch (e) {}
      }

      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(DEFAULT_PROFILE));
    }
    return DEFAULT_PROFILE;
  }

  private saveLocalProfile(profile: ManagerProfile): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    }
  }

  async getProfile(): Promise<ManagerProfile> {
    return this.getLocalProfile();
  }

  async updateProfile(payload: UpdatePersonalProfilePayload): Promise<ManagerProfile> {
    const current = this.getLocalProfile();
    const updated: ManagerProfile = {
      ...current,
      ...(payload.full_name ? { full_name: payload.full_name } : {}),
      ...(payload.phone ? { phone: payload.phone } : {}),
      ...(payload.email ? { email: payload.email } : {}),
      ...(payload.language ? { language: payload.language } : {}),
      activities: [
        {
          id: Date.now(),
          action: "تحديث المعلومات الشخصية",
          details: "تم تعديل بيانات الملف الشخصي بنجاح",
          timestamp: "الآن",
          type: "update",
        },
        ...current.activities,
      ],
    };

    this.saveLocalProfile(updated);
    return updated;
  }

  async changePassword(_payload: ChangePasswordPayload): Promise<boolean> {
    const current = this.getLocalProfile();
    current.activities.unshift({
      id: Date.now(),
      action: "تغيير كلمة المرور",
      details: "تم تغيير كلمة المرور بنجاح للحساب",
      timestamp: "الآن",
      type: "security",
    });
    this.saveLocalProfile(current);
    return true;
  }

  async toggleTwoFactor(): Promise<boolean> {
    const current = this.getLocalProfile();
    current.two_factor_enabled = !current.two_factor_enabled;
    current.activities.unshift({
      id: Date.now(),
      action: current.two_factor_enabled ? "تفعيل التحقق بخطوتين" : "إيقاف التحقق بخطوتين",
      details: current.two_factor_enabled ? "تم تفعيل حماية 2FA للحساب" : "تم تعطيل حماية 2FA",
      timestamp: "الآن",
      type: "security",
    });
    this.saveLocalProfile(current);
    return current.two_factor_enabled;
  }
}
