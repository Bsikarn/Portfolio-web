import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Hero({ setPage, isPdfOpen, setIsPdfOpen }) {
  const [links, setLinks] = useState({ resume: "", portfolio: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("portfolio_settings").select("contact_links").eq("id", 1).single();
      if (data?.contact_links) {
        setLinks({ resume: data.contact_links.resume_url || "", portfolio: data.contact_links.portfolio_url || "" });
      }
    };
    fetchSettings();
  }, []);
  return (
    <section className="h-[calc(100vh-64px)] flex flex-col items-center justify-between px-[48px] py-[40px] max-w-[1440px] mx-auto relative z-[1]">
      <div className="shrink-0 z-10 text-center">
        <div className="inline-block px-[20px] py-[8px] rounded-[50px] bg-white/80 border border-brand-primary/15 text-[13px] font-bold text-brand-primary font-sans backdrop-blur-[10px] shadow-[0_4px_12px_rgba(13,110,253,0.08)]">
          👋 Available for hire
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="shrink-0 z-10 flex flex-col items-center gap-[32px]">
        <div className="flex gap-[16px] justify-center relative">
          <AnimatePresence mode="wait">
            {!isPdfOpen ? (
              <motion.div
                key="main-btns"
                className="flex gap-[16px] flex-wrap justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage("Projects")} className="px-[32px] py-[14px] rounded-[50px] bg-brand-primary border-none text-white font-sans font-bold text-[15px] cursor-pointer shadow-hero-primary hover:shadow-hero-primary-hover">
                  View My Work →
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage("Contact")} className="px-[32px] py-[14px] rounded-[50px] bg-white/80 backdrop-blur-[10px] border-2 border-[#eef3ff] text-brand-primary font-sans font-bold text-[15px] cursor-pointer shadow-hero-secondary">
                  Contact Me
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsPdfOpen(true)}
                  className="px-[20px] py-[14px] rounded-[50px] bg-white/80 backdrop-blur-[10px] border-2 border-[#eef3ff] text-brand-primary font-sans font-bold text-[15px] cursor-pointer shadow-hero-secondary flex items-center gap-[8px] relative"
                >
                  <FileText size={18} /> PDF
                </motion.button>
              </motion.div>
            ) : (
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
                  Resume / CV
                </motion.a>
                <motion.a 
                  href={links.portfolio || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => !links.portfolio && e.preventDefault()}
                  className={`px-[32px] py-[14px] rounded-[50px] border-none font-sans font-bold text-[15px] no-underline inline-flex items-center transition-colors ${links.portfolio ? 'bg-brand-primary text-white shadow-hero-primary hover:shadow-hero-primary-hover cursor-pointer' : 'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-70'}`}
                >
                  Portfolio
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scroll Indicator */}
        <div className="flex flex-col items-center gap-[8px] opacity-70">
          <div className="font-sans text-[12px] font-semibold text-brand-muted uppercase tracking-[1px]">View My Profile</div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-[4px] h-[24px] rounded-[2px] bg-gradient-to-b from-brand-primary to-transparent"
          />
        </div>
      </motion.div>
    </section>
  );
}
