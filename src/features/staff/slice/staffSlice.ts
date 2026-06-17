// ============================================================
// Staff Redux Slice — features/staff/slice
// state + reducer: 목록 / 상세 / 등록
// ============================================================

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StaffDetailItem, StaffItem } from "../types/staffTypes";

type StaffState = {
  // [목록] /staff — staff.tsx
  items: StaffItem[];
  loading: boolean;
  error: string | null;

  // [상세] /staff/[id] — StaffDetail.tsx
  detail: StaffDetailItem | null;
  detailLoading: boolean;
  detailError: string | null;

  // [등록] /staff/register — StaffRegister.tsx
  createLoading: boolean;
  createError: string | null;
  createSuccess: boolean;
  
  // [삭제] /staff — staff.tsx
  deletingId: string | null;
  deleteError: string | null;
  deletedStaffId: string | null;
};

const initialState: StaffState = {
  items: [],
  loading: false,
  error: null,
  detail: null,
  detailLoading: false,
  detailError: null,
  createLoading: false,
  createError: null,
  createSuccess: false,
  deletingId: null,
  deleteError: null,
  deletedStaffId: null,
};

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    // --- 목록 조회 (GET /api/staff) ---
    fetchStaffRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchStaffSuccess(state, action: PayloadAction<StaffItem[]>) {
      state.loading = false;
      state.items = action.payload;
    },
    fetchStaffFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 상세 조회 (GET /api/staff/{id}) ---
    fetchStaffDetailRequest(state, _action: PayloadAction<string>) {
      state.detailLoading = true;
      state.detailError = null;
      state.detail = null;
    },
    fetchStaffDetailSuccess(state, action: PayloadAction<StaffDetailItem>) {
      state.detailLoading = false;
      state.detail = action.payload;
    },
    fetchStaffDetailFailure(state, action: PayloadAction<string>) {
      state.detailLoading = false;
      state.detailError = action.payload;
    },

    // --- 직원 등록 (POST /api/staff) ---
    createStaffRequest(state) {
      state.createLoading = true;
      state.createError = null;
      state.createSuccess = false;
    },
    createStaffSuccess(state) {
      state.createLoading = false;
      state.createSuccess = true;
    },
    createStaffFailure(state, action: PayloadAction<string>) {
      state.createLoading = false;
      state.createError = action.payload;
    },
    resetCreateStaff(state) {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;
    },

    // --- 직원 삭제 (DELETE /api/staff/{id}) ---
    deleteStaffRequest(state, action: PayloadAction<string>) {
      state.deletingId = action.payload;
      state.deleteError = null;
      state.deletedStaffId = null;
    },
    deleteStaffSuccess(state, action: PayloadAction<string>) {
      state.deletingId = null;
      state.deletedStaffId = action.payload;
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    deleteStaffFailure(state, action: PayloadAction<string>) {
      state.deletingId = null;
      state.deleteError = action.payload;
    },
    clearDeleteError(state) {
      state.deleteError = null;
    },
    resetDeleteStaff(state) {
      state.deletingId = null;
      state.deleteError = null;
      state.deletedStaffId = null;
    },
  },
});

export const {
  fetchStaffRequest,
  fetchStaffSuccess,
  fetchStaffFailure,
  fetchStaffDetailRequest,
  fetchStaffDetailSuccess,
  fetchStaffDetailFailure,
  createStaffRequest,
  createStaffSuccess,
  createStaffFailure,
  resetCreateStaff,
  deleteStaffRequest,
  deleteStaffSuccess,
  deleteStaffFailure,
  clearDeleteError,
  resetDeleteStaff,
} = staffSlice.actions;

export default staffSlice.reducer;
