interface EarthCommsProps {
  delayed: boolean;
  onToggle: () => void;
}

export default function EarthComms({ delayed, onToggle }: EarthCommsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      {delayed && (
        <div
          style={{
            background: "rgba(234,179,8,0.06)",
            border: "1px solid rgba(234,179,8,0.18)",
            backdropFilter: "blur(10px)",
            padding: "4px 10px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 7,
              fontFamily: "'JetBrains Mono', monospace",
              color: "rgba(234,179,8,0.7)",
              letterSpacing: "0.15em",
            }}
          >
            LOCAL DECISION SUPPORT ACTIVE
          </div>
        </div>
      )}
      <button
        onClick={onToggle}
        style={{
          background: delayed ? "rgba(234,179,8,0.08)" : "rgba(34,211,238,0.06)",
          border: `1px solid ${delayed ? "rgba(234,179,8,0.2)" : "rgba(34,211,238,0.12)"}`,
          backdropFilter: "blur(10px)",
          padding: "4px 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: delayed ? "#eab308" : "#22c55e",
          }}
          className="pulse"
        />
        <div style={{ textAlign: "left" }}>
          {delayed ? (
            <div>
              <div
                style={{
                  fontSize: 7.5,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#eab308",
                  letterSpacing: "0.14em",
                  lineHeight: 1.2,
                }}
              >
                EARTH LINK DELAYED
              </div>
              <div
                style={{
                  fontSize: 6.5,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "rgba(234,179,8,0.5)",
                  letterSpacing: "0.12em",
                }}
              >
                18:00 RESPONSE DELAY
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: 7.5,
                fontFamily: "'JetBrains Mono', monospace",
                color: "#22c55e",
                letterSpacing: "0.14em",
              }}
            >
              EARTH LINKED
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
