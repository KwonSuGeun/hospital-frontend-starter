// ============================================================
// Sidebar API — features/sidebar/api
// axios 인스턴스: lib/Axios.ts
// saga에서 호출: sidebarSaga.ts → sidebar.tsx
// ============================================================

import { api } from "@/lib/Axios";
import type { SidebarApiResponse, SidebarItem } from "../types/sidebarTypes";
import { toMenuTree } from "../utils/menuTree";

// --- [메뉴] GET /api/sidebar → flat row 조회 후 트리 조합 ---
export async function fetchSidebarApi(): Promise<SidebarItem[]> {
  const response = await api.get<SidebarApiResponse>("/api/sidebar");
  return toMenuTree(response.data.data);
}
