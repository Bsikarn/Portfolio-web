import { motion } from "framer-motion";

export default function FallingEmoji({ emoji, x, delay, onDone }) {
  return (
    <motion.div
      style={{
        position: "fixed",
        top: -50,
        left: x,
        fontSize: 28,
        zIndex: 9999,
        pointerEvents: "none",
        userSelect: "none",
      }}
      initial={{ y: -50, opacity: 1, rotate: 0 }}
      animate={{ y: "110vh", opacity: 0, rotate: 360 }}
      transition={{ duration: 2.5, delay, ease: "easeIn" }}
      onAnimationComplete={onDone}
    >
      {emoji}
    </motion.div>
  );
}