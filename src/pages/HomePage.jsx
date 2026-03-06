import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Code2 from "lucide-react/dist/esm/icons/code-2";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import Languages from "lucide-react/dist/esm/icons/languages";
import Award from "lucide-react/dist/esm/icons/award";
import User from "lucide-react/dist/esm/icons/user";
import Heart from "lucide-react/dist/esm/icons/heart";
import Users from "lucide-react/dist/esm/icons/users";
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
  // Track currently hovered/clicked tech tag
  const [activeTag, setActiveTag] = useState(null);

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
        const { data: allProjectsData } = await supabase.from("projects").select("tags, tools");
        if (allProjectsData) {
          const counts = {};
          allProjectsData.forEach(p => {
            const items = [...(p.tags || []), ...(p.tools || [])];
            items.forEach(item => {
              // Normalize the string "React" to "React.js" to merge tag counts
              let normalizedItem = item;
              if (item === "React") normalizedItem = "React.js";
              counts[normalizedItem] = (counts[normalizedItem] || 0) + 1;
            });
          });
          setTechCounts(counts);
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
            <div style={styles.heroActionBtnsContainer}>
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(13,110,253,0.35)" }} whileTap={{ scale: 0.95 }} onClick={() => setPage("Projects")} style={styles.heroPrimaryBtn}>
                View My Work →
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage("Contact")} style={styles.heroSecondaryBtn}>
                Contact Me
              </motion.button>
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
          <section style={styles.sectionPadding}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              style={styles.aboutCard}
            >
              <div style={styles.aboutHeaderRow}>
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
                    <div style={styles.aboutItemDesc}>{ABOUT_ME?.languages?.join(" • ")}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Tools and Technologies Used Section */}
          <section style={styles.sectionPadding}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              style={styles.toolsCard}
            >
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
          <section style={styles.dashboardSection}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              style={styles.dashboardContainer}
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