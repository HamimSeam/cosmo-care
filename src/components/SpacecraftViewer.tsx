'use client';

import { useRef, useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stars, Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { Astronaut } from '@/types';

const SUN_DIRECTION = new THREE.Vector3(0.82, 0.58, 0.42).normalize();

// ─── Advanced space lighting ──────────────────────────────────────────────────

function useSunCoords(distance: number) {
  return useMemo(
    () => SUN_DIRECTION.clone().multiplyScalar(distance).toArray() as [number, number, number],
    [distance],
  );
}

function configureRenderer(gl: THREE.WebGLRenderer) {
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.18;
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFShadowMap;
}

function SpaceEnvironment({ sunCoords }: { sunCoords: [number, number, number] }) {
  return (
    <Environment resolution={512} background={false} blur={0.65}>
      <Lightformer
        form="circle"
        intensity={18}
        color="#fff4d6"
        position={sunCoords}
        scale={10}
      />
      <Lightformer
        form="rect"
        intensity={2.4}
        color="#7da2ff"
        rotation-y={Math.PI / 2}
        position={[-sunCoords[0] * 0.35, sunCoords[1] * 0.2, -sunCoords[2] * 0.4]}
        scale={[14, 5, 1]}
      />
      <Lightformer
        form="ring"
        intensity={0.8}
        color="#1c2840"
        rotation-x={Math.PI / 2}
        position={[0, 12, 0]}
        scale={18}
      />
      <Lightformer
        form="rect"
        intensity={0.35}
        color="#0a1020"
        rotation-x={Math.PI}
        position={[0, -8, 0]}
        scale={[30, 30, 1]}
      />
    </Environment>
  );
}

function SunLight({
  sunCoords,
  distance,
}: {
  sunCoords: [number, number, number];
  distance: number;
}) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const shadowExtent = Math.max(distance * 0.35, 8);

  useEffect(() => {
    const light = lightRef.current;
    if (!light?.shadow) return;
    light.shadow.radius = 3;
    light.shadow.normalBias = 0.02;
  }, []);

  return (
    <group>
      <directionalLight
        ref={lightRef}
        position={sunCoords}
        intensity={Math.PI * 1.35}
        color="#fff3dc"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-near={0.5}
        shadow-camera-far={distance * 1.5}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-bias={-0.00008}
      />

      <mesh position={sunCoords} layers={1}>
        <sphereGeometry args={[distance * 0.05, 48, 48]} />
        <meshBasicMaterial color="#fff6cc" toneMapped={false} />
      </mesh>

      <mesh position={sunCoords} layers={1}>
        <sphereGeometry args={[distance * 0.11, 48, 48]} />
        <meshBasicMaterial color="#ffbe5c" transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

function RimAndFillLights({ sunCoords }: { sunCoords: [number, number, number] }) {
  const rimPosition = useMemo(
    () => [
      -sunCoords[0] * 0.55,
      sunCoords[1] * 0.25,
      -sunCoords[2] * 0.45,
    ] as [number, number, number],
    [sunCoords],
  );

  return (
    <>
      <directionalLight
        position={rimPosition}
        intensity={Math.PI * 0.22}
        color="#8eb4ff"
      />
      <hemisphereLight args={['#6f8fd4', '#05080f', 0.28]} />
    </>
  );
}

function PostFX() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={1.35}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.35}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.1} darkness={0.45} />
    </EffectComposer>
  );
}

function SpaceLightingRig({ distance }: { distance: number }) {
  const sunCoords = useSunCoords(distance);

  return (
    <>
      <SpaceEnvironment sunCoords={sunCoords} />
      <SunLight sunCoords={sunCoords} distance={distance} />
      <RimAndFillLights sunCoords={sunCoords} />
      <PostFX />
    </>
  );
}

function enhanceShipMaterials(root: THREE.Object3D) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    child.castShadow = true;
    child.receiveShadow = true;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        material.envMapIntensity = 1.35;
        material.roughness = THREE.MathUtils.clamp(material.roughness, 0.25, 0.9);
        material.metalness = THREE.MathUtils.clamp(material.metalness, 0.05, 0.95);
        material.needsUpdate = true;
      }

      if (material instanceof THREE.MeshPhysicalMaterial) {
        material.envMapIntensity = 1.35;
        material.roughness = THREE.MathUtils.clamp(material.roughness, 0.25, 0.9);
        material.metalness = THREE.MathUtils.clamp(material.metalness, 0.05, 0.95);
        material.clearcoat = Math.max(material.clearcoat, 0.08);
        material.clearcoatRoughness = 0.35;
        material.needsUpdate = true;
      }
    });
  });
}

