import { useMemo } from "react";

function Building({ position, scale, color = "#3e3262", roof = "#261c4d" }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[1.35, 1.5, 1.1]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>
      <mesh castShadow position={[0, 1.65, 0]}>
        <coneGeometry args={[0.96, 0.42, 4]} rotation={[0, Math.PI / 4, 0]} />
        <meshStandardMaterial color={roof} roughness={0.86} />
      </mesh>
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, 0.88, 0.57]}>
          <boxGeometry args={[0.17, 0.28, 0.025]} />
          <meshStandardMaterial color="#f5b942" emissive="#f5b942" emissiveIntensity={0.45} />
        </mesh>
      ))}
    </group>
  );
}

export default function OldCityBuildings() {
  const buildings = useMemo(() => [
    [[-3.7, 0, -2.1], [1.25, 1.1, 1.1], "#47366c"],
    [[3.3, 0, -2.3], [1.1, 1.25, 1], "#5b426d"],
    [[-3.8, 0, 1.2], [1.1, 0.9, 1.1], "#503b69"],
    [[3.7, 0, 1.3], [1.3, 1.15, 1.1], "#3d3260"],
    [[-2.7, 0, 3.1], [1.05, 1.1, 1], "#64486e"],
    [[2.8, 0, 3], [1.15, 0.9, 1], "#463662"],
  ], []);

  return <group>{buildings.map((building, index) => <Building key={index} position={building[0]} scale={building[1]} color={building[2]} />)}</group>;
}

export function CityWalls() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.62, -3.7]}>
        <boxGeometry args={[9.5, 1.25, 0.38]} />
        <meshStandardMaterial color="#332858" roughness={0.92} />
      </mesh>
      {[-3.9, 3.9].map((x) => (
        <mesh key={x} castShadow position={[x, 1.3, -3.7]}>
          <cylinderGeometry args={[0.48, 0.62, 2.1, 8]} />
          <meshStandardMaterial color="#4d3865" roughness={0.92} />
        </mesh>
      ))}
      {Array.from({ length: 12 }).map((_, index) => (
        <mesh key={index} position={[-4.25 + index * 0.77, 1.36, -3.49]}>
          <boxGeometry args={[0.36, 0.3, 0.12]} />
          <meshStandardMaterial color="#7c5c72" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
