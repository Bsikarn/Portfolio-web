import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Bot, X, Send, Sparkles, RefreshCw } from "lucide-react";
import { processPortfolioChat } from "../lib/portfolioChat";

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content: "สวัสดีค่ะ! หนูเป็นผู้ช่วย AI ประจำ Portfolio ของคุณสิการย์ สามารถสอบถามเกี่ยวกับผลงาน ทักษะ (Tech Stack) หรือประสบการณ์ทำงานได้เลยนะคะ 😊",
  },
];

const S = {
  card: {
    width: 360,
    height: 520,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(16px)",
    borderRadius: 24,
    boxShadow: "0 24px 64px rgba(13, 110, 253, 0.18), 0 4px 20px rgba(0, 0, 0, 0.06)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid rgba(163, 216, 244, 0.5)",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    background: "linear-gradient(135deg, #A3D8F4 0%, #ffc8d5 100%)",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255, 255, 255, 0.6)",
    userSelect: "none",
  },
  headerInfo: { display: "flex", alignItems: "center", gap: 10 },
  botIcon: {
    width: 36,
    height: 36,
    background: "rgba(255, 255, 255, 0.85)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(13,110,253,0.15)",
  },
  botName: { fontWeight: 700, fontSize: 14, color: "#1a2a4a" },
  botStatus: { fontSize: 11, color: "#0D6EFD", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 },
  headerActions: { display: "flex", alignItems: "center", gap: 6 },
  iconBtn: {
    background: "rgba(255, 255, 255, 0.6)",
    border: "none",
    borderRadius: "50%",
    width: 28,
    height: 28,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  bubble: {
    maxWidth: "85%",
    padding: "10px 14px",
    fontSize: 13,
    lineHeight: 1.6,
    wordBreak: "break-word",
  },
  loadingWrap: { display: "flex", gap: 5, padding: "8px 14px", alignItems: "center" },
  dot: { width: 7, height: 7, borderRadius: "50%", background: "#0D6EFD" },
  inputArea: {
    padding: "12px 16px",
    borderTop: "1px solid rgba(163, 216, 244, 0.3)",
    background: "rgba(248, 251, 255, 0.8)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  inputRow: { display: "flex", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    padding: "10px 16px",
    borderRadius: 24,
    border: "1.5px solid #d0e8ff",
    outline: "none",
    fontSize: 13,
    background: "#ffffff",
    color: "#1a2a4a",
    fontFamily: "inherit",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.15s ease",
  },
  limitInfo: { fontSize: 10, color: "#8a9ab0", textAlign: "right", paddingRight: 4 },
  mobileOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(10, 20, 40, 0.4)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  desktopFloat: {
    position: "fixed",
    bottom: 90,
    right: 24,
    zIndex: 9999,
    cursor: "default",
  },
};

export default function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef(null);
  const dragControls = useDragControls();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setLoading(true);

    try {
      const response = await processPortfolioChat(userText);
      const replyText = response?.reply || "ขออภัยด้วยนะคะ ไม่สามารถประมวลผลคำตอบได้ในขณะนี้";

      setMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
    } catch (err) {
      console.error("PortfolioChat send error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "ขออภัยด้วยนะคะ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้งนะคะ",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetHistory = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const ChatCard = (
    <div style={S.card}>
      {/* Header */}
      <div
        onPointerDown={!isMobile ? (e) => dragControls.start(e) : undefined}
        style={{ ...S.header, cursor: isMobile ? "default" : "grab" }}
      >
        <div style={S.headerInfo}>
          <div style={S.botIcon}>
            <Bot size={20} color="#0D6EFD" />
          </div>
          <div>
            <div style={S.botName}>RAG Portfolio Assistant</div>
            <div style={S.botStatus}>
              <Sparkles size={11} color="#0D6EFD" /> Powered by Gemini 1.5 Flash
            </div>
          </div>
        </div>
        <div style={S.headerActions}>
          <button
            onClick={handleResetHistory}
            style={S.iconBtn}
            title="Reset Conversation"
            type="button"
          >
            <RefreshCw size={13} color="#4a6a8a" />
          </button>
          <button onClick={onClose} style={S.iconBtn} title="Close" type="button">
            <X size={14} color="#4a6a8a" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={S.chatArea}>
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                ...S.bubble,
                borderRadius:
                  m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background:
                  m.role === "user"
                    ? "linear-gradient(135deg, #0D6EFD 0%, #4d9fff 100%)"
                    : "rgba(240, 246, 255, 0.9)",
                color: m.role === "user" ? "#ffffff" : "#1a2a4a",
                boxShadow:
                  m.role === "user"
                    ? "0 4px 12px rgba(13,110,253,0.25)"
                    : "0 2px 8px rgba(0,0,0,0.03)",
                border: m.role === "user" ? "none" : "1px solid rgba(163,216,244,0.3)",
              }}
            >
              {m.content}
            </div>
          </motion.div>
        ))}

        {/* Loading Animated Dots */}
        {loading && (
          <div style={S.loadingWrap}>
            <span style={{ fontSize: 11, color: "#0D6EFD", fontWeight: 500, marginRight: 4 }}>
              กำลังค้นหาข้อมูลและประมวลผล...
            </span>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }}
                style={S.dot}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={S.inputArea}>
        <div style={S.inputRow}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="สอบถามเกี่ยวกับทักษะ, ผลงาน, ประวัติ..."
            maxLength={500}
            style={S.input}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              ...S.sendBtn,
              background:
                loading || !input.trim()
                  ? "#d0dceb"
                  : "linear-gradient(135deg, #0D6EFD 0%, #4d9fff 100%)",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              boxShadow:
                loading || !input.trim() ? "none" : "0 4px 12px rgba(13,110,253,0.3)",
            }}
            type="button"
          >
            <Send size={15} color="white" />
          </button>
        </div>
        <div style={S.limitInfo}>{input.length}/500</div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isMobile ? (
        <div style={S.mobileOverlay}>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
          >
            {ChatCard}
          </motion.div>
        </div>
      ) : (
        <motion.div
          drag
          dragControls={dragControls}
          dragMomentum={false}
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          style={S.desktopFloat}
        >
          {ChatCard}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
