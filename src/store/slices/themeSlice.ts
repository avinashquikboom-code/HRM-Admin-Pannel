import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  darkMode: boolean;
}

const initialState: ThemeState = {
  darkMode: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    hydrateTheme: (state) => {
      if (typeof window !== 'undefined') {
        state.darkMode = localStorage.getItem('darkMode') === 'true';
        if (state.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode.toString());
      if (typeof window !== 'undefined') {
        if (state.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', state.darkMode.toString());
      if (typeof window !== 'undefined') {
        if (state.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
  },
});

export const { hydrateTheme, toggleDarkMode, setDarkMode } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;