// ─── Default camera (computed from model bounds after load) ───────────────────
export type SceneCameraConfig = {
  pos: [number, number, number];
  target: [number, number, number];
  minDistance: number;
  maxDistance: number;
  fogNear: number;
  fogFar: number;
};

const CAMERA_VIEW_DIR = new THREE.Vector3(0.71, 0.39, -0.68).normalize();
// Fraction of hull size — shifts ship left in frame after bbox centering.
const SHIP_FRAME_OFFSET_X = -0.12;
const FALLBACK_CAMERA: SceneCameraConfig = {
  pos: [1.05, 0.58, -1.0],
  target: [0, 0, 0],
  minDistance: 0.5,
  maxDistance: 8,
  fogNear: 8,
  fogFar: 24,
};

function computeSceneCamera(box: THREE.Box3, frameOffset: THREE.Vector3): SceneCameraConfig {
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const distance = maxDim * 1.25;
  const pos = CAMERA_VIEW_DIR.clone().multiplyScalar(distance);

  return {
    pos: [pos.x, pos.y, pos.z],
    target: [frameOffset.x, frameOffset.y, frameOffset.z],
    minDistance: distance * 0.45,
    maxDistance: distance * 2.4,
    fogNear: maxDim * 6,
    fogFar: maxDim * 18,
  };
}

// ─── Crew marker positions (locked final ship coordinates) ────────────────────
export const CREW_POSITIONS: Record<string, [number, number, number]> = {
  'maya-chen':   [ 1.921,  0.921,  1.464],
  'alex-rivera': [-1.890,  0.262, -0.254],
  'sam-patel':   [ 0.974,  0.597, -1.864],
  'jordan-lee':  [-0.060,  0.657, -4.887],
};

const STATUS_COLORS: Record<string, string> = {
  GREEN:  '#34d399',
  YELLOW: '#fbbf24',
  ORANGE: '#fb923c',
  RED:    '#f87171',
};

// ─── Holographic crew marker ──────────────────────────────────────────────────

