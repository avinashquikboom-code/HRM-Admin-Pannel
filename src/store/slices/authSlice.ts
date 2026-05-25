import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN';
  avatar?: string;
  phone?: string;
  bio?: string;
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
  if (typeof window === 'undefined') {
    return initialState;
  }

  const storedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!storedUser || !token) {
    return initialState;
  }

  try {
    const user = JSON.parse(storedUser) as User;
    if (user.avatar?.includes('dicebear.com')) {
      user.avatar = '/assets/admin-avatar.png';
      localStorage.setItem('user', JSON.stringify(user));
    }
    return { user, token, isAuthenticated: true };
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
    return initialState;
  }
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
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
});

export const { hydrateAuth, login, logout, updateUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
export type { User };

