import { create } from 'zustand';

const STORAGE_KEY = 'emf-color-scheme';

function getInitialIsDark(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  // No explicit preference saved yet -- fall back to the OS/browser setting.
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function applyDarkClass(isDark: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', isDark);
}

interface DarkModeState {
  isDark: boolean;
  toastMessage: string | null;
  toggle: () => void;
  dismissToast: () => void;
}

export const useDarkMode = create<DarkModeState>((set, get) => ({
  isDark: getInitialIsDark(),
  toastMessage: null,
  toggle: () => {
    const next = !get().isDark;
    applyDarkClass(next);
    window.localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    set({
      isDark: next,
      toastMessage: next ? 'Switched to dark mode' : 'Switched to light mode',
    });
  },
  dismissToast: () => set({ toastMessage: null }),
}));

// Apply the resolved theme immediately on module load so there is no
// light-mode flash before React mounts.
applyDarkClass(useDarkMode.getState().isDark);
