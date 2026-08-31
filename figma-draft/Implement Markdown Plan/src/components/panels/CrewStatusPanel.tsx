import { crewMembers, getStatusColor, getStatusLabel } from "../../data/crew";
import type { CrewMember } from "../../types";
import GlassPanel from "../GlassPanel";

function HealthBar({ value, status }: { value: number; status: string }) {
  const color = getStatusColor(status);
  return (
    <div style={{ marginTop: 4 }}>
      <div
        style={{
          height: 2,
          background: "rgba(255,255,255,0.06)",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: color,
            borderRadius: 1,
            transition: "width 0.6s ease",
            boxShadow: `0 0 4px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}

interface CrewRowProps {
  crew: CrewMember;
  selected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (id: string | null) => void;
}

function CrewRow({ crew, selected, hovered, onSelect, onHover }: CrewRowProps) {
  const color = getStatusColor(crew.status);
  const label = getStatusLabel(crew.status);
  const isCritical = crew.status === "critical";

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => onHover(crew.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        width: "100%",
        background: selected
          ? `rgba(${crew.status === "critical" ? "239,68,68" : crew.status === "elevated" ? "249,115,22" : crew.status === "monitor" ? "234,179,8" : "34,197,94"},0.06)`
          : hovered
          ? "rgba(34,211,238,0.04)"
          : "transparent",
        border: "none",
        borderLeft: selected ? `1.5px solid ${color}` : "1.5px solid transparent",
        padding: "9px 12px 8px 10px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
        display: "block",
        borderBottom: "1px solid rgba(34,211,238,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              className={isCritical ? "pulse-fast" : "pulse"}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
                boxShadow: `0 0 5px ${color}`,
              }}
            />
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                color: selected ? "#e4f0f8" : "#b4d0e8",
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {crew.name}
            </span>
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 8,
              color: "rgba(100,160,200,0.55)",
              letterSpacing: "0.1em",
              marginTop: 1.5,
              marginLeft: 11,
            }}
          >
            {crew.role.toUpperCase()}
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            className="font-mono"
            style={{
              fontSize: 7.5,
              color,
              letterSpacing: "0.12em",
              fontWeight: 500,
            }}
          >
            {label}
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 13, fontWeight: 500, color: selected ? "#e4f0f8" : "#9ec4de", lineHeight: 1.2, marginTop: 1 }}
          >
            {crew.health}
          </div>
        </div>
      </div>
      <HealthBar value={crew.health} status={crew.status} />
    </button>
  );
}

interface CrewStatusPanelProps {
  selectedCrewId: string | null;
  hoveredCrewId: string | null;
  onSelectCrew: (id: string) => void;
  onHoverCrew: (id: string | null) => void;
}

export default function CrewStatusPanel({
  selectedCrewId,
  hoveredCrewId,
  onSelectCrew,
  onHoverCrew,
}: CrewStatusPanelProps) {
  const alertCount = crewMembers.filter((c) => c.status !== "nominal").length;

  return (
    <GlassPanel
      className="hud-appear"
      style={{
        width: 228,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 12px 8px",
          borderBottom: "1px solid rgba(34,211,238,0.08)",
        }}
      >
        <div
          className="font-mono"
          style={{ fontSize: 8.5, letterSpacing: "0.2em", color: "rgba(100,160,200,0.7)" }}
        >
          CREW STATUS
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#c4daf0", lineHeight: 1 }}>
            {crewMembers.length}
          </span>
          <span
            className="font-mono"
            style={{ fontSize: 8, color: "rgba(100,160,200,0.5)", letterSpacing: "0.1em" }}
          >
            CREW MONITORED
          </span>
          {alertCount > 0 && (
            <span
              className="font-mono"
              style={{
                fontSize: 7.5,
                color: "#ef4444",
                letterSpacing: "0.1em",
                marginLeft: "auto",
                background: "rgba(239,68,68,0.1)",
                padding: "1px 5px",
              }}
            >
              {alertCount} ALERT{alertCount !== 1 ? "S" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Crew rows */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {crewMembers.map((crew) => (
          <CrewRow
            key={crew.id}
            crew={crew}
            selected={selectedCrewId === crew.id}
            hovered={hoveredCrewId === crew.id}
            onSelect={() => onSelectCrew(crew.id)}
            onHover={onHoverCrew}
          />
        ))}
      </div>

      {/* Footer label */}
      <div
        style={{
          padding: "6px 12px",
          borderTop: "1px solid rgba(34,211,238,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#22c55e",
          }}
          className="pulse"
        />
        <span
          className="font-mono"
          style={{ fontSize: 7, color: "rgba(100,160,200,0.4)", letterSpacing: "0.12em" }}
        >
          LIVE TELEMETRY · 5s UPDATE
        </span>
      </div>
    </GlassPanel>
  );
}
