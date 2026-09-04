import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Heart, Users, Trophy, Activity, Image as ImageIcon, FileBadge, Terminal, Database, Palette, Atom, Layers, Server, Sparkles, Boxes, Zap, GitBranch, Code, Send, Container, Figma, Wrench } from "lucide-react";
import ScrollSection from "../components/ScrollSection";
import Hero from "../components/Hero";
import { HomeSkeleton } from "../components/SkeletonLoader";
import HiddenContentModal from "../components/HiddenContentModal";
import { supabase, getTransformedUrl } from "../lib/supabase";
import { useBackgroundBlur } from "../context/BackgroundBlurContext";

// Helper: build stat card data array
const STAT_TEMPLATE = (pCount, views, cheers) => [
  { icon: <Code2 size={16} />, label: "Total Projects", value: pCount || 0 },
  { icon: <Users size={16} />, label: "Profile Views", value: views.toLocaleString() },
  { icon: <Heart size={16} />, label: "Cheer Ups", value: cheers.toLocaleString() },
];

// Helper: determine if a list item should be hidden
const isItemHidden = (item) => item.is_hidden === true || (Array.isArray(item.tags) && item.tags.includes("__hidden__"));

// Helper: Get Icon component matching tech/language/tool name
function getTechIcon(name) {
  const norm = (name || "").toLowerCase().trim();
  
  if (norm.includes("javascript") || norm === "js") {
    return <span className="w-[18px] h-[18px] rounded-[4px] bg-[#f7df1e] text-black font-black text-[9px] flex items-center justify-center shrink-0 leading-none">JS</span>;
  }
  if (norm.includes("typescript") || norm === "ts") {
    return <span className="w-[18px] h-[18px] rounded-[4px] bg-[#3178c6] text-white font-black text-[9px] flex items-center justify-center shrink-0 leading-none">TS</span>;
  }
  if (norm.includes("python")) return <Terminal size={16} className="text-[#3776ab] shrink-0" />;
  if (norm.includes("c++") || norm.includes("cpp") || norm.includes("c#") || norm === "c") return <Code2 size={16} className="text-[#00599c] shrink-0" />;
  if (norm.includes("sql") || norm.includes("postgres") || norm.includes("mysql")) return <Database size={16} className="text-[#336791] shrink-0" />;
  if (norm.includes("html")) return <Code2 size={16} className="text-[#e34f26] shrink-0" />;
  if (norm.includes("css")) return <Palette size={16} className="text-[#1572b6] shrink-0" />;
  if (norm.includes("react")) return <Atom size={16} className="text-[#61dafb] shrink-0" />;
  if (norm.includes("next")) return <Layers size={16} className="text-[#000000] shrink-0" />;
  if (norm.includes("node")) return <Server size={16} className="text-[#339933] shrink-0" />;
  if (norm.includes("express")) return <Server size={16} className="text-[#64748b] shrink-0" />;
  if (norm.includes("tailwind")) return <Sparkles size={16} className="text-[#06b6d4] shrink-0" />;
  if (norm.includes("three") || norm.includes("3d")) return <Boxes size={16} className="text-[#000000] shrink-0" />;
  if (norm.includes("framer") || norm.includes("motion")) return <Zap size={16} className="text-[#0055ff] shrink-0" />;
  if (norm.includes("git")) return <GitBranch size={16} className="text-[#f05032] shrink-0" />;
  if (norm.includes("code") || norm.includes("vs")) return <Code size={16} className="text-[#007acc] shrink-0" />;
  if (norm.includes("supabase")) return <Database size={16} className="text-[#3ecf8e] shrink-0" />;
  if (norm.includes("postman")) return <Send size={16} className="text-[#ff6c37] shrink-0" />;
  if (norm.includes("docker")) return <Container size={16} className="text-[#2496ed] shrink-0" />;
  if (norm.includes("figma")) return <Figma size={16} className="text-[#f24e1e] shrink-0" />;
  if (norm.includes("vite")) return <Zap size={16} className="text-[#646cff] shrink-0" />;
  
  return <Wrench size={16} className="text-[#0D6EFD] shrink-0" />;
}

