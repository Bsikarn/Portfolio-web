import { motion, AnimatePresence } from "framer-motion";
import { FileText, GraduationCap, Award, Languages, User, Terminal, ArrowDown, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase, getTransformedUrl } from "../lib/supabase";
import { ABOUT_ME } from "../data/constants";

export default function Hero({ realStats, setPage, isPdfOpen, setIsPdfOpen, setContactOpen }) {
  const [links, setLinks] = useState({ resume: "", cv: "", portfolio: "" });
  const [aboutData, setAboutData] = useState(ABOUT_ME);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [showArrow, setShowArrow] = useState(true);
  const [isEduHovered, setIsEduHovered] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("portfolio_settings").select("contact_links, about_me").eq("id", 1).single();
      if (data?.contact_links) {
        setLinks({
          resume: data.contact_links.resume_url || "",
          cv: data.contact_links.cv_url || "",
          portfolio: data.contact_links.portfolio_url || ""
        });
      }
      if (data?.about_me) {
        setAboutData(data.about_me);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const achievementsEl = document.getElementById("achievements");
    if (!achievementsEl) {
      const handleScroll = () => setShowArrow(window.scrollY < 300);
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }

    // Use IntersectionObserver to avoid forced reflow from getBoundingClientRect
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowArrow(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(achievementsEl);
    return () => observer.disconnect();
  }, []);

  const languagesList = Array.isArray(aboutData?.languages)
    ? aboutData.languages
    : (aboutData?.languages || "").split(",").map((s) => s.trim()).filter(Boolean);

  const eduLogos = (aboutData?.education_logo_url || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  return (
    <section className="min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-[24px] md:px-[48px] pt-[32px] pb-[40px] max-w-[1280px] mx-auto relative z-[1] text-center">
      <div className="flex flex-col items-center justify-center my-auto w-full">
        {/* Role Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-[8px] px-[20px] py-[8px] rounded-full bg-white/90 backdrop-blur-[12px] border border-[#f0e6f6] shadow-[0_6px_20px_rgba(13,110,253,0.08)] font-sans font-bold text-[13px] text-brand-primary mb-[24px]"
        >
          <Terminal size={16} className="text-brand-primary" />
          <span className="tracking-[0.2px]">{aboutData?.role || "Data Engineer & Full-Stack Developer"}</span>
        </motion.div>

        {/* Profile Picture + Prominent Headline Name & Intro */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-[28px] md:gap-[44px] mb-[36px] w-full max-w-[1000px] text-center md:text-left">
          {/* Enhanced Profile Picture Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-[140px] h-[140px] md:w-[175px] md:h-[175px] rounded-[36px] bg-gradient-to-tr from-[#ffc8d5] via-[#d8f3dc] to-[#a3d8f4] p-[4px] shrink-0 shadow-[0_16px_40px_rgba(255,200,213,0.45)] relative group"
          >
            <div className="w-full h-full rounded-[32px] overflow-hidden bg-white flex items-center justify-center border-2 border-white/90 relative">
              {aboutData?.image_url ? (
                <img
                  src={getTransformedUrl(aboutData.image_url, { width: 300 })}
                  alt={aboutData?.name || "Profile"}
                  width="175"
                  height="175"
                  loading="eager"
                  fetchpriority="high"
                  onError={(e) => { e.target.src = aboutData.image_url; }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <User size={64} color="#A3D8F4" />
              )}
            </div>
          </motion.div>

          {/* Prominent Large Headline Name with Gradient & Styling */}
          <div className="flex flex-col items-center md:items-start max-w-[760px]">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-sans font-extrabold text-[38px] sm:text-[50px] md:text-[62px] tracking-[-1.5px] leading-[1.1] mb-[14px] bg-gradient-to-r from-[#0d1b2a] via-[#0D6EFD] to-[#0d1b2a] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(13,110,253,0.12)]"
            >
              {aboutData?.name || "Sikarn Pattarasirimongkol"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-sans text-[15px] md:text-[17px] text-[#334155] font-medium leading-[1.8] m-0"
            >
              {aboutData?.intro}
            </motion.p>
          </div>
        </div>

        {/* Info Cards Grid with Translucent Glassmorphism & Soft Hover Glow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-[20px] w-full max-w-[1000px] mb-[36px] text-left"
        >
          {/* Education */}
          <div
            onMouseEnter={() => setIsEduHovered(true)}
            onMouseLeave={() => setIsEduHovered(false)}
            onClick={() => {
              if (aboutData?.education_url) {
                window.open(aboutData.education_url, "_blank", "noopener,noreferrer");
              }
            }}
            style={{
              boxShadow: "0 4px 16px rgba(13,110,253,0.03), inset 1px 1px 2px rgba(255,255,255,0.6)",
              cursor: aboutData?.education_url ? "pointer" : "default"
            }}
            className="relative flex gap-[14px] items-center p-[16px_20px] rounded-[18px] bg-white/70 backdrop-blur-[12px] border border-[#eef3ff]/80 hover:border-[#0D6EFD]/40 hover:bg-white/90 hover:shadow-[0_6px_20px_rgba(13,110,253,0.12)] transition-all select-none overflow-hidden group"
          >
            {/* Always render Education Text in the flow to establish natural box height */}
            <div className={`flex gap-[14px] items-center w-full transition-opacity duration-200 ${isEduHovered && eduLogos.length > 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
              <div className="w-[44px] h-[44px] rounded-[14px] flex items-center justify-center shrink-0 bg-[#f0f6ff]/90 text-brand-primary shadow-inner">
                <GraduationCap size={22} />
              </div>
              <div>
                <div className="font-sans font-bold text-[13px] text-[#0d1b2a]">Education</div>
                <div className="font-sans text-[12px] text-[#475569] font-medium mt-[2px] leading-tight">{aboutData?.education}</div>
              </div>
            </div>

            {/* Overlay logos when hovered */}
            <AnimatePresence>
              {isEduHovered && eduLogos.length > 0 && (
                <motion.div
                  key="logo-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-10 flex items-center justify-center gap-[8px] p-[6px_14px] bg-white/95 backdrop-blur-[12px] rounded-[18px] overflow-hidden"
                >
                  {eduLogos.map((url, idx) => {
                    const maxWClass = eduLogos.length === 1 ? "max-w-[85%]" : eduLogos.length === 2 ? "max-w-[44%]" : "max-w-[28%]";
                    return (
                      <img
                        key={idx}
                        src={getTransformedUrl(url, { height: 200 })}
                        alt={`Education Logo ${idx + 1}`}
                        onError={(e) => { e.target.src = url; }}
                        className={`max-h-[88%] ${maxWClass} w-auto object-contain shrink min-w-0 drop-shadow-sm`}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GPAX */}
          <div
            style={{
              boxShadow: "0 4px 16px rgba(13,110,253,0.03), inset 1px 1px 2px rgba(255,255,255,0.6)"
            }}
            className="flex gap-[14px] items-center p-[16px_20px] rounded-[18px] bg-white/70 backdrop-blur-[12px] border border-[#eef3ff]/80 hover:border-[#ff6b6b]/40 hover:bg-white/85 hover:shadow-[0_6px_20px_rgba(255,107,107,0.08)] transition-all select-none"
          >
            <div className="w-[44px] h-[44px] rounded-[14px] flex items-center justify-center shrink-0 bg-[#fff0f4]/90 text-[#ff6b6b] shadow-inner">
              <Award size={22} />
            </div>
            <div>
              <div className="font-sans font-bold text-[13px] text-[#0d1b2a]">GPAX</div>
              <div className="font-sans font-bold text-[14px] text-[#0d1b2a] mt-[2px]">{aboutData?.gpax || aboutData?.gpa}</div>
            </div>
          </div>

          {/* Languages */}
          <div
            style={{
              boxShadow: "0 4px 16px rgba(13,110,253,0.03), inset 1px 1px 2px rgba(255,255,255,0.6)"
            }}
            className="flex gap-[14px] items-center p-[16px_20px] rounded-[18px] bg-white/70 backdrop-blur-[12px] border border-[#eef3ff]/80 hover:border-[#22c55e]/40 hover:bg-white/85 hover:shadow-[0_6px_20px_rgba(34,197,94,0.08)] transition-all select-none"
          >
            <div className="w-[44px] h-[44px] rounded-[14px] flex items-center justify-center shrink-0 bg-[#f0fdf4]/90 text-[#22c55e] shadow-inner">
              <Languages size={22} />
            </div>
            <div>
              <div className="font-sans font-bold text-[13px] text-[#0d1b2a]">Languages</div>
              <div className="flex flex-wrap gap-[6px] mt-[4px]">
                {languagesList.map((lang) => (
                  <span key={lang} className="inline-block px-[10px] py-[3px] rounded-[50px] bg-[#f0fdf4]/90 border border-[#bbf7d0] font-sans font-bold text-[11px] text-[#16a34a]">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex gap-[16px] justify-center relative w-full mb-[12px]"
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsPdfOpen(false)}
                  className="px-[32px] py-[14px] rounded-[50px] bg-gradient-to-br from-white/95 via-white/85 to-[#f0f6ff]/80 backdrop-blur-[10px] border-2 border-[#eef3ff] text-brand-primary font-sans font-bold text-[15px] cursor-pointer shadow-clay-pill"
                >
                  ← Back
                </motion.button>
                <motion.a 
                  href={links.resume || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => !links.resume && e.preventDefault()}
                  whileHover={{ scale: links.resume ? 1.05 : 1 }}
                  whileTap={{ scale: links.resume ? 0.95 : 1 }}
                  className={`px-[32px] py-[14px] rounded-[50px] border-none font-sans font-bold text-[15px] no-underline inline-flex items-center transition-all ${links.resume ? 'bg-gradient-to-br from-[#2b7fff] via-[#0D6EFD] to-[#0a58ca] text-white shadow-clay-btn hover:shadow-clay-btn-hover cursor-pointer' : 'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-70'}`}
                >
                  Resume
                </motion.a>
                <motion.a 
                  href={links.cv || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => !links.cv && e.preventDefault()}
                  whileHover={{ scale: links.cv ? 1.05 : 1 }}
                  whileTap={{ scale: links.cv ? 0.95 : 1 }}
                  className={`px-[32px] py-[14px] rounded-[50px] border-none font-sans font-bold text-[15px] no-underline inline-flex items-center transition-all ${links.cv ? 'bg-gradient-to-br from-[#2b7fff] via-[#0D6EFD] to-[#0a58ca] text-white shadow-clay-btn hover:shadow-clay-btn-hover cursor-pointer' : 'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-70'}`}
                >
                  CV
                </motion.a>
                <motion.a 
                  href={links.portfolio || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => !links.portfolio && e.preventDefault()}
                  whileHover={{ scale: links.portfolio ? 1.05 : 1 }}
                  whileTap={{ scale: links.portfolio ? 0.95 : 1 }}
                  className={`px-[32px] py-[14px] rounded-[50px] border-none font-sans font-bold text-[15px] no-underline inline-flex items-center transition-all ${links.portfolio ? 'bg-gradient-to-br from-[#2b7fff] via-[#0D6EFD] to-[#0a58ca] text-white shadow-clay-btn hover:shadow-clay-btn-hover cursor-pointer' : 'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-70'}`}
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsViewOpen(false)}
                  className="px-[32px] py-[14px] rounded-[50px] bg-gradient-to-br from-white/95 via-white/85 to-[#f0f6ff]/80 backdrop-blur-[10px] border-2 border-[#eef3ff] text-brand-primary font-sans font-bold text-[15px] cursor-pointer shadow-clay-pill"
                >
                  ← Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage("Experiences")}
                  className="px-[32px] py-[14px] rounded-[50px] bg-gradient-to-br from-[#2b7fff] via-[#0D6EFD] to-[#0a58ca] border-none text-white font-sans font-bold text-[15px] cursor-pointer shadow-clay-btn hover:shadow-clay-btn-hover"
                >
                  Experiences
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage("Projects")}
                  className="px-[32px] py-[14px] rounded-[50px] bg-gradient-to-br from-[#2b7fff] via-[#0D6EFD] to-[#0a58ca] border-none text-white font-sans font-bold text-[15px] cursor-pointer shadow-clay-btn hover:shadow-clay-btn-hover"
                >
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
                  className="px-[32px] py-[14px] rounded-[50px] bg-gradient-to-br from-[#2b7fff] via-[#0D6EFD] to-[#0a58ca] border-none text-white font-sans font-bold text-[15px] cursor-pointer shadow-clay-btn hover:shadow-clay-btn-hover flex items-center gap-[2px] justify-center"
                >
                  View My <span className="inline-block w-[24px] h-[16px] border border-white/50 rounded-[4px] mx-[4px] bg-white/20 shadow-inner"></span> →
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsPdfOpen(true)}
                  className="px-[20px] py-[14px] rounded-[50px] bg-gradient-to-br from-white/95 via-white/85 to-[#f0f6ff]/80 backdrop-blur-[10px] border-2 border-[#eef3ff] text-brand-primary font-sans font-bold text-[15px] cursor-pointer shadow-clay-pill flex items-center gap-[8px] relative"
                >
                  <FileText size={18} /> PDF
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => setContactOpen(true)} 
                  className="px-[32px] py-[14px] rounded-[50px] bg-gradient-to-br from-white/95 via-white/85 to-[#f0f6ff]/80 backdrop-blur-[10px] border-2 border-[#eef3ff] text-brand-primary font-sans font-bold text-[15px] cursor-pointer shadow-clay-pill"
                >
                  Contact Me
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Unified 3-Compartment Stat Bar (Single Pill Container - 20% Narrower) */}
        {realStats && realStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="inline-flex items-center justify-center p-[3px_6px] rounded-[18px] bg-white/70 backdrop-blur-[12px] border border-[#eef3ff] shadow-[0_2px_10px_rgba(13,110,253,0.03)] mt-[10px] w-full max-w-[350px]"
          >
            {realStats.map((s, idx) => (
              <div
                key={s.label}
                className={`flex-1 flex items-center justify-center gap-[5px] px-[4px] py-[3px] ${
                  idx < realStats.length - 1 ? "border-r border-[#e2e8f0]/60" : ""
                }`}
              >
                <div className="w-[22px] h-[22px] rounded-full bg-[#f0f6ff] text-[#0D6EFD] flex items-center justify-center shrink-0 opacity-80">
                  {s.icon}
                </div>
                <div className="text-left">
                  <div className="font-sans font-bold text-[12px] text-[#475569] leading-none">{s.value}</div>
                  <div className="font-sans text-[9px] sm:text-[10px] text-[#94a3b8] font-medium leading-tight whitespace-nowrap mt-[1px]">{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Fixed Bouncing Down Arrow attached at screen bottom center until scrolled */}
      <AnimatePresence>
        {showArrow && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              opacity: { duration: 0.3 },
              y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
            }}
            className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[90] text-[#5a7a9a]/60 flex items-center justify-center pointer-events-none"
            style={{ willChange: "transform" }}
          >
            <ArrowDown size={22} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
