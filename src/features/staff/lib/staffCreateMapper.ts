// ============================================================
// Staff 등록 매핑 — StaffCreateForm → StaffCreatePayload
// StaffRegister.tsx 에서 submit 직전에 호출
// ============================================================

import type { StaffCreateForm, StaffCreatePayload, StaffCreateRequest } from "../types/staffTypes";

export const STAFF_CREATE_FORM_INITIAL: StaffCreateForm = {
  staffNo: "",
  password: "",
  name: "",
  departmentId: "",
  staffType: "ADM",
  staffRankCode: "",
  staffPositionCode: "",
  staffPhone: "",
  staffExtensionNo: "",
  email: "",
  address: "",
  hireDate: "",
  birthDate: "",
};

/** 폼 입력값 trim 후 API JSON body 로 변환 */
export function toStaffCreateRequest(form: StaffCreateForm): StaffCreateRequest {
  return {
    staffNo: form.staffNo.trim(),
    password: form.password,
    name: form.name.trim(),
    departmentId: form.departmentId,
    staffType: form.staffType,
    staffRankCode: form.staffRankCode.trim(),
    staffPositionCode: form.staffPositionCode.trim(),
    staffPhone: form.staffPhone.trim(),
    staffExtensionNo: form.staffExtensionNo.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    hireDate: form.hireDate,
    birthDate: form.birthDate,
  };
}

/** multipart POST 용 payload — staff(JSON) + photo(File) */
export function toStaffCreatePayload(
  form: StaffCreateForm,
  photo: File | null
): StaffCreatePayload {
  return {
    ...toStaffCreateRequest(form),
    photo: photo ?? undefined,
  };
}
