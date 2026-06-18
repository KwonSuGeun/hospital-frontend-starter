# 직원 사진 등록 과정 (상세)

> URL: `/staff/register`  
> 최신 UI: 모달형 등록 폼 + 좌측 사진 패널  
> 매핑: `staffMapper.ts` → `staffApi.createStaff()` → multipart POST

---

## 0. 한 줄 요약

사용자가 **사진 File 선택** + 폼 입력 → **`toStaffCreatePayload()`** → **`FormData` multipart POST** → 백엔드 **SeaweedFS PUT** + **Oracle INSERT** → 목록에서 `photoUrl`로 `<img>` 표시.

**등록은 Redux Saga를 쓰지 않음** — `File` 객체는 Redux에 넣을 수 없기 때문. 컴포넌트에서 **직접 `createStaff()`** 호출.

---

## 1. 전체 흐름

```
/staff/register 진입
    ↓
fetchDepartmentList() — GET /api/staff/departments
    ↓
사용자: 폼 입력 + photo File 선택 (로컬 state)
    ↓
등록 클릭 → validateRegisterForm()
    ↓
toRegisterSubmitForm(form, address)  // 주소 합치기, hireDate 기본값 등
    ↓
toStaffCreatePayload(submitForm, photo)
    ↓
createStaff(payload) — POST multipart /api/staff
    ↓
백엔드:
  SeaweedFsService.uploadStaffPhoto()  → SeaweedFS
  staffRepository.save()               → Oracle STAFF
    ↓
성공 → router.push("/staff") 또는 handleBackClick
    ↓
목록 GET /api/staff → photoUrl → img GET /api/staff/{id}/photo
```

---

## 2. Step 1 — 페이지 진입 & state

### 라우트

```
src/app/staff/register/page.tsx → <StaffRegister />
```

### 컴포넌트 로컬 state (`StaffRegister.tsx`)

| state | 타입 | 역할 |
|-------|------|------|
| `form` | `StaffCreateForm` | 사번, 이름, 부서, … |
| `address` | `RegisterAddressForm` | 우편번호, 기본주소, 상세주소 |
| `photo` | `File \| null` | **선택한 이미지 파일** |
| `photoPreviewUrl` | `string \| null` | 미리보기 blob URL |
| `departments` | `DepartmentItem[]` | 부서 select 옵션 |
| `submitting` | `boolean` | 등록 중 버튼 disabled |
| `formError` | `string \| null` | 유효성/API 에러 |

**photo는 Redux 밖** — `useState`만 사용.

### form 초기값 — `staffMapper.ts`

```typescript
export const STAFF_CREATE_FORM_INITIAL: StaffCreateForm = {
  staffNo: "",
  password: "",
  name: "",
  departmentId: "",
  staffType: "ADM",
  staffRankCode: "",
  ...
};
```

---

## 3. Step 2 — 부서 목록

```tsx
useEffect(() => {
  fetchDepartmentList().then((items) => setDepartments(items));
}, []);
```

| API | GET /api/staff/departments |
|-----|---------------------------|
| 응답 | `[{ departmentId, departmentName }]` |
| UI | `departmentId` select |

Saga **미사용** — 컴포넌트에서 axios 직접 호출.

---

## 4. Step 3 — 사진 선택 & 미리보기

### UI 구조 (좌측 패널)

```tsx
<aside className="staff-register__photo-panel">
  <div className="staff-register__photo-avatar">
    {photoPreviewUrl ? <img src={photoPreviewUrl} /> : <AvatarPlaceholderIcon />}
  </div>
  <input ref={photoInputRef} type="file" accept="image/jpeg,..." onChange={handlePhotoChange} />
  <button onClick={() => photoInputRef.current?.click()}>사진 업로드</button>
</aside>
```

숨겨진 `<input type="file">` + 버튼 클릭으로 파일 선택.

### `handlePhotoChange` — 한 줄씩

```typescript
const file = event.target.files?.[0];
```

| `files?.[0]` | input에서 선택한 **첫 번째 File** |
| `?.` | files 없으면 undefined (에러 방지) |

```typescript
if (!file.type.startsWith("image/")) { /* 에러 */ }
if (file.size > 5 * 1024 * 1024) { /* 5MB 초과 에러 */ }
setPhoto(file);
```

### 미리보기 useEffect

```typescript
const previewUrl = URL.createObjectURL(photo);
setPhotoPreviewUrl(previewUrl);
// cleanup: URL.revokeObjectURL(previewUrl)
```

| API | 의미 |
|-----|------|
| `URL.createObjectURL(file)` | File → `blob:http://localhost:3000/...` |
| `<img src={previewUrl}>` | **서버 업로드 전** 로컬 미리보기 |

---

## 5. Step 4 — Submit & 유효성

