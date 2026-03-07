import { motion } from "framer-motion";

// Helper component to render a single falling emoji animation
export default function FallingEmoji({ emoji, x, delay, onDone }) {
  return (
    <motion.div
      style={{ ...styles.container, left: x }}

      // Animation sequence: Start slightly above screen, full opacity, no rotation
      initial={{ y: "-10vh", opacity: 1, rotate: 0 }}
      // End point: Fall to bottom, bounce up, fall past bottom, fade out
      animate={{
        y: ["-10vh", "90vh", "75vh", "110vh"],
        opacity: [1, 1, 1, 0],
        rotate: [0, 180, 270, 360]
      }}
      // Duration of fall, keyframe timing, delay based on stagger
      transition={{
        duration: 2.5,
        delay,
        times: [0, 0.7, 0.85, 1],
        ease: ["easeIn", "easeOut", "easeIn"]
      }}

      // Callback to parent when animation finishes (usually removes from state)
      onAnimationComplete={onDone}
    >
      {emoji}
    </motion.div>
  );
}

// Inline styles for the falling emoji container
const styles = {
  container: {
    position: "fixed",
    top: -50, // Start above the viewport
    fontSize: 28, // Size of the emoji
    zIndex: 9999, // Ensure it floats above all other content
    pointerEvents: "none", // Prevent emojis from interfering with clicks
    userSelect: "none", // Prevent accidental selection
  }
};