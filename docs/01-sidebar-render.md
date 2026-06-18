# 사이드바 렌더링 과정 (상세)

> 최신 코드 기준  
> 관련 파일: `app/layout.tsx` → `sidebar.tsx` → `SidebarMenuItem.tsx` → Saga → API → `toMenuTree` → 백엔드(DB 조회)

---

## 0. 한 줄 요약

브라우저가 **어떤 URL이든** 열면 `layout.tsx`가 **항상 `<Sidebar />`를 mount**하고, Sidebar가 **Redux action → Saga → GET /api/sidebar**로 메뉴 **flat row**를 받은 뒤 **`toMenuTree()`로 트리를 조합**하고 **`SidebarMenuItem` 재귀**로 화면에 그립니다.

---

## 1. 전체 흐름 다이어그램

```
[브라우저] GET / (또는 /staff 등)
    ↓
[Next.js] app/layout.tsx 렌더
    ↓
[Providers] Redux store 연결
    ↓
[Sidebar] useEffect → dispatch(fetchSidebarRequest())
    ↓
[sidebarSlice] loading=true
    ↓
[sidebarSaga] yield call(fetchSidebarApi)
    ↓
[sidebarApi] axios GET http://localhost:8081/api/sidebar
    ↓
[백엔드] SidebarController → SidebarServiceImpl → MyBatis → Oracle AUTH_MENU (flat row)
    ↓
[sidebarApi] toMenuTree(flat rows) → SidebarItem[] 트리
    ↓
[sidebarSaga] yield put(fetchSidebarSuccess(items))
    ↓
[sidebarSlice] items=메뉴트리, loading=false
    ↓
[Sidebar] items.map → SidebarMenuItem (재귀)
    ↓
[화면] 버튼(부모) 또는 Link(리프)
```

---

## 2. Step 1 — Layout에서 Sidebar가 항상 붙는 이유

### 파일: `src/app/layout.tsx`

```tsx
<Providers>
  <div className="app-shell">
    <aside className="app-shell__sidebar">
      <Sidebar />
    </aside>
    <main className="app-shell__main">{children}</main>
  </div>
</Providers>
```

| 요소 | 역할 |
|------|------|
| `Providers` | Redux `<Provider store={store}>` — 전역 state |
| `<Sidebar />` | **모든 페이지** 좌측 고정 |
| `{children}` | URL별 page (`/`, `/staff`, …) |

**중요:** `/staff`로 이동해도 layout은 **언마운트되지 않음**. `main`만 바뀌고 Sidebar는 **처음 한 번 mount된 뒤 유지**됩니다. (메뉴 API는 mount 시 1회 호출)

---

## 3. Step 2 — Redux Store & Saga 대기

### `src/app/Providers.tsx`

```tsx
<Provider store={store}>{children}</Provider>
```

### `src/store/Store.ts`

```typescript
reducer: { sidebar: sidebarReducer, staff: staffReducer }
sagaMiddleware.run(rootSaga);
```

앱 시작 시 `rootSaga`가 `watchSidebarSaga`를 **listen** 상태로 둡니다.

### sidebar 초기 state (`sidebarSlice.ts`)

```typescript
{
  items: [],        // 메뉴 데이터 (아직 없음)
  loading: false,   // 곧 true로 바뀜
  error: null,
}
```

---

## 4. Step 3 — Sidebar 컴포넌트 mount

### 파일: `src/components/sidebar/sidebar.tsx`

```tsx
"use client";  // useEffect, Redux 사용 → 클라이언트 컴포넌트 필수
```

#### 4-1. useSelector

```tsx
const { items, loading, error } = useSelector((state) => state.sidebar);
```

Redux `sidebar` slice를 **구독**. state가 바뀔 때마다 Sidebar **re-render**.

#### 4-2. useEffect — API 트리거

```tsx
useEffect(() => {
  dispatch(fetchSidebarRequest());
}, [dispatch]);
```

| 호출 | slice 변화 |
|------|------------|
| `fetchSidebarRequest()` | `loading=true`, `error=null` |

**1차 re-render** → `loading === true`:

```tsx
return <div>Sidebar loading...</div>;
```

---

## 5. Step 4 — Redux Saga 실행

### `dispatch(fetchSidebarRequest)` 이후

```
action type: "sidebar/fetchSidebarRequest"
    ↓
takeLatest → fetchSidebarSaga 실행
```

### `src/features/sidebar/saga/sidebarSaga.ts`

```typescript
function* fetchSidebarSaga() {
  try {
    const items: SidebarItem[] = yield call(fetchSidebarApi);
    yield put(fetchSidebarSuccess(items));
  } catch (error) {
    yield put(fetchSidebarFailure(message));
  }
}
```