function CrewMarker({
  astronaut,
  isSelected,
  onSelect,
  position,
}: {
  astronaut: Astronaut;
  isSelected: boolean;
  onSelect: () => void;
  position: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const color = STATUS_COLORS[astronaut.healthStatus] ?? '#94a3b8';

  useFrame(() => {
    if (!meshRef.current || !ringRef.current) return;
    const t = Date.now() * 0.003;
    const pulse = 1 + Math.sin(t + astronaut.id.length) * 0.12;
    const emphasis = isSelected ? 1.55 : hovered ? 1.25 : 1;
    meshRef.current.scale.setScalar(hovered || isSelected ? 1.16 : 1);
    ringRef.current.scale.setScalar(pulse * emphasis);
    if (meshRef.current.material instanceof THREE.MeshBasicMaterial) {
      meshRef.current.material.opacity = hovered || isSelected ? 1 : 0.88;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Core dot */}
      <mesh
        ref={meshRef}
        renderOrder={100}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.88} depthTest={false} depthWrite={false} />
      </mesh>

      {/* Invisible hit target keeps the compact marker easy to select through the hull. */}
      <mesh
        renderOrder={101}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.095, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />
      </mesh>

      {/* Pulse ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} renderOrder={102}>
        <ringGeometry args={[0.032, 0.042, 28]} />
        <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.82 : 0.55} side={THREE.DoubleSide} depthTest={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── Ship model + markers ─────────────────────────────────────────────────────

function ShipWithMarkers({
  astronauts,
  selectedId,
  onSelectAstronaut,
  cameraTarget,
  onSceneReady,
}: {
  astronauts: Astronaut[];
  selectedId: string;
  onSelectAstronaut: (id: string) => void;
  cameraTarget: [number, number, number] | null;
  onSceneReady: (camera: SceneCameraConfig) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/ship.glb');
  const { camera } = useThree();
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const animating = useRef(false);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = box.getCenter(new THREE.Vector3());
    clonedScene.position.sub(center);

    const centeredBox = new THREE.Box3().setFromObject(clonedScene);
    const size = centeredBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const frameOffset = new THREE.Vector3(SHIP_FRAME_OFFSET_X * maxDim, 0, 0);
    clonedScene.position.add(frameOffset);

    const framedBox = new THREE.Box3().setFromObject(clonedScene);
    onSceneReady(computeSceneCamera(framedBox, frameOffset));

    enhanceShipMaterials(clonedScene);
  }, [clonedScene, onSceneReady]);

  useEffect(() => {
    if (!cameraTarget) return;
    const dest = new THREE.Vector3(...cameraTarget);
    const camDest = dest.clone().add(new THREE.Vector3(0.2, 0.15, 0.35));
    targetCamPos.current = camDest;
    animating.current = true;
  }, [cameraTarget]);

  useFrame(() => {
    if (!animating.current || !targetCamPos.current) return;
    camera.position.lerp(targetCamPos.current, 0.06);
    if (camera.position.distanceTo(targetCamPos.current) < 0.005) {
      animating.current = false;
      camera.position.copy(targetCamPos.current);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
      {astronauts.map(a => (
        <CrewMarker
          key={a.id}
          astronaut={a}
          isSelected={selectedId === a.id}
          onSelect={() => onSelectAstronaut(a.id)}
          position={CREW_POSITIONS[a.id]}
        />
      ))}
    </group>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

interface SpacecraftViewerProps {
  astronauts: Astronaut[];
  selectedId: string;
  onSelectAstronaut: (id: string) => void;
}

function SceneCameraRig({
  controlsRef,
  activeTarget,
  sceneCamera,
}: {
  controlsRef: React.RefObject<React.ComponentRef<typeof OrbitControls> | null>;
  activeTarget: [number, number, number] | null;
  sceneCamera: SceneCameraConfig;
}) {
  const { camera } = useThree();
  const focusTarget = useRef(new THREE.Vector3(...sceneCamera.target));

  useEffect(() => {
    const target = new THREE.Vector3(...sceneCamera.target);
    camera.position.set(...sceneCamera.pos);
    camera.lookAt(target);
    focusTarget.current.copy(target);

    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(target);
      controls.minDistance = sceneCamera.minDistance;
      controls.maxDistance = sceneCamera.maxDistance;
      controls.update();
    }
  }, [camera, controlsRef, sceneCamera]);

  useEffect(() => {
    if (!activeTarget) return;
    focusTarget.current.set(...activeTarget);
  }, [activeTarget]);

  useFrame(() => {
    if (!activeTarget) return;
    const controls = controlsRef.current;
    if (!controls) return;

    controls.target.lerp(focusTarget.current, 0.06);
    controls.update();
  });

  return null;
}

export default function SpacecraftViewer({ astronauts, selectedId, onSelectAstronaut }: SpacecraftViewerProps) {
  const [cameraTarget, setCameraTarget] = useState<[number, number, number] | null>(null);
  const [sceneCamera, setSceneCamera] = useState<SceneCameraConfig>(FALLBACK_CAMERA);
  const [isShipLoaded, setIsShipLoaded] = useState(false);
  const orbitEnabled = true;
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls> | null>(null);

  const handleSceneReady = useCallback((camera: SceneCameraConfig) => {
    setSceneCamera(camera);
    setCameraTarget(null);
    setIsShipLoaded(true);
  }, []);

  const handleSelect = useCallback((id: string) => {
    onSelectAstronaut(id);
    setCameraTarget(CREW_POSITIONS[id] ?? null);
  }, [onSelectAstronaut]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'transparent' }}>
      <Canvas
        camera={{ position: sceneCamera.pos, fov: 40, near: 0.01, far: 1000 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => configureRenderer(gl)}
        onPointerMissed={() => handleSelect('')}
        shadows
        style={{ background: 'radial-gradient(circle at 50% 35%, #07111f 0%, #02050b 48%, #010208 100%)' }}
      >
        <SpaceLightingRig distance={sceneCamera.fogFar / 3} />

        <color attach="background" args={['#01040b']} />
        <fog attach="fog" args={['#01040b', sceneCamera.fogNear, sceneCamera.fogFar]} />
        <Stars radius={140} depth={90} count={2400} factor={3.2} saturation={0} fade speed={0.12} />
        <Stars radius={80} depth={25} count={650} factor={1.2} saturation={0} fade speed={0.04} />

        <OrbitControls
          ref={controlsRef}
          enabled={orbitEnabled}
          target={sceneCamera.target}
          enablePan
          screenSpacePanning
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE,
          }}
          enableZoom
          enableRotate
          autoRotate={false}
          minDistance={sceneCamera.minDistance}
          maxDistance={sceneCamera.maxDistance}
          enableDamping
          dampingFactor={0.07}
        />

        <Suspense fallback={null}>
          <ShipWithMarkers
            astronauts={astronauts}
            selectedId={selectedId}
            onSelectAstronaut={handleSelect}
            cameraTarget={cameraTarget}
            onSceneReady={handleSceneReady}
          />
        </Suspense>

        <SceneCameraRig controlsRef={controlsRef} activeTarget={cameraTarget} sceneCamera={sceneCamera} />
      </Canvas>

      {!isShipLoaded && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 10, color: '#334155', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Loading spacecraft...
          </span>
        </div>
      )}
    </div>
  );
}

useGLTF.preload('/ship.glb');
