import { useState, useEffect, useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { Bot, X, Send } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ChatBot({ isOpen, onClose }) {
  // State to store conversation history
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! 👋 I'm Sikarn's AI assistant. Ask me anything about his work, skills, or projects!",
    },
  ]);

  // State for the user's current input text
  const [input, setInput] = useState("");

  // State to track if the bot is currently processing a response
  const [loading, setLoading] = useState(false);

  // Ref used to auto-scroll to the bottom of the chat window
  const messagesEndRef = useRef(null);

  // Controls for dragging the chat window (Framer Motion)
  const dragControls = useDragControls();

  // State to determine if the device is mobile for responsive layout
  const [isMobile, setIsMobile] = useState(false);

  // Check window width on mount to set mobile state
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Automatically scroll to the latest message whenever the messages array updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to handle sending a message and getting a response from the AI
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // 1. Add user message to UI immediately
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chat-with-qwen', {
        body: { message: input },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Handle the generated response
      const reply = data.reply || "Sorry, I couldn't respond right now.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

    } catch (err) {
      // Handle network or API errors gracefully
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong. Try again?" },
      ]);
    }
    setLoading(false);
  };

  // If chat is not toggled open, do not render anything
  if (!isOpen) return null;

  // Reusable core UI for the chat interface
  const chatCard = (
    <div style={styles.cardContainer}>

      {/* Draggable Chat Header */}
      <div
        onPointerDown={!isMobile ? (e) => dragControls.start(e) : undefined}
        style={{ ...styles.cardHeader, cursor: isMobile ? "default" : "grab" }}
      >
        <div style={styles.headerInfo}>
          <div style={styles.botIconWrapper}>
            <Bot size={18} color="#0D6EFD" />
          </div>
          <div>
            <div style={styles.botName}>Sikarn's AI Assistant</div>
            <div style={styles.botStatus}>● Online</div>
          </div>
        </div>
        <button onClick={onClose} style={styles.closeButton}>
          <X size={14} />
        </button>
      </div>

      {/* Main Chat Display Area */}
      <div style={styles.chatArea}>
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start"
            }}
          >
            {/* Visual styling distinguishing user vs assistant messages */}
            <div
              style={{
                ...styles.messageBubble,
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.role === "user" ? "linear-gradient(135deg, #0D6EFD, #4d9fff)" : "#f0f6ff",
                color: m.role === "user" ? "white" : "#1a2a4a",
              }}
            >
              {m.content}
            </div>
          </motion.div>
        ))}

        {/* Loading Indicator Animation */}
        {loading && (
          <div style={styles.loadingWrapper}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }}
                style={styles.loadingDot}
              />
            ))}
          </div>
        )}
        {/* Invisible div used as anchor for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field Area */}
      <div style={styles.inputArea}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything..."
          style={styles.inputField}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            ...styles.sendButton,
            background: loading ? "#ccc" : "linear-gradient(135deg,#0D6EFD,#4d9fff)",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <Send size={15} color="white" />
        </button>
      </div>
    </div>
  );

  // Return specific layout behavior based on screen size:
  // Mobile layout: Fixed transparent overlay covering the whole screen
  // Desktop layout: Draggable floating panel
  if (isMobile) {
    return (
      <div style={styles.mobileOverlay}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
          {chatCard}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false} // Prevents drift after releasing the drag
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      style={styles.desktopFloatingCard}
    >
      {chatCard}
    </motion.div>
  );
}

// Inline CSS Styles for the ChatBot Component
const styles = {
  cardContainer: {
    width: 340, height: 480, background: "white", borderRadius: 20,
    boxShadow: "0 20px 60px rgba(13,110,253,0.18)", display: "flex", flexDirection: "column",
    overflow: "hidden", border: "1px solid rgba(163,216,244,0.3)"
  },
  cardHeader: {
    background: "linear-gradient(135deg, #A3D8F4 0%, #ffc8d5 100%)", padding: "14px 16px",
    display: "flex", alignItems: "center", justifyContent: "space-between"
  },
  headerInfo: { display: "flex", alignItems: "center", gap: 10 },
  botIconWrapper: {
    width: 36, height: 36, background: "rgba(255,255,255,0.7)", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  botName: { fontWeight: 700, fontSize: 14, color: "#1a2a4a" },
  botStatus: { fontSize: 11, color: "#4a6a8a" },
  closeButton: {
    background: "rgba(255,255,255,0.5)", border: "none", borderRadius: "50%",
    width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
  },
  chatArea: { flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 },
  messageBubble: { maxWidth: "80%", padding: "9px 13px", fontSize: 13, lineHeight: 1.5 },
  loadingWrapper: { display: "flex", gap: 5, padding: "8px 14px" },
  loadingDot: { width: 7, height: 7, borderRadius: "50%", background: "#A3D8F4" },
  inputArea: { padding: "12px 14px", borderTop: "1px solid #eef3ff", display: "flex", gap: 8 },
  inputField: {
    flex: 1, padding: "9px 14px", borderRadius: 50, border: "1.5px solid #d0e8ff",
    outline: "none", fontSize: 13, background: "#f8fbff", color: "#1a2a4a", fontFamily: "inherit"
  },
  sendButton: {
    width: 38, height: 38, borderRadius: "50%", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  mobileOverlay: {
    position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  desktopFloatingCard: { position: "fixed", bottom: 90, right: 24, zIndex: 9000, cursor: "default" }
};