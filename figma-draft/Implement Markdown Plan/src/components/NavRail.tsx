import type { NavPage } from "../types";

interface NavItem {
  id: NavPage;
  label: string;
  shortLabel: string;
  icon: string;
}

const items: NavItem[] = [
  { id: "overview",      label: "Mission Overview",    shortLabel: "OVERVIEW",     icon: "⊞" },
  { id: "crew",          label: "Crew Health",         shortLabel: "CREW",         icon: "◎" },
  { id: "intelligence",  label: "Health Intelligence", shortLabel: "INTEL",        icon: "◈" },
  { id: "readiness",     label: "Mission Readiness",   shortLabel: "READINESS",    icon: "◇" },
  { id: "events",        label: "Medical Events",      shortLabel: "EVENTS",       icon: "▲" },
  { id: "recovery",      label: "Recovery",            shortLabel: "RECOVERY",     icon: "↑" },
  { id: "triage",        label: "AstroTriage",         shortLabel: "TRIAGE",       icon: "✚" },
  { id: "assistant",     label: "AI Assistant",        shortLabel: "ASSIST",       icon: "◉" },
];

interface NavRailProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export default function NavRail({ currentPage, onNavigate }: NavRailProps) {
  return (
    <div
      className="flex flex-col items-center shrink-0 z-20 py-3 gap-1"
      style={{
        width: 52,
        background: "rgba(3, 10, 22, 0.85)",
        borderRight: "1px solid rgba(34,211,238,0.08)",
        backdropFilter: "blur(12px)",
      }}
    >
      {items.map((item) => {
        const active = currentPage === item.id;
        const isTriage = item.id === "triage";
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            title={item.label}
            style={{
              width: 40,
              padding: "8px 0",
              background: active ? "rgba(34,211,238,0.08)" : "transparent",
              border: "none",
              borderLeft: active ? "1.5px solid #22d3ee" : "1.5px solid transparent",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              borderRadius: "0 2px 2px 0",
              transition: "all 0.15s ease",
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: active
                  ? "#22d3ee"
                  : isTriage
                  ? "rgba(239,68,68,0.7)"
                  : "rgba(100,160,200,0.45)",
                lineHeight: 1,
                transition: "color 0.15s ease",
              }}
            >
              {item.icon}
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: 6.5,
                letterSpacing: "0.12em",
                color: active ? "#22d3ee" : "rgba(100,160,200,0.4)",
                lineHeight: 1,
                transition: "color 0.15s ease",
              }}
            >
              {item.shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
