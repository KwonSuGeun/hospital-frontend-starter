"use client";

// ============================================================
// App Shell — components/layout/AppShell.tsx
// 마운트 시 GET /api/auth/me 로 세션 확인
// 미로그인 시에도 홈/메뉴 표시, 보호 기능 접근 시 LoginModal
// ============================================================

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import LoginModal from "@/components/auth/LoginModal";
import Sidebar from "@/components/sidebar/sidebar";
import { fetchMeRequest } from "@/features/auth/slice/authSlice";
import type { AppDispatch } from "@/store/Store";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchMeRequest());
  }, [dispatch]);

  return (
    <>
      <div className="app-shell">
        <aside className="app-shell__sidebar">
          <Sidebar />
        </aside>
        <main className="app-shell__main">{children}</main>
      </div>
      <LoginModal />
    </>
  );
}
