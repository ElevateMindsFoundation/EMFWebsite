import { create } from 'zustand';
import { api, setAccessToken, ApiError } from '../lib/api';

export type Role = 'ADMIN' | 'USER' | 'CONTRIBUTOR';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  emailVerified: boolean;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

interface MeResponse {
  user: AuthUser;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  /** True while the initial /api/auth/me hydration check on app load is in flight. */
  isHydrating: boolean;
  /** True while a login/signup submission is in flight. */
  isSubmitting: boolean;
  error: string | null;

  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrating: true,
  isSubmitting: false,
  error: null,

  hydrate: async () => {
    try {
      // The access token only ever lives in memory, so a fresh page load has
      // none yet. First mint one from the httpOnly refresh cookie (if any is
      // still valid), then confirm/fetch the canonical user via GET /me.
      const refreshed = await api.post<AuthResponse>('/auth/refresh', undefined, { skipAuthHeader: true });
      setAccessToken(refreshed.accessToken);

      const me = await api.get<MeResponse>('/auth/me');
      set({ user: me.user, accessToken: refreshed.accessToken, isHydrating: false });
    } catch {
      setAccessToken(null);
      set({ user: null, accessToken: null, isHydrating: false });
    }
  },

  login: async (email, password) => {
    set({ isSubmitting: true, error: null });
    try {
      const result = await api.post<AuthResponse>('/auth/login', { email, password }, { skipAuthHeader: true });
      setAccessToken(result.accessToken);
      set({ user: result.user, accessToken: result.accessToken, isSubmitting: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      set({ isSubmitting: false, error: message });
      throw err;
    }
  },

  signup: async ({ email, password, firstName, lastName }) => {
    set({ isSubmitting: true, error: null });
    try {
      const result = await api.post<AuthResponse>(
        '/auth/signup',
        { email, password, firstName, lastName },
        { skipAuthHeader: true },
      );
      setAccessToken(result.accessToken);
      set({ user: result.user, accessToken: result.accessToken, isSubmitting: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      set({ isSubmitting: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the network call fails, clear local state so the UI reflects
      // a logged-out state — the httpOnly cookie will simply expire on its own.
    }
    setAccessToken(null);
    set({ user: null, accessToken: null });
  },

  clearError: () => set({ error: null }),
}));
