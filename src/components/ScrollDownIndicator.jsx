import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";

/**
 * Reusable Global Scroll Down Indicator
 * Shows bouncing arrow and optional text label at the bottom center of the viewport.
 * Automatically hides when scrolled past threshold or when target element is in view,
 * and reappears when user scrolls back up near the top.
 */
export default function ScrollDownIndicator({
  targetId = null,
  text = null,
  scrollThreshold = 150,
  iconSize = 20,
  zIndex = 90,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let observer;

    const checkVisibility = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const targetEl = targetId ? document.getElementById(targetId) : null;

      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        setIsVisible(!isInView && scrollY < scrollThreshold);
      } else {
        setIsVisible(scrollY < scrollThreshold);
      }
    };

    const targetEl = targetId ? document.getElementById(targetId) : null;
    if (targetEl) {
      observer = new IntersectionObserver(
        ([entry]) => {
          const scrollY = window.scrollY || document.documentElement.scrollTop;
          if (entry.isIntersecting) {
            setIsVisible(false);
          } else {
            setIsVisible(scrollY < scrollThreshold);
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(targetEl);
    }

    window.addEventListener("scroll", checkVisibility, { passive: true });
    checkVisibility();

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      if (observer) observer.disconnect();
    };
  }, [targetId, scrollThreshold]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: zIndex,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            pointerEvents: "none",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {text && (
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "inherit",
                  fontWeight: 600,
                  color: "#4a6a8a",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {text}
              </div>
            )}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              style={{ willChange: "transform", color: "#0D6EFD" }}
            >
              <ArrowDown size={iconSize} />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
