import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import IcherisheherLevel from "../levels/IcherisheherLevel";
import { ICHERISHEHER_ARTIFACT } from "../levels/icherisheherData";
import InteractionSystem from "./InteractionSystem";
import PlayerController from "./PlayerController";
import ThirdPersonCamera from "./ThirdPersonCamera";

function GameScene({ playerRef, controlsRef, playerPosition, mobileInput, artifactCollected, canInteract, onNearby, onPositionChange, onCollect, isPaused }) {
  return (
    <>
      <color attach="background" args={["#11142e"]} />
      <fog attach="fog" args={["#11142e", 9, 17]} />
      <ambientLight intensity={0.66} color="#b5b1d8" />
      <directionalLight castShadow position={[-4, 8, 5]} intensity={2.25} color="#ffe0aa" shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, 4, -1]} intensity={1.2} color="#6c4bd6" distance={10} />
      <Stars radius={16} depth={12} count={320} factor={1.4} saturation={0.2} fade speed={0.25} />
      <Sparkles count={55} scale={[10, 3.5, 9]} size={1.4} speed={0.18} color="#a0e4c9" />
      <IcherisheherLevel artifactCollected={artifactCollected} canInteract={canInteract} onCollect={onCollect} />
      <InteractionSystem playerPosition={playerPosition} targetPosition={ICHERISHEHER_ARTIFACT} collected={artifactCollected} onNearby={onNearby} onInteract={onCollect} />
      <PlayerController
        ref={playerRef}
        start={[0, 0, 4]}
        mobileInput={mobileInput}
        isPaused={isPaused}
        onPositionChange={onPositionChange}
      />
      <ThirdPersonCamera playerRef={playerRef} controlsRef={controlsRef} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={4.2}
        maxDistance={9}
        minPolarAngle={Math.PI / 3.8}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.8, 2]}
      />
      <ContactShadows position={[0, -0.1, 0]} scale={11} opacity={0.45} blur={2} far={5} />
    </>
  );
}

export default function GameWorld(props) {
  return (
    <Canvas
      shadows={props.reducedMotion ? false : "basic"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 4.2, 11.2], fov: 48 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <GameScene {...props} />
    </Canvas>
  );
}
