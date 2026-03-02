import { useState, useEffect, useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { Bot, X, Send } from "lucide-react";

export default function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! 👋 I'm Alex's AI assistant. Ask me anything about his work, skills, or projects!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const dragControls = useDragControls();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "YOUR_API_KEY", "anthropic-version": "2023-06-01" }, // Note: Added basic headers required by Anthropic normally, replace properly
        body: JSON.stringify({
          model: "claude-3-sonnet-20240229", // Adjusted model name to a valid one
          max_tokens: 1000,
          system: "You are a helpful AI assistant for Alex Chen's developer portfolio. Alex is a Full-Stack Developer with 4 years of experience specializing in React, Next.js, Node.js, PostgreSQL, and cloud infrastructure. He has built 42+ projects. Be concise, friendly, and highlight his skills when relevant.",
          messages: history,
        }),
      });
      const data = await res.json();
      const reply = data.content?.map((c) => c.text).join("") || "Sorry, I couldn't respond right now.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong. Try again?" },
      ]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const chatCard = (
    <div
      style={{
        width: 340,
        height: 480,
        background: "white",
        borderRadius: 20,
        boxShadow: "0 20px 60px rgba(13,110,253,0.18)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid rgba(163,216,244,0.3)",
      }}
    >
      <div
        onPointerDown={!isMobile ? (e) => dragControls.start(e) : undefined}
        style={{
          background: "linear-gradient(135deg, #A3D8F4 0%, #ffc8d5 100%)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: isMobile ? "default" : "grab",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "rgba(255,255,255,0.7)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bot size={18} color="#0D6EFD" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a2a4a" }}>Alex's AI Assistant</div>
            <div style={{ fontSize: 11, color: "#4a6a8a" }}>● Online</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.5)",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "9px 13px",
                borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: m.role === "user" ? "linear-gradient(135deg, #0D6EFD, #4d9fff)" : "#f0f6ff",
                color: m.role === "user" ? "white" : "#1a2a4a",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {m.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 5, padding: "8px 14px" }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.6 }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: "#A3D8F4" }}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: "12px 14px", borderTop: "1px solid #eef3ff", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything..."
          style={{
            flex: 1,
            padding: "9px 14px",
            borderRadius: 50,
            border: "1.5px solid #d0e8ff",
            outline: "none",
            fontSize: 13,
            background: "#f8fbff",
            color: "#1a2a4a",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: loading ? "#ccc" : "linear-gradient(135deg,#0D6EFD,#4d9fff)",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Send size={15} color="white" />
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      style={{ position: "fixed", bottom: 90, right: 24, zIndex: 9000, cursor: "default" }}
    >
      {chatCard}
    </motion.div>
  );
}