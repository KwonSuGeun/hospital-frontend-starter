"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginRequest } from "@/features/auth/slice/authSlice";
import type { AppDispatch, RootState } from "@/store/Store";
import "@/styles/login.css";

type LoginFormProps = {
  mode?: "page" | "modal";
  message?: string;
};

export default function LoginForm({ mode = "page", message }: LoginFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, loginLoading, loginError } = useSelector((state: RootState) => state.auth);

  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (mode !== "page" || !user) {
      return;
    }

    router.replace("/");
  }, [user, router, mode]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(
      loginRequest({
        staffId: staffId.trim(),
        password,
      })
    );
  }

  const formClassName = mode === "modal" ? "login-form login-form--modal" : "login-form";
  const wrapperClassName = mode === "modal" ? undefined : "login-page";

  const form = (
    <form className={formClassName} onSubmit={handleSubmit}>
      <h1 className="login-form__title" id={mode === "modal" ? "login-modal-title" : undefined}>
        {mode === "modal" ? message ?? "로그인이 필요합니다." : "병원 정보시스템 로그인"}
      </h1>
      <p className="login-form__desc">
        {mode === "modal" ? "계속하려면 사번과 비밀번호를 입력하세요." : "사번과 비밀번호를 입력하세요."}
      </p>

      <label className="login-form__field">
        <span className="login-form__label">사번</span>
        <input
          className="login-form__input"
          type="text"
          value={staffId}
          onChange={(event) => setStaffId(event.target.value)}
          placeholder="사번"
          autoComplete="username"
          required
        />
      </label>

      <label className="login-form__field">
        <span className="login-form__label">비밀번호</span>
        <input
          className="login-form__input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
          required
        />
      </label>

      {loginError ? <p className="login-form__error">{loginError}</p> : null}

      <button className="login-form__submit" type="submit" disabled={loginLoading}>
        {loginLoading ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );

  if (mode === "modal") {
    return form;
  }

  return <div className={wrapperClassName}>{form}</div>;
}