```tsx
const handleSubmit = async (event: FormEvent) => {
  event.preventDefault();

  const validationError = validateRegisterForm(form, address);
  if (validationError) {
    setFormError(validationError);
    return;
  }

  setSubmitting(true);
  try {
    await createStaff(
      toStaffCreatePayload(toRegisterSubmitForm(form, address), photo)
    );
    handleBackClick();  // 목록으로
  } catch (error) {
    setFormError(getStaffCreateErrorMessage(error));
  } finally {
    setSubmitting(false);
  }
};
```

### `validateRegisterForm(form, address)` — 검사 항목

- 사번, 비밀번호, 부서, 이름, 생년월일, 휴대폰
- 우편번호, 기본주소

### `toRegisterSubmitForm(form, address)` — 제출 직전 가공

```typescript
return {
  ...form,
  staffType: form.staffType || "ADM",
  staffRankCode: form.staffRankCode.trim() || "GEN",
  staffPositionCode: "",
  staffExtensionNo: "",
  hireDate: form.hireDate || todayDateString(),  // 오늘 날짜 기본
  address: buildStaffAddress(address),           // "우편 기본 상세" 한 문자열
};
```

### `buildStaffAddress(address)`

```typescript
[zipCode, baseAddress, detailAddress]
  .map(trim)
  .filter(Boolean)
  .join(" ");
// 예: "12345 서울시 ... 101호"
```

---

## 6. Step 5 — Payload 생성 (타입 매핑)

### 계층

```
StaffCreateForm + RegisterAddressForm
    ↓ toRegisterSubmitForm()
StaffCreateForm (address 합쳐진)
    ↓ toStaffCreateRequest()  (내부)
StaffCreateRequest  ← 백엔드 JSON 1:1
    ↓ + photo
StaffCreatePayload
```

### `toStaffCreatePayload(form, photo)` — `staffMapper.ts`

```typescript
export function toStaffCreatePayload(form: StaffCreateForm, photo: File | null) {
  return {
    ...toStaffCreateRequest(form),
    photo: photo ?? undefined,
  };
}
```

### `toStaffCreateRequest(form)` — trim & 기본값

| 필드 | 처리 |
|------|------|
| `staffNo`, `name`, … | `.trim()` |
| `staffRankCode` | 비면 `"GEN"` |
| `staffType` | 비면 `"ADM"` |

**출력 예 (photo 포함)**

```javascript
{
  staffNo: "6666",
  password: "1111",
  name: "홍길동",
  departmentId: "D01",
  staffType: "ADM",
  staffRankCode: "GEN",
  staffPhone: "010-1234-5678",
  address: "12345 서울 ...",
  hireDate: "2026-06-17",
  birthDate: "1990-01-01",
  photo: File { name: "face.jpg", type: "image/jpeg", size: 120000 }
}
```

---

## 7. Step 6 — multipart HTTP POST

### `staffApi.ts` — `createStaff()`

```typescript
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

  const response = await api.post("/api/staff", formData);
  return response.data.data;
}
```

### `new Blob([JSON.stringify(staffRequest)], { type: "application/json" })`

| 부분 | 의미 |
|------|------|
| `JSON.stringify(staffRequest)` | JS 객체 → JSON **문자열** |
| `new Blob([...], { type: "application/json" })` | multipart **part**를 파일처럼 포장 |
| `formData.append("staff", blob)` | part 이름 `"staff"` |

**왜 Blob?** Spring `@RequestPart("staff")` + JSON 역직렬화에 적합.

### `formData.append("photo", photo)`

| photo | File (Blob 상속) — 실제 이미지 바이너리 |
|-------|----------------------------------------|

### Content-Type 주의

```typescript
// ❌ 수동 지정하면 boundary 빠져 400 발생
headers: { "Content-Type": "multipart/form-data" }

// ✅ axios가 boundary 포함해 자동 설정 (현재 코드)
await api.post("/api/staff", formData);
```

### HTTP body 구조 (개념)

```
POST /api/staff
Content-Type: multipart/form-data; boundary=----abc

------abc
Content-Disposition: form-data; name="staff"
Content-Type: application/json

{"staffNo":"6666","name":"홍길동",...}
------abc
Content-Disposition: form-data; name="photo"; filename="face.jpg"
Content-Type: image/jpeg

(바이너리)
------abc--
```

---

## 8. Step 7 — 백엔드 Controller

```java
@PostMapping(consumes = MULTIPART_FORM_DATA_VALUE)
public ApiResponse<StaffDto> createStaff(
    @RequestPart("staff") StaffCreateRequestDto request,
    @RequestPart(value = "photo", required = false) MultipartFile photo
) {
    return ApiResponse.success(staffService.createStaff(request, photo));
}
```

| 파라미터 | multipart name | Java 타입 |
|----------|----------------|-----------|
| `request` | `"staff"` | StaffCreateRequestDto (Jackson) |
| `photo` | `"photo"` | MultipartFile (optional) |

---

## 9. Step 8 — StaffServiceImpl.createStaff()

