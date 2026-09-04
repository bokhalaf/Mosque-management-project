// ==============================
// Central auth/session storage helper
// Single place that knows the shape of the app's localStorage-based session
// (auth_token, auth_user, active_mosque_id, user_role, active_role_view),
// replacing the same raw localStorage reads/role-detection logic that was
// duplicated across data/repositories, presentation/hooks, presentation/sections
// and a couple of src/app components.
//
// Every function is SSR-safe (`typeof window !== "undefined"` guarded) and
// mirrors the exact behavior already present in DonationRepositoryImpl.ts
// (the most complete/reference implementation of this logic in the codebase).
// ==============================

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";
const ACTIVE_MOSQUE_ID_KEY = "active_mosque_id";
const USER_ROLE_KEY = "user_role";
const ACTIVE_ROLE_VIEW_KEY = "active_role_view";

const isBrowser = () => typeof window !== "undefined";

export function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/** Returns the parsed `auth_user` object, or `null` if absent/unparsable. */
export function getAuthUser(): any | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthUser(user: unknown): void {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getActiveMosqueId(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACTIVE_MOSQUE_ID_KEY);
}

export function setActiveMosqueId(mosqueId: string | number): void {
  if (!isBrowser()) return;
  localStorage.setItem(ACTIVE_MOSQUE_ID_KEY, String(mosqueId));
}

export function getUserRole(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(USER_ROLE_KEY);
}

export function getActiveRoleView(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACTIVE_ROLE_VIEW_KEY);
}

/** Clears the auth session (token + user), used on logout. */
export function clearAuthSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

/**
 * Resolves the "current" mosque id: prefers the explicitly active mosque,
 * falls back to the logged-in user's own mosque, defaults to 1.
 * Mirrors DonationRepositoryImpl.getMosqueId().
 */
export function getMosqueId(): number {
  if (!isBrowser()) return 1;

  const activeMosque = getActiveMosqueId();
  if (activeMosque && !isNaN(Number(activeMosque))) return Number(activeMosque);

  const user = getAuthUser();
  if (user) {
    if (user.mosque_id) return Number(user.mosque_id);
    if (user.mosque?.id) return Number(user.mosque.id);
  }

  return 1;
}

/**
 * Determines whether the current session belongs to a super-admin / region-manager
 * class of user (as opposed to a mosque manager). Mirrors
 * DonationRepositoryImpl.isSuperAdminUser(), the most complete of the several
 * near-duplicate role-check implementations found across the codebase.
 */
export function isSuperAdminUser(): boolean {
  if (!isBrowser()) return false;

  const user = getAuthUser();
  if (user) {
    const role = String(
      user.role || user.user_type || user.role_name || (typeof user.role === "object" ? user.role?.name : "") || ""
    ).toLowerCase();
    const roles = (user.roles || []).map((r: any) =>
      typeof r === "string" ? r.toLowerCase() : String(r.name || "").toLowerCase()
    );

    if (
      role === "super_admin" ||
      role === "superadmin" ||
      role === "admin" ||
      role === "administrator" ||
      role === "region_manager" ||
      role === "regionmanager" ||
      role.includes("region") ||
      role.includes("super") ||
      role.includes("مدير المنطقة") ||
      user.is_super_admin === true ||
      user.role_id === 1 ||
      roles.includes("super_admin") ||
      roles.includes("superadmin") ||
      roles.includes("admin") ||
      roles.includes("region_manager")
    ) {
      return true;
    }
  }

  const roleStr = String(getUserRole() || "").toLowerCase();
  if (
    roleStr === "super_admin" ||
    roleStr === "superadmin" ||
    roleStr === "admin" ||
    roleStr === "region_manager" ||
    roleStr.includes("super") ||
    roleStr.includes("region")
  ) {
    return true;
  }

  const activeRoleView = String(getActiveRoleView() || "").toLowerCase();
  if (activeRoleView === "super_admin" || activeRoleView === "region_manager" || activeRoleView === "region") {
    return true;
  }

  return false;
}
