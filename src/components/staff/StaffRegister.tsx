"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fetchDepartmentList, createStaff } from "@/features/staff/api/staffApi";
import {
  getStaffCreateErrorMessage,
  REGISTER_ADDRESS_INITIAL,
  STAFF_CREATE_FORM_INITIAL,
  toRegisterSubmitForm,
  toStaffCreatePayload,
  validateRegisterForm,
  type RegisterAddressForm,
} from "@/features/staff/utils/registerForm";
import type { DepartmentItem, StaffCreateForm } from "@/features/staff/types/staffTypes";
import {
  AvatarPlaceholderIcon,
  CloseIcon,
  LocationIcon,
  PersonIcon,
  UploadIcon,
} from "@/icons";
import "@/styles/staff-register.css";

const DAUM_POSTCODE_SCRIPT_URL =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

type DaumPostcodeData = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: "R" | "J";
};

type FieldType = "text" | "password" | "email" | "tel" | "date" | "select";

type FieldConfig = {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  emptyOptionLabel?: string;
};

type BasicFieldConfig = FieldConfig & {
  name: keyof StaffCreateForm;
};

const BASIC_FIELDS: BasicFieldConfig[] = [
  { id: "staffNo", name: "staffNo", label: "사번", type: "text", required: true, placeholder: "사번을 입력하세요" },
  { id: "password", name: "password", label: "비밀번호", type: "password", required: true, placeholder: "비밀번호를 입력하세요" },
  { id: "departmentId", name: "departmentId", label: "소속 부서", type: "select", required: true, emptyOptionLabel: "부서 선택" },
  { id: "name", name: "name", label: "이름", type: "text", required: true, placeholder: "이름을 입력하세요" },
  { id: "birthDate", name: "birthDate", label: "생년월일", type: "date", required: true, placeholder: "연도-월-일" },
  { id: "email", name: "email", label: "이메일", type: "email", placeholder: "이메일을 입력하세요" },
  { id: "staffPhone", name: "staffPhone", label: "휴대폰번호", type: "tel", required: true, placeholder: "010-1234-5678" },
  { id: "staffRankCode", name: "staffRankCode", label: "면허번호", type: "text", placeholder: "면허번호를 입력하세요", hint: "의사/간호사만 필수" },
];

const ADDRESS_FIELDS: FieldConfig[] = [
  { id: "baseAddress", label: "기본주소", type: "text", required: true, placeholder: "기본주소를 입력하세요" },
  { id: "detailAddress", label: "상세주소 (선택)", type: "text", placeholder: "상세주소를 입력하세요" },
];

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void;
        onclose?: () => void;
        width?: string | number;
        height?: string | number;
      }) => {
        embed: (element: HTMLElement) => void;
      };
    };
  }
}

function loadDaumPostcodeScript() {
  if (window.daum?.Postcode) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = DAUM_POSTCODE_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("postcode script load failed"));
    document.head.appendChild(script);
  });
}

