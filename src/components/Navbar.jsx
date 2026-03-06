import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import { styles } from "../styles/Navbar.styles";

export default function Navbar({ page, setPage, onCheerUp, chatOpen, setChatOpen }) {
  // Track if the viewport is mobile width (less than 768px)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // Manage the state of the mobile dropdown menu (open/closed)
  const [menuOpen, setMenuOpen] = useState(false);

  // Hook to handle window resize events and update mobile layout state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-close the mobile menu if resizing back to a desktop view
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    // Use passive listener for better scroll/resize performance
    window.addEventListener("resize", handleResize, { passive: true });

    // Cleanup listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle navigation link clicks and auto-close the mobile menu
  const handleNavClick = (p) => {
    setPage(p);
    setMenuOpen(false);
  };

  return (
    <>
      <nav style={{ ...styles.nav, zIndex: 1000 }}>

        {/* Left Section: Easter Egg / Interactive Button */}
        <div style={styles.leftContainer}>
          {/* Animated Cheer Up Button */}
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

        {/* Center Section: Logo */}
        <div style={styles.logoContainer}>
          {/* Main Logo Container. Double-click acts as a hidden backdoor to the Admin section */}
          <div
            style={{ ...styles.logoText, cursor: "pointer" }}
            onDoubleClick={() => handleNavClick("Admin")}
            title="Beaut.Portfolio"
          >
            Beaut.Portfolio
          </div>
        </div>

        {/* Right Section: Navigation Links and Actions */}
        <div style={styles.navLinksContainer}>

          {/* Desktop Navigation Links */}
          {!isMobile && ["Home", "Projects", "Contact"].map((p) => (
            <button
              key={p}
              onClick={() => handleNavClick(p)}
              style={{
                ...styles.navLink,
                background: page === p ? "#0D6EFD" : "transparent",
                color: page === p ? "white" : "#4a6a8a",
              }}
              // Hover effects managed via React synthetic events
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

          {/* AI Chatbot Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setChatOpen((v) => !v)}
            aria-label="Open AI Assistant"
            style={{
              ...styles.chatButton,
              // Change button appearance based on chat state
              background: chatOpen
                ? "linear-gradient(135deg,#0D6EFD,#4d9fff)"
                : "rgba(163,216,244,0.3)",
              boxShadow: chatOpen ? "0 4px 14px rgba(13,110,253,0.35)" : "none",
            }}
          >
            <MessageCircle size={17} color={chatOpen ? "white" : "#0D6EFD"} />
          </motion.button>

          {/* Mobile Menu Toggle Button (Hamburger icon) */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                marginLeft: "12px", color: "#0D6EFD", display: "flex",
                justifyContent: "center", alignItems: "center", width: 32, height: 32
              }}
            >
              {/* Transition animations between hamburger (menu) and close (X) icons */}
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

      {/* Mobile Navigation Dropdown Menu */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 64, // Positioned right below the navbar
              left: 0,
              right: 0,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)", // Glassmorphism effect
              borderBottom: "1px solid rgba(163,216,244,0.25)",
              boxShadow: "0 10px 25px rgba(13,110,253,0.1)",
              zIndex: 999, // Just below the navbar's z-index
              display: "flex",
              flexDirection: "column",
              padding: "16px",
            }}
          >
            {/* Render mobile links */}
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

