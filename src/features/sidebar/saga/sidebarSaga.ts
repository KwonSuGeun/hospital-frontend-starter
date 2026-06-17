// ============================================================
// Sidebar Redux Saga — features/sidebar/saga
// API 호출: sidebarApi.ts → slice action dispatch
// ============================================================

import { call, put, takeLatest } from "redux-saga/effects";
import { fetchSidebarTree } from "../api/sidebarApi";
import {
  fetchSidebarFailure,
  fetchSidebarRequest,
  fetchSidebarSuccess,
} from "../slice/sidebarSlice";
import type { SidebarItem } from "../types/sidebarTypes";

// --- 메뉴 트리 조회: sidebar.tsx → GET /api/sidebar ---
function* fetchSidebarSaga() {
  try {
    const items: SidebarItem[] = yield call(fetchSidebarTree);
    yield put(fetchSidebarSuccess(items));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sidebar fetch failed";
    yield put(fetchSidebarFailure(message));
  }
}

export function* watchSidebarSaga() {
  yield takeLatest(fetchSidebarRequest.type, fetchSidebarSaga);
}
