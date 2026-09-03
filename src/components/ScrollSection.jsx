import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useBackgroundBlur } from "../context/BackgroundBlurContext";

/**
 * ScrollSection wrapper component.
 * Uses Intersection Observer to fade content in/out as it enters/leaves the viewport.
 * Also registers with the global background blur manager when intersecting by >= threshold (default 20%).
 */
export default function ScrollSection({ id, children, className = "", style = {}, threshold = 0.1, rootMargin = "0px" }) {
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
        threshold: threshold,
        rootMargin: rootMargin,
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
      id={id}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
