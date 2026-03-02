import { supabase } from "./lib/supabase";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import ChatBot from "./components/ChatBot";
import FallingEmoji from "./components/FallingEmoji";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage"; // เพิ่มบรรทัดนี้ด้านบน
import { EMOJIS } from "./data/constants";

export default function App() {
  const [page, setPage] = useState("Home");
  const [chatOpen, setChatOpen] = useState(false);
  const [emojis, setEmojis] = useState([]);

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
      await supabase.rpc('increment_cheer_ups');
    } catch (error) {
      console.error("Error cheering up:", error);
    }
  }, []);

  const removeEmoji = useCallback((id) => {
    setEmojis((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <>
      {emojis.map((e) => (
        <FallingEmoji key={e.id} emoji={e.emoji} x={`${e.x}vw`} delay={e.delay} onDone={() => removeEmoji(e.id)} />
      ))}

      <Navbar
        page={page}
        setPage={setPage}
        onCheerUp={handleCheerUp}
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
        >
          {page === "Home" && <HomePage setPage={setPage} />}
          {page === "Projects" && <ProjectsPage />}
          {page === "Contact" && <ContactPage />}
          {page === "Admin" && <AdminPage />}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && <ChatBot isOpen={chatOpen} onClose={() => setChatOpen(false)} />}
      </AnimatePresence>
    </>
  );
}