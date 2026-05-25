import { configureStore } from '@reduxjs/toolkit';
import { authReducer, loadAuthFromStorage } from './slices/authSlice';
import { sidebarReducer } from './slices/sidebarSlice';
import { themeReducer } from './slices/themeSlice';

const preloadedAuth =
  typeof window !== 'undefined' ? loadAuthFromStorage() : undefined;

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    sidebar: sidebarReducer,
  },
  preloadedState: preloadedAuth
    ? {
        auth: preloadedAuth,
      }
    : undefined,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
