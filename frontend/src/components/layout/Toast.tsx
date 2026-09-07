import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../../store/useDarkMode';

export function Toast() {
  const toastMessage = useDarkMode((s) => s.toastMessage);
  const isDark = useDarkMode((s) => s.isDark);
  const dismissToast = useDarkMode((s) => s.dismissToast);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => dismissToast(), 2200);
    return () => window.clearTimeout(timer);
  }, [toastMessage, dismissToast]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex justify-center px-4">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-card-hover dark:bg-primary-light"
          >
            {isDark ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
