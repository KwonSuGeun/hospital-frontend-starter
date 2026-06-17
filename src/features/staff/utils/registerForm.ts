// ============================================================
// Staff 등록 폼 — features/staff/utils/registerForm.ts
// StaffRegister.tsx → StaffCreateForm → StaffCreatePayload → POST /api/staff
// ============================================================

import axios from "axios";
import type {
  StaffCreateForm,
  StaffCreatePayload,
  StaffCreateRequest,
} from "../types/staffTypes";

export type RegisterAddressForm = {
  zipCode: string;
  baseAddress: string;
  detailAddress: string;
};

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

export const REGISTER_ADDRESS_INITIAL: RegisterAddressForm = {
  zipCode: "",
  baseAddress: "",
  detailAddress: "",
};

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function buildStaffAddress(address: RegisterAddressForm) {
  return [address.zipCode, address.baseAddress, address.detailAddress]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

export function validateRegisterForm(form: StaffCreateForm, address: RegisterAddressForm) {
  const checks: [boolean, string][] = [
    [!form.staffNo.trim(), "사번을 입력해주세요."],
    [!form.password.trim(), "비밀번호를 입력해주세요."],
    [!form.departmentId, "부서를 선택해주세요."],
    [!form.name.trim(), "이름을 입력해주세요."],
    [!form.birthDate, "생년월일을 선택해주세요."],
    [!form.staffPhone.trim(), "휴대폰번호를 입력해주세요."],
    [!address.zipCode.trim(), "우편번호를 입력해주세요."],
    [!address.baseAddress.trim(), "기본주소를 입력해주세요."],
  ];

  return checks.find(([failed]) => failed)?.[1] ?? null;
}

export function toRegisterSubmitForm(
  form: StaffCreateForm,
  address: RegisterAddressForm
): StaffCreateForm {
  return {
    ...form,
    staffType: form.staffType || "ADM",
    staffRankCode: form.staffRankCode.trim() || "GEN",
    staffPositionCode: "",
    staffExtensionNo: "",
    hireDate: form.hireDate || todayDateString(),
    address: buildStaffAddress(address),
  };
}

export function getStaffCreateErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 400) {
      return "등록 요청 형식이 올바르지 않습니다. 입력값을 확인해주세요.";
    }

    if (status === 500) {
      return "등록에 실패했습니다. 사번이 이미 사용 중인지 확인해주세요.";
    }

    const apiMessage = error.response?.data;
    if (typeof apiMessage === "object" && apiMessage !== null && "message" in apiMessage) {
      const message = (apiMessage as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }

  return error instanceof Error ? error.message : "Staff create failed";
}

export function toStaffCreateRequest(form: StaffCreateForm): StaffCreateRequest {
  const staffRankCode = form.staffRankCode.trim() || "GEN";

  return {
    staffNo: form.staffNo.trim(),
    password: form.password,
    name: form.name.trim(),
    departmentId: form.departmentId,
    staffType: form.staffType || "ADM",
    staffRankCode,
    staffPositionCode: form.staffPositionCode.trim(),
    staffPhone: form.staffPhone.trim(),
    staffExtensionNo: form.staffExtensionNo.trim(),
    email: form.email.trim(),
    address: form.address.trim(),
    hireDate: form.hireDate,
    birthDate: form.birthDate,
  };
}

export function toStaffCreatePayload(
  form: StaffCreateForm,
  photo: File | null
): StaffCreatePayload {
  return {
    ...toStaffCreateRequest(form),
    photo: photo ?? undefined,
  };
}
