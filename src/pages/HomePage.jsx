import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Code2, GraduationCap, Languages, Award, User, Heart, Users } from "lucide-react";
import AnimatedBlob from "../components/AnimatedBlob";
import StackedCard from "../components/StackedCard";
import { TOOLS_TAGS, ABOUT_ME } from "../data/constants";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/HomePage.styles";

export default function HomePage({ setPage }) {
  const [realStats, setRealStats] = useState([
    { icon: <Code2 size={24} />, label: "Total Projects", value: "..." },
    { icon: <Users size={24} />, label: "Profile Views", value: "..." },
    { icon: <Heart size={24} />, label: "Cheer Ups", value: "..." },
  ]);

  const projectCountRef = useRef(0);

  useEffect(() => {
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
    <div style={styles.pageContainer}>
      <StackedCard stickyTop="64px" zIndex={1}>
        <section style={styles.heroSection}>
          <div style={styles.heroTopRow}>
            <div style={styles.hireBadge}>👋 Available for hire</div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} style={styles.canvasContainer}>
            <div style={styles.canvasGlow} />
            <Canvas camera={{ position: [0, 0, 3.5] }} style={styles.fullSize}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <pointLight position={[-5, -5, -5]} color="#ffc8d5" intensity={0.5} />
              <AnimatedBlob />
            </Canvas>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} style={styles.heroBottomRow}>
            <div style={styles.heroActionBtnsContainer}>
              <motion.button whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(13,110,253,0.35)" }} whileTap={{ scale: 0.95 }} onClick={() => setPage("Projects")} style={styles.heroPrimaryBtn}>
                View My Work →
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage("Contact")} style={styles.heroSecondaryBtn}>
                Contact Me
              </motion.button>
            </div>
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
          <section style={styles.sectionPadding}>
            <div style={styles.aboutCard}>
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
            </div>
          </section>

          <section style={styles.sectionPadding}>
            <div style={styles.toolsCard}>
              <h2 style={styles.toolsHeading}>Tools & Technologies</h2>
              <div style={styles.toolsWrapContainer}>
                {TOOLS_TAGS?.map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05, background: "#0D6EFD", color: "white" }}
                    style={styles.toolTag}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>
          </section>

          <section style={styles.dashboardSection}>
            <div style={styles.dashboardContainer}>
              <div style={styles.dashboardHeader}>
                <h2 style={styles.dashboardTitle}>Dashboard Overview</h2>
                <p style={styles.dashboardSubtitle}>Real-time statistics of my portfolio</p>
              </div>

              <div style={styles.statsGrid}>
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
            </div>
          </section>
        </div>
      </div>

    </div>
  );
}