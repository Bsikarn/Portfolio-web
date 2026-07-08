
import { supabase } from "./lib/supabase";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import { useBackgroundBlur } from "./context/BackgroundBlurContext";
import FallingEmoji from "./components/FallingEmoji";
import MeshGradientBackground from "./components/MeshGradientBackground";
import { EMOJIS } from "./data/constants";
import { ChevronsUp } from "lucide-react";

import { lazy, Suspense } from "react";
import ThreeDPreloader from "./components/ThreeDPreloader";

// Lazy loading pages to improve performance by loading them only when needed
const Background3DScene = lazy(() => import("./components/Background3DScene"));
const ChatBot = lazy(() => import("./components/ChatBot"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

// Animation variants for Framer Motion to handle page fading (simplified)
const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function App() {
  const [page, setPage] = useState("Home");
  const [chatOpen, setChatOpen] = useState(false);
  const [emojis, setEmojis] = useState([]);
  const [session, setSession] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [sectionTicks, setSectionTicks] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Monitor scroll position to calculate page scroll percentage and section ticks
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);

      // Track section offset positions for progress bar division lines
      const sections = page === "Home"
        ? ["about-me", "achievements", "activities", "technologies-and-tools", "dashboard-overview"]
        : ["project-selector", "project-details"];

      const ticks = sections.map(id => {
        const el = document.getElementById(id);
        if (el && docHeight > 0) {
          return (el.offsetTop / docHeight) * 100;
        }
        return null;
      }).filter(v => v !== null && v > 0 && v < 100);

      setSectionTicks(ticks);
      setShowBackToTop(window.scrollY > 300);
    };

    // Calculate once on load/page change
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page]); // Re-bind/re-calculate on page change to handle page height difference

  // Monitor Supabase Auth State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Handles page navigation and determines animation direction
  const handleSetPage = useCallback((newPage) => {
    if (newPage === page) return;

    // Protect Admin Route: Redirect to Login if no session
    if (newPage === "Admin" && !session) {
      newPage = "Login";
    }

    setPage(newPage);
  }, [page, session]);

  // Resets scroll position to top when changing pages
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [page]);

  // Handles the "Cheer Up" interactive feature
  const handleCheerUp = useCallback(async () => {
    // Generate falling emoji animation objects
    const newEmojis = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: Math.random() * 95,
      delay: Math.random() * 0.8,
    }));
    setEmojis((prev) => [...prev, ...newEmojis]);

    // Update the cheer up count in the database using a Supabase RPC
    try {
      await supabase.rpc("increment_cheer_ups");
    } catch (error) {
      console.error("Error cheering up:", error);
    }
  }, []);

  // Removes emojis from state once their animation completes
  const removeEmoji = useCallback((id) => {
    setEmojis((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const { blurAmount } = useBackgroundBlur();

  return (
    <>
      {/* Global Background Container containing Mesh Gradient and 3D Scene */}
      <div
        id="global-background-container"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
          filter: `blur(${blurAmount}px)`,
          transition: "filter 0.5s ease-out",
          willChange: "filter",
        }}
      >
        <MeshGradientBackground />

        {/* Soft glowing orb effect */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "50vw",
            height: "50vw",
            maxHeight: 600,
            maxWidth: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(163,216,244,0.2) 0%, rgba(255,200,213,0.15) 50%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        {/* Code-split and lazy-loaded 3D background with Glassmorphism preloader */}
        <Suspense fallback={<ThreeDPreloader />}>
          <Background3DScene page={page} blurAmount={blurAmount} />
        </Suspense>
      </div>

      {/* Render the falling emojis */}
      {emojis.map((e) => (
        <FallingEmoji
          key={e.id}
          emoji={e.emoji}
          x={`${e.x}vw`}
          delay={e.delay}
          onDone={() => removeEmoji(e.id)}
        />
      ))}

      <Navbar
        page={page}
        setPage={handleSetPage}
        onCheerUp={handleCheerUp}
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
      />

      {/* AnimatePresence handles mounting/unmounting animations using fade-in/out */}
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <Suspense fallback={null}>
            {page === "Home" ? <HomePage setPage={handleSetPage} /> : null}
            {page === "Projects" ? <ProjectsPage /> : null}
            {page === "Contact" ? <ContactPage /> : null}
            {page === "Login" ? <LoginPage setPage={handleSetPage} /> : null}
            {page === "Admin" ? (
              // If signed in, show Admin Page (Protected Route)
              session ? <AdminPage setPage={handleSetPage} /> : null
            ) : null}
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {/* Render AI Chatbot overlay if chat is open */}
      <AnimatePresence>
        {chatOpen ? (
          <Suspense fallback={null}>
            <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />
          </Suspense>
        ) : null}
      </AnimatePresence>

      {/* Scroll Progress Bar at the bottom of the screen */}
      {(page === "Home" || page === "Projects") && (
        <div
          id="scroll-progress-bar"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100vw",
            height: "6px",
            background: "#e2e8f0", // light gray bar container
            zIndex: 9999,
            overflow: "hidden"
          }}
        >
          {/* Scroll progress gradient indicator */}
          <div
            style={{
              height: "100%",
              width: `${scrollProgress}%`,
              background: "linear-gradient(90deg, #A3D8F4, #ffc8d5, #0D6EFD)",
              transition: "width 0.05s ease-out",
              borderRadius: "0 4px 4px 0",
              boxShadow: "0 -2px 10px rgba(13,110,253,0.2)",
            }}
          />

          {/* Section Divider Ticks */}
          {sectionTicks.map((tickPercent, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: `${tickPercent}%`,
                top: 0,
                width: "2px",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.15)", // Gray divider line
                zIndex: 10000
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Back-to-Top Shortcut Button */}
      <AnimatePresence>
        {showBackToTop && (page === "Home" || page === "Projects") && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.4 }}
            whileHover={{ scale: 1.1, boxShadow: "0 12px 32px rgba(13,110,253,0.45)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              position: "fixed",
              bottom: 32,
              right: 28,
              zIndex: 500,
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #0D6EFD, #4d9fff)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 24px rgba(13,110,253,0.35)",
              pointerEvents: "auto"
            }}
            title="Back to top"
          >
            <ChevronsUp size={22} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
