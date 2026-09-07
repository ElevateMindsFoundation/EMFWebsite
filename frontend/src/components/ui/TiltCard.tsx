import { useRef, type PointerEvent, type ReactNode } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Maximum tilt angle in degrees at the edge of the card. */
  maxTilt?: number;
}

/**
 * Lightweight hover/tilt wrapper driven by a cheap CSS 3D transform
 * (perspective + rotateX/rotateY from mouse position) -- no per-card R3F
 * canvas, that would be wasteful for something this small. Wrap a <Card> (or
 * any block) in this to give it a subtle depth effect on hover.
 *
 * Respects `prefers-reduced-motion`: the tilt transform is skipped entirely
 * and a plain shadow-based hover state is used instead.
 */
export function TiltCard({ children, className = '', maxTilt = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 2 * maxTilt;
    const rotateX = (0.5 - py) * 2 * maxTilt;
    ref.current.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
  }

  function handlePointerLeave() {
    if (!ref.current) return;
    ref.current.style.transform = '';
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`rounded-2xl transition-transform duration-150 ease-out will-change-transform ${
        reduceMotion ? 'hover:shadow-card-hover' : ''
      } ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}
