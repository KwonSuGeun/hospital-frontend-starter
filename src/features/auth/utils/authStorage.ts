import type { AuthUser } from "../types/authTypes";

const STORAGE_KEY = "hospital_auth_user";

/** 로그인 사용자 정보 — UI 표시용 (실제 인증은 백엔드 HttpSession) */
export function saveAuthUser(user: AuthUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function loadAuthUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearAuthUser() {
  localStorage.removeItem(STORAGE_KEY);
}
