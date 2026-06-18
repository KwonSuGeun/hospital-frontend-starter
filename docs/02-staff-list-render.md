# 직원 목록 렌더링 과정 (상세)

> URL: `/staff`  
> 관련: `app/staff/page.tsx` → `staff.tsx` → Saga → `GET /api/staff` → 테이블 + 사진

---

## 0. 한 줄 요약

`/staff` 진입 → `Staff` 컴포넌트 mount → **Redux Saga**가 **`GET /api/staff`** 호출 → `items` state 저장 → **테이블 re-render** → 사진 있으면 **별도 HTTP**로 `GET /api/staff/{id}/photo`.

---

## 1. 전체 흐름

```
사용자 /staff 이동
    ↓
app/staff/page.tsx → <Staff />
    ↓
useEffect → dispatch(fetchStaffRequest())
    ↓
staffSlice: loading=true
    ↓
staffSaga → fetchStaffList() → GET /api/staff
    ↓
백엔드: StaffRepository.findAll() → StaffDto[] (photoUrl 포함)
    ↓
fetchStaffSuccess(items) → state.staff.items
    ↓
staff.tsx: items.map → <tr> (사진, ID, 이름, 부서, 이메일)
    ↓
<img src={resolveStaffPhotoUrl(photoUrl)}>  → GET /api/staff/{id}/photo
```

---

## 2. Step 1 — 라우팅

### URL

```
http://localhost:3000/staff
```

| 파일 | 코드 |
|------|------|
| `src/app/staff/page.tsx` | `return <Staff />` |
| `src/app/layout.tsx` | Sidebar + `<main>{children}</main>` |

**layout은 유지**, main 영역만 Staff 페이지.

---

## 3. Step 2 — Staff 컴포넌트 mount

### 파일: `src/components/staff/staff.tsx`

```tsx
"use client";

const { items, loading, error } = useSelector((state) => state.staff);
```

### mount 직후 Redux state

```typescript
{
  items: [],       // 직원 배열 (비어 있음)
  loading: false,  // 곧 true
  error: null,
}
```

---

## 4. Step 3 — 목록 API 요청

```tsx
useEffect(() => {
  dispatch(fetchStaffRequest());
}, [dispatch]);
```

### staffSlice — `fetchStaffRequest`

```typescript
fetchStaffRequest(state) {
  state.loading = true;
  state.error = null;
}
```

**1차 render** — loading UI:

```tsx
if (loading) {
  return <div>직원 목록 불러오는 중...</div>;
}
```

---

## 5. Step 4 — Saga & API

### `src/features/staff/saga/staffSaga.ts`

```typescript
function* fetchStaffSaga() {
  try {
    const items: StaffItem[] = yield call(fetchStaffList);
    yield put(fetchStaffSuccess(items));
  } catch (error) {
    yield put(fetchStaffFailure(message));
  }
}
```

| yield | 동작 |
|-------|------|
| `call(fetchStaffList)` | axios GET 실행, 배열 반환 대기 |
| `put(fetchStaffSuccess(items))` | items를 Redux에 저장 |

### `src/features/staff/api/staffApi.ts`

```typescript
export async function fetchStaffList() {
  const response = await api.get<StaffApiResponse>("/api/staff");
  return response.data.data;
}
```

**HTTP**

```
GET http://localhost:8081/api/staff
```

---

## 6. Step 5 — API 응답 데이터

### JSON 구조

```json
{
  "code": "SUCCESS",
  "message": "OK",
  "data": [
    {
      "id": "6666",
      "name": "홍길동",
      "departmentName": "행정과",
      "email": "test@naver.com",
      "photoUrl": "/api/staff/6666/photo"
    },
    {
      "id": "404",
      "name": "김철수",
      "departmentName": "외과",
      "email": null,
      "photoUrl": null
    }
  ]
}
```

### StaffItem 타입 (`staffTypes.ts`)

| 필드 | 의미 | 백엔드 출처 |
|------|------|-------------|
| `id` | 사번 | `STAFF_ID` |
| `name` | 이름 | `STAFF_NAME` |
| `departmentName` | 부서명 | Department JOIN |
| `email` | 이메일 | null 가능 |
| `photoUrl` | 사진 API **상대 경로** | `staffPhotoKey` 있을 때만 |

---

## 7. Step 6 — Redux Success & Re-render

```typescript
fetchStaffSuccess(state, action) {
  state.loading = false;
  state.items = action.payload;
}
```

`useSelector` 구독 → **Staff re-render** → loading 분기 통과 → 테이블 render.

---

## 8. Step 7 — 테이블 렌더 (한 행씩)

