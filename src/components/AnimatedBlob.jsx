import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";

export default function AnimatedBlob() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1.4, 64, 64]}>
        <MeshDistortMaterial
          color="#A3D8F4"
          attach="material"
          distort={0.45}
          speed={2.5}
          roughness={0.1}
          metalness={0.1}
        />
      </Sphere>
      <Stars radius={8} depth={3} count={200} factor={1} saturation={0} fade />
    </Float>
  );
}