// ============================================================
// Auth API — features/auth/api
// axios: lib/Axios.ts (withCredentials: true → JSESSIONID 쿠키)
// saga: authSaga.ts
// ============================================================

import axios from "axios";
import { api } from "@/lib/Axios";
import type { AuthUser, AuthUserApiResponse, LoginForm } from "../types/authTypes";

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as AuthUserApiResponse;
    if (data.message) {
      return data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function unwrapAuthUser(response: AuthUserApiResponse): AuthUser {
  if (response.code !== "SUCCESS" || !response.data) {
    throw new Error(response.message || "로그인에 실패했습니다.");
  }
  return response.data;
}

// --- [로그인] LoginForm → POST /api/auth/login ---
export async function loginApi(payload: LoginForm) {
  try {
    const response = await api.post<AuthUserApiResponse>("/api/auth/login", payload);
    return unwrapAuthUser(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "로그인에 실패했습니다."));
  }
}

// --- [세션 확인] AppShell → GET /api/auth/me ---
export async function fetchMeApi() {
  const response = await api.get<AuthUserApiResponse>("/api/auth/me");
  return unwrapAuthUser(response.data);
}

// --- [로그아웃] POST /api/auth/logout ---
export async function logoutApi() {
  await api.post<AuthUserApiResponse>("/api/auth/logout");
}
