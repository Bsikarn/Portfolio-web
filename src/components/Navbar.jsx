import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function Navbar({ page, setPage, onCheerUp, chatOpen, setChatOpen }) {
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "0 32px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(163,216,244,0.25)",
        boxShadow: "0 2px 20px rgba(13,110,253,0.07)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: 20,
            background: "linear-gradient(135deg,#0D6EFD,#A3D8F4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Beaut.dev
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCheerUp}
          style={{
            padding: "6px 14px",
            borderRadius: 50,
            background: "linear-gradient(135deg,#ffc8d5,#A3D8F4)",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Poppins',sans-serif",
            fontWeight: 600,
            fontSize: 12,
            color: "#1a2a4a",
            boxShadow: "0 2px 8px rgba(163,216,244,0.4)",
          }}
        >
          Cheer up! 🎉
        </motion.button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {["Home", "Projects", "Contact"].map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              padding: "7px 16px",
              borderRadius: 50,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Poppins',sans-serif",
              fontWeight: 600,
              fontSize: 13,
              background: page === p ? "#0D6EFD" : "transparent",
              color: page === p ? "white" : "#4a6a8a",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (page !== p) e.currentTarget.style.color = "#0D6EFD";
            }}
            onMouseLeave={(e) => {
              if (page !== p) e.currentTarget.style.color = "#4a6a8a";
            }}
          >
            {p}
          </button>
        ))}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatOpen((v) => !v)}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: chatOpen
              ? "linear-gradient(135deg,#0D6EFD,#4d9fff)"
              : "rgba(163,216,244,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: chatOpen ? "0 4px 14px rgba(13,110,253,0.35)" : "none",
          }}
        >
          <MessageCircle size={17} color={chatOpen ? "white" : "#0D6EFD"} />
        </motion.button>
      </div>
    </nav>
  );
}