### 순서

```java
// 1. 검증
staffRepository.existsById(request.getStaffNo());           // 중복 사번
ALLOWED_STAFF_TYPES.contains(request.getStaffType());      // DOC/NUR/ADM
departmentRepository.findById(request.getDepartmentId());   // 부서 FK

// 2. 사진 (있을 때)
if (photo != null && !photo.isEmpty()) {
    photoKey = seaweedFsService.uploadStaffPhoto(staffNo, photo);
}

// 3. Entity
staff.setId(request.getStaffNo());
staff.setStaffPhotoKey(photoKey);      // "staff/6666.jpg" 또는 null
staff.setStaffStatus("재직");           // 서버 고정
staff.setStaffRoleCode(...);           // staffType별 자동

// 4. DB
staffRepository.save(staff);

// 5. 응답
return toDto(savedStaff);  // photoUrl: "/api/staff/6666/photo"
```

### `emptyToNull()` — 선택 필드

빈 문자열 `""` → DB `NULL` (직책, 내선, 이메일 등)

---

## 10. Step 9 — SeaweedFS 업로드 상세

### 설정 (`application.yml`)

```yaml
seaweedfs:
  filer:
    endpoint: http://192.168.1.128:8888
    bucket: emp_photo
```

### `SeaweedFsService.uploadStaffPhoto(staffId, file)`

| 단계 | 코드 | 설명 |
|------|------|------|
| 1 | `validatePhoto(file)` | empty, 5MB, jpeg/png/gif/webp |
| 2 | `resolveExtension(file)` | `.jpg`, `.png` … |
| 3 | `objectKey = "staff/" + staffId + ext` | 예: `staff/6666.jpg` |
| 4 | URL = `{endpoint}/{bucket}/{objectKey}` | `http://192.168.1.128:8888/emp_photo/staff/6666.jpg` |
| 5 | `restTemplate.exchange(..., PUT, bytes)` | Filer에 업로드 |
| 6 | return objectKey | DB `STAFF_PHOTO_KEY`에 저장 |

### 저장 위치 정리

| 저장소 | 내용 | 예 |
|--------|------|-----|
| **SeaweedFS** | 이미지 **바이너리** | `emp_photo/staff/6666.jpg` |
| **Oracle STAFF** | **key 문자열** | `STAFF_PHOTO_KEY = 'staff/6666.jpg'` |

DB에 파일 본문은 **없음**.

---

## 11. Step 10 — 등록 성공 후

```tsx
await createStaff(...);
handleBackClick();  // router → /staff
```

목록에서:

1. `GET /api/staff` → `photoUrl: "/api/staff/6666/photo"`
2. `<img src="http://localhost:8081/api/staff/6666/photo">`
3. 백엔드 프록시 → SeaweedFS download → 이미지 표시

---

## 12. 사진 없이 등록

```typescript
toStaffCreatePayload(form, null)
// photo: undefined → formData에 photo part 추가 안 함
```

```java
photoKey = null;
staff.setStaffPhotoKey(null);
// toDto → photoUrl 없음 → 목록 "-"
```

---

## 13. 에러 처리

### 프론트 — `getStaffCreateErrorMessage(error)`

| HTTP status | 메시지 |
|-------------|--------|
| 400 | 등록 요청 형식 오류 |
| 500 | 사번 중복 등 |

### 실패 시

```tsx
setFormError(getStaffCreateErrorMessage(error));
// submitting=false → 버튼 다시 활성
```

---

## 14. Redux를 안 쓰는 이유 (다시 정리)

```typescript
// ❌ Redux action에 File 넣으면
dispatch(createStaffRequest({ ...form, photo: File }))
// → "non-serializable value" 경고/에러

// ✅ 현재
const [submitting, setSubmitting] = useState(false);
await createStaff(payload);  // 컴포넌트에서 직접
```

---

## 15. 파일 매핑 총정리

| 단계 | 파일 |
|------|------|
| UI | `src/components/staff/StaffRegister.tsx` |
| 매핑 | `src/features/staff/lib/staffMapper.ts` |
| 타입 | `src/features/staff/types/staffTypes.ts` |
| API | `src/features/staff/api/staffApi.ts` |
| HTTP | `src/lib/Axios.ts` |
| BE Controller | `StaffController.createStaff()` |
| BE Service | `StaffServiceImpl.createStaff()` |
| SeaweedFS | `SeaweedFsService.uploadStaffPhoto()` |
| CSS | `src/styles/staff-register.css` |

---

## 16. 타임라인

| # | 동작 | 화면 |
|---|------|------|
| 1 | /staff/register | 모달 폼 |
| 2 | 부서 API | select 채움 |
| 3 | 사진 선택 | 미리보기 |
| 4 | 등록 클릭 | "등록 중..." |
| 5 | multipart POST | 대기 |
| 6 | success | /staff 이동 |
| 7 | 목록 img | 사진 표시 |
