import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { supabase } from "./lib/supabase";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import FallingEmoji from "./components/FallingEmoji";
// Pages will be lazy loaded
import MeshGradientBackground from "./components/MeshGradientBackground";
import { EMOJIS } from "./data/constants";

import { Canvas } from "@react-three/fiber";
import { lazy, Suspense } from "react";

const AnimatedBlob = lazy(() => import("./components/AnimatedBlob"));
const ChatBot = lazy(() => import("./components/ChatBot"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

const PAGE_INDEX = {
  Home: 0,
  Projects: 1,
  Contact: 2,
  Admin: 3,
};

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

  const handleSetPage = (newPage) => {
    if (newPage === page) return;
    setDirection(PAGE_INDEX[newPage] > PAGE_INDEX[page] ? 1 : -1);
    setPage(newPage);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [page]);

  const handleCheerUp = useCallback(async () => {
    // โค้ดสร้างแอนิเมชันร่วงหล่น (เหมือนเดิมที่คุณมีอยู่แล้ว)
    const newEmojis = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: Math.random() * 95,
      delay: Math.random() * 0.8,
    }));
    setEmojis((prev) => [...prev, ...newEmojis]);

    // ✨ โค้ดอัปเดตยอดลง Database (ส่วนที่เพิ่มเข้ามา)
    try {
      await supabase.rpc("increment_cheer_ups");
    } catch (error) {
      console.error("Error cheering up:", error);
    }
  }, []);

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
        <Canvas
          camera={{ position: [0, 0, 3.5] }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} color="#ffc8d5" intensity={0.5} />
          <Suspense fallback={null}>
            <AnimatedBlob />
          </Suspense>
        </Canvas>
      </div>

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
            {page === "Admin" ? (
              <>
                {/* 1. ถ้า Login แล้ว -> โชว์หน้า Admin และปุ่ม Profile */}
                <SignedIn>
                  <div
                    style={{
                      position: "fixed",
                      top: 80,
                      right: 20,
                      zIndex: 1000,
                    }}
                  >
                    <UserButton afterSignOutUrl="/" />
                  </div>
                  <AdminPage />
                </SignedIn>

                {/* 2. ถ้ายังไม่ได้ Login -> โชว์หน้าแจ้งเตือนให้ Login */}
                <SignedOut>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "80vh",
                      zIndex: 2,
                      position: "relative",
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "Poppins",
                        color: "#000",
                        fontSize: "2rem",
                        marginBottom: "8px",
                      }}
                    >
                      🔒 Restricted Area
                    </h2>
                    <p style={{ color: "#4a6a8a", marginBottom: 20 }}>
                      กรุณาเข้าสู่ระบบเพื่อจัดการหลังบ้าน
                    </p>
                    <SignInButton mode="modal">
                      <button
                        style={{
                          padding: "12px 24px",
                          background: "#0D6EFD",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Log In as Admin
                      </button>
                    </SignInButton>
                  </div>
                </SignedOut>
              </>
            ) : null}
          </Suspense>
        </motion.div>
      </AnimatePresence>

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
