// ============================================================
// Auth Redux Saga — features/auth/saga
// API 호출: authApi.ts → slice action dispatch
// ============================================================

import { call, put, takeLatest } from "redux-saga/effects";
import { fetchMeApi, loginApi, logoutApi } from "../api/authApi";
import {
  fetchMeFailure,
  fetchMeRequest,
  fetchMeSuccess,
  loginFailure,
  loginRequest,
  loginSuccess,
  logoutRequest,
  logoutSuccess,
} from "../slice/authSlice";
import { clearAuthUser, saveAuthUser } from "../utils/authStorage";
import type { AuthUser, LoginForm } from "../types/authTypes";

// --- 로그인 ---
function* loginSaga(action: ReturnType<typeof loginRequest>) {
  try {
    const user: AuthUser = yield call(loginApi, action.payload);
    saveAuthUser(user);
    yield put(loginSuccess(user));
  } catch (error) {
    const message = error instanceof Error ? error.message : "로그인에 실패했습니다.";
    yield put(loginFailure(message));
  }
}

// --- 세션 확인 ---
function* fetchMeSaga() {
  try {
    const user: AuthUser = yield call(fetchMeApi);
    saveAuthUser(user);
    yield put(fetchMeSuccess(user));
  } catch {
    clearAuthUser();
    yield put(fetchMeFailure());
  }
}

// --- 로그아웃 ---
function* logoutSaga() {
  try {
    yield call(logoutApi);
  } catch {
    // 세션 만료 등으로 실패해도 프론트 상태는 정리
  } finally {
    clearAuthUser();
    yield put(logoutSuccess());
  }
}

export function* watchAuthSaga() {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(fetchMeRequest.type, fetchMeSaga);
  yield takeLatest(logoutRequest.type, logoutSaga);
}
