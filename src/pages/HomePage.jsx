import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ScrollSection from "../components/ScrollSection";
import Hero from "../components/Hero";
import { HomeSkeleton } from "../components/SkeletonLoader";
import HiddenContentModal from "../components/HiddenContentModal";
import ImageModal from "../components/ImageModal";
import { ContentSection, TechSkillsSection, SECTION_ICONS } from "../components/TechSection";
import { supabase, getTransformedUrl } from "../lib/supabase";
import { useBackgroundBlur } from "../context/BackgroundBlurContext";
import { Code2, Heart, Users } from "lucide-react";

// Helper: build stat card data array
const STAT_TEMPLATE = (pCount, views, cheers) => [
  { icon: <Code2 size={16} />, label: "Total Projects", value: pCount || 0 },
  { icon: <Users size={16} />, label: "Profile Views", value: views.toLocaleString() },
  { icon: <Heart size={16} />, label: "Cheer Ups", value: cheers.toLocaleString() },
];

// Default skill lists used as fallback when DB has no data
const DEFAULT_LANGUAGES = ["JavaScript", "TypeScript", "Python", "SQL", "HTML/CSS"];
const DEFAULT_TECHS = ["React.js", "Next.js", "Node.js", "Express", "Tailwind CSS", "Three.js", "Framer Motion"];
const DEFAULT_TOOLS = ["Git", "GitHub", "VS Code", "Supabase", "Postman", "Docker", "Figma"];

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
  const [portfolioLanguages, setPortfolioLanguages] = useState([]);
  const [portfolioTags, setPortfolioTags] = useState([]);
  const [portfolioTools, setPortfolioTools] = useState([]);
  const [hiddenModal, setHiddenModal] = useState({ isOpen: false, title: "", items: [] });

  const projectCountRef = useRef(0);
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
      const extraScroll = h + nav - v + 32;
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
    // Increment page views asynchronously without blocking critical rendering queries
    Promise.resolve(supabase.rpc("increment_views")).catch(() => {});

    const fetchData = async () => {
      try {
        // Fetch dashboard content in parallel
        const [{ count: projectCount }, { data: statsData }, { data: settingsData }, { data: achData }, { data: actData }] = await Promise.all([
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
          const { coding_languages, technologies, tools } = settingsData.about_me;
          setPortfolioLanguages(coding_languages?.length > 0 ? coding_languages : DEFAULT_LANGUAGES);
          setPortfolioTags(technologies?.length > 0 ? technologies : DEFAULT_TECHS);
          setPortfolioTools(tools?.length > 0 ? tools : DEFAULT_TOOLS);
        } else {
          setPortfolioLanguages(DEFAULT_LANGUAGES);
          setPortfolioTags(DEFAULT_TECHS);
          setPortfolioTools(DEFAULT_TOOLS);
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

    // Safely subscribe to site_stats updates with status fallback handler
    const subscription = supabase
      .channel("site_stats_channel")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "site_stats", filter: "id=eq.1" }, (payload) => {
        const { views, cheer_ups } = payload.new;
        setRealStats(STAT_TEMPLATE(projectCountRef.current, views, cheer_ups));
      })
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          // Gracefully ignore realtime connection drops without polluting console logs
        }
      });

    return () => {
      try {
        supabase.removeChannel(subscription);
      } catch (_) {}
    };
  }, []);

  const homeSections = ["achievements", "activities", "technologies-and-tools"];
  const currentActiveSection = homeSections.slice().reverse().find(id => activeSections?.has(id));
  const activeIndex = homeSections.indexOf(currentActiveSection) + 1;
  const totalSections = homeSections.length;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sectionLabels = {
    "achievements": "Achievements",
    "activities": "Activities",
    "technologies-and-tools": "Skills"
  };

  if (isLoading) return <HomeSkeleton />;

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
            icon={SECTION_ICONS.achievements.icon}
            iconBg={SECTION_ICONS.achievements.iconBg}
            iconColor={SECTION_ICONS.achievements.iconColor}
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
            icon={SECTION_ICONS.activities.icon}
            iconBg={SECTION_ICONS.activities.iconBg}
            iconColor={SECTION_ICONS.activities.iconColor}
            title="Activities"
            items={activities}
            setPreviewImage={setPreviewImage}
            setPage={setPage}
            setHiddenModal={setHiddenModal}
            modalTitle="More Activities"
            isMobile={isMobile}
          />

          {/* Technologies & Tools Section */}
          <TechSkillsSection
            portfolioLanguages={portfolioLanguages}
            portfolioTags={portfolioTags}
            portfolioTools={portfolioTools}
            isMobile={isMobile}
          />
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
      <ImageModal
        isOpen={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        items={previewImage ? [previewImage] : []}
      />

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