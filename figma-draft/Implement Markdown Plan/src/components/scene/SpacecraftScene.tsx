import { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import { crewMembers, getStatusColor, getStatusLabel } from "../../data/crew";
import type { CrewMember } from "../../types";

/* ─── Spacecraft geometry ─── */
function Spacecraft() {
  const hullColor = "#0e1e30";
  const panelColor = "#162438";
  const ringColor = "#1e3045";

  return (
    <group>
      {/* === NOSE CONE === */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -4.5]}>
        <coneGeometry args={[0.48, 0.7, 20]} />
        <meshStandardMaterial color="#09151f" metalness={0.92} roughness={0.12} />
      </mesh>

      {/* === COMMAND CAPSULE === */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -3.95]}>
        <cylinderGeometry args={[0.48, 0.55, 0.85, 20]} />
        <meshStandardMaterial color={hullColor} metalness={0.88} roughness={0.18} />
      </mesh>

      {/* Viewport band */}
      <mesh position={[0, 0, -3.7]}>
        <torusGeometry args={[0.52, 0.045, 8, 32]} />
        <meshStandardMaterial color="#22d3ee" metalness={0.95} roughness={0.05} emissive="#22d3ee" emissiveIntensity={0.35} />
      </mesh>

      {/* Viewport fill */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -3.7]}>
        <circleGeometry args={[0.47, 24]} />
        <meshStandardMaterial color="#001a33" transparent opacity={0.85} emissive="#004488" emissiveIntensity={0.3} />
      </mesh>

      {/* Command capsule rear ring */}
      <mesh position={[0, 0, -3.5]}>
        <torusGeometry args={[0.565, 0.03, 8, 32]} />
        <meshStandardMaterial color={ringColor} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* === TRANSITION COLLAR === */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -3.2]}>
        <cylinderGeometry args={[0.55, 0.68, 0.5, 20]} />
        <meshStandardMaterial color={panelColor} metalness={0.8} roughness={0.25} />
      </mesh>

      {/* === MAIN HAB SECTION === */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1.95]}>
        <cylinderGeometry args={[0.68, 0.68, 2.5, 24]} />
        <meshStandardMaterial color={hullColor} metalness={0.82} roughness={0.22} />
      </mesh>

      {/* Hab section panel strips */}
      {[-2.6, -1.8, -1.2, -0.8].map((z, i) => (
        <mesh key={i} position={[0, 0, z]}>
          <torusGeometry args={[0.69, 0.018, 6, 32]} />
          <meshStandardMaterial color={ringColor} metalness={0.75} roughness={0.35} />
        </mesh>
      ))}

      {/* Science port (top) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.88, -1.6]}>
        <cylinderGeometry args={[0.16, 0.16, 0.35, 12]} />
        <meshStandardMaterial color={panelColor} metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.06, -1.6]}>
        <cylinderGeometry args={[0.18, 0.14, 0.06, 12]} />
        <meshStandardMaterial color={ringColor} metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Airlock (starboard) */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.88, 0, -2.4]}>
        <cylinderGeometry args={[0.14, 0.14, 0.3, 12]} />
        <meshStandardMaterial color={panelColor} metalness={0.8} roughness={0.25} />
      </mesh>

      {/* === CENTRAL HUB (solar mount) === */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.78, 0.78, 0.55, 24]} />
        <meshStandardMaterial color="#12202e" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, -0.025]}>
        <torusGeometry args={[0.8, 0.04, 8, 32]} />
        <meshStandardMaterial color={ringColor} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, -0.55]}>
        <torusGeometry args={[0.8, 0.04, 8, 32]} />
        <meshStandardMaterial color={ringColor} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* === SOLAR WING MASTS === */}
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 1.6, 0, -0.3]}>
            <cylinderGeometry args={[0.04, 0.04, 1.85, 8]} />
            <meshStandardMaterial color="#1a2d40" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Solar panel section 1 */}
          <mesh position={[side * 3.0, 0, -0.3]}>
            <boxGeometry args={[2.4, 0.04, 1.1]} />
            <meshStandardMaterial color="#040e1c" metalness={0.05} roughness={0.85} emissive="#020810" emissiveIntensity={0.5} />
          </mesh>
          {/* Solar cell lines overlay */}
          <mesh position={[side * 3.0, 0.022, -0.3]}>
            <boxGeometry args={[2.38, 0.002, 1.08]} />
            <meshStandardMaterial color="#061428" metalness={0.0} roughness={1.0} wireframe={false} />
          </mesh>
          {/* Solar panel section 2 */}
          <mesh position={[side * 5.05, 0, -0.3]}>
            <boxGeometry args={[2.3, 0.04, 1.1]} />
            <meshStandardMaterial color="#040e1c" metalness={0.05} roughness={0.85} emissive="#020810" emissiveIntensity={0.5} />
          </mesh>
          {/* Panel connector */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[side * 3.95, 0, -0.3]}>
            <cylinderGeometry args={[0.03, 0.03, 0.16, 8]} />
            <meshStandardMaterial color="#1a2d40" metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* === THERMAL RADIATORS === */}
      {([-1, 1] as const).map((side) => (
        <mesh key={side} rotation={[0, 0, Math.PI / 2]} position={[side * 0.6, side * 1.55, -0.3]}>
          <boxGeometry args={[0.04, 1.4, 1.8]} />
          <meshStandardMaterial color="#c0d0dc" metalness={0.35} roughness={0.55} />
        </mesh>
      ))}

      {/* === ENGINEERING SECTION === */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 1.35]}>
        <cylinderGeometry args={[0.62, 0.62, 1.7, 20]} />
        <meshStandardMaterial color={hullColor} metalness={0.82} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0, 0.5]}>
        <torusGeometry args={[0.64, 0.025, 8, 32]} />
        <meshStandardMaterial color={ringColor} metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Fuel tanks */}
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[side * 0.92, 0, 1.3]}>
            <cylinderGeometry args={[0.22, 0.22, 1.6, 14]} />
            <meshStandardMaterial color="#0a1a28" metalness={0.75} roughness={0.3} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[side * 0.92, 0, 0.52]}>
            <cylinderGeometry args={[0.22, 0.1, 0.15, 14]} />
            <meshStandardMaterial color="#0a1a28" metalness={0.75} roughness={0.3} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[side * 0.92, 0, 2.1]}>
            <cylinderGeometry args={[0.1, 0.22, 0.15, 14]} />
            <meshStandardMaterial color="#0a1a28" metalness={0.75} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* === TRANSITION TO ENGINE MOUNT === */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 2.45]}>
        <cylinderGeometry args={[0.62, 0.72, 0.3, 20]} />
        <meshStandardMaterial color={panelColor} metalness={0.8} roughness={0.25} />
      </mesh>

      {/* === ENGINE MOUNT RING === */}
      <mesh position={[0, 0, 2.65]}>
        <torusGeometry args={[0.7, 0.1, 12, 32]} />
        <meshStandardMaterial color="#12202e" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* === ENGINE BELLS (4x ion thrusters) === */}
      {[[-0.38, -0.38], [-0.38, 0.38], [0.38, -0.38], [0.38, 0.38]].map(([x, y], i) => (
        <group key={i} position={[x, y, 2.85]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.09, 0.35, 12]} />
            <meshStandardMaterial color="#0c1a28" metalness={0.8} roughness={0.25} />
          </mesh>
          {/* Engine glow */}
          <pointLight position={[0, 0, 0.2]} color="#4488ff" intensity={0.6} distance={1.2} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.18]}>
            <circleGeometry args={[0.08, 12]} />
            <meshStandardMaterial color="#2255cc" emissive="#4488ff" emissiveIntensity={1.5} transparent opacity={0.9} />
          </mesh>
        </group>
      ))}

      {/* === COMMUNICATION DISH === */}
      <group position={[0, 0.78, -0.3]}>
        <mesh rotation={[Math.PI / 6, 0, 0]}>
          <sphereGeometry args={[0.28, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#c8d8e8" metalness={0.4} roughness={0.45} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.25, 6]} />
          <meshStandardMaterial color="#445566" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/* ─── Crew marker ─── */
interface CrewMarkerProps {
  crew: CrewMember;
  selected: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onClick: () => void;
}

function CrewMarker({ crew, selected, hovered, onHover, onClick }: CrewMarkerProps) {
  const color = getStatusColor(crew.status);
  const label = getStatusLabel(crew.status);
  const isCritical = crew.status === "critical";

  return (
    <Html position={crew.position3D} center zIndexRange={[100, 200]}>
      <div
        className="crew-marker-wrap"
        onClick={onClick}
        onMouseEnter={() => onHover(crew.id)}
        onMouseLeave={() => onHover(null)}
        style={{ position: "relative", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {/* Pulsing ring */}
        <div
          style={{
            position: "absolute",
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: `1px solid ${color}`,
            top: 0,
            left: 0,
            animation: "ring-pulse 2.2s ease-out infinite",
            color,
          }}
        />
        {selected && (
          <div
            style={{
              position: "absolute",
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: `1.5px solid ${color}`,
              top: -4,
              left: -4,
              opacity: 0.5,
            }}
          />
        )}

        {/* Main dot */}
        <div
          className={isCritical ? "pulse-fast" : "pulse"}
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 8px ${color}, 0 0 16px ${color}50`,
            border: `1px solid rgba(255,255,255,0.35)`,
            cursor: "pointer",
            outline: selected ? `2px solid ${color}` : "none",
            outlineOffset: 2,
          }}
        />

        {/* Hover tooltip */}
        {hovered && (
          <div
            className="crew-marker-tooltip hud-appear"
            style={{ bottom: 22 }}
          >
            <div className="crew-marker-name">{crew.name}</div>
            <div className="crew-marker-role">{crew.role.toUpperCase()}</div>
            <div className="crew-marker-status" style={{ color }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />
              {label}
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 8, color: "rgba(140,190,220,0.5)", marginTop: 2, letterSpacing: "0.08em" }}
            >
              {crew.module.toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}

/* ─── Camera controller ─── */
interface CamControllerProps {
  selectedCrewId: string | null;
  orbitRef: React.RefObject<any>;
}

function CamController({ selectedCrewId, orbitRef }: CamControllerProps) {
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (selectedCrewId) {
      const crew = crewMembers.find((c) => c.id === selectedCrewId);
      if (crew) {
        targetPos.current.set(...crew.position3D);
      }
    } else {
      targetPos.current.set(0, 0, 0);
    }
  }, [selectedCrewId]);

  useFrame(() => {
    if (orbitRef.current) {
      orbitRef.current.target.lerp(targetPos.current, 0.04);
    }
  });

  return null;
}

/* ─── Main scene ─── */
interface SpacecraftSceneProps {
  selectedCrewId: string | null;
  hoveredCrewId: string | null;
  onSelectCrew: (id: string) => void;
  onHoverCrew: (id: string | null) => void;
}

export default function SpacecraftScene({
  selectedCrewId,
  hoveredCrewId,
  onSelectCrew,
  onHoverCrew,
}: SpacecraftSceneProps) {
  const orbitRef = useRef<any>(null);

  return (
    <Canvas
      camera={{ position: [8, 3.5, 7], fov: 48, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#040912" }}
    >
      {/* ─ Lighting ─ */}
      <ambientLight color="#0a1825" intensity={0.8} />
      {/* Main sun */}
      <directionalLight
        position={[6, 9, -6]}
        color="#fff8f0"
        intensity={3.2}
        castShadow
      />
      {/* Fill from opposite */}
      <directionalLight position={[-4, -2, 8]} color="#1a3555" intensity={0.4} />
      {/* Subtle blue rim */}
      <directionalLight position={[0, -6, -4]} color="#0a2040" intensity={0.25} />

      {/* ─ Stars ─ */}
      <Stars
        radius={120}
        depth={60}
        count={3500}
        factor={4.5}
        saturation={0}
        fade
        speed={0.2}
      />

      {/* ─ Spacecraft ─ */}
      <Suspense fallback={null}>
        <Spacecraft />
      </Suspense>

      {/* ─ Crew markers ─ */}
      {crewMembers.map((crew) => (
        <CrewMarker
          key={crew.id}
          crew={crew}
          selected={selectedCrewId === crew.id}
          hovered={hoveredCrewId === crew.id}
          onHover={onHoverCrew}
          onClick={() => onSelectCrew(crew.id)}
        />
      ))}

      {/* ─ Camera control ─ */}
      <CamController selectedCrewId={selectedCrewId} orbitRef={orbitRef} />
      <OrbitControls
        ref={orbitRef}
        enableDamping
        dampingFactor={0.06}
        minDistance={3}
        maxDistance={22}
        autoRotate={selectedCrewId === null}
        autoRotateSpeed={0.18}
      />
    </Canvas>
  );
}
