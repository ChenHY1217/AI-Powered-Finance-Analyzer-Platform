// frontend/src/store/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setToken: (token: string, email?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
  email: typeof window !== 'undefined' ? localStorage.getItem('user_email') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false,

  setToken: (token: string, email?: string) => {
    const resolvedEmail = email ?? (typeof window !== 'undefined' ? localStorage.getItem('user_email') : null);

    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
      if (resolvedEmail) {
        localStorage.setItem('user_email', resolvedEmail);
      }
    }

    set({ token, email: resolvedEmail, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_email');
    }
    set({ token: null, email: null, isAuthenticated: false });
  },
}));