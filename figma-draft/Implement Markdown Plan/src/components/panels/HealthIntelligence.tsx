import { crewMembers, getStatusColor } from "../../data/crew";
import GlassPanel from "../GlassPanel";

interface HealthIntelligenceProps {
  selectedCrewId: string | null;
  onOpenTriage?: () => void;
}

export default function HealthIntelligence({ selectedCrewId, onOpenTriage }: HealthIntelligenceProps) {
  const crew = crewMembers.find((c) => c.id === selectedCrewId);
  if (!crew) return null;

  const color = getStatusColor(crew.status);
  const { intelligence } = crew;
  const isCritical = crew.status === "critical";
  const isElevated = crew.status === "elevated";
  const isMonitor = crew.status === "monitor";

  const actionColor =
    isCritical ? "#ef4444" : isElevated ? "#f97316" : isMonitor ? "#eab308" : "#22c55e";
  const actionBg =
    isCritical ? "rgba(239,68,68,0.1)" : isElevated ? "rgba(249,115,22,0.09)" : isMonitor ? "rgba(234,179,8,0.08)" : "rgba(34,197,94,0.07)";

  return (
    <GlassPanel
      className="hud-appear"
      style={{
        width: 272,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Intelligence section */}
      <div style={{ padding: "10px 12px 8px", borderBottom: "1px solid rgba(34,211,238,0.07)" }}>
        <div
          className="font-mono"
          style={{ fontSize: 7.5, letterSpacing: "0.18em", color: "rgba(100,160,200,0.6)", marginBottom: 4 }}
        >
          COSMOCARE INTELLIGENCE
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: `${color}10`,
            border: `1px solid ${color}25`,
            padding: "5px 8px",
          }}
        >
          <span style={{ color, fontSize: 11 }}>{isCritical ? "⚠" : isElevated ? "⚠" : isMonitor ? "◈" : "◎"}</span>
          <span
            className="font-mono"
            style={{ fontSize: 8.5, fontWeight: 600, color, letterSpacing: "0.12em" }}
          >
            {intelligence.pattern.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Contributing factors */}
      <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(34,211,238,0.06)" }}>
        <div
          className="font-mono"
          style={{ fontSize: 7, letterSpacing: "0.15em", color: "rgba(100,160,200,0.5)", marginBottom: 5 }}
        >
          CONTRIBUTING FACTORS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {intelligence.factors.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span
                style={{
                  fontSize: 9,
                  color: f.direction === "down"
                    ? (isCritical ? "#ef4444" : isElevated ? "#f97316" : "#eab308")
                    : "#22c55e",
                  fontWeight: 700,
                  flexShrink: 0,
                  width: 10,
                }}
              >
                {f.direction === "down" ? "↓" : "↑"}
              </span>
              <span style={{ fontSize: 9, color: "rgba(160,200,230,0.7)", lineHeight: 1.3 }}>
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment */}
      <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(34,211,238,0.06)" }}>
        <div
          className="font-mono"
          style={{ fontSize: 7, letterSpacing: "0.15em", color: "rgba(100,160,200,0.5)", marginBottom: 4 }}
        >
          COSMOCARE ASSESSMENT
        </div>
        <p style={{ fontSize: 8.5, color: "rgba(160,200,230,0.65)", lineHeight: 1.55, margin: 0 }}>
          {intelligence.assessment}
        </p>
      </div>

      {/* Recommendation */}
      <div style={{ padding: "8px 12px" }}>
        <div
          className="font-mono"
          style={{ fontSize: 7, letterSpacing: "0.15em", color: "rgba(100,160,200,0.5)", marginBottom: 5 }}
        >
          COSMOCARE RECOMMENDS
        </div>

        <div
          style={{
            background: actionBg,
            border: `1px solid ${actionColor}20`,
            padding: "4px 8px",
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            className="font-mono"
            style={{ fontSize: 9.5, fontWeight: 700, color: actionColor, letterSpacing: "0.2em" }}
          >
            {intelligence.action.toUpperCase()}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {intelligence.recommendations.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ fontSize: 7, color: actionColor, marginTop: 1.5, flexShrink: 0 }}>•</span>
              <span style={{ fontSize: 8.5, color: "rgba(160,200,230,0.65)", lineHeight: 1.45 }}>{r}</span>
            </div>
          ))}
        </div>

        {isCritical && (
          <button
            onClick={onOpenTriage}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "7px 0",
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#ef4444",
              cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              letterSpacing: "0.18em",
              fontWeight: 600,
              transition: "all 0.15s ease",
            }}
          >
            INITIATE ASTROTRIAGE →
          </button>
        )}
      </div>

      {/* Disclaimer */}
      <div
        style={{
          padding: "5px 12px 6px",
          borderTop: "1px solid rgba(34,211,238,0.06)",
          background: "rgba(0,0,0,0.15)",
        }}
      >
        <p
          style={{
            fontSize: 7,
            color: "rgba(100,160,200,0.3)",
            lineHeight: 1.4,
            margin: 0,
            fontStyle: "italic",
          }}
        >
          CosmoCare provides medical decision support and does not replace qualified medical professionals.
        </p>
      </div>
    </GlassPanel>
  );
}
