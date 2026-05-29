import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  clearAuthSession,
  getAuthSession,
  resolvePortalFromWindow,
  setAuthSession,
} from '@/lib/authStorage';
import type { PortalType } from '@/lib/portals';

export interface UserProfileSecurity {
  twoFactorEnabled: boolean;
  twoFactorStatus: string;
  lastLoginAt: string;
  lastLoginLocation: string;
  clearanceLevel: number;
  clearanceLabel: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string | null;
  timezone: string;
  timezoneLabel: string;
  bio: string;
  security: UserProfileSecurity;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  profile?: UserProfile;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  portal: PortalType | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  portal: null,
};

export const loadAuthFromStorage = (portal?: PortalType): AuthState => {
  const session = getAuthSession(portal ?? resolvePortalFromWindow());
  if (!session) {
    return initialState;
  }

  return {
    user: session.user,
    token: session.token,
    isAuthenticated: true,
    portal: session.portal,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth: (state, action: PayloadAction<PortalType | undefined>) => {
      const hydrated = loadAuthFromStorage(action.payload);
      state.user = hydrated.user;
      state.token = hydrated.token;
      state.isAuthenticated = hydrated.isAuthenticated;
      state.portal = hydrated.portal;
    },
    login: (
      state,
      action: PayloadAction<{ user: User; token: string; portal: PortalType }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.portal = action.payload.portal;
      setAuthSession({
        token: action.payload.token,
        user: action.payload.user,
        portal: action.payload.portal,
      });
    },
    logout: (state) => {
      const portal = state.portal ?? resolvePortalFromWindow();
      if (portal) {
        clearAuthSession(portal);
      }
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.portal = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user && state.token && state.portal) {
        state.user = { ...state.user, ...action.payload };
        setAuthSession({
          token: state.token,
          user: state.user,
          portal: state.portal,
        });
      }
    },
  },
});

export const { hydrateAuth, login, logout, updateUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
