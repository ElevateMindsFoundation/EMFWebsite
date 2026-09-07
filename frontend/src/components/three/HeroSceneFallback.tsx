/**
 * Static, non-animated stand-in for the 3D hero. Used in three situations:
 *  1. As the <Suspense> fallback while the R3F chunk is still downloading.
 *  2. When `prefers-reduced-motion` (OS-level or the on-page toggle) is set.
 *  3. When WebGL isn't available, or the 3D scene throws (error boundary).
 *
 * It intentionally reuses the exact wheat-stalk SVG treatment Phase A shipped
 * as its hero placeholder, so swapping between this and the live scene never
 * causes a layout jump or a visual "downgrade" -- it just stops moving.
 * No CSS animation, no WebGL: safe for every device and every motion setting.
 */
export function HeroSceneFallback() {
  return (
    <div className="h-full w-full opacity-40" aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="heroWheatGradFallback" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D8B573" />
            <stop offset="100%" stopColor="#846033" />
          </linearGradient>
        </defs>
        {Array.from({ length: 7 }).map((_, i) => (
          <path
            key={i}
            d={`M ${60 + i * 110} 600 Q ${90 + i * 110} 420 ${60 + i * 110} 260 Q ${40 + i * 110} 160 ${70 + i * 110} 60`}
            stroke="url(#heroWheatGradFallback)"
            strokeWidth="3"
            fill="none"
            opacity={0.5}
          />
        ))}
      </svg>
    </div>
  );
}