// Static Non-clickable Tech Badge with crisp icon
const TechBadge = ({ tag }) => (
  <div className="inline-flex items-center gap-[8px] px-[16px] py-[9px] rounded-[50px] bg-white/90 backdrop-blur-[8px] border border-[#eef3ff] shadow-[0_2px_8px_rgba(13,110,253,0.04)] font-sans font-semibold text-[13px] text-[#334155] select-none hover:shadow-[0_4px_12px_rgba(13,110,253,0.08)] transition-all">
    {getTechIcon(tag)}
    <span>{tag}</span>
  </div>
);

const TagButton = ({ tag, activeTag, setActiveTag, techCounts }) => (
  <motion.button
    type="button"
    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
    onMouseLeave={() => setActiveTag(null)}
    whileHover={{ background: "linear-gradient(135deg, #2b7fff 0%, #0D6EFD 100%)", color: "white" }}
    whileTap={{ scale: 0.96 }}
    animate={activeTag === tag
      ? { background: "linear-gradient(135deg, #2b7fff 0%, #0D6EFD 100%)", color: "white" }
      : { background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,246,255,0.85) 100%)", color: "#4a6a8a" }
    }
    className="inline-block px-[20px] py-[10px] rounded-[50px] border border-[#eef3ff] shadow-clay-pill font-sans font-semibold text-[13px] cursor-pointer transition-colors duration-200"
  >
    {activeTag === tag ? `${techCounts[tag] || 0} projects` : tag}
  </motion.button>
);

// Reusable section card for Achievements and Activities with visible/hidden split
const ContentSection = ({ id, icon, iconBg, iconColor, title, items, setPreviewImage, setPage, setHiddenModal, modalTitle, isMobile }) => {
  const visible = items.filter((a) => !isItemHidden(a));
  const hidden = items.filter((a) => isItemHidden(a));
  const cardPad = isMobile ? "p-[32px_24px] gap-[24px]" : "p-[48px] gap-[32px]";
  return (
    <section className={`max-w-[1440px] mx-auto ${isMobile ? "p-[0px_24px_40px]" : "p-[0px_48px_40px]"}`}>
      <ScrollSection id={id} rootMargin="-25% 0px -25% 0px" className={`bg-white/80 backdrop-blur-[16px] rounded-[24px] shadow-card-base flex flex-col ${cardPad}`}>
        <div className="flex items-center gap-[16px]">
          <div className={`w-[48px] h-[48px] rounded-[16px] flex items-center justify-center shrink-0 ${iconBg}`} style={{ color: iconColor }}>{icon}</div>
          <h2 className="font-sans font-extrabold text-[28px] text-brand-dark m-0">{title}</h2>
        </div>
        <div className="flex flex-col gap-[20px]">
          {visible.length > 0
            ? visible.map((item) => <MediaRow key={item.id} item={item} setPreviewImage={setPreviewImage} setPage={setPage} />)
            : <div className="text-brand-muted text-[14px]">No {title.toLowerCase()} added yet.</div>
          }
        </div>
        {hidden.length > 0 && (
          <div className="flex justify-center -mt-[16px] mb-[-16px]">
            <button
              type="button"
              onClick={() => setHiddenModal({ isOpen: true, title: modalTitle, items: hidden })}
              className="px-[16px] py-[6px] rounded-[50px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#334155] border border-[#cbd5e1] text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-[6px] shadow-sm"
            >
              more
            </button>
          </div>
        )}
      </ScrollSection>
    </section>
  );
};

