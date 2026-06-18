// ============================================================
// Redux Store — store/Store.ts
// reducer: sidebar(사이드바), staff(직원 목록/상세/등록)
// middleware: redux-saga (RootSaga.ts)
// ============================================================

import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import RootReducer from "@/store/RootReducer";
import rootSaga from "./RootSaga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: RootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
