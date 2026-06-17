"use client";

// ============================================================
// Redux Provider — app/Providers.tsx
// layout.tsx에서 전역 감싸기 → 모든 페이지에서 useDispatch/useSelector 사용
// ============================================================

import { Provider } from "react-redux";
import { store } from "@/store/Store";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
