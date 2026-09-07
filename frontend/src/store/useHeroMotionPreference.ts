import { create } from 'zustand';

const STORAGE_KEY = 'emf-hero-motion-preference';

function getInitialManualReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === 'reduced';
}

interface HeroMotionPreferenceState {
  /**
   * An explicit, on-page opt-out of the 3D hero animation, independent of
   * (and in addition to) the OS-level `prefers-reduced-motion` setting.
   * Persisted so the choice survives a reload.
   */
  manualReduceMotion: boolean;
  toggle: () => void;
}

export const useHeroMotionPreference = create<HeroMotionPreferenceState>((set, get) => ({
  manualReduceMotion: getInitialManualReduceMotion(),
  toggle: () => {
    const next = !get().manualReduceMotion;
    window.localStorage.setItem(STORAGE_KEY, next ? 'reduced' : 'full');
    set({ manualReduceMotion: next });
  },
}));
