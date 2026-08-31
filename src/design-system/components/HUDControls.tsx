'use client';

import type { ReactNode } from 'react';
import { cn } from '../utils';

export function HUDButton({
  variant = 'default',
  active = false,
  className = '',
  children,
  ...rest
}: {
  variant?: 'default' | 'primary' | 'danger';
  active?: boolean;
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variantClass =
    variant === 'primary' ? 'hud-btn hud-btn-primary' :
    variant === 'danger'  ? 'hud-btn hud-btn-danger'  :
    'hud-btn';

  return (
    <button className={cn(variantClass, className)} data-active={active ? 'true' : undefined} {...rest}>
      {children}
    </button>
  );
}

export function HUDDivider({ style }: { style?: React.CSSProperties }) {
  return <hr className="hud-divider" style={style} />;
}
