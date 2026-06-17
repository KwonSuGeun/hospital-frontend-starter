"use client";

// ============================================================
// [사이드바] layout 고정 — components/sidebar/sidebar.tsx
// Redux: fetchSidebarRequest → sidebarSlice (items, loading, error)
// 자식: SidebarMenuItem.tsx (재귀 메뉴)
// 스타일: styles/sidebar-nav.css
// ============================================================

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSidebarRequest } from "@/features/sidebar/slice/sidebarSlice";
import type { AppDispatch, RootState } from "@/store/Store";
import SidebarMenuItem from "./SidebarMenuItem";
import "@/styles/sidebar-nav.css";

export default function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.sidebar);

  // --- 마운트 시 메뉴 트리 조회 (GET /api/sidebar) ---
  useEffect(() => {
    dispatch(fetchSidebarRequest());
  }, [dispatch]);

  if (loading) {
    return (
      <nav className="sidebar-nav">
        <div className="sidebar-nav__status">Sidebar loading...</div>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className="sidebar-nav">
        <div className="sidebar-nav__status">Sidebar error: {error}</div>
      </nav>
    );
  }

  return (
    <nav className="sidebar-nav">
      <ul className="sidebar-nav__list">
        {items.map((item) => (
          <SidebarMenuItem key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  );
}
