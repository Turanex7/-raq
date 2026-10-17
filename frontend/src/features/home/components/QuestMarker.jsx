import { useRef, useState } from "react";
import { Sparkles, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function QuestMarker({ position, onClick }) {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (!group.current) return;
    group.current.position.y = position[1] + 0.15 + Math.sin(state.clock.elapsedTime * 2.4) * 0.08;
    group.current.rotation.y += 0.01;
  });

  return (
    <group
      ref={group}
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <Sparkles count={hovered ? 16 : 8} scale={0.8} size={2} color="#f5b942" />
      <mesh castShadow>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#f5b942" emissive="#f5b942" emissiveIntensity={1.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <torusGeometry args={[0.22, 0.018, 8, 32]} />
        <meshBasicMaterial color="#f5b942" transparent opacity={0.65} />
      </mesh>
    </group>
  );
}
