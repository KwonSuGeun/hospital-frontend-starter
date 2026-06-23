// ============================================================
// Auth Redux Slice — features/auth/slice
// state: 로그인 사용자 + 세션 확인 완료 여부
// ============================================================

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser, LoginForm } from "../types/authTypes";

type AuthState = {
  user: AuthUser | null;
  loginLoading: boolean;
  loginError: string | null;
  sessionChecked: boolean;
  loginModalOpen: boolean;
  loginModalMessage: string | null;
};

const initialState: AuthState = {
  user: null,
  loginLoading: false,
  loginError: null,
  sessionChecked: false,
  loginModalOpen: false,
  loginModalMessage: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // --- 로그인 (POST /api/auth/login) ---
    loginRequest(state, _action: PayloadAction<LoginForm>) {
      state.loginLoading = true;
      state.loginError = null;
    },
    loginSuccess(state, action: PayloadAction<AuthUser>) {
      state.loginLoading = false;
      state.user = action.payload;
      state.sessionChecked = true;
      state.loginModalOpen = false;
      state.loginModalMessage = null;
      state.loginError = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loginLoading = false;
      state.loginError = action.payload;
    },

    // --- 세션 확인 (GET /api/auth/me) ---
    fetchMeRequest(state) {
      state.sessionChecked = false;
    },
    fetchMeSuccess(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.sessionChecked = true;
    },
    fetchMeFailure(state) {
      state.user = null;
      state.sessionChecked = true;
    },

    // --- 로그아웃 (POST /api/auth/logout) ---
    logoutRequest(state) {
      state.loginLoading = true;
    },
    logoutSuccess(state) {
      state.user = null;
      state.loginLoading = false;
      state.loginError = null;
      state.sessionChecked = true;
      state.loginModalOpen = false;
      state.loginModalMessage = null;
    },

    openLoginModal(state, action: PayloadAction<{ message?: string } | undefined>) {
      state.loginModalOpen = true;
      state.loginModalMessage = action.payload?.message ?? "로그인이 필요합니다.";
      state.loginError = null;
    },
    closeLoginModal(state) {
      state.loginModalOpen = false;
      state.loginModalMessage = null;
      state.loginError = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  fetchMeRequest,
  fetchMeSuccess,
  fetchMeFailure,
  logoutRequest,
  logoutSuccess,
  openLoginModal,
  closeLoginModal,
} = authSlice.actions;

export default authSlice.reducer;
