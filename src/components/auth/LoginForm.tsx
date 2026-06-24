"use client";

import { useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginRequest } from "@/features/auth/slice/authSlice";
import type { AppDispatch, RootState } from "@/store/Store";
import "@/styles/login.css";

type LoginFormProps = {
  message?: string;
};

export default function LoginForm({ message }: LoginFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loginLoading, loginError } = useSelector((state: RootState) => state.auth);

  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch(
      loginRequest({
        staffId: staffId.trim(),
        password,
      })
    );
  }

  return (
    <form className="login-form login-form--modal" onSubmit={handleSubmit}>
      <h1 className="login-form__title" id="login-modal-title">
        {message ?? "로그인이 필요합니다."}
      </h1>
      <p className="login-form__desc">계속하려면 사번과 비밀번호를 입력하세요.</p>

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
}
