# Hospital Frontend 학습 문서

프론트엔드·백엔드 전체 데이터 흐름을 **하나도 빠짐없이** 정리한 문서입니다.  
각 문서를 읽고 나면 해당 기능을 **어떤 데이터가, 어디에서, 어떻게 넘어가는지** 설명할 수 있어야 합니다.

## 문서 목록

| # | 파일 | 기능 | 인증 필요 |
|---|------|------|-----------|
| 0 | [00-common-infrastructure.md](./00-common-infrastructure.md) | 공통 인프라 (Axios, ApiResponse, Redux, Layout, 백엔드 인터셉터) | — |
| 1 | [01-login.md](./01-login.md) | 로그인 | 공개 |
| 2 | [02-session-check.md](./02-session-check.md) | 세션 확인 (fetchMe) | 공개 (쿠키 있으면 성공) |
| 3 | [03-logout.md](./03-logout.md) | 로그아웃 | 공개 |
| 4 | [04-home.md](./04-home.md) | 홈 페이지 | — |
| 5 | [05-sidebar.md](./05-sidebar.md) | 사이드바 렌더링 | 공개 |
| 6 | [06-staff-list.md](./06-staff-list.md) | 직원 목록 (+ 목록 사진 표시) | 세션 필요 |
| 7 | [07-staff-detail.md](./07-staff-detail.md) | 직원 상세 (+ 상세 사진 표시) | 세션 필요 |
| 8 | [08-staff-delete.md](./08-staff-delete.md) | 직원 삭제 | 세션 필요 |
| 9 | [09-staff-register.md](./09-staff-register.md) | 직원 등록 | 세션 필요 |
| 10 | [10-photo-upload.md](./10-photo-upload.md) | 등록 시 사진 첨부 (multipart) | 세션 필요 |
| 11 | [11-address-search.md](./11-address-search.md) | 등록 시 주소 검색 (다음 우편번호) | — (외부 API) |

## 권장 읽는 순서

```
00 공통 인프라
  ↓
01 로그인 → 02 세션 확인 → 03 로그아웃 → 04 홈
  ↓
05 사이드바
  ↓
06 직원 목록 → 07 직원 상세 → 08 직원 삭제
  ↓
09 직원 등록 → 10 사진 첨부 → 11 주소 검색
```

## 환경 변수

```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

- 프론트엔드: `http://localhost:3000`
- 백엔드: `http://localhost:8081`
- SeaweedFS Filer (사진): `http://localhost:8888` (백엔드 `application.yml` 설정)

## 백엔드 API 전체 목록 (11개)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/auth/me` | 세션 확인 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/sidebar` | 사이드바 메뉴 |
| GET | `/api/staff` | 직원 목록 |
| GET | `/api/staff/{id}` | 직원 상세 |
| POST | `/api/staff` | 직원 등록 (multipart) |
| DELETE | `/api/staff/{id}` | 직원 삭제 |
| GET | `/api/staff/departments` | 부서 목록 |
| GET | `/api/staff/{id}/photo` | 직원 사진 (바이너리) |

## 공통 응답 래퍼 (JSON API)

사진 API(`GET /api/staff/{id}/photo`)를 제외한 모든 JSON 응답:

```json
{
  "code": "SUCCESS",
  "message": "OK",
  "data": { }
}
```

- 성공: `code = "SUCCESS"`, `data`에 실제 payload
- 실패: `code = "UNAUTHORIZED" | "AUTH_FAILED" | ...`, `data = null`, `message`에 이유