| 코드 | 의미 |
|------|------|
| `yield call(fetchSidebarApi)` | API + `toMenuTree` 실행, **완료까지 대기** |
| `yield put(fetchSidebarSuccess(items))` | 성공 action dispatch (payload = **트리**) |
| `yield put(fetchSidebarFailure(message))` | 실패 action dispatch |

### slice success

```typescript
fetchSidebarSuccess(state, action) {
  state.loading = false;
  state.items = action.payload;  // SidebarItem[] 트리
}
```

---

## 6. Step 5 — HTTP API (flat row 조회)

### `src/features/sidebar/api/sidebarApi.ts`

```typescript
export async function fetchSidebarApi(): Promise<SidebarItem[]> {
  const response = await api.get<SidebarApiResponse>("/api/sidebar");
  return toMenuTree(response.data.data);
}
```

| 표현 | 값 |
|------|-----|
| `api.get(...)` | axios GET |
| `response.data` | `{ code, message, data }` |
| `response.data.data` | **flat row 배열** (`SidebarMenuRow[]`) |
| `toMenuTree(...)` | flat → nested tree 변환 후 Saga에 반환 |

**실제 요청 URL**

```
GET {NEXT_PUBLIC_API_URL}/api/sidebar
기본: http://localhost:8081/api/sidebar
```

### API 응답 JSON 예시 (flat)

```json
{
  "code": "SUCCESS",
  "message": "OK",
  "data": [
    {
      "id": 1,
      "parentId": null,
      "label": "관리",
      "path": null
    },
    {
      "id": 2,
      "parentId": 1,
      "label": "직원 목록",
      "path": "/staff"
    }
  ]
}
```

### SidebarMenuRow 타입 (API / DB row)

```typescript
{
  id: number;
  parentId: number | null;
  label: string;
  path: string | null;
}
```

---

## 7. Step 6 — toMenuTree (프론트 트리 조합)

### 파일: `src/features/sidebar/utils/menuTree.ts`

백엔드는 **DB flat row만** 반환합니다. `parentId`로 부모-자식을 연결해 **UI용 트리**를 만드는 책임은 React 쪽입니다.

```typescript
export function toMenuTree(flatRows: SidebarMenuRow[]): SidebarItem[] {
  const menuById: Record<number, SidebarItem & { children: SidebarItem[] }> = {};
  const topMenus: SidebarItem[] = [];

  // 1. row마다 메뉴 객체 만들기
  for (const row of flatRows) {
    menuById[row.id] = {
      id: row.id,
      label: row.label,
      path: row.path ?? "",
      children: [],
    };
  }

  // 2. parentId가 null → 최상위, 아니면 부모.children에 추가
  for (const row of flatRows) {
    const menu = menuById[row.id];

    if (row.parentId === null) {
      topMenus.push(menu);
      continue;
    }

    const parentMenu = menuById[row.parentId];
    if (parentMenu) {
      parentMenu.children.push(menu);
    }
  }

  return topMenus;
}
```

| 변수 | 의미 |
|------|------|
| `menuById` | `id`로 메뉴를 빠르게 찾는 객체 |
| `topMenus` | `parentId === null`인 **최상위 메뉴** 배열 |
| `parentMenu.children` | 하위 메뉴가 붙는 배열 |

### toMenuTree 이후 SidebarItem (Redux / UI)

```typescript
{
  id: number;
  label: string;
  path: string;
  children?: SidebarItem[];  // optional → 없으면 undefined (리프)
}
```

**예:** 위 flat JSON → Redux `items`:

```json
[
  {
    "id": 1,
    "label": "관리",
    "path": "",
    "children": [
      {
        "id": 2,
        "label": "직원 목록",
        "path": "/staff"
      }
    ]
  }
]
```

---

## 8. Step 7 — 백엔드 (참고, DB 조회만)

```
SidebarController.getSidebarMenuRows()
  → sidebarService.getSidebarMenuRows()
  → sidebarMapper.selectSidebarMenuRows()   // MyBatis
  → ApiResponse.success(flat rows)
```

DB: `HOSPITAL.AUTH_MENU` (`IS_ACTIVE = 'Y'`, `SORT_ORDER`)

| 컬럼 | DTO 필드 |
|------|----------|
| `MENU_ID` | `id` |
| `PARENT_ID` | `parentId` |
| `NAME` | `label` |
| `PATH` | `path` |

**트리 조합(`buildTree`)은 백엔드에 없음** — 프론트 `toMenuTree`에서 처리.

---

## 9. Step 8 — SidebarMenuItem 재귀 렌더 (핵심)

### 파일: `src/components/sidebar/SidebarMenuItem.tsx`

Sidebar가 성공하면:

```tsx
{items.map((item) => (
  <SidebarMenuItem key={item.id} item={item} />
))}
```

