import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import { styles } from "../styles/Navbar.styles";

export default function Navbar({ page, setPage, onCheerUp, chatOpen, setChatOpen }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavClick = (p) => {
    setPage(p);
    setMenuOpen(false);
  };

  return (
    <>
      <nav style={{ ...styles.nav, zIndex: 1000 }}>
        <div style={styles.leftContainer}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCheerUp}
            aria-label="Cheer up!"
            style={styles.cheerButton}
          >
            🎉
          </motion.button>
        </div>

        <div style={styles.logoContainer}>
          <div
            style={{ ...styles.logoText, cursor: "pointer" }}
            onDoubleClick={() => handleNavClick("Admin")}
            title="Beaut.Portfolio"
          >
            Beaut.Portfolio
          </div>
        </div>

        <div style={styles.navLinksContainer}>
          {!isMobile && ["Home", "Projects", "Contact"].map((p) => (
            <button
              key={p}
              onClick={() => handleNavClick(p)}
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
            aria-label="Open AI Assistant"
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

          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
              style={{ background: "transparent", border: "none", cursor: "pointer", marginLeft: "12px", color: "#0D6EFD", display: "flex", justifyContent: "center", alignItems: "center", width: 32, height: 32 }}
            >
              <div style={{ position: "relative", width: 24, height: 24 }}>
                <motion.div
                  animate={{ rotate: menuOpen ? 180 : 0, opacity: menuOpen ? 1 : 0, scale: menuOpen ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                  style={{ position: "absolute", top: 0, left: 0 }}
                >
                  <X size={24} />
                </motion.div>
                <motion.div
                  animate={{ rotate: menuOpen ? -180 : 0, opacity: menuOpen ? 0 : 1, scale: menuOpen ? 0.5 : 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ position: "absolute", top: 0, left: 0 }}
                >
                  <Menu size={24} />
                </motion.div>
              </div>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 64,
              left: 0,
              right: 0,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(163,216,244,0.25)",
              boxShadow: "0 10px 25px rgba(13,110,253,0.1)",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              padding: "16px",
            }}
          >
            {["Home", "Projects", "Contact"].map((p) => (
              <button
                key={p}
                onClick={() => handleNavClick(p)}
                style={{
                  padding: "16px",
                  background: page === p ? "rgba(13,110,253,0.1)" : "transparent",
                  color: page === p ? "#0D6EFD" : "#4a6a8a",
                  fontWeight: page === p ? 700 : 500,
                  border: "none",
                  borderRadius: "12px",
                  textAlign: "center",
                  fontSize: "16px",
                  fontFamily: "'Poppins',sans-serif",
                  marginBottom: "8px"
                }}
              >
                {p}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

