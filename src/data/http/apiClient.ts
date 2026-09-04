// ==============================
// Shared API client infrastructure
// Single source of truth for the backend base URL and auth headers,
// replacing the copy-pasted BASE_URL/getAuthHeaders() that used to live
// in every *RepositoryImpl.ts file individually.
//
// Intentionally kept close to the old per-file shape (plain constants +
// header builders, not a fetch wrapper) so migrating each repository is a
// mechanical "use the shared one" swap rather than a rewrite of call sites.
// ==============================

import { getAuthToken } from "../auth/authStorage";

export const BASE_URL = "https://mms-backend-rose.vercel.app/api";

/**
 * Standard JSON request headers (Content-Type + Accept + Bearer token when present).
 * Equivalent to the `getAuthHeaders()` private method duplicated across repositories.
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Headers for multipart/form-data requests (file uploads, FormData bodies).
 * No Content-Type is set so the browser can add the correct multipart boundary.
 * Equivalent to the inline `{ Accept, Authorization }` headers repeated next to
 * every `fetch(..., { body: formData })` call across the repositories.
 */
export function getMultipartAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
