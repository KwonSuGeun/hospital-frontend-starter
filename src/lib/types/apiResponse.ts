/**
 * 백엔드 com.hospital.common.ApiResponse<T> 와 1:1 대응
 * 성공: { code: "SUCCESS", message: "OK", data: T }
 */
export type ApiResponse<T> = {
  code: string;
  message: string;
  data: T;
};
