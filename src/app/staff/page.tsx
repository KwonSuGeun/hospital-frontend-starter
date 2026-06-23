// ============================================================
// [직원 목록] 라우트: /staff — app/staff/page.tsx
// 컴포넌트: components/staff/staff.tsx
// Redux: fetchStaffRequest → staffSlice.items
// ============================================================

import RequireAuth from "@/components/auth/RequireAuth";
import Staff from "@/components/staff/staff";

export default function StaffPage() {
  return (
    <RequireAuth>
      <Staff />
    </RequireAuth>
  );
}
