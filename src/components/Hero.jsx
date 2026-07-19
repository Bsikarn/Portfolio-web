import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowDown } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Hero({ setPage, isPdfOpen, setIsPdfOpen, setContactOpen, scrollToSection }) {
  const [links, setLinks] = useState({ resume: "", portfolio: "" });
  const [showHeroControls, setShowHeroControls] = useState(true);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("portfolio_settings").select("contact_links").eq("id", 1).single();
      if (data?.contact_links) {
        setLinks({
          resume: data.contact_links.resume_url || "",
          cv: data.contact_links.cv_url || "",
          portfolio: data.contact_links.portfolio_url || ""
        });
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowHeroControls(window.scrollY < 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <section className="h-[calc(100dvh-64px)] flex flex-col items-center justify-between px-[24px] md:px-[48px] pt-[40px] pb-[100px] md:pb-[40px] max-w-[1440px] mx-auto relative z-[1]">


      <AnimatePresence>
        {showHeroControls && (
          <div className="fixed bottom-[32px] left-0 right-0 flex flex-col items-center gap-[24px] z-[100] pointer-events-none">
            {/* Buttons Wrap */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-auto flex gap-[16px] justify-center relative"
            >
              <AnimatePresence mode="wait">
                {isPdfOpen ? (
                  <motion.div
                    key="pdf-btns"
                    className="flex gap-[16px] flex-wrap justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsPdfOpen(false)} className="px-[32px] py-[14px] rounded-[50px] bg-white/80 backdrop-blur-[10px] border-2 border-[#eef3ff] text-brand-primary font-sans font-bold text-[15px] cursor-pointer shadow-hero-secondary">
                      ← Back
                    </motion.button>
                    <motion.a 
                      href={links.resume || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => !links.resume && e.preventDefault()}
                      className={`px-[32px] py-[14px] rounded-[50px] border-none font-sans font-bold text-[15px] no-underline inline-flex items-center transition-colors ${links.resume ? 'bg-brand-primary text-white shadow-hero-primary hover:shadow-hero-primary-hover cursor-pointer' : 'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-70'}`}
                    >
                      Resume
                    </motion.a>
                    <motion.a 
                      href={links.cv || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => !links.cv && e.preventDefault()}
                      className={`px-[32px] py-[14px] rounded-[50px] border-none font-sans font-bold text-[15px] no-underline inline-flex items-center transition-colors ${links.cv ? 'bg-brand-primary text-white shadow-hero-primary hover:shadow-hero-primary-hover cursor-pointer' : 'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-70'}`}
                    >
                      CV
                    </motion.a>
                    <motion.a 
                      href={links.portfolio || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => !links.portfolio && e.preventDefault()}
                      className={`px-[32px] py-[14px] rounded-[50px] border-none font-sans font-bold text-[15px] no-underline inline-flex items-center transition-colors ${links.portfolio ? 'bg-brand-primary text-white shadow-hero-primary hover:shadow-hero-primary-hover cursor-pointer' : 'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-70'}`}
                    >
                      Portfolio PDF
                    </motion.a>
                  </motion.div>
                ) : isViewOpen ? (
                  <motion.div
                    key="view-btns"
                    className="flex gap-[16px] flex-wrap justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsViewOpen(false)} className="px-[32px] py-[14px] rounded-[50px] bg-white/80 backdrop-blur-[10px] border-2 border-[#eef3ff] text-brand-primary font-sans font-bold text-[15px] cursor-pointer shadow-hero-secondary">
                      ← Back
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage("Experiences")} className="px-[32px] py-[14px] rounded-[50px] bg-brand-primary border-none text-white font-sans font-bold text-[15px] cursor-pointer shadow-hero-primary hover:shadow-hero-primary-hover">
                      Experiences
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage("Projects")} className="px-[32px] py-[14px] rounded-[50px] bg-brand-primary border-none text-white font-sans font-bold text-[15px] cursor-pointer shadow-hero-primary hover:shadow-hero-primary-hover">
                      Projects
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="main-btns"
                    className="flex gap-[16px] flex-wrap justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      onClick={() => setIsViewOpen(true)} 
                      className="px-[32px] py-[14px] rounded-[50px] bg-brand-primary border-none text-white font-sans font-bold text-[15px] cursor-pointer shadow-hero-primary hover:shadow-hero-primary-hover flex items-center gap-[2px] justify-center"
                    >
                      View My <span className="inline-block w-[24px] h-[16px] border border-white/50 rounded-[4px] mx-[4px] bg-white/15"></span> →
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsPdfOpen(true)}
                      className="px-[20px] py-[14px] rounded-[50px] bg-white/80 backdrop-blur-[10px] border-2 border-[#eef3ff] text-brand-primary font-sans font-bold text-[15px] cursor-pointer shadow-hero-secondary flex items-center gap-[8px] relative"
                    >
                      <FileText size={18} /> PDF
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      onClick={() => setContactOpen(true)} 
                      className="px-[32px] py-[14px] rounded-[50px] bg-white/80 backdrop-blur-[10px] border-2 border-[#eef3ff] text-brand-primary font-sans font-bold text-[15px] cursor-pointer shadow-hero-secondary"
                    >
                      Contact Me
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Shortcuts Indicator Container */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center gap-[12px] pointer-events-auto"
            >
              <div className="flex flex-row flex-wrap justify-center gap-[10px] max-w-[90vw]">
                {[
                  { id: "about-me", label: "About Me", icon: "▼" },
                  { id: "achievements", label: "Certificate", icon: "▼" },
                  { id: "activities", label: "Activities", icon: "▼" }
                ].map((btn) => (
                  <motion.button
                    key={btn.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToSection && scrollToSection(btn.id)}
                    className="px-[18px] py-[9px] rounded-full bg-white/60 backdrop-blur-[10px] border border-[#eef3ff] text-[#4a6a8a] hover:text-brand-primary font-sans font-bold text-[12px] cursor-pointer shadow-[0_4px_16px_rgba(13,110,253,0.04)] hover:shadow-[0_6px_20px_rgba(13,110,253,0.09)] transition-all duration-200 flex items-center gap-[5px]"
                  >
                    <span className="text-[9px] opacity-70">{btn.icon}</span>
                    {btn.label}
                  </motion.button>
                ))}
              </div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="text-brand-primary flex items-center justify-center mt-[4px] pointer-events-none"
                style={{ willChange: "transform" }}
              >
                <ArrowDown size={20} />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
