"use client";

// ============================================================
// [직원 목록] /staff — components/staff/staff.tsx
// Redux: fetchStaffRequest → staffSlice (items, loading, error)
// 스타일: styles/staff-page.css
// ============================================================

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchStaffRequest } from "@/features/staff/slice/staffSlice";
import { resolveStaffPhotoUrl } from "@/features/staff/api/staffApi";
import type { AppDispatch, RootState } from "@/store/Store";
import "@/styles/staff-page.css";

export default function Staff() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.staff);

  // --- 마운트 시 목록 조회 (GET /api/staff) ---
  useEffect(() => {
    dispatch(fetchStaffRequest());
  }, [dispatch]);

  // --- 라우팅 ---
  const handleNameClick = (id: string) => {
    router.push(`/staff/${id}`);
  };

  const handleRegisterClick = () => {
    router.push("/staff/register");
  };

  // --- 로딩 / 에러 ---
  if (loading) {
    return (
      <section className="staff-page">
        <div className="staff-page__status">직원 목록 불러오는 중...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="staff-page">
        <div className="staff-page__status staff-page__status--error">직원 목록 오류: {error}</div>
      </section>
    );
  }

  // --- 목록 테이블 ---
  return (
    <section className="staff-page">
      <header className="staff-page__header">
        <h1 className="staff-page__title">직원 목록</h1>
        <button type="button" className="staff-page__register-button" onClick={handleRegisterClick}>
          등록
        </button>
      </header>
      <div className="staff-page__panel">
        <table className="staff-page__table">
          <colgroup>
            <col />
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>사진</th>
              <th>ID</th>
              <th>이름</th>
              <th>부서</th>
              <th>이메일</th>
            </tr>
          </thead>
          <tbody>
            {items.map((staff) => {
              const photoSrc = resolveStaffPhotoUrl(staff.photoUrl);

              return (
                <tr key={staff.id}>
                  <td>
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt={`${staff.name} 사진`}
                        className="staff-page__photo"
                      />
                    ) : (
                      <span className="staff-page__photo-placeholder">-</span>
                    )}
                  </td>
                  <td>{staff.id}</td>
                  <td>
                    <button
                      type="button"
                      className="staff-page__name-button"
                      onClick={() => handleNameClick(staff.id)}
                    >
                      {staff.name}
                    </button>
                  </td>
                  <td>{staff.departmentName}</td>
                  <td>{staff.email}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
