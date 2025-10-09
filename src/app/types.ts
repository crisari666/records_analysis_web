import type { Action, ThunkAction } from "@reduxjs/toolkit"

// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof import('./store').rootReducer>

// Infer the type of `store`
export type AppStore = typeof import('./store').store

// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"]

export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>
