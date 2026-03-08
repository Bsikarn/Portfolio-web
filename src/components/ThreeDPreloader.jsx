import { motion } from "framer-motion";

// Glassmorphism preloader component to display while 3D assets are matching
export default function ThreeDPreloader() {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 5,
                pointerEvents: "none",
            }}
        >
            {/* 
        Stylized pulsing translucent sphere placeholder 
        Matches the general size and position of the 3D AnimatedBlob
      */}
            <motion.div
                animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{
                    width: "40vw", // Roughly matching AnimatedBlob scale
                    height: "40vw",
                    minWidth: 250,
                    minHeight: 250,
                    maxHeight: 450,
                    maxWidth: 450,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(163,216,244,0.3), rgba(255,200,213,0.3))",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)", // For Safari support
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
                }}
            />
        </div>
    );
}
