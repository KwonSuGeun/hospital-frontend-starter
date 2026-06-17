"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchStaffDetail, resolveStaffPhotoUrl } from "@/features/staff/api/staffApi";
import {
  clearDeleteError,
  deleteStaffRequest,
  resetDeleteStaff,
} from "@/features/staff/slice/staffSlice";
import type { StaffDetailItem } from "@/features/staff/types/staffTypes";
import type { AppDispatch, RootState } from "@/store/Store";
import { AvatarPlaceholderIcon, CloseIcon, LocationIcon, PersonIcon } from "@/icons";
import "@/styles/staff-detail.css";

const STAFF_TYPE_LABEL: Record<string, string> = {
  DOC: "의사",
  NUR: "간호",
  ADM: "행정",
};

type DetailField = {
  id: string;
  label: string;
  value: string;
  fullWidth?: boolean;
};

function displayValue(value?: string | number | null) {
  if (value === null || value === undefined) {
    return "-";
  }

  const text = String(value).trim();
  if (!text) {
    return "-";
  }

  return text;
}

function displayStaffType(value?: string) {
  if (!value) {
    return "-";
  }
  return STAFF_TYPE_LABEL[value] ?? value;
}

function buildBasicFields(detail: StaffDetailItem): DetailField[] {
  return [
    { id: "staffNo", label: "사번", value: displayValue(detail.id) },
    { id: "name", label: "이름", value: displayValue(detail.name) },
    { id: "department", label: "소속 부서", value: displayValue(detail.departmentName) },
    { id: "birthDate", label: "생년월일", value: displayValue(detail.birthDate) },
    { id: "email", label: "이메일", value: displayValue(detail.email) },
    { id: "staffPhone", label: "휴대폰번호", value: displayValue(detail.staffPhone) },
    { id: "staffRankCode", label: "면허번호", value: displayValue(detail.staffRankCode) },
    { id: "staffStatus", label: "재직 상태", value: displayValue(detail.staffStatus) },
  ];
}

function buildWorkFields(detail: StaffDetailItem): DetailField[] {
  return [
    { id: "staffType", label: "직종", value: displayStaffType(detail.staffType) },
    { id: "staffPositionCode", label: "직책", value: displayValue(detail.staffPositionCode) },
    { id: "staffExtensionNo", label: "내선번호", value: displayValue(detail.staffExtensionNo) },
    { id: "hireDate", label: "입사일", value: displayValue(detail.hireDate) },
  ];
}

function DetailFieldItem({ field }: { field: DetailField }) {
  const isEmpty = field.value === "-";

  return (
    <div className={`staff-detail__field${field.fullWidth ? " staff-detail__field--full" : ""}`}>
      <span className="staff-detail__label">{field.label}</span>
      <div className={`staff-detail__value${isEmpty ? " staff-detail__value--muted" : ""}`}>
        {field.value}
      </div>
    </div>
  );
}

function DetailSection({
  title,
  icon,
  fields,
}: {
  title: string;
  icon: ReactNode;
  fields: DetailField[];
}) {
  return (
    <section className="staff-detail__section">
      <h2 className="staff-detail__section-title">
        {icon}
        {title}
      </h2>
      <div className="staff-detail__grid">
        {fields.map((field) => (
          <DetailFieldItem key={field.id} field={field} />
        ))}
      </div>
    </section>
  );
}

function DetailShell({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="staff-detail">
      <div className="staff-detail__modal">
        <header className="staff-detail__modal-header">
          <h1 className="staff-detail__title">{title}</h1>
          {onClose && (
            <button type="button" className="staff-detail__close-button" onClick={onClose} aria-label="닫기">
              <CloseIcon />
            </button>
          )}
        </header>
        {children}
        {footer}
      </div>
    </section>
  );
}

