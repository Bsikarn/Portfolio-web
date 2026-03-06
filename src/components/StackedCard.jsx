import { motion, useScroll, useTransform } from "framer-motion";

// A wrapper component that creates a sticky, stacking effect as the user scrolls
export default function StackedCard({ children, stickyTop = "64px", zIndex = 1, scaleTo = 1 }) {
    // Hook to track the user's vertical scroll position relative to the entire page
    const { scrollY } = useScroll();

    // Use absolute global scroll. The card will scale down slightly and blur as the user scrolls down 400px.
    // Maps scroll position [0px -> 400px] to scale [1 -> scaleTo]
    const scale = useTransform(scrollY, [0, 400], [1, scaleTo]);

    // Maps scroll position [0px -> 400px] to blur [0px -> 12px]
    const filter = useTransform(scrollY, [0, 400], ["blur(0px)", "blur(12px)"]);

    // Maps scroll position [0px -> 400px] to opacity [1 -> 0.4]
    const opacity = useTransform(scrollY, [0, 400], [1, 0.4]);

    return (
        // Sticky container that holds the card in place when it reaches 'stickyTop'
        <div style={{ position: "sticky", top: stickyTop, zIndex }}>

            {/* Scroll-animated container handling scale, blur, and opacity */}
            <motion.div
                style={{
                    scale,
                    filter,
                    opacity,
                    transformOrigin: "top center", // Ensures it scales towards the top edge
                    width: "100%",
                    // Hint to the browser for performance optimization during animations
                    willChange: "transform, filter, opacity"
                }}
            >
                {/* Initial entrance animation when the card first renders */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </motion.div>
        </div>
    );
}
