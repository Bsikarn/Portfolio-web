import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useBackgroundBlur } from "../context/BackgroundBlurContext";

/**
 * ScrollSection wrapper component.
 * Uses Intersection Observer to fade content in/out as it enters/leaves the viewport.
 * Also registers with the global background blur manager when intersecting by >= threshold (default 20%).
 */
export default function ScrollSection({ id, children, className = "", style = {}, threshold = 0.2 }) {
  const elementRef = useRef(null);
  const { registerSection } = useBackgroundBlur();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        setIsVisible(isIntersecting);
        registerSection(id, isIntersecting);
      },
      {
        // 20% of the element needs to be visible in the viewport to trigger
        threshold: threshold,
        rootMargin: "-5% 0px -5% 0px", // Slight margin to feel more organic
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      // Safely cleanup from global blur manager on unmount
      registerSection(id, false);
    };
  }, [id, threshold, registerSection]);

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={className}
      style={{ ...style, willChange: "opacity" }}
    >
      {children}
    </motion.div>
  );
}
