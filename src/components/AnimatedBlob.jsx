import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
// import { useGLTF } from "@react-three/drei"; // Uncomment this when you want to use your own 3D model
import { Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";

export default function AnimatedBlob() {
  const meshRef = useRef();

  // ⚠️ TODO: If you have your own 3D model (.glb/.gltf file), uncomment the line below to load it:
  // const { scene } = useGLTF('/ชื่อไฟล์ของคุณ.glb');

  // useFrame executes every frame, rotating the blob to give it a spinning effect
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      {/* 
        ⚠️ IF YOU USE YOUR OWN 3D MODEL (useGLTF):
        1. Remove this entire <Sphere> ... </Sphere> block (including MeshDistortMaterial).
        2. Replace it with your 3D model object like this: 
           <primitive object={scene} ref={meshRef} scale={1.5} />
      */}

      {/* 
        Sphere creates the base 3D shape.
        Args: [radius, widthSegments, heightSegments]
      */}
      <Sphere ref={meshRef} args={[1.4, 64, 64]}>
        {/* 
          MeshDistortMaterial is what makes the sphere look like a liquid "blob".
          It displaces the vertices of the geometry continuously.
        */}
        <MeshDistortMaterial
          color="#A3D8F4"
          attach="material"
          distort={0.45} // Intensity of the distortion (how bumpy it gets)
          speed={2.5}  // Speed of the distortion animation
          roughness={0.1}
          metalness={0.1}
        />
      </Sphere>

      {/* Background stars component within the 3D scene */}
      <Stars radius={8} depth={3} count={200} factor={1} saturation={0} fade />
    </Float>
  );
}