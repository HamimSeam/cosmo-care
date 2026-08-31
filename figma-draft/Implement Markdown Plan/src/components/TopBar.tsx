interface TopBarProps {
  earthDelayed: boolean;
  onToggleEarth: () => void;
  alertCount: number;
}

export default function TopBar({ earthDelayed, onToggleEarth, alertCount }: TopBarProps) {
  return (
    <div
      className="flex items-center justify-between px-5 shrink-0 z-20 relative"
      style={{
        height: 48,
        background: "rgba(3, 10, 22, 0.9)",
        borderBottom: "1px solid rgba(34,211,238,0.1)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Left — Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 6,
              height: 24,
              background: "linear-gradient(180deg, #22d3ee, #14b8a6)",
              borderRadius: 1,
            }}
          />
          <div>
            <div
              className="font-mono font-semibold tracking-widest"
              style={{ fontSize: 11, color: "#22d3ee", letterSpacing: "0.22em" }}
            >
              COSMOCARE
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 7.5, color: "rgba(100,160,200,0.6)", letterSpacing: "0.18em", marginTop: -1 }}
            >
              AI MEDICAL INTELLIGENCE
            </div>
          </div>
        </div>
      </div>

      {/* Center — Mission */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center">
        <div
          className="font-mono font-medium tracking-widest"
          style={{ fontSize: 11, color: "#c4daf0", letterSpacing: "0.2em" }}
        >
          ARTEMIS FORWARD
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 8, color: "rgba(100,160,200,0.5)", letterSpacing: "0.18em", marginTop: 1 }}
        >
          MISSION DAY 147 · DEEP SPACE TRANSIT
        </div>
      </div>

      {/* Right — Status */}
      <div className="flex items-center gap-4">
        {alertCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div
              className="font-mono font-medium"
              style={{
                fontSize: 8.5,
                color: alertCount > 2 ? "#ef4444" : "#eab308",
                letterSpacing: "0.15em",
                background: alertCount > 2 ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)",
                padding: "2px 7px",
                border: `1px solid ${alertCount > 2 ? "rgba(239,68,68,0.25)" : "rgba(234,179,8,0.2)"}`,
              }}
            >
              {alertCount} ACTIVE ALERT{alertCount !== 1 ? "S" : ""}
            </div>
          </div>
        )}

        <button
          onClick={onToggleEarth}
          className="flex items-center gap-2 cursor-pointer"
          style={{ background: "none", border: "none", padding: 0 }}
        >
          {earthDelayed ? (
            <div className="flex items-center gap-1.5">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#eab308" }} className="pulse" />
              <div>
                <div
                  className="font-mono"
                  style={{ fontSize: 8, color: "#eab308", letterSpacing: "0.15em", lineHeight: 1.2 }}
                >
                  ⚠ EARTH LINK DELAYED
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 7, color: "rgba(234,179,8,0.6)", letterSpacing: "0.15em" }}
                >
                  18:00 RESPONSE DELAY
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} className="pulse" />
              <div
                className="font-mono"
                style={{ fontSize: 8, color: "#22c55e", letterSpacing: "0.15em" }}
              >
                EARTH LINKED
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
