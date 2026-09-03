import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

// Vibrant & Soft Rainbow Sprinkles Color Palette
const SPRINKLE_COLORS = [
  "#0D6EFD", // Royal Blue
  "#ff70a6", // Bright Pink
  "#38bdf8", // Sky Blue
  "#ffc01d", // Golden Yellow
  "#10b981", // Emerald Mint
  "#a855f7", // Purple Lavender
  "#ff477e", // Coral Pink
  "#06b6d4", // Electric Cyan
];

export default function RainbowSprinkles() {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === "undefined") return "desktop";
    if (window.innerWidth < 768) return "mobile";
    if (window.innerWidth < 1280) return "laptop";
    return "desktop";
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 768) setScreenSize("mobile");
      else if (w < 1280) setScreenSize("laptop");
      else setScreenSize("desktop");
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const allSprinkles = useMemo(() => {
    return [
      { top: "3%", left: "7%", width: 28, height: 10, angle: -65, colorIdx: 0, duration: 5.2, delay: 0, priority: 1 },
      { top: "7%", left: "86%", width: 34, height: 12, angle: 25, colorIdx: 1, duration: 6.4, delay: 0.3, priority: 1 },
      { top: "11%", left: "21%", width: 24, height: 9, angle: 75, colorIdx: 2, duration: 4.8, delay: 0.7, priority: 3 },
      { top: "15%", left: "73%", width: 30, height: 11, angle: -30, colorIdx: 3, duration: 5.9, delay: 0.1, priority: 2 },
      { top: "19%", left: "41%", width: 26, height: 10, angle: 45, colorIdx: 4, duration: 6.1, delay: 0.5, priority: 3 },
      
      { top: "24%", left: "12%", width: 32, height: 11, angle: -15, colorIdx: 5, duration: 5.6, delay: 0.2, priority: 2 },
      { top: "28%", left: "94%", width: 28, height: 10, angle: -80, colorIdx: 6, duration: 7.0, delay: 0.9, priority: 1 },
      { top: "33%", left: "62%", width: 36, height: 12, angle: 10, colorIdx: 7, duration: 4.5, delay: 0.4, priority: 3 },
      { top: "37%", left: "4%", width: 22, height: 9, angle: 55, colorIdx: 0, duration: 6.7, delay: 0.8, priority: 1 },
      { top: "42%", left: "83%", width: 30, height: 11, angle: -48, colorIdx: 1, duration: 5.3, delay: 0.6, priority: 2 },
      
      { top: "47%", left: "28%", width: 28, height: 10, angle: -72, colorIdx: 2, duration: 6.8, delay: 0.3, priority: 3 },
      { top: "51%", left: "90%", width: 34, height: 11, angle: 38, colorIdx: 3, duration: 5.0, delay: 0.1, priority: 2 },
      { top: "56%", left: "9%", width: 24, height: 9, angle: 82, colorIdx: 4, duration: 6.3, delay: 0.7, priority: 1 },
      { top: "60%", left: "71%", width: 32, height: 12, angle: -22, colorIdx: 5, duration: 4.9, delay: 0.2, priority: 3 },
      { top: "65%", left: "45%", width: 26, height: 10, angle: 60, colorIdx: 6, duration: 5.7, delay: 0.5, priority: 3 },
      
      { top: "70%", left: "17%", width: 30, height: 11, angle: -40, colorIdx: 7, duration: 6.6, delay: 0.4, priority: 2 },
      { top: "74%", left: "95%", width: 28, height: 10, angle: 18, colorIdx: 0, duration: 5.1, delay: 0.9, priority: 1 },
      { top: "79%", left: "34%", width: 34, height: 12, angle: -85, colorIdx: 1, duration: 6.0, delay: 0.2, priority: 3 },
      { top: "83%", left: "81%", width: 22, height: 9, angle: 50, colorIdx: 2, duration: 5.5, delay: 0.6, priority: 2 },
      { top: "88%", left: "3%", width: 32, height: 11, angle: -10, colorIdx: 3, duration: 6.9, delay: 0.3, priority: 1 },
      
      { top: "92%", left: "67%", width: 26, height: 10, angle: 72, colorIdx: 4, duration: 4.7, delay: 0.8, priority: 3 },
      { top: "96%", left: "23%", width: 30, height: 11, angle: -55, colorIdx: 5, duration: 5.8, delay: 0.1, priority: 2 },
    ];
  }, []);

  // Filter sprinkles count dynamically based on screen viewport size
  const sprinkles = useMemo(() => {
    if (screenSize === "mobile") return allSprinkles.filter((s) => s.priority === 1);
    if (screenSize === "laptop") return allSprinkles.filter((s) => s.priority <= 2);
    return allSprinkles;
  }, [allSprinkles, screenSize]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {sprinkles.map((s, idx) => {
        const color = SPRINKLE_COLORS[s.colorIdx % SPRINKLE_COLORS.length];
        return (
          <motion.div
            key={idx}
            initial={{
              x: 0,
              y: 0,
              rotate: s.angle,
              scale: 1,
            }}
            animate={{
              y: [-10, 10, -10],
              x: [-5, 5, -5],
              rotate: [s.angle - 10, s.angle + 10, s.angle - 10],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: s.delay,
            }}
            style={{
              position: "absolute",
              top: s.top,
              left: s.left,
              width: `${s.width}px`,
              height: `${s.height}px`,
              borderRadius: "8px",
              backgroundColor: color,
              opacity: 0.62,
              boxShadow: `0 4px 12px ${color}65, 0 1px 3px rgba(0,0,0,0.08)`,
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
}
