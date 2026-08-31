import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { crewMembers, getStatusColor } from "../../data/crew";
import GlassPanel from "../GlassPanel";

type MetricKey = "heartRate" | "hrv" | "spo2" | "sleep" | "recovery";

const METRICS: { key: MetricKey; label: string; unit: string }[] = [
  { key: "heartRate", label: "HEART RATE", unit: "bpm" },
  { key: "hrv", label: "HRV", unit: "ms" },
  { key: "spo2", label: "SPO₂", unit: "%" },
  { key: "sleep", label: "SLEEP", unit: "hr" },
  { key: "recovery", label: "RECOVERY", unit: "" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
  unit: string;
  baseline: number;
  statusColor: string;
}

function CustomTooltip({ active, payload, label, unit, baseline, statusColor }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  if (val === undefined) return null;

  return (
    <div
      style={{
        background: "rgba(4, 12, 24, 0.92)",
        border: "1px solid rgba(34,211,238,0.18)",
        padding: "5px 8px",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="font-mono" style={{ fontSize: 7.5, color: "rgba(100,160,200,0.5)", marginBottom: 2 }}>
        {label}
      </div>
      <div className="font-mono" style={{ fontSize: 14, color: statusColor, fontWeight: 600 }}>
        {val}{unit}
      </div>
      <div className="font-mono" style={{ fontSize: 7, color: "rgba(100,160,200,0.4)", marginTop: 1 }}>
        BASELINE {baseline}{unit}
      </div>
    </div>
  );
}

interface HealthTrendsProps {
  selectedCrewId: string | null;
}

export default function HealthTrends({ selectedCrewId }: HealthTrendsProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("heartRate");
  const crew = crewMembers.find((c) => c.id === selectedCrewId);
  if (!crew) return null;

  const metricInfo = METRICS.find((m) => m.key === activeMetric)!;
  const data = crew.trends[activeMetric];
  const baseline = crew.baseline[activeMetric === "heartRate" ? "heartRate" : activeMetric === "hrv" ? "hrv" : activeMetric === "spo2" ? "spo2" : activeMetric === "sleep" ? "sleep" : "recovery"];
  const color = getStatusColor(crew.status);

  // Show every 4th hour label
  const filteredData = data.map((d, i) => ({
    ...d,
    displayHour: i % 4 === 0 ? d.hour : "",
  }));

  const vals = data.map((d) => d.value);
  const minVal = Math.min(...vals, baseline) * 0.92;
  const maxVal = Math.max(...vals, baseline) * 1.08;

  return (
    <GlassPanel className="hud-appear" style={{ width: 272, overflow: "hidden" }}>
      <div style={{ padding: "8px 12px 6px", borderBottom: "1px solid rgba(34,211,238,0.07)" }}>
        <div
          className="font-mono"
          style={{ fontSize: 7.5, letterSpacing: "0.18em", color: "rgba(100,160,200,0.6)" }}
        >
          HEALTH TRENDS · 24H
        </div>
      </div>

      {/* Metric tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(34,211,238,0.07)",
          overflowX: "auto",
        }}
      >
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMetric(m.key)}
            style={{
              flex: 1,
              padding: "5px 4px",
              background: activeMetric === m.key ? "rgba(34,211,238,0.07)" : "transparent",
              border: "none",
              borderBottom: activeMetric === m.key ? `1.5px solid ${color}` : "1.5px solid transparent",
              cursor: "pointer",
              transition: "all 0.12s ease",
              minWidth: 40,
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: 6.5,
                letterSpacing: "0.1em",
                color: activeMetric === m.key ? color : "rgba(100,160,200,0.4)",
                display: "block",
                whiteSpace: "nowrap",
              }}
            >
              {m.label}
            </span>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ padding: "8px 4px 4px" }}>
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={filteredData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.18} />
                <stop offset="95%" stopColor={color} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.05)" />
            <XAxis
              dataKey="displayHour"
              tick={{ fontSize: 7, fill: "rgba(100,160,200,0.4)", fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[minVal, maxVal]}
              tick={{ fontSize: 7, fill: "rgba(100,160,200,0.4)", fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              tickCount={3}
            />
            <Tooltip
              content={
                <CustomTooltip
                  unit={metricInfo.unit}
                  baseline={baseline}
                  statusColor={color}
                />
              }
            />
            <ReferenceLine
              y={baseline}
              stroke="rgba(34,211,238,0.3)"
              strokeDasharray="4 3"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill="url(#areaGrad)"
              dot={false}
              activeDot={{ r: 3, fill: color, stroke: "rgba(4,9,18,0.8)", strokeWidth: 1.5 }}
              isAnimationActive
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>

        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 4, marginTop: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ width: 14, height: 1, background: color, opacity: 0.8 }} />
            <span className="font-mono" style={{ fontSize: 6.5, color: "rgba(100,160,200,0.45)" }}>CURRENT</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div
              style={{
                width: 14,
                height: 1,
                background: "rgba(34,211,238,0.4)",
                backgroundImage: "repeating-linear-gradient(to right, rgba(34,211,238,0.4) 0, rgba(34,211,238,0.4) 3px, transparent 3px, transparent 6px)",
              }}
            />
            <span className="font-mono" style={{ fontSize: 6.5, color: "rgba(100,160,200,0.45)" }}>BASELINE</span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
