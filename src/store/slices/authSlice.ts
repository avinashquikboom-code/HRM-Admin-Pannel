import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from '@/lib/authStorage';

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
  id: string;
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
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
};

export const loadAuthFromStorage = (): AuthState => {
  const session = getAuthSession();
  if (!session) {
    return initialState;
  }

  return {
    user: session.user,
    token: session.token,
    isAuthenticated: true,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth: (state) => {
      const hydrated = loadAuthFromStorage();
      state.user = hydrated.user;
      state.token = hydrated.token;
      state.isAuthenticated = hydrated.isAuthenticated;
    },
    login: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      setAuthSession({
        token: action.payload.token,
        user: action.payload.user,
      });
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearAuthSession();
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user && state.token) {
        state.user = { ...state.user, ...action.payload };
        setAuthSession({
          token: state.token,
          user: state.user,
        });
      }
    },
  },
});

export const { hydrateAuth, login, logout, updateUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
