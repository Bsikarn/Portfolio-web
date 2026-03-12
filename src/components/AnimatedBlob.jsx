import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Float, Stars } from "@react-three/drei";

export default function AnimatedBlob() {
  const meshRef = useRef();

  // Load 3D model from public folder
  const { scene } = useGLTF('/ergoninane-potion-76.glb');

  // useFrame executes every frame
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle circular rotation to simulate looking around the model
      // Use Math.sin for gentle left-right sway
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.5; // Sway left and right
      // Use Math.abs(Math.sin) to ensure positive values (tilt downwards only, no tilting up)
      meshRef.current.rotation.x = Math.abs(Math.sin(state.clock.elapsedTime * 0.2)) * 0.1; // Maximum downward tilt then return to origin
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      {/* Place 3D model in the center, adjusted scale and position */}
      <primitive object={scene} ref={meshRef} scale={0.3} position={[0, -0.9, 0]} />

      {/* Background stars component within the 3D scene */}
      <Stars radius={8} depth={3} count={200} factor={1} saturation={0} fade />
    </Float>
  );
}

// Preload 3D model to prevent jittering during initial render
useGLTF.preload('/ergoninane-potion-76.glb');