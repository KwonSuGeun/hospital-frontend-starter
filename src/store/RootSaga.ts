// ============================================================
// Root Saga — store/RootSaga.ts
// feature별 watch*Saga를 fork로 병렬 실행
// ============================================================

import { all, fork } from "redux-saga/effects";
import { watchAuthSaga } from "@/features/auth/saga/authSaga";
import { watchSidebarSaga } from "@/features/sidebar/saga/sidebarSaga";
import { watchStaffSaga } from "@/features/staff/saga/staffSaga";

export default function* rootSaga() {
  yield all([
    fork(watchAuthSaga), // /login, AppShell 세션 확인
    fork(watchSidebarSaga), // layout 사이드바
    fork(watchStaffSaga), // 직원 목록 / 상세 / 등록
  ]);
}
