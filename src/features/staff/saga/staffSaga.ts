// ============================================================
// Staff Redux Saga — features/staff/saga
// API 호출: staffApi.ts → slice action dispatch
// 등록(POST /api/staff)은 StaffRegister.tsx에서 직접 API 호출 (File 객체 Redux 미경유)
// ============================================================

import { call, put, takeLatest } from "redux-saga/effects";
import { deleteStaff, fetchStaffDetail, fetchStaffList } from "../api/staffApi";
import {
  deleteStaffFailure,
  deleteStaffRequest,
  deleteStaffSuccess,
  fetchStaffDetailFailure,
  fetchStaffDetailRequest,
  fetchStaffDetailSuccess,
  fetchStaffFailure,
  fetchStaffRequest,
  fetchStaffSuccess,
} from "../slice/staffSlice";
import type { StaffDetailItem, StaffItem } from "../types/staffTypes";

// --- 목록 조회: staff.tsx → GET /api/staff ---
function* fetchStaffSaga() {
  try {
    const items: StaffItem[] = yield call(fetchStaffList);
    yield put(fetchStaffSuccess(items));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Staff fetch failed";
    yield put(fetchStaffFailure(message));
  }
}

// --- 상세 조회: StaffDetail.tsx → GET /api/staff/{id} ---
function* fetchStaffDetailSaga(action: ReturnType<typeof fetchStaffDetailRequest>) {
  try {
    const detail: StaffDetailItem = yield call(fetchStaffDetail, action.payload);
    yield put(fetchStaffDetailSuccess(detail));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Staff detail fetch failed";
    yield put(fetchStaffDetailFailure(message));
  }
}

// --- 삭제: staff.tsx → DELETE /api/staff/{id} ---
function* deleteStaffSaga(action: ReturnType<typeof deleteStaffRequest>) {
  try {
    yield call(deleteStaff, action.payload);
    yield put(deleteStaffSuccess(action.payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Staff delete failed";
    yield put(deleteStaffFailure(message));
  }
}

export function* watchStaffSaga() {
  yield takeLatest(fetchStaffRequest.type, fetchStaffSaga);
  yield takeLatest(fetchStaffDetailRequest.type, fetchStaffDetailSaga);
  yield takeLatest(deleteStaffRequest.type, deleteStaffSaga);
}
