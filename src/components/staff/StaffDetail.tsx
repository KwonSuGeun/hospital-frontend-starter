"use client";

// ============================================================
// [직원 상세] /staff/[id] — components/staff/StaffDetail.tsx
// Redux: fetchStaffDetailRequest → staffSlice (detail, detailLoading, detailError)
// Redux: deleteStaffRequest → staffSlice (deletingId, deleteError, deletedStaffId)
// 스타일: styles/staff-detail.css
// ============================================================

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  clearDeleteError,
  deleteStaffRequest,
  fetchStaffDetailRequest,
  resetDeleteStaff,
} from "@/features/staff/slice/staffSlice";
import type { StaffDetailItem } from "@/features/staff/types/staffTypes";
import type { AppDispatch, RootState } from "@/store/Store";
import "@/styles/staff-detail.css";

// --- 표시용 상수 / 헬퍼 ---
const STAFF_TYPE_LABEL: Record<string, string> = {
  DOC: "의사",
  NUR: "간호",
  ADM: "행정",
};

function displayValue(value?: string | null) {
  if (!value || !value.trim()) {
    return "-";
  }
  return value.trim();
}

function displayStaffType(value?: string) {
  if (!value) {
    return "-";
  }
  return STAFF_TYPE_LABEL[value] ?? value;
}

type DetailRow = {
  label: string;
  value: string;
};

function buildDetailRows(detail: StaffDetailItem): DetailRow[] {
  return [
    { label: "사번", value: displayValue(detail.id) },
    { label: "이름", value: displayValue(detail.name) },
    { label: "재직 상태", value: displayValue(detail.staffStatus) },
    { label: "부서", value: displayValue(detail.departmentName) },
    { label: "직종", value: displayStaffType(detail.staffType) },
    { label: "직급", value: displayValue(detail.staffRankCode) },
    { label: "직책", value: displayValue(detail.staffPositionCode) },
    { label: "연락처", value: displayValue(detail.staffPhone) },
    { label: "내선", value: displayValue(detail.staffExtensionNo) },
    { label: "이메일", value: displayValue(detail.email) },
    { label: "주소", value: displayValue(detail.address) },
    { label: "입사일", value: displayValue(detail.hireDate) },
    { label: "생년월일", value: displayValue(detail.birthDate) },
  ];
}

export default function StaffDetail() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { detail, detailLoading, detailError, deletingId, deleteError, deletedStaffId } =
    useSelector((state: RootState) => state.staff);

  const staffId = typeof params.id === "string" ? params.id : "";
  const isDeleting = deletingId === staffId;

  // --- 마운트 시 상세 조회 (GET /api/staff/{id}) ---
  useEffect(() => {
    if (staffId) {
      dispatch(fetchStaffDetailRequest(staffId));
    }
  }, [dispatch, staffId]);

  useEffect(() => {
    return () => {
      dispatch(resetDeleteStaff());
    };
  }, [dispatch]);

  useEffect(() => {
    if (deletedStaffId === staffId) {
      router.push("/staff");
    }
  }, [deletedStaffId, staffId, router]);

  const handleBackClick = () => {
    router.push("/staff");
  };

  const handleDeleteClick = () => {
    if (!detail) {
      return;
    }

    const confirmed = window.confirm(
      `"${detail.name}"(${detail.id}) 직원을 삭제하시겠습니까?`
    );
    if (!confirmed) {
      return;
    }

    dispatch(clearDeleteError());
    dispatch(deleteStaffRequest(staffId));
  };

  // --- 유효성 / 로딩 / 에러 / 빈 데이터 ---
  if (!staffId) {
    return (
      <section className="staff-detail">
        <div className="staff-detail__status staff-detail__status--error">잘못된 사번입니다.</div>
      </section>
    );
  }

  if (detailLoading) {
    return (
      <section className="staff-detail">
        <div className="staff-detail__status">직원 상세 불러오는 중...</div>
      </section>
    );
  }

  if (detailError) {
    return (
      <section className="staff-detail">
        <header className="staff-detail__header">
          <button type="button" className="staff-detail__back-button" onClick={handleBackClick}>
            Back
          </button>
        </header>
        <div className="staff-detail__status staff-detail__status--error">직원 상세 오류: {detailError}</div>
      </section>
    );
  }

  if (!detail) {
    return (
      <section className="staff-detail">
        <div className="staff-detail__status">직원 정보를 찾을 수 없습니다.</div>
      </section>
    );
  }

  const detailRows = buildDetailRows(detail);

  // --- 상세 목록 렌더 ---
  return (
    <section className="staff-detail">
      <header className="staff-detail__header">
        <button type="button" className="staff-detail__back-button" onClick={handleBackClick}>
          Back
        </button>
        <h1 className="staff-detail__title">직원 상세</h1>
        <button
          type="button"
          className="staff-detail__delete-button"
          disabled={isDeleting}
          onClick={handleDeleteClick}
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </button>
      </header>
      {deleteError && (
        <div className="staff-detail__delete-error">삭제 오류: {deleteError}</div>
      )}
      <div className="staff-detail__panel">
        <ul className="staff-detail__list">
          {detailRows.map((row) => (
            <li key={row.label} className="staff-detail__row">
              <span className="staff-detail__label">{row.label}</span>
              <span className="staff-detail__value">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
