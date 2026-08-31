import { useState, useMemo } from "react";
import type { NavPage, Scenario } from "./types";
import { crewMembers } from "./data/crew";

import TopBar from "./components/TopBar";
import NavRail from "./components/NavRail";
import SpacecraftScene from "./components/scene/SpacecraftScene";
import CrewStatusPanel from "./components/panels/CrewStatusPanel";
import HealthPanel from "./components/panels/HealthPanel";
import HealthIntelligence from "./components/panels/HealthIntelligence";
import HealthTrends from "./components/panels/HealthTrends";
import ScenarioSelector from "./components/ScenarioSelector";
import AstroTriage from "./pages/AstroTriage";
import Recovery from "./pages/Recovery";
import PlaceholderPage from "./pages/PlaceholderPage";

const placeholders: Partial<Record<NavPage, { title: string; description: string }>> = {
  crew: { title: "Crew Health", description: "Comprehensive physiological profiles and longitudinal health tracking for all crew members." },
  intelligence: { title: "Health Intelligence", description: "AI-driven pattern recognition across crew health data to detect early physiological anomalies." },
  readiness: { title: "Mission Readiness", description: "Real-time mission performance readiness assessment based on crew physiological state." },
  events: { title: "Medical Events", description: "Chronological log of all detected medical events, interventions, and outcomes." },
  assistant: { title: "AI Assistant", description: "Natural language interface for medical queries, protocol lookups, and decision support." },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>("overview");
  const [selectedCrewId, setSelectedCrewId] = useState<string | null>("jordan");
  const [hoveredCrewId, setHoveredCrewId] = useState<string | null>(null);
  const [earthDelayed, setEarthDelayed] = useState(false);
  const [scenario, setScenario] = useState<Scenario>("emergency");

  const alertCount = useMemo(
    () => crewMembers.filter((c) => c.status !== "nominal").length,
    []
  );

  function handleSelectScenario(s: Scenario, crewId: string) {
    setScenario(s);
    setSelectedCrewId(crewId);
  }

  function handleSelectCrew(id: string) {
    setSelectedCrewId(id);
  }

  // Render non-overview pages
  function renderPage() {
    if (currentPage === "triage") return <AstroTriage />;
    if (currentPage === "recovery") return <Recovery />;
    const ph = placeholders[currentPage];
    if (ph) return <PlaceholderPage title={ph.title} description={ph.description} />;
    return null;
  }

  const isOverview = currentPage === "overview";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#040912", overflow: "hidden" }}>
      {/* Top bar */}
      <TopBar
        earthDelayed={earthDelayed}
        onToggleEarth={() => setEarthDelayed((v) => !v)}
        alertCount={alertCount}
      />

      {/* Main body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Nav rail */}
        <NavRail currentPage={currentPage} onNavigate={setCurrentPage} />

        {/* Content area */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {isOverview ? (
            <>
              {/* 3D Canvas - fills entire area */}
              <div style={{ position: "absolute", inset: 0 }}>
                <SpacecraftScene
                  selectedCrewId={selectedCrewId}
                  hoveredCrewId={hoveredCrewId}
                  onSelectCrew={handleSelectCrew}
                  onHoverCrew={setHoveredCrewId}
                />
              </div>

              {/* HUD overlay layer */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Main HUD row */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "stretch",
                    overflow: "hidden",
                    padding: "12px",
                    gap: 12,
                  }}
                >
                  {/* Left: Crew status */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      pointerEvents: "auto",
                      maxHeight: "100%",
                    }}
                  >
                    <CrewStatusPanel
                      selectedCrewId={selectedCrewId}
                      hoveredCrewId={hoveredCrewId}
                      onSelectCrew={handleSelectCrew}
                      onHoverCrew={setHoveredCrewId}
                    />
                  </div>

                  {/* Center: spacer (spacecraft visible) */}
                  <div style={{ flex: 1 }} />

                  {/* Right: health panels stack */}
                  {selectedCrewId && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        pointerEvents: "auto",
                        maxHeight: "100%",
                        overflowY: "auto",
                        scrollbarWidth: "none",
                      }}
                    >
                      <HealthPanel selectedCrewId={selectedCrewId} />
                      <HealthIntelligence
                        selectedCrewId={selectedCrewId}
                        onOpenTriage={() => setCurrentPage("triage")}
                      />
                      <HealthTrends selectedCrewId={selectedCrewId} />
                    </div>
                  )}
                </div>

                {/* Bottom HUD bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    padding: "0 12px 12px",
                    gap: 12,
                    pointerEvents: "none",
                  }}
                >
                  {/* Bottom left — mission stats */}
                  <div
                    style={{
                      pointerEvents: "auto",
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    {[
                      { label: "MISSION DAY", value: "147" },
                      { label: "CREW NOMINAL", value: "1 / 4" },
                      { label: "ACTIVE ALERTS", value: String(alertCount) },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        style={{
                          background: "rgba(4, 12, 24, 0.75)",
                          border: "1px solid rgba(34,211,238,0.1)",
                          backdropFilter: "blur(12px)",
                          padding: "5px 10px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          className="font-mono"
                          style={{ fontSize: 16, fontWeight: 600, color: "#c4daf0", lineHeight: 1 }}
                        >
                          {stat.value}
                        </div>
                        <div
                          className="font-mono"
                          style={{ fontSize: 6.5, letterSpacing: "0.15em", color: "rgba(100,160,200,0.45)", marginTop: 2 }}
                        >
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom center — scenario selector */}
                  <div style={{ pointerEvents: "auto" }}>
                    <ScenarioSelector active={scenario} onSelect={handleSelectScenario} />
                  </div>

                  {/* Bottom right — earth comms + triage shortcut */}
                  <div style={{ pointerEvents: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    {/* Earth comms */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: earthDelayed ? "rgba(234,179,8,0.06)" : "rgba(34,211,238,0.04)",
                        border: `1px solid ${earthDelayed ? "rgba(234,179,8,0.2)" : "rgba(34,211,238,0.1)"}`,
                        backdropFilter: "blur(10px)",
                        padding: "4px 10px",
                        cursor: "pointer",
                      }}
                      onClick={() => setEarthDelayed((v) => !v)}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: earthDelayed ? "#eab308" : "#22c55e",
                        }}
                        className="pulse"
                      />
                      {earthDelayed ? (
                        <div>
                          <div
                            className="font-mono"
                            style={{ fontSize: 7.5, color: "#eab308", letterSpacing: "0.14em", lineHeight: 1.2 }}
                          >
                            EARTH LINK DELAYED
                          </div>
                          <div
                            className="font-mono"
                            style={{ fontSize: 6.5, color: "rgba(234,179,8,0.5)", letterSpacing: "0.12em" }}
                          >
                            LOCAL DECISION SUPPORT ACTIVE
                          </div>
                        </div>
                      ) : (
                        <div
                          className="font-mono"
                          style={{ fontSize: 7.5, color: "#22c55e", letterSpacing: "0.14em" }}
                        >
                          EARTH LINKED · SUPPORT AVAILABLE
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* HUD decorative elements — thin technical lines */}
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  pointerEvents: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  className="font-mono"
                  style={{
                    fontSize: 7,
                    letterSpacing: "0.2em",
                    color: "rgba(34,211,238,0.25)",
                  }}
                >
                  MISSION OVERVIEW · ARTEMIS FORWARD
                </div>
                <div style={{ width: 1, height: 18, background: "rgba(34,211,238,0.12)" }} />
              </div>
            </>
          ) : (
            renderPage()
          )}
        </div>
      </div>
    </div>
  );
}
