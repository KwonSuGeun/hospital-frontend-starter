import type { ApiResponse } from "@/lib/types/apiResponse";

/** GET /api/auth/me, POST /api/auth/login 성공 data */
export type AuthUser = {
  staffId: string;
  name: string;
  staffRoleCode: string;
};

/** 로그인 폼 입력값 */
export type LoginForm = {
  staffId: string;
  password: string;
};

export type AuthUserApiResponse = ApiResponse<AuthUser>;
