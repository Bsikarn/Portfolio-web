import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, GraduationCap, Languages, Award, User, Heart, Users, Trophy, Activity, Image as ImageIcon, FileBadge } from "lucide-react";
import StackedCard from "../components/StackedCard";
import Hero from "../components/Hero";
import LoadingPage from "../components/LoadingPage";
import { TECHNOLOGIES_TAGS, TOOLS_TAGS, ABOUT_ME } from "../data/constants";
import { supabase } from "../lib/supabase";

// Helper: merge DB about_me with constants fallback
const getAbout = (dbAbout) => dbAbout || ABOUT_ME;

// Helper: build stat card data array
const STAT_TEMPLATE = (pCount, views, cheers) => [
  { icon: <Code2 size={24} />, label: "Total Projects", value: pCount || 0 },
  { icon: <Users size={24} />, label: "Profile Views", value: views.toLocaleString() },
  { icon: <Heart size={24} />, label: "Cheer Ups", value: cheers.toLocaleString() },
];

// Module-level components — defined OUTSIDE the page function to prevent
// React from treating them as new types on every re-render (unmount bug)
const AnimatedSection = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
    className={className}
  >
    {children}
  </motion.div>
);

const TagButton = ({ tag, index, activeTag, setActiveTag, techCounts }) => (
  <motion.button
    type="button"
    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
    onMouseLeave={() => setActiveTag(null)}
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ scale: 1.05, background: "#0D6EFD", color: "white" }}
    animate={activeTag === tag
      ? { scale: 1.05, background: "#0D6EFD", color: "white" }
      : { background: "rgba(255,255,255,0.9)", color: "#4a6a8a" }
    }
    className="inline-block px-[20px] py-[10px] rounded-[50px] border border-[#eef3ff] shadow-[0_4px_12px_rgba(13,110,253,0.04)] font-sans font-semibold text-[13px] cursor-pointer transition-colors duration-200"
  >
    {activeTag === tag ? `${techCounts[tag] || 0} projects` : tag}
  </motion.button>
);

