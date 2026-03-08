
import { supabase } from "./lib/supabase";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import FallingEmoji from "./components/FallingEmoji";
import MeshGradientBackground from "./components/MeshGradientBackground";
import { EMOJIS } from "./data/constants";

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

// Index mapping for page transitions (used to determine slide direction)
const PAGE_INDEX = {
  Home: 0,
  Projects: 1,
  Contact: 2,
  Login: 3,
  Admin: 4,
};

// Animation variants for Framer Motion to handle page sliding
const slideVariants = {
  initial: (direction) => ({ opacity: 0, x: direction > 0 ? 50 : -50 }),
  animate: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction > 0 ? -50 : 50 }),
};

export default function App() {
  const [page, setPage] = useState("Home");
  const [direction, setDirection] = useState(1);
  const [chatOpen, setChatOpen] = useState(false);
  const [emojis, setEmojis] = useState([]);
  const [session, setSession] = useState(null);

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

    setDirection(PAGE_INDEX[newPage] > PAGE_INDEX[page] ? 1 : -1);
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

  return (
    <>
      <MeshGradientBackground />

      {/* Global 3D Background placed behind page contents */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
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
          <Background3DScene />
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

      {/* AnimatePresence handles mounting/unmounting animations using slideVariants */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
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
    </>
  );
}
