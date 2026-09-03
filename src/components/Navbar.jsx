import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Menu, X } from "lucide-react";

export default function Navbar({ page, setPage, onCheerUp, chatOpen, setChatOpen, setContactOpen }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavClick = (p) => {
    if (p === "Contact") {
      setContactOpen(true);
      setMenuOpen(false);
    } else {
      setPage(p);
      setMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[1000] px-[32px] h-[64px] flex items-center justify-between bg-white border-b border-brand-secondary/25 shadow-[0_2px_20px_rgba(13,110,253,0.07)]">
        
        {/* Left Section: Easter Egg / Interactive Button */}
        <div className="flex items-center flex-1">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onCheerUp}
            aria-label="Cheer up!"
            className="p-[6px] bg-transparent border-none cursor-pointer font-sans font-semibold text-[22px] shadow-none"
          >
            🎉
          </motion.button>
        </div>

        {/* Center Section: Logo */}
        <div className="flex items-center justify-center flex-1">
          <div
            className="cursor-pointer font-sans font-extrabold text-[22px] bg-gradient-to-br from-brand-primary to-brand-secondary bg-clip-text text-transparent tracking-[-0.5px]"
            onDoubleClick={() => handleNavClick("Admin")}
            title="Beaut.Portfolio"
          >
            Beaut.Portfolio
          </div>
        </div>

        {/* Right Section: Navigation Links and Actions */}
        <div className="flex items-center gap-[12px] flex-1 justify-end">
          {!isMobile && ["Home", "Experiences", "Projects"].map((p) => (
            <button
              key={p}
              onClick={() => handleNavClick(p)}
              className={`px-[16px] py-[7px] rounded-[50px] border-none cursor-pointer font-sans font-semibold text-[13px] transition-all duration-200 ${
                page === p ? "bg-brand-primary text-white" : "bg-transparent text-[#4a6a8a] hover:text-brand-primary"
              }`}
            >
              {p}
            </button>
          ))}
          {!isMobile && (
            <button
              onClick={() => handleNavClick("Contact")}
              className="px-[20px] py-[7px] rounded-[50px] border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-sans font-bold text-[13px] cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(13,110,253,0.08)] bg-white/50 backdrop-blur-[5px]"
            >
              Contact
            </button>
          )}

          {/* AI Chatbot Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setChatOpen((v) => !v)}
            aria-label="Open AI Assistant"
            className={`w-[38px] h-[38px] rounded-full border-none cursor-pointer flex items-center justify-center ${
              chatOpen 
                ? "bg-gradient-to-br from-brand-primary to-[#4d9fff] shadow-[0_4px_14px_rgba(13,110,253,0.35)]" 
                : "bg-brand-secondary/30 shadow-none"
            }`}
          >
            <MessageCircle size={17} color={chatOpen ? "white" : "#0D6EFD"} />
          </motion.button>

          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-transparent border-none cursor-pointer ml-[12px] text-brand-primary flex justify-center items-center w-[32px] h-[32px]"
            >
              <div className="relative w-[24px] h-[24px]">
                <motion.div animate={{ rotate: menuOpen ? 180 : 0, opacity: menuOpen ? 1 : 0, scale: menuOpen ? 1 : 0.5 }} transition={{ duration: 0.3 }} className="absolute top-0 left-0">
                  <X size={24} />
                </motion.div>
                <motion.div animate={{ rotate: menuOpen ? -180 : 0, opacity: menuOpen ? 0 : 1, scale: menuOpen ? 0.5 : 1 }} transition={{ duration: 0.3 }} className="absolute top-0 left-0">
                  <Menu size={24} />
                </motion.div>
              </div>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Menu Backdrop Gradient Blur Overlay (Top Blur -> Bottom Transparent) */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[990] pointer-events-auto backdrop-blur-[16px] [mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_85%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_85%)] bg-gradient-to-b from-white/70 via-white/30 to-transparent cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Mobile Capsule Menu Dropdown (Right-Aligned Floating Pills) */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-[72px] right-[24px] z-[999] flex flex-col items-end gap-[10px] pointer-events-auto"
          >
            {["Home", "Experiences", "Projects"].map((p) => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavClick(p)}
                className={`px-[24px] py-[10px] rounded-[50px] font-sans font-bold text-[14px] cursor-pointer transition-all border shadow-[0_4px_16px_rgba(13,110,253,0.1)] backdrop-blur-[12px] ${
                  page === p
                    ? "bg-gradient-to-r from-[#2b7fff] to-[#0D6EFD] text-white border-transparent shadow-[0_4px_14px_rgba(13,110,253,0.3)]"
                    : "bg-white/95 text-[#4a6a8a] border-[#eef3ff] hover:text-brand-primary hover:border-brand-primary/40"
                }`}
              >
                {p}
              </motion.button>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavClick("Contact")}
              className="px-[26px] py-[10px] rounded-[50px] font-sans font-bold text-[14px] cursor-pointer transition-all border border-brand-primary text-brand-primary bg-white/95 backdrop-blur-[12px] shadow-[0_4px_16px_rgba(13,110,253,0.12)] hover:bg-brand-primary hover:text-white"
            >
              Contact
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
