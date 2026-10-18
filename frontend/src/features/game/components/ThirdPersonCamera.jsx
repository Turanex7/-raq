import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function ThirdPersonCamera({ playerRef, controlsRef }) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3(0, 4.2, 7.2));
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!playerRef?.current) return;
    const player = playerRef.current.position;
    desired.current.set(player.x, player.y + 4.2, player.z + 7.2);
    target.current.set(player.x, player.y + 0.8, player.z);
    camera.position.lerp(desired.current, 0.12);
    if (controlsRef?.current) {
      controlsRef.current.target.lerp(target.current, 0.16);
      controlsRef.current.update();
    } else {
      camera.lookAt(target.current);
    }
  });

  return null;
}
