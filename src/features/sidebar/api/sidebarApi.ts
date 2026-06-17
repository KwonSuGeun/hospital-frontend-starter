// ============================================================
// Sidebar API — features/sidebar/api
// axios 인스턴스: lib/Axios.ts
// saga에서 호출: sidebarSaga.ts → sidebar.tsx
// ============================================================

import { api } from "@/lib/Axios";
import type { SidebarApiResponse } from "../types/sidebarTypes";

// --- [메뉴 트리] GET /api/sidebar ---
export async function fetchSidebarApi() {
  const response = await api.get<SidebarApiResponse>("/api/sidebar");
  return response.data.data;
}
