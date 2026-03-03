import { motion, useScroll, useTransform } from "framer-motion";

export default function StackedCard({ children, stickyTop = "64px", zIndex = 1, scaleTo = 1 }) {
    const { scrollY } = useScroll();

    // Use absolute global scroll. The card will scale and blur as the user scrolls down 400px.
    const scale = useTransform(scrollY, [0, 400], [1, scaleTo]);
    const filter = useTransform(scrollY, [0, 400], ["blur(0px)", "blur(12px)"]);
    const opacity = useTransform(scrollY, [0, 400], [1, 0.4]);

    return (
        <div style={{ position: "sticky", top: stickyTop, zIndex }}>
            <motion.div
                style={{
                    scale,
                    filter,
                    opacity,
                    transformOrigin: "top center",
                    width: "100%",
                    willChange: "transform, filter, opacity"
                }}
            >
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
