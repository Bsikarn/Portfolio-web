import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Menu, X } from "lucide-react";

export default function Navbar({ page, setPage, onCheerUp, chatOpen, setChatOpen }) {
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
    setPage(p);
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[1000] px-[32px] h-[64px] flex items-center justify-between bg-white/60 backdrop-blur-[20px] border-b border-brand-secondary/25 shadow-[0_2px_20px_rgba(13,110,253,0.07)]">
        
        {/* Left Section: Easter Egg / Interactive Button */}
        <div className="flex items-center flex-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCheerUp}
            aria-label="Cheer up!"
            className="px-[14px] py-[6px] rounded-[50px] bg-gradient-to-br from-brand-accent to-brand-secondary border-none cursor-pointer font-sans font-semibold text-[20px] text-[#1a2a4a] shadow-[0_2px_8px_rgba(163,216,244,0.4)]"
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
          {!isMobile && ["Home", "Projects", "Contact"].map((p) => (
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

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[64px] left-0 right-0 bg-white/95 backdrop-blur-[20px] border-b border-brand-secondary/25 shadow-[0_10px_25px_rgba(13,110,253,0.1)] z-[999] flex flex-col p-[16px]"
          >
            {["Home", "Projects", "Contact"].map((p) => (
              <button
                key={p}
                onClick={() => handleNavClick(p)}
                className={`p-[16px] border-none rounded-[12px] text-center text-[16px] font-sans mb-[8px] ${
                  page === p ? "bg-brand-primary/10 text-brand-primary font-bold" : "bg-transparent text-[#4a6a8a] font-medium"
                }`}
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