```tsx
{items.map((staff) => {
  const photoSrc = resolveStaffPhotoUrl(staff.photoUrl);

  return (
    <tr key={staff.id}>
      <td>
        {photoSrc ? (
          <img src={photoSrc} alt={`${staff.name} 사진`} className="staff-page__photo" />
        ) : (
          <span className="staff-page__photo-placeholder">-</span>
        )}
      </td>
      <td>{staff.id}</td>
      <td>
        <button onClick={() => router.push(`/staff/${staff.id}`)}>
          {staff.name}
        </button>
      </td>
      <td>{staff.departmentName}</td>
      <td>{staff.email}</td>
    </tr>
  );
})}
```

### `items.map()` 분석

| 코드 | 의미 |
|------|------|
| `items.map((staff) => ...)` | 배열 1명 = `<tr>` 1개 |
| `key={staff.id}` | React list key (사번) |
| `staff.photoUrl` | null 또는 `"/api/staff/6666/photo"` |

### `resolveStaffPhotoUrl()` — `staffApi.ts`

```typescript
export function resolveStaffPhotoUrl(photoUrl: string | null | undefined) {
  if (!photoUrl) return null;

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8081";
  return `${apiBase.replace(/\/$/, "")}${photoUrl}`;
}
```

**변환 예**

```
photoUrl = "/api/staff/6666/photo"
apiBase  = "http://localhost:8081"
결과     = "http://localhost:8081/api/staff/6666/photo"
```

| photoUrl | photoSrc | UI |
|----------|----------|-----|
| `null` | `null` | `-` |
| `"/api/staff/6666/photo"` | full URL | `<img>` |

---
          
## 9. Step 8 — 사진 이미지 로드 (목록 API와 별개)

`<img src="...">` 는 브라우저가 **자동으로 추가 GET** 요청.

```
GET http://localhost:8081/api/staff/6666/photo
    ↓
StaffController.getStaffPhoto(id)
    ↓
StaffServiceImpl.getStaffPhoto()
    → staff.getStaffPhotoKey()  // "staff/6666.jpg"
    → SeaweedFsService.download(key)
    ↓
ResponseEntity — image/jpeg 바이너리 (JSON 아님)
    ↓
브라우저 img에 표시
```

**왜 프록시?**

- SeaweedFS(`192.168.1.128:8888`) 직접 `<img>` → CORS 문제 가능
- 백엔드가 대신 받아 전달

**타임라인**

1. 목록 API → 테이블 텍스트 먼저 표시  
2. img 요청 → 사진 **비동기** 로드 (늦게 나타날 수 있음)

---

## 10. 사용자 인터랙션

| 동작 | 코드 | 결과 |
|------|------|------|
| 이름 클릭 | `router.push(`/staff/${id}`)` | 상세 `/staff/[id]` |
| 등록 버튼 | `router.push("/staff/register")` | 등록 폼 |

---

## 11. 백엔드 목록 API (참고)

```java
// StaffServiceImpl.getStaffList()
List<Staff> staffList = staffRepository.findAll();

for (Staff staff : staffList) {
    result.add(toDto(staff));
}
```

### `toDto(staff)`

```java
dto.setId(staff.getId());
dto.setName(staff.getName());
dto.setEmail(staff.getEmail());
dto.setDepartmentName(staff.getDepartmentName());

if (StringUtils.hasText(staff.getStaffPhotoKey())) {
    dto.setPhotoUrl("/api/staff/" + staff.getId() + "/photo");
}
```

DB에 **파일 없음**, **key만** 저장. 실제 바이너리는 SeaweedFS.

---

## 12. 에러 처리

```typescript
fetchStaffFailure → state.error = message
```

```tsx
if (error) {
  return <div>직원 목록 오류: {error}</div>;
}
```

---

## 13. Redux vs 등록

| 기능 | Redux Saga | 이유 |
|------|------------|------|
| **목록** | ✅ 사용 | JSON만 다룸 |
| **등록** | ❌ 미사용 | File 객체 직렬화 불가 |

---

## 14. 타임라인 표

| # | 동작 | UI |
|---|------|-----|
| 1 | /staff 진입 | layout + 빈/loading main |
| 2 | fetchStaffRequest | "불러오는 중..." |
| 3 | GET /api/staff | 대기 |
| 4 | fetchStaffSuccess | 테이블 (텍스트) |
| 5 | img GET /photo | 행별 사진 표시 |

---

## 15. 관련 파일

| 구분 | 경로 |
|------|------|
| 라우트 | `src/app/staff/page.tsx` |
| UI | `src/components/staff/staff.tsx` |
| slice | `src/features/staff/slice/staffSlice.ts` |
| saga | `src/features/staff/saga/staffSaga.ts` |
| api | `src/features/staff/api/staffApi.ts` |
| types | `src/features/staff/types/staffTypes.ts` |
| CSS | `src/styles/staff-page.css` |
| BE | `StaffController.getStaffList()` |
