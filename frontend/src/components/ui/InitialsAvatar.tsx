const PALETTE = [
  'bg-primary text-white',
  'bg-accent text-white',
  'bg-primary-400 text-white',
  'bg-accent-400 text-white',
];

function paletteIndex(seed: string): number {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return sum % PALETTE.length;
}

interface InitialsAvatarProps {
  initials: string;
  name: string;
  size?: number;
}

export function InitialsAvatar({ initials, name, size = 72 }: InitialsAvatarProps) {
  const colorClasses = PALETTE[paletteIndex(name)];

  return (
    <div
      role="img"
      aria-label={`Portrait placeholder for ${name}`}
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${colorClasses}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials}
    </div>
  );
}