const MediaRow = ({ item, setPreviewImage, setPage }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] p-[20px] bg-[#f8fbff] rounded-[16px] border border-[#eef3ff]">
    <div>
      <div className="font-sans font-bold text-[18px] text-brand-dark flex items-center flex-wrap">
        {item.title}
        {item.year && <span className="text-[14px] text-brand-muted font-normal ml-[8px]">({item.year})</span>}
        {item.link_url && (
          <button
            type="button"
            onClick={() => { localStorage.setItem("targetProjectId", item.link_url || item.id || item.title); setPage("Projects"); }}
            className="ml-[12px] bg-[#eef3ff] text-[#0D6EFD] text-[12px] font-semibold px-[12px] py-[4px] rounded-full hover:bg-[#0D6EFD] hover:text-white transition-colors cursor-pointer"
          >
            Project
          </button>
        )}
      </div>
      <div className="font-sans text-[14px] text-brand-muted mt-[4px]">{item.description}</div>
    </div>
    <div className="flex gap-[12px] shrink-0">
      <button
        type="button"
        onClick={() => item.gallery?.[0] && setPreviewImage(item.gallery[0])}
        disabled={!item.gallery?.[0]}
        aria-label="View Certificate"
        className={`w-[44px] h-[44px] rounded-[12px] border border-[#eef3ff] flex items-center justify-center shadow-[0_2px_8px_rgba(13,110,253,0.05)] transition-colors ${item.gallery?.[0] ? "bg-white text-brand-primary hover:bg-[#0D6EFD] hover:text-white cursor-pointer" : "bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-50"}`}
        title="View Certificate"
      >
        <FileBadge size={20} />
      </button>
      <button
        type="button"
        onClick={() => item.gallery?.[1] && setPreviewImage(item.gallery[1])}
        disabled={!item.gallery?.[1]}
        aria-label="View Activity Picture"
        className={`w-[44px] h-[44px] rounded-[12px] border border-[#eef3ff] flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.05)] transition-colors ${item.gallery?.[1] ? "bg-white text-[#10b981] hover:bg-[#10b981] hover:text-white cursor-pointer" : "bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-50"}`}
        title="View Activity Picture"
      >
        <ImageIcon size={20} />
      </button>
    </div>
  </div>
);

