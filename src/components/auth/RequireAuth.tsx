"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openLoginModal } from "@/features/auth/slice/authSlice";
import type { AppDispatch, RootState } from "@/store/Store";

type RequireAuthProps = {
  children: React.ReactNode;
};

export default function RequireAuth({ children }: RequireAuthProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, sessionChecked } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (sessionChecked && !user) {
      dispatch(openLoginModal({ message: "로그인이 필요합니다." }));
    }
  }, [sessionChecked, user, dispatch]);

  if (!sessionChecked) {
    return (
      <section className="require-auth">
        <p className="require-auth__message">로그인 확인 중...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="require-auth">
        <p className="require-auth__message">로그인이 필요합니다.</p>
      </section>
    );
  }

  return <>{children}</>;
}
