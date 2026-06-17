// ============================================================
// Staff 상세 API 응답 — features/staff/utils/detailResponse.ts
// staffApi.ts → GET /api/staff/{id} → StaffDetailItem
// ============================================================

import type { StaffDetailItem } from "../types/staffTypes";

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text || null;
}

function toRequiredString(value: unknown, fallback = ""): string {
  return toNullableString(value) ?? fallback;
}

export function normalizeStaffDetailItem(raw: unknown): StaffDetailItem {
  const record =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    id: toRequiredString(record.id),
    name: toRequiredString(record.name),
    departmentName: toRequiredString(record.departmentName),
    staffType: toRequiredString(record.staffType),
    staffRankCode: toRequiredString(record.staffRankCode),
    staffPositionCode: toNullableString(record.staffPositionCode),
    staffPhone: toRequiredString(record.staffPhone),
    staffExtensionNo: toNullableString(record.staffExtensionNo),
    email: toRequiredString(record.email),
    hireDate: toRequiredString(record.hireDate),
    staffStatus: toRequiredString(record.staffStatus),
    birthDate: toRequiredString(record.birthDate),
    address: toNullableString(record.address),
  };
}

export function unwrapStaffDetailPayload(payload: unknown): StaffDetailItem {
  if (payload && typeof payload === "object" && "data" in payload) {
    const wrapped = payload as { data?: unknown };
    if (wrapped.data && typeof wrapped.data === "object") {
      return normalizeStaffDetailItem(wrapped.data);
    }
  }

  return normalizeStaffDetailItem(payload);
}
