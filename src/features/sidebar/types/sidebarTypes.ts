// ============================================================
// Sidebar 타입 정의 — features/sidebar
// ============================================================

import type { ApiResponse } from "@/lib/types/apiResponse";

// --- GET /api/sidebar flat row (백엔드 SidebarMenuRowDto) ---
export type SidebarMenuRow = {
  id: number;
  parentId: number | null;
  label: string;
  path: string | null;
};

// --- Redux / UI 트리 노드 — sidebar.tsx, SidebarMenuItem.tsx ---
export type SidebarItem = {
  id: number;
  label: string;
  path: string;
  children?: SidebarItem[];
};

// --- API 응답 래퍼 (백엔드 ApiResponse<T>) ---
export type SidebarApiResponse = ApiResponse<SidebarMenuRow[]>;
