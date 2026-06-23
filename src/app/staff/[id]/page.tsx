// ============================================================
// [직원 상세] 라우트: /staff/[id] — app/staff/[id]/page.tsx
// 컴포넌트: components/staff/StaffDetail.tsx
// Redux: fetchStaffDetailRequest → staffSlice.detail
// ============================================================

import RequireAuth from "@/components/auth/RequireAuth";
import StaffDetail from "@/components/staff/StaffDetail";

export default function StaffDetailPage() {
  return (
    <RequireAuth>
      <StaffDetail />
    </RequireAuth>
  );
}
