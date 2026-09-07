import type { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

// framer-motion's HTMLMotionProps redefines a handful of DOM event handlers
// (onAnimationStart/End, onDrag*) with animation-aware signatures, so those
// are excluded here to avoid an incompatible-override type error.
type SafeDivProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration' | 'onDrag' | 'onDragStart' | 'onDragEnd'
>;

interface CardProps extends SafeDivProps {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({ children, className = '', hoverable = true, ...rest }: CardProps) {
  return (
    <motion.div
      className={`rounded-2xl border border-primary-100 bg-surface p-6 shadow-card dark:border-primary-800 dark:bg-surface-dark-muted ${className}`}
      whileHover={hoverable ? { y: -4 } : undefined}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
