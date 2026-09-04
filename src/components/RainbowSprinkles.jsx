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

  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [winDim, setWinDim] = useState({ w: 1440, h: 900 });
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setWinDim({ w, h });
      if (w < 768) setScreenSize("mobile");
      else if (w < 1280) setScreenSize("laptop");
      else setScreenSize("desktop");
    };
    handleResize();

    const handleScroll = () => {
      // Freeze interaction when scrolled down past 150px (under curtain overlay)
      const scrolled = window.scrollY > 150;
      setIsScrolledPastHero(scrolled);
      if (scrolled) setMousePos({ x: -1000, y: -1000 });
    };
    handleScroll();

    let rafId = null;
    const handleMouseMove = (e) => {
      if (window.scrollY > 150) return; // Skip calculation when scrolled down
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };

    const handleMouseLeave = () => {
      setMousePos({ x: -1000, y: -1000 });
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const allSprinkles = useMemo(() => {
    return [
      { topPct: 3, leftPct: 7, width: 28, height: 10, angle: -65, colorIdx: 0, duration: 5.2, delay: 0, priority: 1 },
      { topPct: 7, leftPct: 86, width: 34, height: 12, angle: 25, colorIdx: 1, duration: 6.4, delay: 0.3, priority: 1 },
      { topPct: 11, leftPct: 21, width: 24, height: 9, angle: 75, colorIdx: 2, duration: 4.8, delay: 0.7, priority: 3 },
      { topPct: 15, leftPct: 73, width: 30, height: 11, angle: -30, colorIdx: 3, duration: 5.9, delay: 0.1, priority: 2 },
      { topPct: 19, leftPct: 41, width: 26, height: 10, angle: 45, colorIdx: 4, duration: 6.1, delay: 0.5, priority: 3 },
      
      { topPct: 24, leftPct: 12, width: 32, height: 11, angle: -15, colorIdx: 5, duration: 5.6, delay: 0.2, priority: 2 },
      { topPct: 28, leftPct: 94, width: 28, height: 10, angle: -80, colorIdx: 6, duration: 7.0, delay: 0.9, priority: 1 },
      { topPct: 33, leftPct: 62, width: 36, height: 12, angle: 10, colorIdx: 7, duration: 4.5, delay: 0.4, priority: 3 },
      { topPct: 37, leftPct: 4, width: 22, height: 9, angle: 55, colorIdx: 0, duration: 6.7, delay: 0.8, priority: 1 },
      { topPct: 42, leftPct: 83, width: 30, height: 11, angle: -48, colorIdx: 1, duration: 5.3, delay: 0.6, priority: 2 },
      
      { topPct: 47, leftPct: 28, width: 28, height: 10, angle: -72, colorIdx: 2, duration: 6.8, delay: 0.3, priority: 3 },
      { topPct: 51, leftPct: 90, width: 34, height: 11, angle: 38, colorIdx: 3, duration: 5.0, delay: 0.1, priority: 2 },
      { topPct: 56, leftPct: 9, width: 24, height: 9, angle: 82, colorIdx: 4, duration: 6.3, delay: 0.7, priority: 1 },
      { topPct: 60, leftPct: 71, width: 32, height: 12, angle: -22, colorIdx: 5, duration: 4.9, delay: 0.2, priority: 3 },
      { topPct: 65, leftPct: 45, width: 26, height: 10, angle: 60, colorIdx: 6, duration: 5.7, delay: 0.5, priority: 3 },
      
      { topPct: 70, leftPct: 17, width: 30, height: 11, angle: -40, colorIdx: 7, duration: 6.6, delay: 0.4, priority: 2 },
      { topPct: 74, leftPct: 95, width: 28, height: 10, angle: 18, colorIdx: 0, duration: 5.1, delay: 0.9, priority: 1 },
      { topPct: 79, leftPct: 34, width: 34, height: 12, angle: -85, colorIdx: 1, duration: 6.0, delay: 0.2, priority: 3 },
      { topPct: 83, leftPct: 81, width: 22, height: 9, angle: 50, colorIdx: 2, duration: 5.5, delay: 0.6, priority: 2 },
      { topPct: 88, leftPct: 3, width: 32, height: 11, angle: -10, colorIdx: 3, duration: 6.9, delay: 0.3, priority: 1 },
      
      { topPct: 92, leftPct: 67, width: 26, height: 10, angle: 72, colorIdx: 4, duration: 4.7, delay: 0.8, priority: 3 },
      { topPct: 96, leftPct: 23, width: 30, height: 11, angle: -55, colorIdx: 5, duration: 5.8, delay: 0.1, priority: 2 },
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
        
        // Calculate Sprinkle position in pixels
        const sprX = (winDim.w * s.leftPct) / 100;
        const sprY = (winDim.h * s.topPct) / 100;

        const dx = sprX - mousePos.x;
        const dy = sprY - mousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Repulsion physics calculation
        const threshold = 160; // Mouse interaction radius
        let pushX = 0;
        let pushY = 0;
        let extraScale = 1;
        let extraRotate = 0;

        if (dist < threshold && dist > 0) {
          const force = (threshold - dist) / threshold; // 0 to 1
          const pushDist = force * 90; // Max repulsion offset 90px
          pushX = (dx / dist) * pushDist;
          pushY = (dy / dist) * pushDist;
          extraScale = 1 + force * 0.25;
          extraRotate = force * 35;
        }

        return (
          <motion.div
            key={idx}
            animate={{
              x: pushX,
              y: pushY,
              rotate: s.angle + extraRotate,
              scale: extraScale,
            }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 18,
              mass: 0.6,
            }}
            style={{
              position: "absolute",
              top: `${s.topPct}%`,
              left: `${s.leftPct}%`,
              width: `${s.width}px`,
              height: `${s.height}px`,
              borderRadius: "8px",
              backgroundColor: color,
              opacity: dist < threshold ? 0.95 : 0.62,
              boxShadow: dist < threshold 
                ? `0 8px 24px ${color}aa, 0 2px 6px rgba(0,0,0,0.15)`
                : `0 4px 12px ${color}65, 0 1px 3px rgba(0,0,0,0.08)`,
              willChange: "transform",
            }}
          >
            {/* Ambient floating effect inside inner element */}
            <motion.div
              animate={{
                y: [-6, 6, -6],
                x: [-3, 3, -3],
                rotate: [-6, 6, -6],
              }}
              transition={{
                duration: s.duration,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: s.delay,
              }}
              style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

