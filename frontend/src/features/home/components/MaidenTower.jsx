import { useRef, useState } from "react";
import { useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// The real landmark is the licensed/local environment plate. This component is
// a 3D interaction layer, not a claim that primitive geometry is the tower.
export default function MaidenTower({ selected, onSelect }) {
  const ring = useRef();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (!ring.current) return;
    ring.current.rotation.z += 0.004;
    const pulse = selected || hovered ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08 : 1;
    ring.current.scale.setScalar(pulse);
  });

  return (
    <group
      position={[0, 0.9, -0.4]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh visible={false}>
        <cylinderGeometry args={[1.35, 1.35, 2.6, 24]} />
        <meshBasicMaterial transparent opacity={0.001} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, selected ? 0.035 : 0.018, 10, 64]} />
        <meshBasicMaterial color={selected || hovered ? "#a0e4c9" : "#f5b942"} transparent opacity={selected ? 0.9 : hovered ? 0.65 : 0.25} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <ringGeometry args={[1.12, 1.2, 48]} />
        <meshBasicMaterial color="#f5b942" transparent opacity={selected ? 0.12 : 0.04} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color={selected ? "#a0e4c9" : "#f5b942"} intensity={selected ? 1.3 : 0.35} distance={3} />
    </group>
  );
}
