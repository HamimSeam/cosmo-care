'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react';

type LiveNumberProps = {
  value: number;
  decimals?: number;
  className?: string;
};

export function LiveNumber({ value, decimals, className = '' }: LiveNumberProps) {
  const precision = decimals ?? (Number.isInteger(value) ? 0 : 1);
  const initialValue = value === 0 ? 0 : value * 0.92;
  const animatedValue = useMotionValue(initialValue);
  const previousValue = useRef(initialValue);
  const [displayValue, setDisplayValue] = useState(initialValue);
  const reduceMotion = useReducedMotion();

  useMotionValueEvent(animatedValue, 'change', latest => {
    setDisplayValue(latest);
  });

  useEffect(() => {
    if (reduceMotion) {
      animatedValue.set(value);
      previousValue.current = value;
      return;
    }

    animatedValue.set(previousValue.current);
    const controls = animate(animatedValue, value, {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    });
    previousValue.current = value;

    return () => controls.stop();
  }, [animatedValue, reduceMotion, value]);

  return (
    <span className={`live-number ${className}`} aria-label={value.toFixed(precision)}>
      {displayValue.toFixed(precision)}
    </span>
  );
}
