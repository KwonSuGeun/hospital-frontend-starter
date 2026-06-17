// ============================================================
// Root Saga — store/RootSaga.ts
// feature별 watch*Saga를 fork로 병렬 실행
// ============================================================

import { all, fork } from "redux-saga/effects";
import { watchSidebarSaga } from "@/features/sidebar/saga/sidebarSaga";
import { watchStaffSaga } from "@/features/staff/saga/staffSaga";

export default function* rootSaga() {
  yield all([
    fork(watchSidebarSaga), // layout 사이드바
    fork(watchStaffSaga), // 직원 목록 / 상세 / 등록
  ]);
}
