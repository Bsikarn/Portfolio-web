import { useState, useEffect, useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { Bot, X, Send } from "lucide-react";

// Initial greeting message
const INITIAL_MESSAGES = [
  { role: "assistant", content: "Hi! Ask me anything about my projects, skills, or experience! (Thai or English is fine 😊)" },
];

// Inline styles for the chat UI
const S = {
  card: { width: 340, height: 480, background: "white", borderRadius: 20, boxShadow: "0 20px 60px rgba(13,110,253,0.18)", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid rgba(163,216,244,0.3)" },
  header: { background: "linear-gradient(135deg,#A3D8F4 0%,#ffc8d5 100%)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  headerInfo: { display: "flex", alignItems: "center", gap: 10 },
  botIcon: { width: 36, height: 36, background: "rgba(255,255,255,0.7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
  botName: { fontWeight: 700, fontSize: 14, color: "#1a2a4a" },
  botStatus: { fontSize: 11, color: "#4a6a8a" },
  closeBtn: { background: "rgba(255,255,255,0.5)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  chatArea: { flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 },
  bubble: { maxWidth: "80%", padding: "9px 13px", fontSize: 13, lineHeight: 1.5 },
  loadingWrap: { display: "flex", gap: 5, padding: "8px 14px" },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "#A3D8F4" },
  inputArea: { padding: "12px 14px", borderTop: "1px solid #eef3ff", display: "flex", gap: 8 },
  input: { flex: 1, padding: "9px 14px", borderRadius: 50, border: "1.5px solid #d0e8ff", outline: "none", fontSize: 13, background: "#f8fbff", color: "#1a2a4a", fontFamily: "inherit" },
  sendBtn: { width: 38, height: 38, borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center" },
  mobileOverlay: { position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" },
  desktopFloat: { position: "fixed", bottom: 90, right: 24, zIndex: 9000, cursor: "default" },
};

export default function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef(null);
  const dragControls = useDragControls();

  // Set mobile flag on mount only
  useEffect(() => { setIsMobile(window.innerWidth < 768); }, []);

  // Auto-scroll to latest message
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!isOpen) return null;

  // Send message using direct fetch to the Edge Function
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Send the last 6 messages as history to give the AI context
      const historyToSend = messages.map(m => ({ role: m.role, content: m.content })).slice(-6);

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-qwen`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ message: input, history: historyToSend }),
        }
      );

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Unknown error");

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Sorry, I couldn't respond right now." }]);
    } catch (err) {
      console.error("ChatBot error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Oops! Something went wrong. Try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  // Shared chat UI (used in both mobile and desktop layouts)
  const ChatCard = (
    <div style={S.card}>
      {/* Header (draggable on desktop) */}
      <div onPointerDown={!isMobile ? (e) => dragControls.start(e) : undefined} style={{ ...S.header, cursor: isMobile ? "default" : "grab" }}>
        <div style={S.headerInfo}>
          <div style={S.botIcon}><Bot size={18} color="#0D6EFD" /></div>
          <div>
            <div style={S.botName}>Sikarn's AI Assistant</div>
          </div>
        </div>
        <button onClick={onClose} style={S.closeBtn}><X size={14} /></button>
      </div>

      {/* Messages */}
      <div style={S.chatArea}>
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              ...S.bubble,
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: m.role === "user" ? "linear-gradient(135deg,#0D6EFD,#4d9fff)" : "#f0f6ff",
              color: m.role === "user" ? "white" : "#1a2a4a",
            }}>
              {m.content}
            </div>
          </motion.div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={S.loadingWrap}>
            {[0, 1, 2].map((i) => (
              <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }} style={S.dot} />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={S.inputArea}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask me anything..." style={S.input} />
        <button onClick={sendMessage} disabled={loading} style={{ ...S.sendBtn, background: loading ? "#ccc" : "linear-gradient(135deg,#0D6EFD,#4d9fff)", cursor: loading ? "not-allowed" : "pointer" }}>
          <Send size={15} color="white" />
        </button>
      </div>
    </div>
  );

  // Mobile: centered overlay; Desktop: draggable floating card
  if (isMobile) {
    return (
      <div style={S.mobileOverlay}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
          {ChatCard}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div drag dragControls={dragControls} dragMomentum={false} initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 20 }} style={S.desktopFloat}>
      {ChatCard}
    </motion.div>
  );
}