import type { SidebarItem, SidebarMenuRow } from "../types/sidebarTypes";

/**
 * GET /api/sidebar flat row → SidebarItem[] 트리 변환
 *
 * [입력 예시 — DB/API flat 배열]
 * [
 *   { id: 1, parentId: null, label: "관리", path: null },
 *   { id: 2, parentId: 1,    label: "직원", path: "/staff" },
 * ]
 *
 * [출력 예시 — SidebarMenuItem이 그리는 nested 구조]
 * [
 *   { id: 1, label: "관리", path: "", children: [
 *       { id: 2, label: "직원", path: "/staff", children: [] },
 *   ]},
 * ]
 */
export function toMenuTree(flatRows: SidebarMenuRow[]): SidebarItem[] {
  // id로 메뉴를 바로 찾기 위한 저장소 (예: menuById[1] → "관리" 메뉴)
  const menuById: Record<number, SidebarItem & { children: SidebarItem[] }> = {};

  // parentId가 null인 메뉴만 모음 → sidebar.tsx에서 items.map()의 시작점
  const topMenus: SidebarItem[] = [];

  // ── 1단계: row마다 "빈 children"을 가진 메뉴 객체를 먼저 전부 만든다 ──
  // parentId 연결은 아직 하지 않음. id → 객체 매핑만 준비.
  for (const row of flatRows) {
    menuById[row.id] = {
      id: row.id,
      label: row.label,
      path: row.path ?? "", // 부모 메뉴는 path가 null → Link 대신 버튼으로 렌더
      children: [],         // 2단계에서 parentId 보고 여기에 자식 push
    };
  }

  // ── 2단계: parentId를 보고 "누구 밑에 붙일지" 연결 ──
  for (const row of flatRows) {
    const menu = menuById[row.id];

    // parentId === null → 최상위 메뉴 (예: "관리")
    if (row.parentId === null) {
      topMenus.push(menu);
      continue;
    }

    // parentId가 있으면 → 부모 menuById[parentId].children에 자신을 추가
    // 예: id=2, parentId=1 → menuById[1].children.push(menuById[2])
    const parentMenu = menuById[row.parentId];
    if (parentMenu) {
      parentMenu.children.push(menu);
    }
    // parentMenu가 없으면 (잘못된 parentId) → 해당 row는 트리에서 제외
  }

  return topMenus;
}
