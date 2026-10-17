/** @typedef {{ error?: { code?: string, message?: string } }} ApiErrorBody */
/** @typedef {Error & { status?: number, code?: string }} ApiError */

const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
export const useMocks = import.meta.env.VITE_USE_MOCKS === "true";

/** @template T @param {string} path @param {RequestInit} [init] @returns {Promise<T>} */
export async function apiRequest(path, init = {}) {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("chiraq_token") : null;
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${apiBase}${path}`, { ...init, headers });
  /** @type {any} */
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(body?.error?.message || "Sorğu alınmadı.");
    error.status = response.status;
    error.code = body?.error?.code;
    throw error;
  }
  return body;
}

/** @template T @param {string} path @param {unknown} body @returns {Promise<T>} */
export function apiPost(path, body) {
  return apiRequest(path, { method: "POST", body: JSON.stringify(body) });
}
