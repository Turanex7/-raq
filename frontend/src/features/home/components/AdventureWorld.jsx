import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import MaidenTower from "./MaidenTower";
import QuestMarker from "./QuestMarker";

function Lantern({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 1.6, 8]} />
        <meshStandardMaterial color="#161426" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 1.62, 0]}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial color="#f5b942" emissive="#f5b942" emissiveIntensity={1.8} />
      </mesh>
      <pointLight color="#f5b942" intensity={0.32} distance={2.4} position={[0, 1.6, 0]} />
    </group>
  );
}

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1.2, 8]} />
        <meshStandardMaterial color="#3d2941" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]}>
        <dodecahedronGeometry args={[0.75, 1]} />
        <meshStandardMaterial color="#176b5b" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0.25, 1.95, 0.08]}>
        <dodecahedronGeometry args={[0.46, 1]} />
        <meshStandardMaterial color="#279375" roughness={0.9} />
      </mesh>
    </group>
  );
}

function CameraFocus({ target }) {
  const { camera, controls } = useThree();
  const destination = useRef(new THREE.Vector3(0, 2.6, 7.8));
  const lookAt = useRef(new THREE.Vector3(0, 0.9, 0));

  useFrame(() => {
    const nextPosition = target ? new THREE.Vector3(1.8, 2.35, 4.4) : new THREE.Vector3(0, 2.6, 7.8);
    const nextLookAt = target ? new THREE.Vector3(0, 0.75, -0.4) : new THREE.Vector3(0, 0.7, 0);
    destination.current.lerp(nextPosition, 0.04);
    lookAt.current.lerp(nextLookAt, 0.04);
    camera.position.lerp(destination.current, 0.04);
    if (controls) {
      controls.target.lerp(lookAt.current, 0.06);
      controls.update();
    }
  });
  return null;
}

function WorldContents({ selected, onSelect, places }) {
  const mainPlace = places.find((place) => place.slug === "icherisheher") || places[0];
  const markerPlaces = places.filter((place) => place.slug !== mainPlace?.slug).slice(0, 2);
  return (
    <>
      <ambientLight intensity={0.7} color="#a79dcc" />
      <directionalLight castShadow position={[-4, 8, 5]} intensity={2.3} color="#ffe0a4" shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, 3, 1]} intensity={1.5} color="#6c4bd6" distance={9} />
      <Stars radius={14} depth={10} count={380} factor={1.7} saturation={0.2} fade speed={0.4} />
      <Sparkles count={80} scale={[10, 3, 9]} size={1.6} speed={0.25} color="#a0e4c9" />
      {mainPlace && <MaidenTower selected={selected === mainPlace.slug} onSelect={() => onSelect(mainPlace.slug)} />}
      {markerPlaces.map((place, index) => <QuestMarker key={place.id} position={index === 0 ? [-2.35, 1.75, -1.25] : [2.9, 1.2, 0.65]} label={place.name} onClick={() => onSelect(place.slug)} />)}
      <Lantern position={[-2.3, 0, 0.6]} />
      <Lantern position={[2.2, 0, -1.5]} />
      <Tree position={[-3.3, 0, -0.4]} />
      <Tree position={[3.15, 0, 2.35]} />
      <ContactShadows position={[0, -0.14, 0]} opacity={0.48} scale={11} blur={2.2} far={5} />
    </>
  );
}

export default function AdventureWorld({ selected, onSelect, places = [], reducedMotion = false }) {
  return (
    <Canvas
      shadows={reducedMotion ? false : "basic"}
      dpr={[1, 1.7]}
      camera={{ position: [0, 2.6, 7.8], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onPointerMissed={() => onSelect(null)}
    >
      <Suspense fallback={null}>
        <WorldContents selected={selected} onSelect={onSelect} places={places} />
        <CameraFocus target={selected === "icherisheher"} />
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={4.5}
          maxDistance={11}
          minPolarAngle={Math.PI / 3.6}
          maxPolarAngle={Math.PI / 2.05}
          enableDamping
          dampingFactor={0.07}
          rotateSpeed={0.55}
        />
      </Suspense>
    </Canvas>
  );
}
