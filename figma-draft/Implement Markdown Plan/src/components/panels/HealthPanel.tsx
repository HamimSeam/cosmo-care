import { crewMembers, getStatusColor, getStatusLabel } from "../../data/crew";
import GlassPanel from "../GlassPanel";

interface MetricRowProps {
  label: string;
  baseline: number;
  current: number;
  unit: string;
  lowerIsBetter?: boolean;
}

function MetricRow({ label, baseline, current, unit, lowerIsBetter }: MetricRowProps) {
  const diff = current - baseline;
  const pct = Math.abs(diff) / baseline;
  const isDeviant = pct > 0.08;
  const isWorrying = pct > 0.18;
  const isHigh = diff > 0;

  // Arrow: if lower is better, up-arrow = bad; if higher is better, down-arrow = bad
  const isBad = lowerIsBetter ? isHigh : !isHigh;
  const arrowColor = isDeviant ? (isBad ? (isWorrying ? "#ef4444" : "#f97316") : "#22c55e") : "rgba(100,160,200,0.4)";

  const barWidth = Math.min(100, Math.max(0, (current / (baseline * 1.5)) * 100));
  const baseBarWidth = Math.min(100, Math.max(0, (baseline / (baseline * 1.5)) * 100));

  return (
    <div style={{ padding: "7px 0", borderBottom: "1px solid rgba(34,211,238,0.05)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span
          className="font-mono"
          style={{ fontSize: 7.5, letterSpacing: "0.13em", color: "rgba(100,160,200,0.6)" }}
        >
          {label}
        </span>
        <span style={{ fontSize: 7.5, color: arrowColor, fontWeight: 600 }}>
          {diff > 0 ? "↑" : "↓"}{" "}
          <span className="font-mono" style={{ fontSize: 7 }}>
            {Math.abs(Math.round(diff * 10) / 10)}{unit} FROM BASELINE
          </span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 3 }}>
        <div>
          <div className="font-mono" style={{ fontSize: 7, color: "rgba(100,160,200,0.4)", letterSpacing: "0.1em" }}>
            BASELINE
          </div>
          <div className="font-mono" style={{ fontSize: 15, fontWeight: 400, color: "rgba(140,190,220,0.6)", lineHeight: 1.1 }}>
            {baseline}
            <span style={{ fontSize: 8, marginLeft: 2, color: "rgba(100,160,200,0.4)" }}>{unit}</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "rgba(100,160,200,0.2)" }}>→</div>
        <div>
          <div className="font-mono" style={{ fontSize: 7, color: "rgba(100,160,200,0.4)", letterSpacing: "0.1em" }}>
            CURRENT
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 17, fontWeight: 600, color: isDeviant ? (isWorrying ? "#ef4444" : "#f97316") : "#c4daf0", lineHeight: 1.1 }}
          >
            {current}
            <span style={{ fontSize: 8, marginLeft: 2, color: isDeviant ? "rgba(239,100,100,0.5)" : "rgba(100,160,200,0.4)" }}>
              {unit}
            </span>
          </div>
        </div>
      </div>

      {/* Bar comparison */}
      <div style={{ marginTop: 4, position: "relative", height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 1 }}>
        {/* Baseline marker */}
        <div
          style={{
            position: "absolute",
            left: `${baseBarWidth}%`,
            top: -1,
            width: 1,
            height: 5,
            background: "rgba(34,211,238,0.35)",
          }}
        />
        {/* Current fill */}
        <div
          style={{
            height: "100%",
            width: `${barWidth}%`,
            background: isDeviant ? (isWorrying ? "#ef4444" : "#f97316") : "#22c55e",
            borderRadius: 1,
            opacity: 0.7,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

interface HealthSummaryProps {
  health: number;
  recovery: number;
  readiness: number;
  status: string;
}

function HealthSummary({ health, recovery, readiness, status }: HealthSummaryProps) {
  const color = getStatusColor(status);
  const metrics = [
    { label: "HEALTH", value: health },
    { label: "RECOVERY", value: recovery },
    { label: "READINESS", value: readiness },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        borderBottom: "1px solid rgba(34,211,238,0.08)",
      }}
    >
      {metrics.map((m, i) => (
        <div
          key={m.label}
          style={{
            flex: 1,
            padding: "10px 10px 8px",
            borderRight: i < 2 ? "1px solid rgba(34,211,238,0.06)" : "none",
            textAlign: "center",
          }}
        >
          <div
            className="font-mono"
            style={{ fontSize: 7, letterSpacing: "0.15em", color: "rgba(100,160,200,0.5)" }}
          >
            {m.label}
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: m.value < 40 ? "#ef4444" : m.value < 60 ? "#f97316" : m.value < 75 ? "#eab308" : "#c4daf0",
              lineHeight: 1.1,
              marginTop: 1,
            }}
          >
            {m.value}
          </div>
        </div>
      ))}
    </div>
  );
}

