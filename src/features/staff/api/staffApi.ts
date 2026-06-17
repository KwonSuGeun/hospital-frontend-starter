// ============================================================
// Staff API — features/staff/api
// axios 인스턴스: lib/Axios.ts
// saga: 목록/상세/삭제 — staffSaga.ts
// 직접 호출: StaffRegister (등록, 부서 목록)
// ============================================================

import { api } from "@/lib/Axios";
import { unwrapStaffDetailPayload } from "../utils/detailResponse";
import type {
  DepartmentApiResponse,
  StaffApiResponse,
  StaffCreateApiResponse,
  StaffCreatePayload,
  StaffDeleteApiResponse,
  StaffDetailApiResponse,
} from "../types/staffTypes";

// --- [목록] staffSaga → staff.tsx ---
export async function fetchStaffList() {
  const response = await api.get<StaffApiResponse>("/api/staff");
  return response.data.data;
}

// --- [상세] staffSaga → StaffDetail.tsx ---
export async function fetchStaffDetail(id: string) {
  const response = await api.get<StaffDetailApiResponse>(`/api/staff/${id}`);
  return unwrapStaffDetailPayload(response.data);
}

// --- [등록 폼] StaffRegister.tsx — GET /api/staff/departments ---
export async function fetchDepartmentList() {
  const response = await api.get<DepartmentApiResponse>("/api/staff/departments");
  return response.data.data;
}

// --- [등록] StaffRegister.tsx — POST /api/staff (multipart) ---
// payload.staff → @RequestPart("staff") StaffCreateRequestDto
// payload.photo → @RequestPart("photo") MultipartFile (optional)
export async function createStaff(payload: StaffCreatePayload) {
  const { photo, ...staffRequest } = payload;

  const formData = new FormData();
  formData.append(
    "staff",
    new Blob([JSON.stringify(staffRequest)], { type: "application/json" })
  );

  if (photo) {
    formData.append("photo", photo);
  }

  // Content-Type은 브라우저/axios가 boundary 포함해 자동 설정해야 함 (수동 지정 시 400 발생)
  const response = await api.post<StaffCreateApiResponse>("/api/staff", formData);
  return response.data.data;
}

// --- [삭제] staffSaga → StaffDetail.tsx ---
export async function deleteStaff(id: string) {
  const response = await api.delete<StaffDeleteApiResponse>(`/api/staff/${id}`);
  return response.data;
}

export function resolveStaffPhotoUrl(photoUrl: string | null | undefined) {
  if (!photoUrl) {
    return null;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8081";
  return `${apiBase.replace(/\/$/, "")}${photoUrl}`;
}
