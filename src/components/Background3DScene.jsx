import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import AnimatedBlob from "./AnimatedBlob";

// Extracted 3D Scene to allow for code-splitting and lazy loading of @react-three/fiber
export default function Background3DScene() {
    return (
        <Canvas
            camera={{ position: [0, 0, 3.5] }}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
            }}
        >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <pointLight position={[-5, -5, -5]} color="#ffc8d5" intensity={0.5} />

            {/* 
        This internal Suspense is for 3D assets loaded within the Canvas.
        The external Suspense in App.jsx handles the loading of the Canvas itself.
      */}
            <Suspense fallback={null}>
                <AnimatedBlob />
            </Suspense>
        </Canvas>
    );
}
