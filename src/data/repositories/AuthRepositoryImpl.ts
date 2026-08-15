// ==============================
// Data — AuthRepositoryImpl
// التنفيذ الفعلي: Login + Logout API
// ==============================

import { LoginRequest, LoginResponse } from "../../domain/entities/Auth";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

const BASE_URL = "https://mms-backend-rose.vercel.app";

export class AuthRepositoryImpl implements IAuthRepository {
  // ── Login ──────────────────────────────────────────
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const json = await response.json();
    console.log("==== LOGIN API RESPONSE ====", json);

    if (!response.ok || !json.status) {
      throw new Error(json.message || "فشل تسجيل الدخول");
    }

    const userData = json.data?.user || {};
    const mosqueId = userData.mosque_id ?? userData.mosque?.id ?? json.data?.mosque_id ?? 1;

    // Enriched user with explicit mosque_id
    const enrichedUser = {
      ...userData,
      mosque_id: mosqueId,
    };

    console.log("🕌 =========================================");
    console.log("🕌 [AUTH LOGIN] تم تسجيل الدخول بنجاح!");
    console.log("🕌 [AUTH LOGIN] معرّف المسجد (Mosque ID):", mosqueId);
    console.log("👤 [AUTH LOGIN] المستخدم:", enrichedUser.name);
    console.log("📧 [AUTH LOGIN] البريد:", enrichedUser.email);
    console.log("🕌 =========================================");

    // حفظ التوكن وبيانات المستخدم في localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", json.data.access_token);
      localStorage.setItem("auth_user", JSON.stringify(enrichedUser));
      localStorage.setItem("active_mosque_id", String(mosqueId));
    }

    return {
      ...json.data,
      user: enrichedUser,
    } as LoginResponse;
  }

  // ── Logout ─────────────────────────────────────────
  async logout(): Promise<void> {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    // استدعاء API إن وجد توكن
    if (token) {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {
        // تجاهل أخطاء الشبكة عند الخروج
      });
    }

    // مسح البيانات المحلية دائماً
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
  }
}
