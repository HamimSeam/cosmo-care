import type { ReactNode, CSSProperties } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hi?: boolean;
  onClick?: () => void;
}

export default function GlassPanel({ children, className = "", style, hi, onClick }: GlassPanelProps) {
  return (
    <div
      className={`${hi ? "glass-hi" : "glass"} bracket relative ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