**최상위 메뉴 1개 = SidebarMenuItem 1인스턴스**

---

### 9-1. 부모 vs 리프 판별

```tsx
const hasChildren = Boolean(item.children && item.children.length > 0);
```

| `item.children` | `length` | `hasChildren` | UI |
|-----------------|----------|---------------|-----|
| `undefined` | - | **false** | Link (리프) |
| `[]` | 0 | **false** | Link (리프) |
| `[{...}]` | ≥ 1 | **true** | button (부모) |

**`&&` = AND (그리고)** — 둘 다 true일 때만 부모.

**`undefined` / `[]` 의미:** 리프는 `children`이 없거나 빈 배열 → `hasChildren === false` → **Link**.

---

### 9-2. 부모 메뉴 (hasChildren === true)

```tsx
const [open, setOpen] = useState(false);

<button onClick={() => setOpen((prev) => !prev)}>
  {item.label}
</button>

{open && (
  <ul>
    {item.children!.map((child) => (
      <SidebarMenuItem key={child.id} item={child} />
    ))}
  </ul>
)}
```

#### `open` state

| 시점 | open | 화면 |
|------|------|------|
| 초기 | `false` | 버튼만, 자식 `<ul>` **없음** |
| 버튼 클릭 | `true` | `{open && ...}` → 자식 **재귀** mount |

#### `setOpen((prev) => !prev)` 분석

```
첫 클릭: prev=false → !false=true → setOpen(true)  → 펼침
둘째 클릭: prev=true → !true=false → setOpen(false) → 접힘
```

**`!` = NOT (boolean 반대). `+` 더하기 아님.**

#### `item.children!` 의 `!`

TypeScript **non-null assertion** — “여기선 children 있다”고 컴파일러에 알림.  
**런타임 동작 변경 없음.** `hasChildren` 블록 안에서만 사용.

#### 재귀

```tsx
<SidebarMenuItem item={child} />
```

**같은 컴포넌트**가 자식 `item`으로 **다시 호출** → 트리 depth만큼 반복.

**종료 조건:** `hasChildren === false` → 아래 Link return, 더 이상 재귀 없음.

---

### 9-3. 리프 메뉴 (hasChildren === false)

```tsx
return (
  <li>
    <Link href={item.path}>{item.label}</Link>
  </li>
);
```

| 위치 | 설명 |
|------|------|
| 최상위 `<ul>` 바로 아래 | `children` 없는 최상위 메뉴 |
| nested `<ul>` 안 | 2depth, 3depth 리프 |

클릭 → Next.js Client Navigation → `main`만 해당 page로 교체.

---

### 9-4. DOM 트리 예시 (관리 펼친 후)

```
<nav>
  <ul>                                    ← sidebar.tsx
    <li>                                  ← SidebarMenuItem id=1
      <button>관리</button>
      <ul>                                ← open=true 일 때
        <li><Link>/staff 직원</Link></li>  ← 리프 (hasChildren=false)
      </ul>
    </li>
  </ul>
</nav>
```

---

## 10. 타임라인

| # | 시점 | 사용자가 보는 것 |
|---|------|------------------|
| 1 | layout HTML | shell (사이드바 영역) |
| 2 | Sidebar mount | "Sidebar loading..." |
| 3 | GET /api/sidebar + toMenuTree | loading |
| 4 | success | 메뉴 버튼/링크 |
| 5 | 부모 클릭 | 하위 메뉴 펼침 |
| 6 | Link 클릭 | main 페이지 전환 |

---

## 11. 에러 시

```typescript
fetchSidebarFailure → error = "Sidebar fetch failed"
```

원인: 백엔드 미실행, CORS, DB 조회 실패, `toMenuTree` 입력 데이터 오류 등.

---

## 12. 관련 파일 체크리스트

| 순서 | 파일 |
|------|------|
| 1 | `src/app/layout.tsx` |
| 2 | `src/app/Providers.tsx` |
| 3 | `src/store/Store.ts` |
| 4 | `src/store/RootSaga.ts` |
| 5 | `src/features/sidebar/slice/sidebarSlice.ts` |
| 6 | `src/features/sidebar/saga/sidebarSaga.ts` |
| 7 | `src/features/sidebar/api/sidebarApi.ts` |
| 8 | `src/features/sidebar/utils/menuTree.ts` |
| 9 | `src/features/sidebar/types/sidebarTypes.ts` |
| 10 | `src/lib/Axios.ts` |
| 11 | `src/components/sidebar/sidebar.tsx` |
| 12 | `src/components/sidebar/SidebarMenuItem.tsx` |
| 13 | (BE) `SidebarController.java` |
| 14 | (BE) `SidebarServiceImpl.java` |
| 15 | (BE) `SidebarMapper.xml` |
