import GlassPanel from "../components/GlassPanel";

const timeline = [
  { date: "DAY 140", label: "MEDICAL EVENT", value: 22, detail: "Acute hypoxic episode detected. Multiple vitals critical.", status: "critical" },
  { date: "DAY 141", label: "INTERVENTION", value: 34, detail: "Supplemental O₂ initiated. Workload reduced. Flight surgeon consulted.", status: "elevated" },
  { date: "DAY 142", label: "RECOVERY PHASE 1", value: 48, detail: "HRV improving. SpO₂ stabilizing at 95%. Continued rest protocol.", status: "monitor" },
  { date: "DAY 143", label: "RECOVERY PHASE 2", value: 62, detail: "Sleep quality improving. Heart rate trending toward baseline.", status: "monitor" },
  { date: "DAY 144", label: "MONITORING", value: 74, detail: "Recovery index 74. Gradual return to light duties.", status: "monitor" },
  { date: "DAY 145", label: "CLEARANCE PENDING", value: 86, detail: "Vitals approaching personal baseline. Full clearance pending.", status: "nominal" },
];

const statusColor: Record<string, string> = {
  nominal: "#22c55e",
  monitor: "#eab308",
  elevated: "#f97316",
  critical: "#ef4444",
};

export default function Recovery() {
  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        padding: "24px 32px",
        background: "linear-gradient(180deg, #06060e 0%, #04091a 100%)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          className="font-mono"
          style={{ fontSize: 8, letterSpacing: "0.22em", color: "#22d3ee", marginBottom: 6 }}
        >
          RECOVERY MONITORING
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#e4f0f8", letterSpacing: "-0.01em" }}>
          Post-Event Recovery — Jordan Lee
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 9, color: "rgba(100,160,200,0.5)", letterSpacing: "0.12em", marginTop: 3 }}
        >
          SCIENCE OFFICER · EVENT INITIATED DAY 140 · RECOVERY IN PROGRESS
        </div>
      </div>

      {/* Recovery score progression */}
      <GlassPanel hi style={{ padding: "18px 20px", marginBottom: 20, maxWidth: 900 }}>
        <div
          className="font-mono"
          style={{ fontSize: 7.5, letterSpacing: "0.18em", color: "rgba(100,160,200,0.55)", marginBottom: 16 }}
        >
          RECOVERY SCORE PROGRESSION
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {timeline.map((t, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                className="font-mono"
                style={{ fontSize: 9, color: statusColor[t.status], fontWeight: 600 }}
              >
                {t.value}
              </div>
              <div
                style={{
                  width: "100%",
                  height: (t.value / 100) * 55,
                  background: statusColor[t.status],
                  opacity: 0.7,
                  transition: "height 0.5s ease",
                  borderRadius: "1px 1px 0 0",
                  boxShadow: `0 0 8px ${statusColor[t.status]}40`,
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, borderTop: "1px solid rgba(34,211,238,0.08)", paddingTop: 6, marginTop: 4 }}>
          {timeline.map((t, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div className="font-mono" style={{ fontSize: 6, color: "rgba(100,160,200,0.4)", letterSpacing: "0.1em" }}>
                {t.date}
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Timeline cards */}
      <div style={{ position: "relative", maxWidth: 900 }}>
        {/* Connecting line */}
        <div
          style={{
            position: "absolute",
            left: 19,
            top: 20,
            bottom: 20,
            width: 1,
            background: "linear-gradient(180deg, #ef4444, #22c55e)",
            opacity: 0.3,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {timeline.map((t, i) => {
            const isLast = i === timeline.length - 1;
            const color = statusColor[t.status];
            return (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {/* Node */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: color,
                    border: `2px solid ${color}50`,
                    flexShrink: 0,
                    marginTop: 12,
                    boxShadow: `0 0 8px ${color}`,
                    zIndex: 1,
                  }}
                />
                {/* Content */}
                <GlassPanel style={{ flex: 1, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        className="font-mono"
                        style={{ fontSize: 8, color: "rgba(100,160,200,0.4)", letterSpacing: "0.1em" }}
                      >
                        {t.date}
                      </span>
                      <span
                        className="font-mono"
                        style={{ fontSize: 8.5, fontWeight: 600, color, letterSpacing: "0.14em" }}
                      >
                        {t.label}
                      </span>
                    </div>
                    <div
                      className="font-mono"
                      style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}
                    >
                      {t.value}
                      <span style={{ fontSize: 8, marginLeft: 2, color: `${color}60` }}>/ 100</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 8.5, color: "rgba(140,190,220,0.6)", margin: 0, lineHeight: 1.5 }}>
                    {t.detail}
                  </p>
                </GlassPanel>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div
        style={{
          marginTop: 20,
          padding: "10px 14px",
          background: "rgba(34,197,94,0.07)",
          border: "1px solid rgba(34,197,94,0.25)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          maxWidth: 500,
        }}
      >
        <span style={{ fontSize: 14, color: "#22c55e" }}>✓</span>
        <div>
          <div
            className="font-mono"
            style={{ fontSize: 8.5, color: "#22c55e", letterSpacing: "0.12em", fontWeight: 600 }}
          >
            RETURNING TOWARD PERSONAL BASELINE
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 7, color: "rgba(34,197,94,0.55)", letterSpacing: "0.1em", marginTop: 1 }}
          >
            CosmoCare continues monitoring post-event recovery trajectory
          </div>
        </div>
      </div>
    </div>
  );
}