interface HealthPanelProps {
  selectedCrewId: string | null;
}

export default function HealthPanel({ selectedCrewId }: HealthPanelProps) {
  const crew = crewMembers.find((c) => c.id === selectedCrewId);
  if (!crew) {
    return (
      <GlassPanel style={{ width: 272, padding: "14px 14px" }}>
        <div
          className="font-mono"
          style={{ fontSize: 8, color: "rgba(100,160,200,0.35)", letterSpacing: "0.15em", textAlign: "center", paddingTop: 20 }}
        >
          SELECT CREW MEMBER
        </div>
      </GlassPanel>
    );
  }

  const color = getStatusColor(crew.status);
  const label = getStatusLabel(crew.status);

  return (
    <GlassPanel
      hi
      className="hud-appear"
      style={{
        width: 272,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        maxHeight: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "10px 12px 8px",
          borderBottom: "1px solid rgba(34,211,238,0.08)",
          background: `linear-gradient(to right, ${color}08, transparent)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e0eef8", letterSpacing: "0.02em" }}>
              {crew.name}
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 7.5, letterSpacing: "0.14em", color: "rgba(100,160,200,0.55)", marginTop: 1 }}
            >
              {crew.role.toUpperCase()} · {crew.module.toUpperCase()}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
              <div
                className={crew.status === "critical" ? "pulse-fast" : "pulse"}
                style={{ width: 5, height: 5, borderRadius: "50%", background: color }}
              />
              <span
                className="font-mono"
                style={{ fontSize: 8, color, letterSpacing: "0.15em", fontWeight: 600 }}
              >
                {label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Health metrics */}
      <HealthSummary
        health={crew.health}
        recovery={crew.recoveryScore}
        readiness={crew.readiness}
        status={crew.status}
      />

      {/* Personal baseline */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        <div
          style={{
            padding: "8px 12px 4px",
            borderBottom: "1px solid rgba(34,211,238,0.06)",
          }}
        >
          <div
            className="font-mono"
            style={{ fontSize: 7.5, letterSpacing: "0.18em", color: "rgba(100,160,200,0.6)" }}
          >
            PERSONAL BASELINE
          </div>
          <div
            style={{ fontSize: 8.5, color: "rgba(100,160,200,0.4)", marginTop: 2, lineHeight: 1.4 }}
          >
            Deviations from <em style={{ color: "rgba(140,190,220,0.55)" }}>{crew.name.split(" ")[0]}'s</em> personal baseline
          </div>
        </div>
        <div style={{ padding: "0 12px" }}>
          <MetricRow
            label="RESTING HEART RATE"
            baseline={crew.baseline.heartRate}
            current={crew.current.heartRate}
            unit=" BPM"
            lowerIsBetter
          />
          <MetricRow
            label="HRV"
            baseline={crew.baseline.hrv}
            current={crew.current.hrv}
            unit=" ms"
            lowerIsBetter={false}
          />
          <MetricRow
            label="SLEEP DURATION"
            baseline={crew.baseline.sleep}
            current={crew.current.sleep}
            unit=" HR"
            lowerIsBetter={false}
          />
          <MetricRow
            label="SPO₂"
            baseline={crew.baseline.spo2}
            current={crew.current.spo2}
            unit="%"
            lowerIsBetter={false}
          />
          <MetricRow
            label="RECOVERY INDEX"
            baseline={crew.baseline.recovery}
            current={crew.current.recovery}
            unit=""
            lowerIsBetter={false}
          />
        </div>
      </div>
    </GlassPanel>
  );
}
