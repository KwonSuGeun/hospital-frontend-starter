import { redirect } from "next/navigation";

// ============================================================
// [로그인] /login → / 리다이렉트 (로그인은 LoginModal 사용)
// ============================================================

export default function LoginPage() {
  redirect("/");
}
