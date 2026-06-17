"use client";

// ============================================================
// [사이드바 메뉴 항목] sidebar.tsx에서 재귀 렌더
// 자식 있음: 토글 버튼 + 중첩 ul
// 자식 없음: Next.js Link로 페이지 이동
// ============================================================

import Link from "next/link";
import { useState } from "react";
import type { SidebarItem } from "@/features/sidebar/types/sidebarTypes";

type SidebarMenuItemProps = {
  item: SidebarItem;
};

export default function SidebarMenuItem({ item }: SidebarMenuItemProps) {
  const hasChildren = Boolean(item.children && item.children.length > 0);
  const [open, setOpen] = useState(false);

  // --- 부모 메뉴 (펼치기/접기) ---
  if (hasChildren) {
    return (
      <li className="sidebar-nav__item">
        <button
          type="button"
          className="sidebar-nav__toggle"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="sidebar-nav__label">{item.label}</span>
          <span className="sidebar-nav__chevron" aria-hidden="true">
            ›
          </span>
        </button>
        {open && (
          <ul className="sidebar-nav__list sidebar-nav__list--nested">
            {item.children!.map((child) => (
              <SidebarMenuItem key={child.id} item={child} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  // --- 리프 메뉴 (링크) ---
  return (
    <li className="sidebar-nav__item">
      <Link className="sidebar-nav__link" href={item.path}>
        {item.label}
      </Link>
    </li>
  );
}
