import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SPEED = 2.7;

function PlayerAvatar() {
  const avatar = useRef();

  useFrame((state) => {
    if (avatar.current) {
      avatar.current.position.y = Math.sin(state.clock.elapsedTime * 3.2) * 0.035;
    }
  });

  return (
    <group ref={avatar}>
      <mesh castShadow position={[0, 0.68, 0]}>
        <capsuleGeometry args={[0.22, 0.55, 6, 12]} />
        <meshStandardMaterial color="#6941c6" roughness={0.62} />
      </mesh>
      <mesh castShadow position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color="#e0ad8c" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 1.48, 0]}>
        <sphereGeometry args={[0.24, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#17132d" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.78, 0.22]}>
        <boxGeometry args={[0.34, 0.1, 0.06]} />
        <meshStandardMaterial color="#a0e4c9" emissive="#a0e4c9" emissiveIntensity={0.25} />
      </mesh>
      <mesh castShadow position={[0, 0.12, 0.08]}>
        <boxGeometry args={[0.16, 0.18, 0.34]} />
        <meshStandardMaterial color="#22183e" roughness={0.75} />
      </mesh>
    </group>
  );
}

const PlayerController = forwardRef(function PlayerController({ start = [0, 0, 4], mobileInput, onPositionChange, isPaused }, ref) {
  const group = useRef();
  const keys = useRef({});
  const lastReported = useRef(new THREE.Vector3(...start));
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  useImperativeHandle(ref, () => group.current);

  useEffect(() => {
    const down = (event) => {
      keys.current[event.key.toLowerCase()] = true;
    };
    const up = (event) => {
      keys.current[event.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    if (!group.current || isPaused) return;
    const inputX = (keys.current.d || keys.current.arrowright || mobileInput.right ? 1 : 0) - (keys.current.a || keys.current.arrowleft || mobileInput.left ? 1 : 0);
    const inputZ = (keys.current.s || keys.current.arrowdown || mobileInput.backward ? 1 : 0) - (keys.current.w || keys.current.arrowup || mobileInput.forward ? 1 : 0);
    const direction = new THREE.Vector3(inputX, 0, inputZ);
    const moving = direction.lengthSq() > 0;
    if (moving) {
      direction.normalize();
      const nextX = THREE.MathUtils.clamp(group.current.position.x + direction.x * SPEED * delta, -4.7, 4.7);
      const nextZ = THREE.MathUtils.clamp(group.current.position.z + direction.z * SPEED * delta, -3.8, 4.5);
      if (!isBlocked(nextX, group.current.position.z)) group.current.position.x = nextX;
      if (!isBlocked(group.current.position.x, nextZ)) group.current.position.z = nextZ;
      group.current.rotation.y = Math.atan2(direction.x, direction.z);
    }
    if (group.current.position.distanceTo(lastReported.current) > 0.05) {
      lastReported.current.copy(group.current.position);
      onPositionChange?.([group.current.position.x, group.current.position.y, group.current.position.z]);
    }
  });

  return (
    <group
      ref={group}
      position={start}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <PlayerAvatar />
    </group>
  );
});

function isBlocked(x, z) {
  const blockers = [
    [-4.7, -3.95, -3.8, 4.5],
    [3.95, 4.7, -3.8, 4.5],
    [-3.5, 3.5, -3.8, -3.35],
    [-1.2, 1.2, -1.8, -0.4],
    [-4.3, -2.8, -1.1, 0.3],
    [2.6, 4.1, 1.4, 2.8],
  ];
  return blockers.some(([minX, maxX, minZ, maxZ]) => x > minX && x < maxX && z > minZ && z < maxZ);
}

export default PlayerController;