const MediaRow = ({ item, setPreviewImage, setPage }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] p-[20px] bg-[#f8fbff] rounded-[16px] border border-[#eef3ff]">
    <div>
      <div className="font-sans font-bold text-[18px] text-brand-dark flex items-center flex-wrap">
        {item.title}
        {item.year && <span className="text-[14px] text-brand-muted font-normal ml-[8px]">({item.year})</span>}
        {item.link_url && (
          <button
            type="button"
            onClick={() => { localStorage.setItem("targetProjectId", item.link_url); setPage("Projects"); }}
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
        className={`w-[44px] h-[44px] rounded-[12px] border border-[#eef3ff] flex items-center justify-center shadow-[0_2px_8px_rgba(13,110,253,0.05)] transition-colors ${item.gallery?.[0] ? "bg-white text-brand-primary hover:bg-[#0D6EFD] hover:text-white cursor-pointer" : "bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-50"}`}
        title="View Certificate"
      >
        <FileBadge size={20} />
      </button>
      <button
        type="button"
        onClick={() => item.gallery?.[1] && setPreviewImage(item.gallery[1])}
        disabled={!item.gallery?.[1]}
        className={`w-[44px] h-[44px] rounded-[12px] border border-[#eef3ff] flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.05)] transition-colors ${item.gallery?.[1] ? "bg-white text-[#10b981] hover:bg-[#10b981] hover:text-white cursor-pointer" : "bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-50"}`}
        title="View Activity Picture"
      >
        <ImageIcon size={20} />
      </button>
    </div>
  </div>
);

export default function HomePage({ setPage }) {
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
  const [activeTag, setActiveTag] = useState(null);

  const projectCountRef = useRef(0);
  const workerRef = useRef(null);

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

  // Initialize Web Worker for tag processing
  useEffect(() => {
    workerRef.current = new Worker(new URL("../lib/worker.js", import.meta.url), { type: "module" });
    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === "PROCESS_PROJECT_TAGS_RESULT") {
        setTechCounts(payload.counts);
        setPortfolioLanguages(payload.portfolioLanguages);
      }
    };
    return () => workerRef.current?.terminate();
  }, []);

  // Fetch all dashboard data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Increment views and fetch stats in parallel
        const [, { count: projectCount }, { data: statsData }, { data: settingsData }, { data: actsData }, { data: allProjectsData }] = await Promise.all([
          supabase.rpc("increment_views"),
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("site_stats").select("*").eq("id", 1).single(),
          supabase.from("portfolio_settings").select("about_me").eq("id", 1).single(),
          supabase.from("projects").select("*").in("category", ["Achievement", "Activity"]).order("year", { ascending: false }).order("id", { ascending: false }),
          supabase.from("projects").select("tags, tools, languages"),
        ]);

        projectCountRef.current = projectCount || 0;

        if (statsData) setRealStats(STAT_TEMPLATE(projectCountRef.current, statsData.views, statsData.cheer_ups));
        if (settingsData?.about_me) setAboutMe(settingsData.about_me);
        if (actsData) {
          setAchievements(actsData.filter((d) => d.category === "Achievement"));
          setActivities(actsData.filter((d) => d.category === "Activity"));
        }
        if (allProjectsData && workerRef.current) {
          workerRef.current.postMessage({ type: "PROCESS_PROJECT_TAGS", payload: allProjectsData });
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Realtime subscription for live stats updates
    const subscription = supabase
      .channel("site_stats_channel")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "site_stats", filter: "id=eq.1" }, (payload) => {
        const { views, cheer_ups } = payload.new;
        setRealStats(STAT_TEMPLATE(projectCountRef.current, views, cheer_ups));
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  if (isLoading) return <LoadingPage />;

  const about = getAbout(aboutMe);
  const sectionPad = isMobile ? "p-[40px_24px]" : "p-[40px_48px]";
  const cardPad = isMobile ? "p-[32px_24px] gap-[24px]" : "p-[48px] gap-[32px]";

  return (
    <div className="pt-[64px]">
      <StackedCard stickyTop="64px" zIndex={1}>
        <Hero setPage={setPage} isPdfOpen={isPdfOpen} setIsPdfOpen={setIsPdfOpen} />
      </StackedCard>

      <div className="relative z-[2]">
        <div className="flex flex-col gap-0">

          {/* About Me */}
          <section className={`max-w-[1440px] mx-auto ${sectionPad}`}>
            <AnimatedSection className={`bg-white/80 backdrop-blur-[16px] rounded-[24px] shadow-card-base flex flex-col ${cardPad}`}>
              <div className={`flex ${isMobile ? "flex-col text-center items-center gap-[16px]" : "flex-row items-center gap-[32px]"}`}>
                <div className="w-[120px] h-[120px] rounded-[24px] bg-gradient-to-br from-[#e0f2fe] to-[#fce7f3] flex items-center justify-center text-[48px] shrink-0 shadow-[inset_0_0_0_1px_rgba(163,216,244,0.5)] overflow-hidden">
                  {about?.image_url ? (
                    <img src={about.image_url} alt={about?.name || "Profile"} className="w-full h-full object-cover" />
                  ) : (
                    <User size={56} color="#A3D8F4" />
                  )}
                </div>
                <div>
                  <h2 className="font-sans font-extrabold text-[28px] text-brand-dark m-0 mb-[4px]">{about?.name}</h2>
                  <div className="font-sans text-[15px] text-brand-primary font-semibold mb-[12px]">{about?.role}</div>
                  <p className="font-sans text-brand-muted text-[14px] leading-[1.7] m-0 max-w-[800px]">{about?.intro}</p>
                </div>
              </div>

              <hr className="border-none border-t border-dashed border-[#eef3ff]" />

              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[24px]">
                {/* Education */}
                <div className="flex gap-[16px]">
                  <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center shrink-0 bg-[#f0f6ff] text-brand-primary"><GraduationCap size={20} /></div>
                  <div>
                    <div className="font-sans font-bold text-[14px] text-brand-dark">Education</div>
                    <div className="font-sans text-[13px] text-brand-muted mt-[4px]">{about?.education}</div>
                  </div>
                </div>
                {/* GPA */}
                <div className="flex gap-[16px]">
                  <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center shrink-0 bg-[#fff0f4] text-[#ff6b6b]"><Award size={20} /></div>
                  <div>
                    <div className="font-sans font-bold text-[14px] text-brand-dark">GPA</div>
                    <div className="font-sans text-[13px] text-brand-muted mt-[4px]">{about?.gpa}</div>
                  </div>
                </div>
                {/* Languages */}
                <div className="flex gap-[16px]">
                  <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center shrink-0 bg-[#f0fdf4] text-[#22c55e]"><Languages size={20} /></div>
                  <div>
                    <div className="font-sans font-bold text-[14px] text-brand-dark">Languages</div>
                    <div className="flex flex-wrap gap-[8px] mt-[4px]">
                      {(Array.isArray(about?.languages) ? about.languages : (about?.languages || "").split(",").map((s) => s.trim()).filter(Boolean)).map((lang) => (
                        <span key={lang} className="inline-block px-[12px] py-[4px] rounded-[50px] bg-[#f0fdf4]/60 border border-[#bbf7d0] font-sans font-semibold text-[12px] text-[#16a34a]">{lang}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </section>

          {/* Achievements */}
          <section className={`max-w-[1440px] mx-auto ${isMobile ? "p-[0px_24px_40px]" : "p-[0px_48px_40px]"}`}>
            <AnimatedSection className={`bg-white/80 backdrop-blur-[16px] rounded-[24px] shadow-card-base flex flex-col ${cardPad}`}>
              <div className="flex items-center gap-[16px]">
                <div className="w-[48px] h-[48px] rounded-[16px] bg-gradient-to-br from-[#fff0f4] to-[#ffe4e6] flex items-center justify-center text-[#ff6b6b] shrink-0"><Trophy size={24} /></div>
                <h2 className="font-sans font-extrabold text-[28px] text-brand-dark m-0">Achievements</h2>
              </div>
              <div className="flex flex-col gap-[20px]">
                {achievements.length > 0
                  ? achievements.map((ach) => <MediaRow key={ach.id} item={ach} setPreviewImage={setPreviewImage} setPage={setPage} />)
                  : <div className="text-brand-muted text-[14px]">No achievements added yet.</div>
                }
              </div>
            </AnimatedSection>
          </section>

          {/* Activities */}
          <section className={`max-w-[1440px] mx-auto ${isMobile ? "p-[0px_24px_40px]" : "p-[0px_48px_40px]"}`}>
            <AnimatedSection className={`bg-white/80 backdrop-blur-[16px] rounded-[24px] shadow-card-base flex flex-col ${cardPad}`}>
              <div className="flex items-center gap-[16px]">
                <div className="w-[48px] h-[48px] rounded-[16px] bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] flex items-center justify-center text-[#10b981] shrink-0"><Activity size={24} /></div>
                <h2 className="font-sans font-extrabold text-[28px] text-brand-dark m-0">Activities</h2>
              </div>
              <div className="flex flex-col gap-[20px]">
                {activities.length > 0
                  ? activities.map((act) => <MediaRow key={act.id} item={act} setPreviewImage={setPreviewImage} setPage={setPage} />)
                  : <div className="text-brand-muted text-[14px]">No activities added yet.</div>
                }
              </div>
            </AnimatedSection>
          </section>

          {/* Technologies & Tools */}
          <section className={`max-w-[1440px] mx-auto ${sectionPad}`}>
            <AnimatedSection className={`bg-white/80 backdrop-blur-[16px] rounded-[24px] shadow-card-base ${isMobile ? "p-[32px_24px]" : "p-[48px]"}`}>
              {portfolioLanguages.length > 0 && (
                <>
                  <h2 className="font-sans font-extrabold text-[24px] text-brand-dark mb-[24px] text-center">LANGUAGES</h2>
                  <div className="flex flex-wrap justify-center gap-[12px] mb-[32px]">
                    {portfolioLanguages.map((tag, i) => <TagButton key={tag} tag={tag} index={i} activeTag={activeTag} setActiveTag={setActiveTag} techCounts={techCounts} />)}
                  </div>
                </>
              )}

              <h2 className="font-sans font-extrabold text-[24px] text-brand-dark mb-[24px] text-center">Technologies</h2>
              <div className="flex flex-wrap justify-center gap-[12px] mb-[32px]">
                {TECHNOLOGIES_TAGS?.map((tag, i) => <TagButton key={tag} tag={tag} index={i} activeTag={activeTag} setActiveTag={setActiveTag} techCounts={techCounts} />)}
              </div>

              <h2 className="font-sans font-extrabold text-[24px] text-brand-dark mb-[24px] text-center mt-[16px]">Tools</h2>
              <div className="flex flex-wrap justify-center gap-[12px]">
                {TOOLS_TAGS?.map((tag, i) => <TagButton key={tag} tag={tag} index={i} activeTag={activeTag} setActiveTag={setActiveTag} techCounts={techCounts} />)}
              </div>
            </AnimatedSection>
          </section>

          {/* Dashboard Stats */}
          <section className={`max-w-[1440px] mx-auto ${isMobile ? "p-[40px_24px_80px]" : "p-[40px_48px_100px]"}`}>
            <AnimatedSection className={`bg-gradient-to-b from-white/80 to-[#f8fbff]/80 backdrop-blur-[16px] rounded-[32px] shadow-card-base border border-brand-secondary/30 ${isMobile ? "p-[32px_24px]" : "p-[48px]"}`}>
              <div className="text-center mb-[32px]">
                <h2 className="font-sans font-extrabold text-[24px] text-brand-dark m-0 mb-[8px]">Dashboard Overview</h2>
                <p className="font-sans text-brand-muted-light text-[14px]">Real-time statistics of my portfolio</p>
              </div>
              <div className={`grid gap-[24px] ${isMobile ? "grid-cols-1" : "grid-cols-3"}`}>
                {realStats.map((s) => (
                  <motion.div
                    key={s.label}
                    whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(13,110,253,0.12)" }}
                    className="bg-white/80 rounded-[24px] p-[32px_24px] shadow-[0_4px_16px_rgba(13,110,253,0.05)] text-center border border-[#eef3ff]"
                  >
                    <div className="w-[64px] h-[64px] rounded-full bg-[#f0f6ff] text-brand-primary flex items-center justify-center mx-auto mb-[16px]">{s.icon}</div>
                    <div className="font-sans font-extrabold text-[36px] text-brand-dark leading-none">{s.value}</div>
                    <div className="font-sans text-[13px] text-brand-muted-light font-semibold uppercase tracking-[1px] mt-[12px]">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </section>

        </div>
      </div>

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
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] rounded-[16px] object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-[24px] right-[24px] w-[44px] h-[44px] rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}