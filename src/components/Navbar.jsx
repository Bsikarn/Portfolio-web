import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { styles } from "../styles/Navbar.styles";

export default function Navbar({ page, setPage, onCheerUp, chatOpen, setChatOpen }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.leftContainer}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCheerUp}
          style={styles.cheerButton}
        >
          Cheer up! 🎉
        </motion.button>
      </div>

      <div style={styles.logoContainer}>
        <div style={styles.logoText}>
          Beaut.dev
        </div>
      </div>

      <div style={styles.navLinksContainer}>
        {["Home", "Projects", "Contact"].map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              ...styles.navLink,
              background: page === p ? "#0D6EFD" : "transparent",
              color: page === p ? "white" : "#4a6a8a",
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
            ...styles.chatButton,
            background: chatOpen
              ? "linear-gradient(135deg,#0D6EFD,#4d9fff)"
              : "rgba(163,216,244,0.3)",
            boxShadow: chatOpen ? "0 4px 14px rgba(13,110,253,0.35)" : "none",
          }}
        >
          <MessageCircle size={17} color={chatOpen ? "white" : "#0D6EFD"} />
        </motion.button>
      </div>
    </nav>
  );
}

