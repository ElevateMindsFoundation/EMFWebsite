import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';
type Size = 'md' | 'lg' | 'sm';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-light dark:bg-primary-light dark:hover:bg-primary-400',
  accent: 'bg-accent text-white hover:bg-accent-600',
  outline:
    'border border-primary-200 text-primary bg-transparent hover:bg-primary-50 dark:text-ink-onDark dark:border-primary-700 dark:hover:bg-surface-dark-muted',
  ghost:
    'bg-transparent text-primary hover:bg-primary-50 dark:text-ink-onDark dark:hover:bg-surface-dark-muted',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
    to?: undefined;
    href?: undefined;
  };

type ButtonAsLink = CommonProps & { to: string; href?: undefined };

type ButtonAsAnchor = CommonProps & { href: string; to?: undefined };

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

const OWN_PROP_KEYS = new Set(['variant', 'size', 'children', 'className', 'to', 'href']);

function extractNativeProps(props: Record<string, unknown>): Record<string, unknown> {
  const rest: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if (!OWN_PROP_KEYS.has(key)) rest[key] = props[key];
  }
  return rest;
}

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', children, className = '' } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={classes}>
        {children}
      </Link>
    );
  }

  if ('href' in props && props.href) {
    return (
      <a href={props.href} className={classes}>
        {children}
      </a>
    );
  }

  const nativeProps = extractNativeProps(props as unknown as Record<string, unknown>);

  return (
    <button type="button" className={classes} {...nativeProps}>
      {children}
    </button>
  );
}
