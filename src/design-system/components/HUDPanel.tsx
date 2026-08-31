'use client';

import React, { type ReactNode, type CSSProperties, type ElementType } from 'react';
import { HUDBracket } from './HUDBracket';
import { HolographicBorder } from './HolographicBorder';
import type { GlassLevel } from '../tokens';
import { cn } from '../utils';

export interface HUDPanelProps {
  level?: GlassLevel;
  brackets?: boolean;
  /** Thin cyan accent along one edge */
  edge?: 'top' | 'left' | 'right' | 'bottom' | 'none';
  glowColor?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: ElementType;
  onClick?: () => void;
  ariaLabel?: string;
  padding?: string | number;
}

export function HUDPanel({
  level = 2,
  brackets = false,
  edge = 'none',
  glowColor,
  className = '',
  style,
  children,
  as,
  onClick,
  ariaLabel,
  padding = 'var(--space-4)',
}: HUDPanelProps) {
  const boxShadow = glowColor
    ? `0 0 20px ${glowColor}, inset 0 0 12px ${glowColor}`
    : undefined;

  const innerStyle: CSSProperties = {
    position: 'relative',
    padding,
    boxShadow,
    transition: 'box-shadow 0.4s ease',
    ...style,
  };

  const content = (
    <>
      {brackets && <HUDBracket />}
      {edge !== 'none' && <HolographicBorder edge={edge} />}
      {children}
    </>
  );

  return React.createElement(
    as ?? 'div',
    {
      className: cn(`hud-glass-${level}`, className),
      style: innerStyle,
      onClick,
      'aria-label': ariaLabel,
      type: as === 'button' ? 'button' : undefined,
    },
    content,
  );
}
