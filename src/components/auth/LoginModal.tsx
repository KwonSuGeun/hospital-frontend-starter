"use client";

import { useDispatch, useSelector } from "react-redux";
import LoginForm from "@/components/auth/LoginForm";
import { closeLoginModal } from "@/features/auth/slice/authSlice";
import type { AppDispatch, RootState } from "@/store/Store";
import "@/styles/login.css";

export default function LoginModal() {
  const dispatch = useDispatch<AppDispatch>();
  const { loginModalOpen, loginModalMessage } = useSelector((state: RootState) => state.auth);

  if (!loginModalOpen) {
    return null;
  }

  function handleBackdropClick() {
    dispatch(closeLoginModal());
  }

  function handleDialogClick(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
  }

  return (
    <div className="login-modal" role="presentation" onClick={handleBackdropClick}>
      <div
        className="login-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={handleDialogClick}
      >
        <button
          type="button"
          className="login-modal__close"
          aria-label="닫기"
          onClick={() => dispatch(closeLoginModal())}
        >
          ×
        </button>
        <LoginForm message={loginModalMessage ?? "로그인이 필요합니다."} />
      </div>
    </div>
  );
}
