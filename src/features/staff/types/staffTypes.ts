// ============================================================
// Staff 타입 정의 — features/staff
//
// [등록 매핑]
//   StaffCreateForm (폼 state)
//     → toStaffCreatePayload() — features/staff/lib/staffCreateMapper.ts
//     → StaffCreatePayload (multipart: staff JSON + photo File)
//     → POST /api/staff @RequestPart("staff") StaffCreateRequestDto
//     → Staff 엔티티 (staffStatus="재직", staffPhotoKey=SeaweedFS key)
// ============================================================

// --- [목록] GET /api/staff — staff.tsx, staffSlice.items ---
export type StaffItem = {
  id: string;
  name: string;
  departmentName: string;
  email: string;
  photoUrl: string | null;
};

// --- [상세] GET /api/staff/{id} — StaffDetail.tsx, staffSlice.detail ---
export type StaffDetailItem = {
  id: string;
  name: string;
  departmentName: string;
  staffType: string;
  staffRankCode: string;
  staffPositionCode: string | null;
  staffPhone: string;
  staffExtensionNo: string | null;
  email: string;
  hireDate: string;
  staffStatus: string;
  birthDate: string;
  address: string | null;
};

// --- [등록 폼] 부서 select — GET /api/staff/departments ---
export type DepartmentItem = {
  departmentId: string;
  departmentName: string;
};

/**
 * POST /api/staff multipart — @RequestPart("staff") JSON body
 * 백엔드: StaffCreateRequestDto (필드명 1:1)
 */
export type StaffCreateRequest = {
  staffNo: string;
  password: string;
  name: string;
  departmentId: string;
  staffType: string;
  staffRankCode: string;
  staffPositionCode: string;
  staffPhone: string;
  staffExtensionNo: string;
  email: string;
  address: string;
  hireDate: string;
  birthDate: string;
};

/** 등록 폼 useState — 필드 구성은 StaffCreateRequest 와 동일 */
export type StaffCreateForm = StaffCreateRequest;

/**
 * createStaff() 인자 — StaffCreateRequest + photo(File, multipart 전용)
 * photo 는 @RequestPart("photo") 로 전송 (Redux 미경유)
 */
export type StaffCreatePayload = StaffCreateRequest & {
  photo?: File | null;
};

// --- API 응답 래퍼 (백엔드 ApiResponse<T>) ---
export type StaffApiResponse = {
  code: string;
  message: string;
  data: StaffItem[];
};

export type StaffDetailApiResponse = {
  code: string;
  message: string;
  data: StaffDetailItem;
};

export type StaffCreateApiResponse = {
  code: string;
  message: string;
  data: StaffItem;
};

export type DepartmentApiResponse = {
  code: string;
  message: string;
  data: DepartmentItem[];
};

export type StaffDeleteApiResponse = {
  code: string;
  message: string;
  data: null;
};
