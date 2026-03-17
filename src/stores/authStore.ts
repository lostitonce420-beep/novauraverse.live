import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { apiClient } from '@/services/apiClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  claimDailyCoins: () => Promise<void>;
  useCoins: (amount: number) => Promise<boolean>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      init: () => {
        // On app load, if we have a JWT token, silently re-validate with the server
        const token = apiClient.getToken();
        if (!token) return;

        const { user } = get();
        if (!user) return;

        apiClient.get<{ user: User }>('/auth/me')
          .then(({ user }) => {
            set({ user, isAuthenticated: true });
          })
          .catch(() => {
            // Token expired or invalid — clear session
            apiClient.clearToken();
            set({ user: null, isAuthenticated: false });
          });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await apiClient.post<{ token: string; user: User }>(
            '/auth/login',
            { email, password }
          );
          apiClient.setToken(token);
          set({ user, isAuthenticated: true, isLoading: false, error: null });
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      loginWithGoogle: async () => {
        // Google OAuth requires a real OAuth flow — available after Polsia backend setup
        set({ isLoading: false, error: 'Google sign-in coming soon. Please use email & password for now.' });
        throw new Error('Google sign-in not yet available');
      },

      signup: async (email: string, password: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await apiClient.post<{ token: string; user: User }>(
            '/auth/signup',
            { email, password, username }
          );
          apiClient.setToken(token);
          set({ user, isAuthenticated: true, isLoading: false, error: null });
        } catch (err: any) {
          set({ isLoading: false, error: err.message });
          throw err;
        }
      },

      logout: () => {
        apiClient.post('/auth/logout', {}).catch(() => {}); // fire-and-forget
        apiClient.clearToken();
        set({ user: null, isAuthenticated: false, error: null });
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        set({ isLoading: true });
        try {
          const { user: updated } = await apiClient.patch<{ user: User }>(
            '/auth/profile',
            data
          );
          set({ user: updated, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false });
          throw err;
        }
      },

      claimDailyCoins: async () => {
        const { user } = get();
        if (!user) return;

        const now = new Date();
        if (user.lastDailyClaim) {
          const last = new Date(user.lastDailyClaim);
          const sameDay =
            last.getFullYear() === now.getFullYear() &&
            last.getMonth() === now.getMonth() &&
            last.getDate() === now.getDate();
          if (sameDay) throw new Error('Daily coins already claimed today.');
        }

        const newBalance = (user.consciousnessCoins ?? 0) + 50;
        await get().updateProfile({
          consciousnessCoins: newBalance,
          lastDailyClaim: now.toISOString(),
        });
      },

      useCoins: async (amount: number) => {
        const { user } = get();
        if (!user) return false;
        const current = user.consciousnessCoins ?? 0;
        if (current < amount) return false;
        try {
          await get().updateProfile({ consciousnessCoins: current - amount });
          return true;
        } catch {
          return false;
        }
      },

      setUser: (user: User | null) => {
        if (!user) apiClient.clearToken();
        set({ user, isAuthenticated: !!user });
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'novaura-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