export default function StaffDetail() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { deletingId, deleteError, deletedStaffId } = useSelector((state: RootState) => state.staff);
  const [detail, setDetail] = useState<StaffDetailItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);

  const staffId = typeof params.id === "string" ? params.id : "";
  const isDeleting = deletingId === staffId;

  useEffect(() => {
    if (!staffId) {
      setDetail(null);
      setDetailLoading(false);
      setDetailError(null);
      return;
    }

    let cancelled = false;

    setDetail(null);
    setDetailLoading(true);
    setDetailError(null);

    fetchStaffDetail(staffId)
      .then((item) => {
        if (!cancelled) {
          setDetail(item);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Staff detail fetch failed";
          setDetailError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [staffId]);

  useEffect(() => {
    setPhotoFailed(false);
  }, [staffId]);

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

    const confirmed = window.confirm(`"${detail.name}"(${detail.id}) 직원을 삭제하시겠습니까?`);
    if (!confirmed) {
      return;
    }

    dispatch(clearDeleteError());
    dispatch(deleteStaffRequest(staffId));
  };

  if (!staffId) {
    return (
      <DetailShell title="직원 상세">
        <div className="staff-detail__status staff-detail__status--error">잘못된 사번입니다.</div>
      </DetailShell>
    );
  }

  if (detailLoading) {
    return (
      <DetailShell title="직원 상세" onClose={handleBackClick}>
        <div className="staff-detail__status">직원 상세 불러오는 중...</div>
      </DetailShell>
    );
  }

  if (detailError) {
    return (
      <DetailShell title="직원 상세" onClose={handleBackClick}>
        <div className="staff-detail__status staff-detail__status--error">직원 상세 오류: {detailError}</div>
      </DetailShell>
    );
  }

  if (!detail) {
    return (
      <DetailShell title="직원 상세" onClose={handleBackClick}>
        <div className="staff-detail__status">직원 정보를 찾을 수 없습니다.</div>
      </DetailShell>
    );
  }

  const photoSrc = resolveStaffPhotoUrl(`/api/staff/${detail.id}/photo`);
  const basicFields = buildBasicFields(detail);
  const workFields = buildWorkFields(detail);
  const address = displayValue(detail.address);

  return (
    <DetailShell
      title="직원 상세"
      onClose={handleBackClick}
      footer={
        <footer className="staff-detail__modal-footer">
          <button type="button" className="staff-detail__back-button" onClick={handleBackClick}>
            목록으로
          </button>
          <button
            type="button"
            className="staff-detail__delete-button"
            disabled={isDeleting}
            onClick={handleDeleteClick}
          >
            {isDeleting ? "삭제 중..." : "삭제"}
          </button>
        </footer>
      }
    >
      <div className="staff-detail__modal-body">
        <aside className="staff-detail__photo-panel">
          <div className="staff-detail__photo-avatar">
            {photoSrc && !photoFailed ? (
              <img
                src={photoSrc}
                alt={`${detail.name} 사진`}
                onError={() => setPhotoFailed(true)}
              />
            ) : (
              <AvatarPlaceholderIcon />
            )}
          </div>
          <p className="staff-detail__photo-name">{detail.name}</p>
          <p className="staff-detail__photo-meta">{detail.id}</p>
        </aside>

        <div className="staff-detail__content">
          {deleteError && <div className="staff-detail__alert">삭제 오류: {deleteError}</div>}

          <DetailSection title="기본 정보" icon={<PersonIcon />} fields={basicFields} />

          <DetailSection title="근무 정보" icon={<PersonIcon />} fields={workFields} />

          <section className="staff-detail__section">
            <h2 className="staff-detail__section-title">
              <LocationIcon />
              주소 정보
            </h2>
            <div className="staff-detail__address-box">
              <div className="staff-detail__field staff-detail__field--full">
                <span className="staff-detail__label">주소</span>
                <div className={`staff-detail__value${address === "-" ? " staff-detail__value--muted" : ""}`}>
                  {address}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DetailShell>
  );
}
