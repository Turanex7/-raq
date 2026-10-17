import { useRef, useState } from "react";
import { Sparkles, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ICHERISHEHER_ARTIFACT } from "./icherisheherData";

function StoneBuilding({ position, scale = [1, 1, 1], color = "#66506d" }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[1.45, 1.4, 1.15]} />
        <meshStandardMaterial color={color} roughness={0.88} metalness={0.03} />
      </mesh>
      <mesh castShadow position={[0, 1.52, 0]}>
        <coneGeometry args={[1.05, 0.35, 4]} rotation={[0, Math.PI / 4, 0]} />
        <meshStandardMaterial color="#35264f" roughness={0.9} />
      </mesh>
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.8, 0.59]}>
          <boxGeometry args={[0.18, 0.32, 0.03]} />
          <meshStandardMaterial color="#f5b942" emissive="#f5b942" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function MaidenTowerLandmark() {
  return (
    <group position={[-0.1, 0, -1.05]}>
      <mesh castShadow receiveShadow position={[0, 1.35, 0]}>
        <cylinderGeometry args={[1.05, 1.2, 2.7, 16]} />
        <meshStandardMaterial color="#82636c" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0, 2.83, 0]}>
        <cylinderGeometry args={[1.08, 1.08, 0.18, 16]} />
        <meshStandardMaterial color="#a58178" roughness={0.86} />
      </mesh>
      <mesh castShadow position={[0, 3.03, 0]}>
        <coneGeometry args={[0.8, 0.3, 16]} />
        <meshStandardMaterial color="#3c2854" roughness={0.8} />
      </mesh>
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <mesh key={index} castShadow position={[Math.cos(angle) * 0.9, 3.16, Math.sin(angle) * 0.9]}>
            <boxGeometry args={[0.2, 0.26, 0.2]} />
            <meshStandardMaterial color="#a58178" roughness={0.88} />
          </mesh>
        );
      })}
      {[-0.35, 0.3, 0.95, 1.6, 2.2].map((y) => (
        <mesh key={y} position={[0, y, 1.06]}>
          <boxGeometry args={[0.18, 0.28, 0.04]} />
          <meshStandardMaterial color="#f5b942" emissive="#f5b942" emissiveIntensity={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 0.45, 1.2]}>
        <torusGeometry args={[1.24, 0.025, 8, 36]} />
        <meshBasicMaterial color="#a0e4c9" transparent opacity={0.36} />
      </mesh>
    </group>
  );
}

function Artifact({ collected, canInteract, onCollect }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (!ref.current || collected) return;
    ref.current.rotation.y += 0.025;
    ref.current.position.y = ICHERISHEHER_ARTIFACT[1] + Math.sin(state.clock.elapsedTime * 2.2) * 0.1;
  });

  return collected ? null : (
    <group
      ref={ref}
      position={ICHERISHEHER_ARTIFACT}
      onClick={(event) => {
        event.stopPropagation();
        if (canInteract) onCollect();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Sparkles count={hovered || canInteract ? 20 : 10} scale={0.8} size={2} color="#f5b942" />
      <mesh castShadow>
        <octahedronGeometry args={[0.26, 1]} />
        <meshStandardMaterial color="#f5b942" emissive="#f5b942" emissiveIntensity={1.8} metalness={0.55} roughness={0.25} />
      </mesh>
      <pointLight color="#f5b942" intensity={canInteract ? 1.2 : 0.45} distance={2.5} />
    </group>
  );
}

export default function IcherisheherLevel({ artifactCollected, canInteract, onCollect }) {
  return (
    <>
      <mesh receiveShadow position={[0, -0.2, 0]}>
        <boxGeometry args={[10, 0.35, 9]} />
        <meshStandardMaterial color="#1a1c39" roughness={1} />
      </mesh>
      {Array.from({ length: 90 }).map((_, index) => {
        const x = (index % 10) - 4.5 + (Math.floor(index / 10) % 2 ? 0.2 : 0);
        const z = Math.floor(index / 10) - 4;
        return (
          <mesh key={index} receiveShadow position={[x, -0.01, z * 0.75]} rotation={[-Math.PI / 2, 0, (index % 4) * 0.15]}>
            <boxGeometry args={[0.62, 0.44, 0.05]} />
            <meshStandardMaterial color={index % 3 === 0 ? "#40395c" : "#2c2c4b"} roughness={1} />
          </mesh>
        );
      })}
      <mesh receiveShadow position={[0, 1.1, -4.25]}>
        <boxGeometry args={[9.6, 2.4, 0.35]} />
        <meshStandardMaterial color="#3a2d55" roughness={0.95} />
      </mesh>
      <MaidenTowerLandmark />
      <StoneBuilding position={[-3.5, 0, -2.5]} scale={[1.2, 1.1, 1]} color="#544267" />
      <StoneBuilding position={[3.5, 0, -2.7]} scale={[1.1, 1.35, 1.1]} color="#684d6d" />
      <StoneBuilding position={[-3.4, 0, 1.5]} scale={[1.15, 0.9, 1.1]} color="#4d3b64" />
      <StoneBuilding position={[3.5, 0, 1.9]} scale={[1.2, 1, 1]} color="#5b416b" />
      <Artifact collected={artifactCollected} canInteract={canInteract} onCollect={onCollect} />
    </>
  );
}
