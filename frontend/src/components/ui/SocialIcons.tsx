import type { SVGProps } from 'react';

/*
 * Minimal, generic monoline glyphs used as social-link placeholders.
 * These are original simplified shapes (not reproductions of any brand's
 * trademarked logo artwork) so they're safe to ship before real social
 * profiles / brand assets are wired up.
 */

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function FacebookGlyph(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M14 8.5h-1.5A1.5 1.5 0 0 0 11 10v2H9v2.5h2V21h2.5v-6.5H16l.5-2.5h-2V10c0-.3.2-.5.5-.5H16V8.5Z" />
    </svg>
  );
}

export function InstagramGlyph(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function XGlyph(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 8l8 8M16 8l-8 8" />
    </svg>
  );
}

export function LinkedInGlyph(props: IconProps) {
  return (
    <svg {...base} aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="8" cy="8.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="M8 11v6M12 17v-4a2 2 0 0 1 4 0v4M12 13v-2" />
    </svg>
  );
}
