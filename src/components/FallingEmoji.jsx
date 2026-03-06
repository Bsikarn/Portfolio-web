import { motion } from "framer-motion";

// Helper component to render a single falling emoji animation
export default function FallingEmoji({ emoji, x, delay, onDone }) {
  return (
    <motion.div
      style={{ ...styles.container, left: x }}

      // Animation sequence: Start slightly above screen, full opacity, no rotation
      initial={{ y: -50, opacity: 1, rotate: 0 }}
      // End point: Fall past bottom of screen (110vh), fade out, rotate 360 degrees
      animate={{ y: "110vh", opacity: 0, rotate: 360 }}

      // Duration of fall, delay based on stagger, and ease-in acceleration
      transition={{ duration: 2.5, delay, ease: "easeIn" }}

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