// ============================================================
// Root Layout — app/layout.tsx
// 전 페이지 공통: Redux Provider + 고정 사이드바 + main 콘텐츠
// ============================================================

import Providers from "./Providers";
import AppShell from "@/components/layout/AppShell";
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
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
