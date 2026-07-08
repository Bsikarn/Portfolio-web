import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ArrowLeftRight, Search, ArrowDown, FolderGit2, FileText } from "lucide-react";
import ScrollSection from "../components/ScrollSection";
// Background blur managed inside ScrollSection wrapper
import ProjectMiniCard from "../components/ProjectMiniCard";
import ProjectDetailsCard from "../components/ProjectDetailsCard";
import LoadingPage from "../components/LoadingPage";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/ProjectsPage.styles";

// Sort projects: awards first → recommended → alphabetical
function sortProjects(projects) {
  return [...projects].sort((a, b) => {
    if (!!b.award !== !!a.award) return !!b.award - !!a.award;
    if (!!b.is_recommended !== !!a.is_recommended) return !!b.is_recommended - !!a.is_recommended;
    return a.title.localeCompare(b.title);
  });
}

// Extract gallery from video url for thumbnail background
function getCoverBg(project) {
  if (project.video_url?.includes("youtube.com/embed/")) {
    const videoId = project.video_url.split("embed/")[1].split("?")[0];
    return `linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.2)), url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg) center/cover no-repeat`;
  }
  return "linear-gradient(135deg,#f0f6ff,#e0f2fe)";
}

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [projectsData, setProjectsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState(["All"]);
  const [isLoading, setIsLoading] = useState(true);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Handled automatically via ScrollSection components

  // Drag-to-scroll state
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragDistance = useRef(0);

  // Show back-to-top button when user has scrolled past the selection card, and manage scroll-down indicator visibility
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(true);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      setShowScrollDown(window.scrollY < 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch categories and projects from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: catData }, { data: projData }] = await Promise.all([
          supabase.from("categories").select("*").order("name"),
          supabase.from("projects").select("*"),
        ]);

        if (catData) {
          const filtered = catData.filter((c) => c.name !== "Achievement" && c.name !== "Activity");
          const sorted = [...filtered].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setCategoriesData(["All", ...sorted.map((c) => c.name)]);
        }

        if (projData) {
          const visible = projData.filter((p) => p.category !== "Achievement" && p.category !== "Activity");
          const sorted = sortProjects(visible);
          setProjectsData(sorted);

          // Auto-select from localStorage or default to first
          const targetId = localStorage.getItem("targetProjectId");
          if (targetId) {
            setSelectedId(Number(targetId));
            localStorage.removeItem("targetProjectId");
          } else if (sorted.length > 0) {
            setSelectedId(sorted[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter by category + search
  const filtered = projectsData.filter((p) => {
    const cats = p.category ? p.category.split(",").map((c) => c.trim()) : [];
    const matchCat = activeFilter === "All" || cats.includes(activeFilter);
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const selected = filtered.find((p) => p.id === selectedId) || filtered[0] || null;

  // Reset selection when filter changes and current project is not in filtered list
  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((p) => p.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [activeFilter, searchQuery]);

  // Navigate between projects
  const nav = (dir) => {
    const idx = filtered.findIndex((p) => p.id === selectedId);
    setSelectedId(filtered[(idx + dir + filtered.length) % filtered.length].id);
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    dragDistance.current = 0;
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    dragDistance.current = Math.abs(walk);
  };
  const handleCardClick = (id) => { if (dragDistance.current <= 10) setSelectedId(id); };

  // Lightbox openers
  const openGalleryLightbox = (startIndex) => {
    if (!selected?.gallery?.length) return;
    setLightboxItems(selected.gallery.map((url) => ({ type: "image", url })));
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };
  const openVideoLightbox = () => {
    if (!selected?.video_url) return;
    setLightboxItems([{ type: "video", url: selected.video_url }]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };
  const openAwardLightbox = () => {
    if (!selected?.award?.image_url) return;
    setLightboxItems([{ type: "image", url: selected.award.image_url }]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  const nextLightbox = (e) => { e.stopPropagation(); setLightboxIndex((p) => (p + 1) % lightboxItems.length); };
  const prevLightbox = (e) => { e.stopPropagation(); setLightboxIndex((p) => (p - 1 + lightboxItems.length) % lightboxItems.length); };

  // Warn user if link is missing
  const handleLinkClick = (e, url) => {
    if (!url || url === "#" || url === "") {
      e.preventDefault();
      alert("Link not connected yet. This project is still under development for this channel.");
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div style={styles.pageContainer}>

      {/* Filter Bar and Project Scroll List */}
      <div style={{ maxWidth: 1440, margin: "0 auto", width: "100%" }}>
        <ScrollSection id="project-selector" className="flex flex-col w-full overflow-hidden">
          <div style={styles.filterContainer}>
            {/* Search */}
            <div style={styles.searchBarWrap}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search project name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            {/* Category Tabs */}
            {categoriesData.map((f) => (
              <motion.button
                key={f}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(f)}
                style={{
                  ...styles.filterTab,
                  background: activeFilter === f ? "#0D6EFD" : "white",
                  color: activeFilter === f ? "white" : "#4a6a8a",
                  boxShadow: activeFilter === f ? "0 4px 12px rgba(13,110,253,0.3)" : "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {f}
              </motion.button>
            ))}
          </div>

          {/* Project Scroll List */}
          <div style={styles.mainContentWrapper}>
            <div style={styles.selectionSection}>
              <div
                style={styles.selectionCardOuter}
              >
                <div style={styles.selectionHeading}>Select Project</div>
                {filtered.length === 0 ? (
                  <div style={styles.noProjectsText}>No projects found.</div>
                ) : (
                  <div
                    ref={scrollContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    style={{ ...styles.scrollRow, scrollSnapType: isDragging ? "none" : "x mandatory", cursor: isDragging ? "grabbing" : "grab" }}
                  >
                    <AnimatePresence>
                      {filtered.map((p) => (
                        <ProjectMiniCard key={p.id} project={p} selectedId={selectedId} isDragging={isDragging} handleCardClick={handleCardClick} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
                {filtered.length > 0 && (
                  <div style={styles.scrollHintWrap}>
                    <motion.div animate={{ x: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}>
                      <ArrowLeftRight size={14} />
                    </motion.div>
                    <span>drag left-right to see other projects</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollSection>
      </div>

      {/* Project Detail Card */}
      <div style={styles.mainContentWrapper}>
        <div style={{ ...styles.detailsOuterContainer, padding: isMobile ? "0 16px" : styles.detailsOuterContainer.padding }}>
          <ScrollSection id="project-details" className="w-full" threshold={isMobile ? 0.08 : 0.25}>
            <AnimatePresence mode="wait">
              {selected && (
                <ProjectDetailsCard
                  selected={selected}
                  nav={nav}
                  openVideoLightbox={openVideoLightbox}
                  openAwardLightbox={openAwardLightbox}
                  openGalleryLightbox={openGalleryLightbox}
                  handleLinkClick={handleLinkClick}
                  isMobile={isMobile}
                />
              )}
            </AnimatePresence>
          </ScrollSection>
        </div>
      </div>



      {/* Lightbox — rendered via Portal over document.body */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {lightboxOpen && lightboxItems.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxOpen(false)} style={styles.lightboxOverlay}>
              <X onClick={() => setLightboxOpen(false)} style={styles.lightboxClose} size={36} />
              {lightboxItems.length > 1 && (
                <>
                  <button type="button" onClick={prevLightbox} style={styles.lightboxLeftBtn}><ChevronLeft size={32} /></button>
                  <button type="button" onClick={nextLightbox} style={styles.lightboxRightBtn}><ChevronRight size={32} /></button>
                  <div style={styles.lightboxCounter}>{lightboxIndex + 1} / {lightboxItems.length}</div>
                </>
              )}
              <div onClick={(e) => e.stopPropagation()} style={styles.lightboxContent}>
                {lightboxItems[lightboxIndex].type === "image"
                  ? <img src={lightboxItems[lightboxIndex].url} alt="Gallery" style={{ ...styles.lightboxImage, aspectRatio: "16/9" }} />
                  : <iframe src={lightboxItems[lightboxIndex].url} allowFullScreen style={{ ...styles.lightboxVideo, aspectRatio: "16/9" }} title="Video Player" />
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}



      {/* Scroll Down Indicator */}
      <AnimatePresence>
        {showScrollDown && (
          <div style={{ position: "fixed", bottom: 32, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 200, pointerEvents: "none" }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: "#8aabcc",
                textTransform: "uppercase",
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}>
                Scroll down
                <span style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 2, opacity: 0.7 }}>
                  <FolderGit2 size={12} />
                  <FileText size={12} />
                </span>
              </div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", willChange: "transform" }}
              >
                <ArrowDown size={20} style={{ color: "#0D6EFD" }} />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
