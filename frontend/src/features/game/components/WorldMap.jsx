import { Html, Line, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import styles from "../levels/LevelSelect.module.scss";
import { translate as t } from "../../../i18n/i18n";

const LANDMARK_POSITIONS = {
  icherisheher: [-4.5, 0.25, -1.1],
  "carpet-museum": [-1.35, 0.22, 2.05],
  "national-history": [2.05, 0.25, -1.2],
  "heydar-aliyev": [4.65, 0.22, 1.75],
};

const ROAD_POINTS = [
  LANDMARK_POSITIONS.icherisheher,
  LANDMARK_POSITIONS["carpet-museum"],
  LANDMARK_POSITIONS["national-history"],
  LANDMARK_POSITIONS["heydar-aliyev"],
].map(([x, y, z]) => [x, y + 0.17, z]);

function DestinationMarker({ level, position, selected, locked, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const group = useRef();
  const accent = level.accent === "mint" ? "#a0e4c9" : level.accent === "purple" ? "#b796ff" : level.accent === "blue" ? "#91c7ff" : "#f5b942";

  useFrame((state) => {
    if (!group.current) return;
    const pulse = selected || hovered ? 1 + Math.sin(state.clock.elapsedTime * 4) * 0.06 : 1;
    group.current.scale.lerp(new THREE.Vector3(pulse, pulse, pulse), 0.12);
  });

  return (
    <group ref={group} position={position} onClick={(event) => { event.stopPropagation(); onSelect(level.id); }} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh position={[0, 0.48, 0]}><sphereGeometry args={[0.72, 16, 12]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.58, selected || hovered ? 0.72 : 0.63, 40]} /><meshBasicMaterial color={accent} transparent opacity={selected || hovered ? 0.78 : 0.32} /></mesh>
      <mesh position={[0, 0.27, 0]}><cylinderGeometry args={[0.11, 0.16, 0.42, 8]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={selected || hovered ? 1.7 : 0.45} roughness={0.34} metalness={0.28} /></mesh>
      <mesh position={[0, 0.57, 0]}><sphereGeometry args={[0.14, 12, 8]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={selected || hovered ? 2 : 0.65} /></mesh>
      <Html position={[0, 0.9, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }}><div className={`${styles.mapLabel} ${selected ? styles.mapLabelActive : ""} ${locked ? styles.mapLabelLocked : ""}`}><span>{t(level.title)}</span>{locked && <small>{t("Bağlıdır")}</small>}</div></Html>
      <pointLight color={accent} intensity={selected || hovered ? 1.1 : 0.18} distance={2.1} />
    </group>
  );
}

function TowerLandmark() {
  return <group>
    <mesh castShadow position={[0, 0.72, 0]}><cylinderGeometry args={[0.55, 0.68, 1.42, 14]} /><meshStandardMaterial color="#a27b70" roughness={0.82} /></mesh>
    <mesh castShadow position={[0, 1.53, 0]}><cylinderGeometry args={[0.6, 0.6, 0.12, 14]} /><meshStandardMaterial color="#d1a28b" roughness={0.75} /></mesh>
    <mesh castShadow position={[0, 1.67, 0]}><coneGeometry args={[0.42, 0.27, 14]} /><meshStandardMaterial color="#40315c" roughness={0.78} /></mesh>
    {Array.from({ length: 8 }).map((_, index) => { const angle = (index / 8) * Math.PI * 2; return <mesh key={index} castShadow position={[Math.cos(angle) * 0.52, 1.8, Math.sin(angle) * 0.52]}><boxGeometry args={[0.11, 0.2, 0.11]} /><meshStandardMaterial color="#c18e7c" roughness={0.8} /></mesh>; })}
    {[-0.45, 0.05, 0.55, 1.05].map((y) => <mesh key={y} position={[0, y, 0.65]}><boxGeometry args={[0.12, 0.18, 0.035]} /><meshStandardMaterial color="#f5b942" emissive="#f5b942" emissiveIntensity={0.5} /></mesh>)}
  </group>;
}

function CarpetMuseumLandmark() {
  return <group rotation={[0, -0.2, 0]}>
    <mesh castShadow position={[0, 0.45, 0]} rotation={[0, 0.3, 0]}><sphereGeometry args={[0.84, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.1]} /><meshStandardMaterial color="#a65d62" roughness={0.7} metalness={0.08} /></mesh>
    <mesh castShadow position={[0, 0.2, 0]}><boxGeometry args={[1.45, 0.2, 0.8]} /><meshStandardMaterial color="#513d61" roughness={0.88} /></mesh>
    {[[-0.48, 0.42, 0.42], [0, 0.42, 0.48], [0.48, 0.42, 0.42]].map(([x, y, z], index) => <mesh key={index} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.25, 8]} /><meshStandardMaterial color="#f5b942" emissive="#f5b942" emissiveIntensity={0.25} /></mesh>)}
  </group>;
}

function HistoryMuseumLandmark() {
  return <group>
    <mesh castShadow position={[0, 0.48, 0]}><boxGeometry args={[1.45, 0.85, 0.85]} /><meshStandardMaterial color="#b37e6c" roughness={0.76} /></mesh>
    <mesh castShadow position={[0, 1.08, 0]} scale={[0.72, 0.45, 0.72]}><sphereGeometry args={[0.72, 20, 12]} /><meshStandardMaterial color="#d39d7f" roughness={0.68} /></mesh>
    <mesh castShadow position={[0, 1.38, 0]}><coneGeometry args={[0.28, 0.2, 12]} /><meshStandardMaterial color="#4f355f" roughness={0.72} /></mesh>
    {[-0.52, 0, 0.52].map((x) => <mesh key={x} position={[x, 0.52, 0.45]}><cylinderGeometry args={[0.055, 0.055, 0.62, 8]} /><meshStandardMaterial color="#f5b942" metalness={0.3} roughness={0.35} /></mesh>)}
  </group>;
}

function HeydarLandmark() {
  return <group rotation={[0, -0.25, 0]}>
    <mesh castShadow position={[0, 0.42, 0]} scale={[1.1, 0.7, 0.72]}><sphereGeometry args={[1, 32, 18]} /><meshStandardMaterial color="#d9e8e1" roughness={0.28} metalness={0.06} /></mesh>
    <mesh castShadow position={[0.22, 0.7, 0.05]} scale={[0.65, 0.7, 0.48]}><sphereGeometry args={[1, 28, 16]} /><meshStandardMaterial color="#eef8f1" roughness={0.24} /></mesh>
    <mesh position={[-0.62, 0.4, 0.52]} rotation={[0, 0, -0.08]}><boxGeometry args={[0.75, 0.035, 0.035]} /><meshStandardMaterial color="#a0e4c9" emissive="#a0e4c9" emissiveIntensity={0.7} /></mesh>
  </group>;
}

function Landmark({ level }) {
  if (level.id === "icherisheher") return <TowerLandmark />;
  if (level.id === "carpet-museum") return <CarpetMuseumLandmark />;
  if (level.id === "national-history") return <HistoryMuseumLandmark />;
  return <HeydarLandmark />;
}

function WorldScene({ levels, selectedId, onSelect }) {
  const controls = useRef();
  const focus = useRef(new THREE.Vector3(...LANDMARK_POSITIONS.icherisheher));
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0));
  const selectedPosition = useMemo(() => LANDMARK_POSITIONS[selectedId] ?? [0, 0, 0], [selectedId]);
  const route = useMemo(() => ROAD_POINTS.map(([x, y, z]) => [x, y + 0.02, z]), []);

  useEffect(() => { focus.current.set(...selectedPosition); }, [selectedId, selectedPosition]);

  useFrame(({ camera }, delta) => {
    const desiredTarget = new THREE.Vector3(focus.current.x, 0.15, focus.current.z);
    cameraTarget.current.lerp(desiredTarget, 1 - Math.pow(0.001, delta));
    if (controls.current) controls.current.target.copy(cameraTarget.current);
    camera.lookAt(cameraTarget.current);
  });

  return <>
    <color attach="background" args={["#10132c"]} />
    <fog attach="fog" args={["#10132c", 8, 18]} />
    <ambientLight intensity={1.2} color="#d2d5ff" />
    <directionalLight castShadow position={[-5, 9, 5]} intensity={3.1} color="#ffe2b4" shadow-mapSize={[1024, 1024]} />
    <pointLight position={[0, 4, 1]} intensity={2} color="#6941c6" distance={12} />
    <Sparkles count={45} scale={[12, 2.2, 9]} size={1.4} speed={0.12} color="#a0e4c9" />
    <mesh receiveShadow position={[0, -0.3, 0]} rotation={[0, 0.03, 0]}><cylinderGeometry args={[7.3, 7.7, 0.55, 48]} /><meshStandardMaterial color="#262349" roughness={0.93} /></mesh>
    <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[6.9, 48]} /><meshStandardMaterial color="#172a3b" roughness={1} /></mesh>
    <Line points={route} color="#f5b942" transparent opacity={0.48} lineWidth={1.3} />
    <Line points={route.map(([x, y, z]) => [x, y + 0.02, z + 0.06])} color="#a0e4c9" transparent opacity={0.16} lineWidth={4} />
    {levels.map((level) => {
      const unlocked = level.place?.status === "open";
      const locked = level.place?.status === "locked";
      return <group key={level.id} position={LANDMARK_POSITIONS[level.id]}>
        <mesh receiveShadow position={[0, -0.06, 0]}><cylinderGeometry args={[1.35, 1.5, 0.22, 8]} /><meshStandardMaterial color={unlocked ? "#354b57" : locked ? "#252842" : "#303047"} roughness={0.9} /></mesh>
        <Landmark level={level} />
        <DestinationMarker level={level} position={[0, 0.15, 0]} selected={selectedId === level.id} locked={false} onSelect={onSelect} />
      </group>;
    })}
    {[-5.8, -3.1, 0.8, 4.2].map((x) => <group key={x} position={[x, 0, 4.6]}><mesh castShadow position={[0, 0.7, 0]}><cylinderGeometry args={[0.16, 0.24, 1.25, 8]} /><meshStandardMaterial color="#664659" roughness={0.9} /></mesh><mesh castShadow position={[0, 1.5, 0]}><sphereGeometry args={[0.5, 10, 8]} /><meshStandardMaterial color="#1d675f" roughness={0.98} /></mesh></group>)}
    <OrbitControls ref={controls} enablePan={false} enableDamping dampingFactor={0.08} minDistance={7} maxDistance={14} minPolarAngle={Math.PI / 4.5} maxPolarAngle={Math.PI / 2.35} target={[0, 0, 0]} />
  </>;
}

export default function WorldMap({ levels, selectedId, onSelect }) {
  return <div className={styles.scene} aria-label={t("Azərbaycanın 3D kəşf xəritəsi")}><Canvas shadows dpr={[1, 1.5]} camera={{ position: [9, 8.5, 10], fov: 42 }} gl={{ antialias: true, powerPreference: "high-performance" }} onPointerMissed={() => onSelect(null)}><WorldScene levels={levels} selectedId={selectedId} onSelect={onSelect} /></Canvas></div>;
}
