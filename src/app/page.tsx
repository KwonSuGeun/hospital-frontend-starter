"use client";

// ============================================================
// [홈] 라우트: / — app/page.tsx
// ============================================================

import { useDispatch, useSelector } from "react-redux";
import { logoutRequest, openLoginModal } from "@/features/auth/slice/authSlice";
import type { AppDispatch, RootState } from "@/store/Store";

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <section>
      <h1>Home</h1>
      {user ? (
        <>
          <p>
            {user.name} ({user.staffId}) 님, 환영합니다.
          </p>
          <button type="button" onClick={() => dispatch(logoutRequest())}>
            로그아웃
          </button>
        </>
      ) : (
        <>
          <p>병원 정보시스템에 오신 것을 환영합니다. 좌측 메뉴에서 원하는 기능을 선택하세요.</p>
          <button type="button" onClick={() => dispatch(openLoginModal({ message: "로그인이 필요합니다." }))}>
            로그인
          </button>
        </>
      )}
    </section>
  );
}
