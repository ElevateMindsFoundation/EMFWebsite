import { useMemo } from 'react';

/**
 * One-time feature detection for WebGL. If context creation throws or every
 * context type comes back null (software-disabled browsers, some locked-down
 * corporate machines, ancient hardware), the 3D hero must not be attempted --
 * callers should fall back to the static gradient instead.
 */
export function useWebglSupported(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      const context =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      return !!context;
    } catch {
      return false;
    }
  }, []);
}