function renderField(
  field: FieldConfig,
  value: string,
  onChange: (value: string) => void,
  options?: { value: string; label: string }[]
) {
  const inputClassName =
    field.type === "date"
      ? "staff-register__input staff-register__input--date"
      : "staff-register__input";

  return (
    <div className="staff-register__field" key={field.id}>
      <label className="staff-register__label" htmlFor={field.id}>
        {field.label}
        {field.required && <span className="staff-register__required">*</span>}
      </label>

      {field.type === "select" ? (
        <select
          id={field.id}
          className="staff-register__select"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.emptyOptionLabel && <option value="">{field.emptyOptionLabel}</option>}
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={field.id}
          className={inputClassName}
          type={field.type}
          placeholder={field.placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {field.hint && <p className="staff-register__hint">{field.hint}</p>}
    </div>
  );
}

export default function StaffRegister() {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const postcodeLayerRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<StaffCreateForm>(STAFF_CREATE_FORM_INITIAL);
  const [address, setAddress] = useState<RegisterAddressForm>(REGISTER_ADDRESS_INITIAL);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [postcodeLoadFailed, setPostcodeLoadFailed] = useState(false);

  const handleBackClick = () => router.push("/staff");

  useEffect(() => {
    if (!photo) {
      setPhotoPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(photo);
    setPhotoPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [photo]);

  useEffect(() => {
    fetchDepartmentList()
      .then(setDepartments)
      .catch(() => setFormError("부서 목록을 불러오지 못했습니다."));
  }, []);

  useEffect(() => {
    if (!isPostcodeOpen) {
      return;
    }

    let cancelled = false;
    setPostcodeLoadFailed(false);

    void loadDaumPostcodeScript()
      .then(() => {
        if (cancelled || !postcodeLayerRef.current || !window.daum?.Postcode) {
          return;
        }

        postcodeLayerRef.current.innerHTML = "";

        new window.daum.Postcode({
          oncomplete: (data) => {
            const selectedAddress =
              data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

            setAddress((prev) => ({
              ...prev,
              zipCode: data.zonecode,
              baseAddress: selectedAddress,
            }));
            setFormError(null);
            setIsPostcodeOpen(false);
            setTimeout(() => document.getElementById("detailAddress")?.focus(), 0);
          },
          onclose: () => {
            if (!cancelled) {
              setIsPostcodeOpen(false);
            }
          },
          width: "100%",
          height: "100%",
        }).embed(postcodeLayerRef.current);
      })
      .catch(() => {
        if (!cancelled) {
          setPostcodeLoadFailed(true);
        }
      });

    return () => {
      cancelled = true;
      if (postcodeLayerRef.current) {
        postcodeLayerRef.current.innerHTML = "";
      }
    };
  }, [isPostcodeOpen]);

  const handleChange = (field: keyof StaffCreateForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleAddressChange = (field: keyof RegisterAddressForm, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const validationError = validateRegisterForm(form, address);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await createStaff(toStaffCreatePayload(toRegisterSubmitForm(form, address), photo));
      handleBackClick();
    } catch (error) {
      setFormError(getStaffCreateErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const departmentOptions = departments.map((department) => ({
    value: department.departmentId,
    label: department.departmentName,
  }));

  return (
    <section className="staff-register">
      <div className="staff-register__modal">
        <header className="staff-register__modal-header">
          <h1 className="staff-register__title">신규 직원 등록</h1>
          <button type="button" className="staff-register__close-button" onClick={handleBackClick} aria-label="닫기">
            <CloseIcon />
          </button>
        </header>

        <div className="staff-register__modal-body">
          <aside className="staff-register__photo-panel">
            <div className="staff-register__photo-avatar">
              {photoPreviewUrl ? (
                <img src={photoPreviewUrl} alt="등록 사진 미리보기" />
              ) : (
                <AvatarPlaceholderIcon />
              )}
            </div>
            <input
              ref={photoInputRef}
              id="photo"
              className="staff-register__photo-input"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              className="staff-register__photo-upload-button"
              onClick={() => photoInputRef.current?.click()}
            >
              <UploadIcon />
              사진 업로드
            </button>
            <p className="staff-register__photo-hint">
              권장 크기 300x300px / JPG, PNG 파일
              <br />
              (최대 5MB)
            </p>
          </aside>

          <div className="staff-register__form-area">
            <form id="staff-register-form" className="staff-register__form" onSubmit={handleSubmit}>
              {formError && <div className="staff-register__error">{formError}</div>}

              <section className="staff-register__section">
                <h2 className="staff-register__section-title">
                  <PersonIcon />
                  기본 정보
                </h2>
                <div className="staff-register__grid">
                  {BASIC_FIELDS.map((field) =>
                    renderField(
                      field,
                      form[field.name],
                      (value) => handleChange(field.name, value),
                      field.name === "departmentId" ? departmentOptions : undefined
                    )
                  )}
                </div>
              </section>

              <section className="staff-register__section">
                <h2 className="staff-register__section-title">
                  <LocationIcon />
                  주소 정보
                </h2>
                <div className="staff-register__address-box">
                  <div className="staff-register__zip-row">
                    {renderField(
                      {
                        id: "zipCode",
                        label: "우편번호",
                        type: "text",
                        required: true,
                        placeholder: "우편번호를 입력하세요",
                      },
                      address.zipCode,
                      (value) => handleAddressChange("zipCode", value)
                    )}
                    <button
                      type="button"
                      className="staff-register__zip-button"
                      onClick={() => {
                        setFormError(null);
                        setPostcodeLoadFailed(false);
                        setIsPostcodeOpen(true);
                      }}
                    >
                      우편번호 찾기
                    </button>
                  </div>

                  {ADDRESS_FIELDS.map((field) =>
                    renderField(
                      field,
                      address[field.id as keyof RegisterAddressForm],
                      (value) => handleAddressChange(field.id as keyof RegisterAddressForm, value)
                    )
                  )}
                </div>
              </section>
            </form>
          </div>
        </div>

        <footer className="staff-register__modal-footer">
          <button type="button" className="staff-register__cancel-button" onClick={handleBackClick}>
            취소
          </button>
          <button
            type="submit"
            form="staff-register-form"
            className="staff-register__submit-button"
            disabled={submitting}
          >
            {submitting ? "등록 중..." : "등록 완료"}
          </button>
        </footer>
      </div>

      {isPostcodeOpen && (
        <div
          className="staff-register__postcode-overlay"
          role="presentation"
          onClick={() => setIsPostcodeOpen(false)}
        >
          <div
            className="staff-register__postcode-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="postcode-search-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="staff-register__postcode-header">
              <h2 id="postcode-search-title" className="staff-register__postcode-title">
                우편번호 검색
              </h2>
              <button
                type="button"
                className="staff-register__close-button"
                onClick={() => setIsPostcodeOpen(false)}
                aria-label="닫기"
              >
                <CloseIcon />
              </button>
            </header>
            {postcodeLoadFailed ? (
              <div className="staff-register__postcode-error">우편번호 검색을 불러오지 못했습니다.</div>
            ) : (
              <div ref={postcodeLayerRef} className="staff-register__postcode-embed" />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
