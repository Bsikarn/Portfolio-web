import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, GraduationCap, Languages, Award, User, Heart, Users, FileText } from "lucide-react";
import StackedCard from "../components/StackedCard";
import { TECHNOLOGIES_TAGS, TOOLS_TAGS, ABOUT_ME } from "../data/constants";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/HomePage.styles";

export default function HomePage({ setPage }) {
  // State to hold the displayed statistics for the dashboard
  const [realStats, setRealStats] = useState([
    { icon: <Code2 size={24} />, label: "Total Projects", value: "..." },
    { icon: <Users size={24} />, label: "Profile Views", value: "..." },
    { icon: <Heart size={24} />, label: "Cheer Ups", value: "..." },
  ]);

  // State mapping of tools and their respective usage count
  const [techCounts, setTechCounts] = useState({});
  // Track dynamically extracted languages
  const [portfolioLanguages, setPortfolioLanguages] = useState([]);

  // Track currently hovered/clicked tech tag
  const [activeTag, setActiveTag] = useState(null);

  // PDF Dropdown open state
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isPdfOpen) setIsPdfOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPdfOpen]);

  // Responsive layout tracking
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // UseRef for persistent local project count, updated alongside stats
  const projectCountRef = useRef(0);

  useEffect(() => {
    // Helper function to update the stats UI state from the DB data
    const updateStatsUI = (pCount, views, cheers) => {
      setRealStats([
        { icon: <Code2 size={24} />, label: "Total Projects", value: pCount || 0 },
        { icon: <Users size={24} />, label: "Profile Views", value: views.toLocaleString() },
        { icon: <Heart size={24} />, label: "Cheer Ups", value: cheers.toLocaleString() },
      ]);
    };

    // Main logic for fetching data on page mount
    const fetchDashboardStats = async () => {
      try {
        // Increment global profile views via Supabase RPC function
        await supabase.rpc('increment_views');

        // Fetch exact project count
        const { count: projectCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });

        projectCountRef.current = projectCount || 0;

        // Fetch site-wide statistics (for ID 1)
        const { data: statsData } = await supabase
          .from('site_stats')
          .select('*')
          .eq('id', 1)
          .single();

        if (statsData) {
          updateStatsUI(projectCountRef.current, statsData.views, statsData.cheer_ups);
        }

        // Fetch all projects to count occurrences of technologies/tools locally
        const { data: allProjectsData } = await supabase.from("projects").select("tags, tools, languages");
        if (allProjectsData) {
          const counts = {};
          const langSet = new Set();

          allProjectsData.forEach(p => {
            const items = [...(p.tags || []), ...(p.tools || [])];

            if (p.languages) {
              p.languages.forEach(l => {
                langSet.add(l.name);
                counts[l.name] = (counts[l.name] || 0) + 1;
              });
            }

            items.forEach(item => {
              // Normalize the string "React" to "React.js" to merge tag counts
              let normalizedItem = item;
              if (item === "React") normalizedItem = "React.js";
              counts[normalizedItem] = (counts[normalizedItem] || 0) + 1;
            });
          });
          setTechCounts(counts);
          setPortfolioLanguages(Array.from(langSet));
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchDashboardStats();

    // Set up Supabase Realtime subscription to reflect "cheer ups" dynamically
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

    // Clean up channel listener on component unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div style={styles.pageContainer}>
      {/* The StackedCard component gives this section a 3D overlay stacking look */}
      <StackedCard stickyTop="64px" zIndex={1}>
        <section style={styles.heroSection}>
          <div style={styles.heroTopRow}>
            <div style={styles.hireBadge}>👋 Available for hire</div>
          </div>

          {/* Hero Section Call to Action controls */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} style={styles.heroBottomRow}>
            <div style={{ ...styles.heroActionBtnsContainer, position: "relative" }}>
              <AnimatePresence mode="wait">
                {!isPdfOpen ? (
                  <motion.div
                    key="main-btns"
                    style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.button whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(13,110,253,0.35)" }} whileTap={{ scale: 0.95 }} onClick={() => setPage("Projects")} style={styles.heroPrimaryBtn}>
                      View My Work →
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage("Contact")} style={styles.heroSecondaryBtn}>
                      Contact Me
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsPdfOpen(true)}
                      style={styles.dropdownButton}
                    >
                      <FileText size={18} /> PDF
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pdf-btns"
                    style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsPdfOpen(false)} style={styles.heroSecondaryBtn}>
                      ← Back
                    </motion.button>
                    <motion.a href="#" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(13,110,253,0.35)" }} whileTap={{ scale: 0.95 }} style={{ ...styles.heroPrimaryBtn, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                      Resume / CV
                    </motion.a>
                    <motion.a href="#" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(13,110,253,0.35)" }} whileTap={{ scale: 0.95 }} style={{ ...styles.heroPrimaryBtn, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                      Portfolio
                    </motion.a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scroll Indicator Icon */}
            <div style={styles.scrollPrompt}>
              <div style={styles.scrollPromptText}>Scroll down to discover my journey</div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                style={styles.scrollIndicator}
              />
            </div>
          </motion.div>
        </section>
      </StackedCard>

      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={styles.groupedCardsWrapper}>

          {/* "About Me" Resume Card */}
          <section style={{ ...styles.sectionPadding, padding: isMobile ? "40px 24px" : "40px 48px" }}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              style={{ ...styles.aboutCard, padding: isMobile ? "32px 24px" : "48px", gap: isMobile ? 24 : 32 }}
            >
              <div style={{ ...styles.aboutHeaderRow, flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left", gap: isMobile ? 16 : 32 }}>
                <div style={styles.aboutAvatar}>
                  <User size={56} color="#A3D8F4" />
                </div>
                <div>
                  <h2 style={styles.aboutName}>{ABOUT_ME?.name}</h2>
                  <div style={styles.aboutRole}>{ABOUT_ME?.role}</div>
                  <p style={styles.aboutIntro}>
                    {ABOUT_ME?.intro}
                  </p>
                </div>
              </div>

              <hr style={styles.dividerStyle} />

              {/* Education and Skills details */}
              <div style={styles.aboutGridRow}>
                <div style={styles.aboutGridItem}>
                  <div style={{ ...styles.aboutIconBox, background: "#f0f6ff", color: "#0D6EFD" }}><GraduationCap size={20} /></div>
                  <div>
                    <div style={styles.aboutItemTitle}>Education</div>
                    <div style={styles.aboutItemDesc}>{ABOUT_ME?.education}</div>
                  </div>
                </div>

                <div style={styles.aboutGridItem}>
                  <div style={{ ...styles.aboutIconBox, background: "#fff0f4", color: "#ff6b6b" }}><Award size={20} /></div>
                  <div>
                    <div style={styles.aboutItemTitle}>GPA</div>
                    <div style={styles.aboutItemDesc}>{ABOUT_ME?.gpa}</div>
                  </div>
                </div>

                <div style={styles.aboutGridItem}>
                  <div style={{ ...styles.aboutIconBox, background: "#f0fdf4", color: "#22c55e" }}><Languages size={20} /></div>
                  <div>
                    <div style={styles.aboutItemTitle}>Languages</div>
                    <div style={styles.aboutLanguageTagsWrap}>
                      {ABOUT_ME?.languages?.map(lang => (
                        <span key={lang} style={styles.aboutLanguageTag}>{lang}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Empty Experience Card - Hidden until experience data is implemented */}
            {/*
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8, delay: 0.2 }}
              style={{ ...styles.experienceCardWrap, padding: isMobile ? "32px 24px" : "48px" }}
            >
              <h2 style={styles.aboutName}>Experience</h2>
              <p style={styles.experienceEmptyText}>Waiting for you to add experience... ✨</p>
            </motion.div>
            */}
          </section>

          <section style={{ ...styles.sectionPadding, padding: isMobile ? "40px 24px" : "40px 48px" }}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              style={{ ...styles.toolsCard, padding: isMobile ? "32px 24px" : "48px" }}
            >
              {portfolioLanguages.length > 0 && (
                <>
                  <h2 style={styles.toolsHeading}>LANGUAGES</h2>
                  <div style={{ ...styles.toolsWrapContainer, marginBottom: "32px", position: "relative" }}>
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
                        style={styles.toolTag}
                      >
                        {activeTag === tag ? `${techCounts[tag] || 0} projects` : tag}
                      </motion.button>
                    ))}
                  </div>
                </>
              )}

              <h2 style={styles.toolsHeading}>Technologies</h2>
              <div style={{ ...styles.toolsWrapContainer, marginBottom: "32px", position: "relative" }}>
                {/* Dynamically render tags defined in data/constants */}
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
                    style={styles.toolTag}
                  >
                    {/* Conditionally display the total project count over the tool title dynamically */}
                    {activeTag === tag ? `${techCounts[tag] || 0} projects` : tag}
                  </motion.button>
                ))}
              </div>

              <h2 style={{ ...styles.toolsHeading, marginTop: "16px" }}>Tools</h2>
              <div style={styles.toolsWrapContainer}>
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
                    style={styles.toolTag}
                  >
                    {activeTag === tag ? `${techCounts[tag] || 0} projects` : tag}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Real-Time Dashboard Details using Supabase */}
          <section style={{ ...styles.dashboardSection, padding: isMobile ? "40px 24px 80px" : "40px 48px 100px" }}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              style={{ ...styles.dashboardContainer, padding: isMobile ? "32px 24px" : "48px" }}
            >
              <div style={styles.dashboardHeader}>
                <h2 style={styles.dashboardTitle}>Dashboard Overview</h2>
                <p style={styles.dashboardSubtitle}>Real-time statistics of my portfolio</p>
              </div>

              {/* Responsive grid for statistics blocks */}
              <div style={isMobile ? { ...styles.statsGrid, gridTemplateColumns: "1fr" } : styles.statsGrid}>
                {realStats.map((s) => (
                  <motion.div
                    key={s.label}
                    whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(13,110,253,0.12)" }}
                    style={styles.statCard}
                  >
                    <div style={styles.statIconWrap}>
                      {s.icon}
                    </div>
                    <div style={styles.statValue}>{s.value}</div>
                    <div style={styles.statLabel}>{s.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        </div>
      </div>

    </div>
  );
}