import type { Scenario } from "../types";
import { crewMembers } from "../data/crew";

const scenarios: { id: Scenario; label: string; sub: string; crewId: string; status: string }[] = [
  { id: "normal",    label: "NORMAL",    sub: "Maya · Nominal",    crewId: "maya",   status: "nominal" },
  { id: "fatigue",   label: "FATIGUE",   sub: "Alex · Fatigue",    crewId: "alex",   status: "monitor" },
  { id: "illness",   label: "ILLNESS",   sub: "Sam · Developing",  crewId: "sam",    status: "elevated" },
  { id: "emergency", label: "EMERGENCY", sub: "Jordan · Critical",  crewId: "jordan", status: "critical" },
];

const statusColor: Record<string, string> = {
  nominal: "#22c55e",
  monitor: "#eab308",
  elevated: "#f97316",
  critical: "#ef4444",
};

interface ScenarioSelectorProps {
  active: Scenario;
  onSelect: (scenario: Scenario, crewId: string) => void;
}

export default function ScenarioSelector({ active, onSelect }: ScenarioSelectorProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(4, 12, 24, 0.75)",
        border: "1px solid rgba(34,211,238,0.1)",
        backdropFilter: "blur(12px)",
        padding: "5px 10px",
      }}
    >
      <span
        className="font-mono"
        style={{ fontSize: 7, letterSpacing: "0.18em", color: "rgba(100,160,200,0.4)", marginRight: 2 }}
      >
        DEMO SCENARIO
      </span>
      <div style={{ display: "flex", gap: 3 }}>
        {scenarios.map((s) => {
          const isActive = active === s.id;
          const color = statusColor[s.status];
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id, s.crewId)}
              style={{
                background: isActive ? `${color}15` : "transparent",
                border: `1px solid ${isActive ? `${color}40` : "rgba(34,211,238,0.08)"}`,
                padding: "3px 8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <span
                className="font-mono"
                style={{
                  fontSize: 7.5,
                  letterSpacing: "0.14em",
                  color: isActive ? color : "rgba(100,160,200,0.45)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {s.label}
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: 6,
                  letterSpacing: "0.08em",
                  color: isActive ? `${color}80` : "rgba(100,160,200,0.3)",
                }}
              >
                {s.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
