"use client";

// ============================================================
// [직원 등록] /staff/register — components/staff/StaffRegister.tsx
// 폼: StaffCreateForm → toStaffCreatePayload() → createStaff() (multipart)
// Redux: createLoading / createError / createSuccess 만 사용 (File 은 Redux 미경유)
// ============================================================

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchDepartmentList, createStaff } from "@/features/staff/api/staffApi";
import {
  STAFF_CREATE_FORM_INITIAL,
  toStaffCreatePayload,
} from "@/features/staff/lib/staffCreateMapper";
import {
  createStaffFailure,
  createStaffRequest,
  createStaffSuccess,
  resetCreateStaff,
} from "@/features/staff/slice/staffSlice";
import type { DepartmentItem, StaffCreateForm } from "@/features/staff/types/staffTypes";
import type { AppDispatch, RootState } from "@/store/Store";
import "@/styles/staff-register.css";

export default function StaffRegister() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { createLoading, createError, createSuccess } = useSelector(
    (state: RootState) => state.staff
  );

  const [form, setForm] = useState<StaffCreateForm>(STAFF_CREATE_FORM_INITIAL);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  // --- 언마운트 시 등록 state 초기화 ---
  useEffect(() => {
    return () => {
      dispatch(resetCreateStaff());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!photo) {
      setPhotoPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(photo);
    setPhotoPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [photo]);

  // --- 부서 목록 로드 (GET /api/staff/departments) ---
  useEffect(() => {
    fetchDepartmentList()
      .then((items) => {
        setDepartments(items);
        if (items.length > 0) {
          setForm((prev) => ({
            ...prev,
            departmentId: prev.departmentId || items[0].departmentId,
          }));
        }
      })
      .catch(() => {
        setFormError("부서 목록을 불러오지 못했습니다.");
      });
  }, []);

  // --- 등록 성공 시 목록으로 이동 ---
  useEffect(() => {
    if (createSuccess) {
      router.push("/staff");
    }
  }, [createSuccess, router]);

  // --- 폼 입력 / 라우팅 ---
  const handleChange = (field: keyof StaffCreateForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleBackClick = () => {
    router.push("/staff");
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPhoto(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("이미지 파일만 첨부할 수 있습니다.");
      event.target.value = "";
      setPhoto(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("사진은 5MB 이하만 첨부할 수 있습니다.");
      event.target.value = "";
      setPhoto(null);
      return;
    }

    setFormError(null);
    setPhoto(file);
  };

  // --- 유효성 검사 + 등록 요청 (POST /api/staff) ---
  const handleSubmit = async () => {
    if (!form.staffNo.trim()) {
      setFormError("사번을 입력해주세요.");
      return;
    }

    if (!form.password.trim()) {
      setFormError("비밀번호를 입력해주세요.");
      return;
    }

    if (!form.name.trim()) {
      setFormError("이름을 입력해주세요.");
      return;
    }

    if (!form.departmentId) {
      setFormError("부서를 선택해주세요.");
      return;
    }

    if (!form.staffRankCode.trim()) {
      setFormError("직급을 입력해주세요.");
      return;
    }

    if (!form.staffPhone.trim()) {
      setFormError("연락처를 입력해주세요.");
      return;
    }

    if (!form.hireDate) {
      setFormError("입사일을 선택해주세요.");
      return;
    }

    if (!form.birthDate) {
      setFormError("생년월일을 선택해주세요.");
      return;
    }

    dispatch(createStaffRequest());

    try {
      await createStaff(toStaffCreatePayload(form, photo));
      dispatch(createStaffSuccess());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Staff create failed";
      dispatch(createStaffFailure(message));
    }
  };

  // --- 등록 폼 UI ---
  return (
    <section className="staff-register">
      <header className="staff-register__header">
        <button type="button" className="staff-register__back-button" onClick={handleBackClick}>
          Back
        </button>
        <h1 className="staff-register__title">직원 등록</h1>
      </header>
      <div className="staff-register__panel">
        <form
          className="staff-register__form"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          {(formError || createError) && (
            <div className="staff-register__error">{formError || createError}</div>
          )}

          <label className="staff-register__label" htmlFor="staffNo">
            사번
          </label>
          <input
            id="staffNo"
            className="staff-register__input"
            type="text"
            value={form.staffNo}
            onChange={(event) => handleChange("staffNo", event.target.value)}
          />

          <label className="staff-register__label" htmlFor="password">
            비밀번호
          </label>
          <input
            id="password"
            className="staff-register__input"
            type="text"
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
          />

          <label className="staff-register__label" htmlFor="name">
            이름
          </label>
          <input
            id="name"
            className="staff-register__input"
            type="text"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
          />

          <label className="staff-register__label" htmlFor="departmentId">
            부서
          </label>
          <select
            id="departmentId"
            className="staff-register__input"
            value={form.departmentId}
            onChange={(event) => handleChange("departmentId", event.target.value)}
          >
            {departments.map((department) => (
              <option key={department.departmentId} value={department.departmentId}>
                {department.departmentName}
              </option>
            ))}
          </select>

          <label className="staff-register__label" htmlFor="staffType">
            직종
          </label>
          <select
            id="staffType"
            className="staff-register__input"
            value={form.staffType}
            onChange={(event) => handleChange("staffType", event.target.value)}
          >
            <option value="DOC">의사</option>
            <option value="NUR">간호</option>
            <option value="ADM">행정</option>
          </select>

          <label className="staff-register__label" htmlFor="staffRankCode">
            직급
          </label>
          <input
            id="staffRankCode"
            className="staff-register__input"
            type="text"
            value={form.staffRankCode}
            onChange={(event) => handleChange("staffRankCode", event.target.value)}
          />

          <label className="staff-register__label" htmlFor="staffPositionCode">
            직책
          </label>
          <input
            id="staffPositionCode"
            className="staff-register__input"
            type="text"
            value={form.staffPositionCode}
            onChange={(event) => handleChange("staffPositionCode", event.target.value)}
          />

          <label className="staff-register__label" htmlFor="staffPhone">
            연락처
          </label>
          <input
            id="staffPhone"
            className="staff-register__input"
            type="text"
            value={form.staffPhone}
            onChange={(event) => handleChange("staffPhone", event.target.value)}
          />

          <label className="staff-register__label" htmlFor="staffExtensionNo">
            내선
          </label>
          <input
            id="staffExtensionNo"
            className="staff-register__input"
            type="text"
            value={form.staffExtensionNo}
            onChange={(event) => handleChange("staffExtensionNo", event.target.value)}
          />

          <label className="staff-register__label" htmlFor="email">
            이메일
          </label>
          <input
            id="email"
            className="staff-register__input"
            type="text"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
          />

          <label className="staff-register__label" htmlFor="address">
            주소
          </label>
          <input
            id="address"
            className="staff-register__input"
            type="text"
            value={form.address}
            onChange={(event) => handleChange("address", event.target.value)}
          />

          <label className="staff-register__label" htmlFor="hireDate">
            입사일
          </label>
          <input
            id="hireDate"
            className="staff-register__input"
            type="date"
            value={form.hireDate}
            onChange={(event) => handleChange("hireDate", event.target.value)}
          />

          <label className="staff-register__label" htmlFor="birthDate">
            생년월일
          </label>
          <input
            id="birthDate"
            className="staff-register__input"
            type="date"
            value={form.birthDate}
            onChange={(event) => handleChange("birthDate", event.target.value)}
          />

          <label className="staff-register__label" htmlFor="photo">
            사진
          </label>
          <input
            id="photo"
            className="staff-register__input staff-register__input--file"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handlePhotoChange}
          />
          {photoPreviewUrl && (
            <img
              src={photoPreviewUrl}
              alt="등록 사진 미리보기"
              className="staff-register__photo-preview"
            />
          )}

          <div className="staff-register__actions">
            <button
              type="submit"
              className="staff-register__submit-button"
              disabled={createLoading}
            >
              {createLoading ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
