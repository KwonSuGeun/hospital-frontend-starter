// ============================================================
// Sidebar 타입 정의 — features/sidebar
// ============================================================

// --- [메뉴 트리] GET /api/sidebar — sidebar.tsx, SidebarMenuItem.tsx ---
export type SidebarItem = {
  id: number;
  label: string;
  path: string;
  children?: SidebarItem[];
};

// --- API 응답 래퍼 (백엔드 ApiResponse<T>) ---
export type SidebarApiResponse = {
  code: string;
  message: string;
  data: SidebarItem[];
};
