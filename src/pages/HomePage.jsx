import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, GraduationCap, Languages, Award, User, Heart, Users, FileText, Trophy, Activity, Image as ImageIcon, FileBadge } from "lucide-react";
import StackedCard from "../components/StackedCard";
import Hero from "../components/Hero";
import { TECHNOLOGIES_TAGS, TOOLS_TAGS, ABOUT_ME } from "../data/constants";
import { supabase } from "../lib/supabase";

export default function HomePage({ setPage }) {
  const [realStats, setRealStats] = useState([
    { icon: <Code2 size={24} />, label: "Total Projects", value: "..." },
    { icon: <Users size={24} />, label: "Profile Views", value: "..." },
    { icon: <Heart size={24} />, label: "Cheer Ups", value: "..." },
  ]);

  const [achievements, setAchievements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const [techCounts, setTechCounts] = useState({});
  const [portfolioLanguages, setPortfolioLanguages] = useState([]);
  const [activeTag, setActiveTag] = useState(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleScroll = () => {
      if (isPdfOpen) setIsPdfOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPdfOpen]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const projectCountRef = useRef(0);
  const workerRef = useRef(null);
  const [aboutMe, setAboutMe] = useState(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL("../lib/worker.js", import.meta.url), { type: "module" });
    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'PROCESS_PROJECT_TAGS_RESULT') {
        setTechCounts(payload.counts);
        setPortfolioLanguages(payload.portfolioLanguages);
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("portfolio_settings").select("about_me").eq("id", 1).single();
      if (data?.about_me) setAboutMe(data.about_me);
    };
    fetchSettings();

    const updateStatsUI = (pCount, views, cheers) => {
      setRealStats([
        { icon: <Code2 size={24} />, label: "Total Projects", value: pCount || 0 },
        { icon: <Users size={24} />, label: "Profile Views", value: views.toLocaleString() },
        { icon: <Heart size={24} />, label: "Cheer Ups", value: cheers.toLocaleString() },
      ]);
    };

    const fetchDashboardStats = async () => {
      try {
        await supabase.rpc('increment_views');
        const { count: projectCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });

        projectCountRef.current = projectCount || 0;

        const { data: statsData } = await supabase
          .from('site_stats')
          .select('*')
          .eq('id', 1)
          .single();

        if (statsData) {
          updateStatsUI(projectCountRef.current, statsData.views, statsData.cheer_ups);
        }

        const { data: allProjectsData } = await supabase.from("projects").select("tags, tools, languages");
        
        const { data: actsData } = await supabase.from("projects").select("*").in("category", ["Achievement", "Activity"]).order("year", { ascending: false }).order("id", { ascending: false });
        if (actsData) {
          setAchievements(actsData.filter(d => d.category === "Achievement"));
          setActivities(actsData.filter(d => d.category === "Activity"));
        }
        
        if (allProjectsData && workerRef.current) {
          workerRef.current.postMessage({
            type: 'PROCESS_PROJECT_TAGS',
            payload: allProjectsData
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchDashboardStats();

    const subscription = supabase
      .channel('site_stats_channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_stats', filter: 'id=eq.1' },
        (payload) => {
          const newData = payload.new;
          updateStatsUI(projectCountRef.current, newData.views, newData.cheer_ups);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="pt-[64px]">
      <StackedCard stickyTop="64px" zIndex={1}>
        <Hero setPage={setPage} isPdfOpen={isPdfOpen} setIsPdfOpen={setIsPdfOpen} />
      </StackedCard>

      <div className="relative z-[2]">
        <div className="flex flex-col gap-0">
          
          {/* About Me */}
          <section className={`max-w-[1440px] mx-auto ${isMobile ? "p-[40px_24px]" : "p-[40px_48px]"}`}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className={`bg-white/80 backdrop-blur-[16px] rounded-[24px] shadow-card-base flex flex-col ${
                isMobile ? "p-[32px_24px] gap-[24px]" : "p-[48px] gap-[32px]"
              }`}
            >
              <div className={`flex ${isMobile ? "flex-col text-center items-center gap-[16px]" : "flex-row items-center gap-[32px]"}`}>
                <div className="w-[120px] h-[120px] rounded-[24px] bg-gradient-to-br from-[#e0f2fe] to-[#fce7f3] flex items-center justify-center text-[48px] shrink-0 shadow-[inset_0_0_0_1px_rgba(163,216,244,0.5)]">
                  <User size={56} color="#A3D8F4" />
                </div>
                <div>
                  <h2 className="font-sans font-extrabold text-[28px] text-brand-dark m-0 mb-[4px]">{(aboutMe || ABOUT_ME)?.name}</h2>
                  <div className="font-sans text-[15px] text-brand-primary font-semibold mb-[12px]">{(aboutMe || ABOUT_ME)?.role}</div>
                  <p className="font-sans text-brand-muted text-[14px] leading-[1.7] m-0 max-w-[800px]">
                    {(aboutMe || ABOUT_ME)?.intro}
                  </p>
                </div>
              </div>

              <hr className="border-none border-t border-dashed border-[#eef3ff]" />

              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-[24px]">
                <div className="flex gap-[16px]">
                  <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center shrink-0 bg-[#f0f6ff] text-brand-primary"><GraduationCap size={20} /></div>
                  <div>
                    <div className="font-sans font-bold text-[14px] text-brand-dark">Education</div>
                    <div className="font-sans text-[13px] text-brand-muted mt-[4px]">{(aboutMe || ABOUT_ME)?.education}</div>
                  </div>
                </div>

                <div className="flex gap-[16px]">
                  <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center shrink-0 bg-[#fff0f4] text-[#ff6b6b]"><Award size={20} /></div>
                  <div>
                    <div className="font-sans font-bold text-[14px] text-brand-dark">GPA</div>
                    <div className="font-sans text-[13px] text-brand-muted mt-[4px]">{(aboutMe || ABOUT_ME)?.gpa}</div>
                  </div>
                </div>

                <div className="flex gap-[16px]">
                  <div className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center shrink-0 bg-[#f0fdf4] text-[#22c55e]"><Languages size={20} /></div>
                  <div>
                    <div className="font-sans font-bold text-[14px] text-brand-dark">Languages</div>
                    <div className="flex flex-wrap gap-[8px] mt-[4px]">
                      {(Array.isArray((aboutMe || ABOUT_ME)?.languages) ? (aboutMe || ABOUT_ME).languages : ((aboutMe || ABOUT_ME)?.languages || "").split(",").map(s => s.trim()).filter(Boolean)).map(lang => (
                        <span key={lang} className="inline-block px-[12px] py-[4px] rounded-[50px] bg-[#f0fdf4]/60 border border-[#bbf7d0] font-sans font-semibold text-[12px] text-[#16a34a]">{lang}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Achievements Card */}
          {(achievements.length > 0 || true) && (
          <section className={`max-w-[1440px] mx-auto ${isMobile ? "p-[0px_24px_40px]" : "p-[0px_48px_40px]"}`}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className={`bg-white/80 backdrop-blur-[16px] rounded-[24px] shadow-card-base flex flex-col ${isMobile ? "p-[32px_24px] gap-[24px]" : "p-[48px] gap-[32px]"}`}
            >
              <div className="flex items-center gap-[16px]">
                <div className="w-[48px] h-[48px] rounded-[16px] bg-gradient-to-br from-[#fff0f4] to-[#ffe4e6] flex items-center justify-center text-[#ff6b6b] shrink-0">
                  <Trophy size={24} />
                </div>
                <h2 className="font-sans font-extrabold text-[28px] text-brand-dark m-0">Achievements & Awards</h2>
              </div>
              <div className="flex flex-col gap-[20px]">
                {achievements.length > 0 ? achievements.map(ach => (
                  <div key={ach.id} className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] p-[20px] bg-[#f8fbff] rounded-[16px] border border-[#eef3ff]">
                    <div>
                      <div className="font-sans font-bold text-[18px] text-brand-dark">{ach.title} {ach.year && <span className="text-[14px] text-brand-muted font-normal ml-[8px]">({ach.year})</span>}</div>
                      <div className="font-sans text-[14px] text-brand-muted mt-[4px]">{ach.description}</div>
                    </div>
                    <div className="flex gap-[12px] shrink-0">
                      <button 
                        onClick={() => { if (ach.gallery && ach.gallery[0]) setPreviewImage(ach.gallery[0]); }} 
                        className={`w-[44px] h-[44px] rounded-[12px] border border-[#eef3ff] flex items-center justify-center shadow-[0_2px_8px_rgba(13,110,253,0.05)] transition-colors ${ach.gallery && ach.gallery[0] ? 'bg-white text-brand-primary hover:bg-[#0D6EFD] hover:text-white cursor-pointer' : 'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-50'}`}
                        title="View Certificate"
                        disabled={!ach.gallery || !ach.gallery[0]}
                      >
                        <FileBadge size={20} />
                      </button>
                      <button 
                        onClick={() => { if (ach.gallery && ach.gallery[1]) setPreviewImage(ach.gallery[1]); }} 
                        className={`w-[44px] h-[44px] rounded-[12px] border border-[#eef3ff] flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.05)] transition-colors ${ach.gallery && ach.gallery[1] ? 'bg-white text-[#10b981] hover:bg-[#10b981] hover:text-white cursor-pointer' : 'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-50'}`}
                        title="View Activity Picture"
                        disabled={!ach.gallery || !ach.gallery[1]}
                      >
                        <ImageIcon size={20} />
                      </button>
                    </div>
                  </div>
                )) : <div className="text-brand-muted text-[14px]">No achievements added yet.</div>}
              </div>
            </motion.div>
          </section>
          )}

          {/* Activities Card */}
          {(activities.length > 0 || true) && (
          <section className={`max-w-[1440px] mx-auto ${isMobile ? "p-[0px_24px_40px]" : "p-[0px_48px_40px]"}`}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className={`bg-white/80 backdrop-blur-[16px] rounded-[24px] shadow-card-base flex flex-col ${isMobile ? "p-[32px_24px] gap-[24px]" : "p-[48px] gap-[32px]"}`}
            >
              <div className="flex items-center gap-[16px]">
                <div className="w-[48px] h-[48px] rounded-[16px] bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] flex items-center justify-center text-[#10b981] shrink-0">
                  <Activity size={24} />
                </div>
                <h2 className="font-sans font-extrabold text-[28px] text-brand-dark m-0">Activities</h2>
              </div>
              <div className="flex flex-col gap-[20px]">
                {activities.length > 0 ? activities.map(act => (
                  <div key={act.id} className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] p-[20px] bg-[#f8fbff] rounded-[16px] border border-[#eef3ff]">
                    <div>
                      <div className="font-sans font-bold text-[18px] text-brand-dark">{act.title} {act.year && <span className="text-[14px] text-brand-muted font-normal ml-[8px]">({act.year})</span>}</div>
                      <div className="font-sans text-[14px] text-brand-muted mt-[4px]">{act.description}</div>
                    </div>
                    <div className="flex gap-[12px] shrink-0">
                      <button 
                        onClick={() => { if (act.gallery && act.gallery[0]) setPreviewImage(act.gallery[0]); }} 
                        className={`w-[44px] h-[44px] rounded-[12px] border border-[#eef3ff] flex items-center justify-center shadow-[0_2px_8px_rgba(13,110,253,0.05)] transition-colors ${act.gallery && act.gallery[0] ? 'bg-white text-brand-primary hover:bg-[#0D6EFD] hover:text-white cursor-pointer' : 'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-50'}`}
                        title="View Certificate"
                        disabled={!act.gallery || !act.gallery[0]}
                      >
                        <FileBadge size={20} />
                      </button>
                      <button 
                        onClick={() => { if (act.gallery && act.gallery[1]) setPreviewImage(act.gallery[1]); }} 
                        className={`w-[44px] h-[44px] rounded-[12px] border border-[#eef3ff] flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.05)] transition-colors ${act.gallery && act.gallery[1] ? 'bg-white text-[#10b981] hover:bg-[#10b981] hover:text-white cursor-pointer' : 'bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-50'}`}
                        title="View Activity Picture"
                        disabled={!act.gallery || !act.gallery[1]}
                      >
                        <ImageIcon size={20} />
                      </button>
                    </div>
                  </div>
                )) : <div className="text-brand-muted text-[14px]">No activities added yet.</div>}
              </div>
            </motion.div>
          </section>
          )}

          {/* Tools Card */}
          <section className={`max-w-[1440px] mx-auto ${isMobile ? "p-[40px_24px]" : "p-[40px_48px]"}`}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className={`bg-white/80 backdrop-blur-[16px] rounded-[24px] shadow-card-base ${isMobile ? "p-[32px_24px]" : "p-[48px]"}`}
            >
              {portfolioLanguages.length > 0 && (
                <>
                  <h2 className="font-sans font-extrabold text-[24px] text-brand-dark mb-[24px] text-center">LANGUAGES</h2>
                  <div className="flex flex-wrap justify-center gap-[12px] mb-[32px] relative">
                    {portfolioLanguages.map((tag, i) => (
                      <motion.button
                        key={tag}
                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        onMouseLeave={() => setActiveTag(null)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: false }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.05, background: "#0D6EFD", color: "white" }}
                        animate={activeTag === tag ? { scale: 1.05, background: "#0D6EFD", color: "white" } : { background: "rgba(255, 255, 255, 0.9)", color: "#4a6a8a" }}
                        className="inline-block px-[20px] py-[10px] rounded-[50px] border border-[#eef3ff] shadow-[0_4px_12px_rgba(13,110,253,0.04)] font-sans font-semibold text-[13px] cursor-pointer transition-colors duration-200"
                      >
                        {activeTag === tag ? `${techCounts[tag] || 0} projects` : tag}
                      </motion.button>
                    ))}
                  </div>
                </>
              )}

              <h2 className="font-sans font-extrabold text-[24px] text-brand-dark mb-[24px] text-center">Technologies</h2>
              <div className="flex flex-wrap justify-center gap-[12px] mb-[32px] relative">
                {TECHNOLOGIES_TAGS?.map((tag, i) => (
                  <motion.button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    onMouseLeave={() => setActiveTag(null)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05, background: "#0D6EFD", color: "white" }}
                    animate={activeTag === tag ? { scale: 1.05, background: "#0D6EFD", color: "white" } : { background: "rgba(255, 255, 255, 0.9)", color: "#4a6a8a" }}
                    className="inline-block px-[20px] py-[10px] rounded-[50px] border border-[#eef3ff] shadow-[0_4px_12px_rgba(13,110,253,0.04)] font-sans font-semibold text-[13px] cursor-pointer transition-colors duration-200"
                  >
                    {activeTag === tag ? `${techCounts[tag] || 0} projects` : tag}
                  </motion.button>
                ))}
              </div>

              <h2 className="font-sans font-extrabold text-[24px] text-brand-dark mb-[24px] text-center mt-[16px]">Tools</h2>
              <div className="flex flex-wrap justify-center gap-[12px] relative">
                {TOOLS_TAGS?.map((tag, i) => (
                  <motion.button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    onMouseLeave={() => setActiveTag(null)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05, background: "#0D6EFD", color: "white" }}
                    animate={activeTag === tag ? { scale: 1.05, background: "#0D6EFD", color: "white" } : { background: "rgba(255, 255, 255, 0.9)", color: "#4a6a8a" }}
                    className="inline-block px-[20px] py-[10px] rounded-[50px] border border-[#eef3ff] shadow-[0_4px_12px_rgba(13,110,253,0.04)] font-sans font-semibold text-[13px] cursor-pointer transition-colors duration-200"
                  >
                    {activeTag === tag ? `${techCounts[tag] || 0} projects` : tag}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Real-Time Dashboard Details */}
          <section className={`max-w-[1440px] mx-auto ${isMobile ? "p-[40px_24px_80px]" : "p-[40px_48px_100px]"}`}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className={`bg-gradient-to-b from-white/80 to-[#f8fbff]/80 backdrop-blur-[16px] rounded-[32px] shadow-card-base border border-brand-secondary/30 ${
                isMobile ? "p-[32px_24px]" : "p-[48px]"
              }`}
            >
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
                    <div className="w-[64px] h-[64px] rounded-full bg-[#f0f6ff] text-brand-primary flex items-center justify-center mx-auto mb-[16px]">
                      {s.icon}
                    </div>
                    <div className="font-sans font-extrabold text-[36px] text-brand-dark leading-none">{s.value}</div>
                    <div className="font-sans text-[13px] text-brand-muted-light font-semibold uppercase tracking-[1px] mt-[12px]">{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

        </div>
      </div>

      {/* Image Preview Modal using Portal to escape stacking context */}
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