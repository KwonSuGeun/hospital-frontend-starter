// ============================================================
// Root Layout — app/layout.tsx
// 전 페이지 공통: Redux Provider + 고정 사이드바 + main 콘텐츠
// ============================================================

import Providers from "./Providers";
import Sidebar from "@/components/sidebar/sidebar";
import "./globals.css";
import "@/styles/app-shell.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <div className="app-shell">
            {/* --- 사이드바 (전 페이지 고정) --- */}
            <aside className="app-shell__sidebar">
              <Sidebar />
            </aside>
            {/* --- 페이지별 콘텐츠 (app/.../page.tsx) --- */}
            <main className="app-shell__main">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