export default function HomePage({ setPage, setContactOpen }) {
  const { activeSections } = useBackgroundBlur();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  const [aboutMe, setAboutMe] = useState(null);
  const [realStats, setRealStats] = useState(STAT_TEMPLATE(0, 0, 0));
  const [achievements, setAchievements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [techCounts, setTechCounts] = useState({});
  const [portfolioLanguages, setPortfolioLanguages] = useState([]);
  const [portfolioTags, setPortfolioTags] = useState([]);
  const [portfolioTools, setPortfolioTools] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [hiddenModal, setHiddenModal] = useState({ isOpen: false, title: "", items: [] });

  const projectCountRef = useRef(0);
  const workerRef = useRef(null);
  const heroRef = useRef(null);

  const [curtainTopSpacer, setCurtainTopSpacer] = useState(0);
  const [stickyTopValue, setStickyTopValue] = useState("64px");

  const updateHeroLayout = useCallback(() => {
    if (!heroRef.current) return;
    const h = heroRef.current.offsetHeight || heroRef.current.clientHeight;
    const v = window.innerHeight;
    const nav = 64;

    if (h + nav <= v) {
      // Large PC: Hero fits inside viewport height
      setStickyTopValue("64px");
      setCurtainTopSpacer(0);
    } else {
      // Laptop / Mobile / Short screen: Hero is taller than viewport height
      const extraScroll = h + nav - v + 32; // Extra distance needed to scroll to bottom of Hero
      setStickyTopValue(`calc(100dvh - ${h}px)`);
      setCurtainTopSpacer(extraScroll);
    }
  }, []);

  useEffect(() => {
    updateHeroLayout();
    window.addEventListener("resize", updateHeroLayout, { passive: true });
    const timer = setTimeout(updateHeroLayout, 400);
    return () => {
      window.removeEventListener("resize", updateHeroLayout);
      clearTimeout(timer);
    };
  }, [updateHeroLayout, realStats, isLoading]);

  // Close PDF viewer on scroll
  useEffect(() => {
    const close = () => isPdfOpen && setIsPdfOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [isPdfOpen]);

  // Track mobile breakpoint
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Increment views and fetch stats in parallel
        const [, { count: projectCount }, { data: statsData }, { data: settingsData }, { data: achData }, { data: actData }] = await Promise.all([
          supabase.rpc("increment_views"),
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("site_stats").select("*").eq("id", 1).single(),
          supabase.from("portfolio_settings").select("about_me").eq("id", 1).single(),
          supabase.from("achievements").select("*").order("year", { ascending: false }).order("id", { ascending: false }),
          supabase.from("activities").select("*").order("year", { ascending: false }).order("id", { ascending: false }),
        ]);

        projectCountRef.current = projectCount || 0;

        if (statsData) setRealStats(STAT_TEMPLATE(projectCountRef.current, statsData.views, statsData.cheer_ups));
        if (settingsData?.about_me) {
          setAboutMe(settingsData.about_me);

          const manualLangs = Array.isArray(settingsData.about_me.coding_languages) && settingsData.about_me.coding_languages.length > 0
            ? settingsData.about_me.coding_languages
            : ["JavaScript", "TypeScript", "Python", "SQL", "HTML/CSS"];

          const manualTechs = Array.isArray(settingsData.about_me.technologies) && settingsData.about_me.technologies.length > 0
            ? settingsData.about_me.technologies
            : ["React.js", "Next.js", "Node.js", "Express", "Tailwind CSS", "Three.js", "Framer Motion"];

          const manualTools = Array.isArray(settingsData.about_me.tools) && settingsData.about_me.tools.length > 0
            ? settingsData.about_me.tools
            : ["Git", "GitHub", "VS Code", "Supabase", "Postman", "Docker", "Figma"];

          setPortfolioLanguages(manualLangs);
          setPortfolioTags(manualTechs);
          setPortfolioTools(manualTools);
        } else {
          setPortfolioLanguages(["JavaScript", "TypeScript", "Python", "SQL", "HTML/CSS"]);
          setPortfolioTags(["React.js", "Next.js", "Node.js", "Express", "Tailwind CSS", "Three.js", "Framer Motion"]);
          setPortfolioTools(["Git", "GitHub", "VS Code", "Supabase", "Postman", "Docker", "Figma"]);
        }

        if (achData) setAchievements(achData);
        if (actData) setActivities(actData);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const subscription = supabase
      .channel("site_stats_channel")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "site_stats", filter: "id=eq.1" }, (payload) => {
        const { views, cheer_ups } = payload.new;
        setRealStats(STAT_TEMPLATE(projectCountRef.current, views, cheer_ups));
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const homeSections = ["achievements", "activities", "technologies-and-tools"];
  const currentActiveSection = homeSections.slice().reverse().find(id => activeSections?.has(id));
  const activeIndex = homeSections.indexOf(currentActiveSection) + 1;
  const totalSections = homeSections.length;

  const prevIndex = activeIndex - 2;
  const prevSectionId = prevIndex >= 0 ? homeSections[prevIndex] : null;
  const nextIndex = activeIndex;
  const nextSectionId = nextIndex < totalSections ? homeSections[nextIndex] : null;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sectionLabels = {
    "achievements": "Achievements",
    "activities": "Activities",
    "technologies-and-tools": "Skills"
  };

  if (isLoading) return <HomeSkeleton />;

  const sectionPad = isMobile ? "p-[40px_24px]" : "p-[40px_48px]";

  return (
    <div className="pt-[64px] relative">
      <div
        ref={heroRef}
        className="sticky z-[1] flex flex-col justify-center transition-[top] duration-150"
        style={{ top: stickyTopValue }}
      >
        <Hero realStats={realStats} setPage={setPage} isPdfOpen={isPdfOpen} setIsPdfOpen={setIsPdfOpen} setContactOpen={setContactOpen} scrollToSection={scrollToSection} />
      </div>

      {curtainTopSpacer > 0 && <div style={{ height: `${curtainTopSpacer}px` }} className="pointer-events-none" />}

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.01 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="relative z-[10] backdrop-blur-[16px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_150px)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_150px)] pt-[150px]"
      >
        <div className="flex flex-col gap-0">
          {/* Achievements Section */}
          <ContentSection
            id="achievements"
            icon={<Trophy size={24} />}
            iconBg="bg-gradient-to-br from-[#fff0f4] to-[#ffe4e6]"
            iconColor="#ff6b6b"
            title="Achievements"
            items={achievements}
            setPreviewImage={setPreviewImage}
            setPage={setPage}
            setHiddenModal={setHiddenModal}
            modalTitle="More Achievements"
            isMobile={isMobile}
          />

          {/* Activities Section */}
          <ContentSection
            id="activities"
            icon={<Activity size={24} />}
            iconBg="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7]"
            iconColor="#10b981"
            title="Activities"
            items={activities}
            setPreviewImage={setPreviewImage}
            setPage={setPage}
            setHiddenModal={setHiddenModal}
            modalTitle="More Activities"
            isMobile={isMobile}
          />

          <section className={`max-w-[1440px] mx-auto ${sectionPad}`}>
            <ScrollSection id="technologies-and-tools" rootMargin="-25% 0px -25% 0px" className={`bg-white/80 backdrop-blur-[16px] rounded-[24px] shadow-card-base ${isMobile ? "p-[32px_24px]" : "p-[48px]"}`}>
              {portfolioLanguages.length > 0 && (
                <>
                  <h2 className="font-sans font-extrabold text-[24px] text-brand-dark mb-[24px] text-center">LANGUAGES</h2>
                  <div className="flex flex-wrap justify-center gap-[12px] mb-[32px]">
                    {portfolioLanguages.map((tag) => <TechBadge key={tag} tag={tag} />)}
                  </div>
                </>
              )}

              {portfolioTags.length > 0 && (
                <>
                  <h2 className="font-sans font-extrabold text-[24px] text-brand-dark mb-[24px] text-center">Technologies</h2>
                  <div className="flex flex-wrap justify-center gap-[12px] mb-[32px]">
                    {portfolioTags.map((tag) => <TechBadge key={tag} tag={tag} />)}
                  </div>
                </>
              )}

              {portfolioTools.length > 0 && (
                <>
                  <h2 className="font-sans font-extrabold text-[24px] text-brand-dark mb-[24px] text-center mt-[16px]">Tools</h2>
                  <div className="flex flex-wrap justify-center gap-[12px]">
                    {portfolioTools.map((tag) => <TechBadge key={tag} tag={tag} />)}
                  </div>
                </>
              )}
            </ScrollSection>
          </section>
        </div>
      </motion.div>

      {/* Hidden Content Modal */}
      <HiddenContentModal
        isOpen={hiddenModal.isOpen}
        onClose={() => setHiddenModal({ ...hiddenModal, isOpen: false })}
        title={hiddenModal.title}
        items={hiddenModal.items}
        setPreviewImage={setPreviewImage}
        setPage={setPage}
      />

      {/* Image Preview Modal */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {previewImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-[24px]"
            >
               <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.4 }}
                src={getTransformedUrl(previewImage, { width: 1200 })}
                alt="Preview"
                loading="lazy"
                onError={(e) => { e.target.src = previewImage; }}
                className="max-w-full max-h-[90vh] rounded-[16px] object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setPreviewImage(null)}
                aria-label="Close preview"
                className="absolute top-[24px] right-[24px] w-[44px] h-[44px] rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Active Section Indicator Float Box */}
      <AnimatePresence>
        {currentActiveSection && sectionLabels[currentActiveSection] && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              pointerEvents: "none"
            }}
          >
            {/* Current Active Indicator Box */}
            <motion.div
              key={currentActiveSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 0.7, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              style={{
                background: "rgba(255, 255, 255, 0.22)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                padding: "8px 18px",
                boxShadow: "0 4px 16px rgba(13, 110, 253, 0.04)",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                color: "#0D6EFD",
                display: "flex",
                alignItems: "center",
                whiteSpace: "nowrap"
              }}
            >
              {sectionLabels[currentActiveSection]}
              <span style={{ color: "#7a9abc", fontWeight: 500, marginLeft: "6px" }}>
                ({activeIndex} / {totalSections})
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}