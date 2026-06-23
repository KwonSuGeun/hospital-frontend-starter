// ============================================================
// HTTP 클라이언트 — lib/Axios.ts
// staffApi.ts, sidebarApi.ts, authApi.ts에서 공통 사용
// withCredentials: true → 백엔드 HttpSession(JSESSIONID) 쿠키 전송
// baseURL: NEXT_PUBLIC_API_URL 또는 http://localhost:8081
// ============================================================

import axios from "axios";

const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim();

export const api = axios.create({
  baseURL: apiBase || "http://localhost:8081",
  withCredentials: true,
});
