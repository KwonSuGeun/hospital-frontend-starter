# 학습용 문서 목록

Git 최신화(`origin/master`) 후 다시 작성한 상세 가이드입니다.

| # | 파일 | 내용 |
|---|------|------|
| 1 | [01-sidebar-render.md](./01-sidebar-render.md) | 사이드바 렌더링 — layout, Redux Saga, flat API, toMenuTree, 재귀 SidebarMenuItem |
| 2 | [02-staff-list-render.md](./02-staff-list-render.md) | 직원 목록 — Saga, GET /api/staff, 테이블, photoUrl, img 프록시 |
| 3 | [03-staff-photo-register.md](./03-staff-photo-register.md) | 사진 등록 — staffMapper, FormData, Blob, SeaweedFS, DB key |

## 읽는 순서

1. 사이드바 (앱 공통 layout)
2. 직원 목록
3. 사진 등록

## 환경

```
NEXT_PUBLIC_API_URL=http://localhost:8081
```

백엔드 8081 + SeaweedFS Filer 8888 실행 필요 (사진 등록/표시 시).
