import { motion } from "framer-motion";

// Full-screen glassmorphism loading overlay shown while DB data is being fetched
export default function LoadingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-[20px] flex flex-col items-center justify-center"
    >


      {/* Loading label */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-sans font-extrabold text-[24px] text-brand-dark tracking-widest uppercase"
      >
        Loading
      </motion.h2>

      {/* Bouncing dots */}
      <div className="flex gap-[6px] mt-[12px]">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: ["0%", "-50%", "0%"], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            className="w-[8px] h-[8px] bg-brand-primary rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}
