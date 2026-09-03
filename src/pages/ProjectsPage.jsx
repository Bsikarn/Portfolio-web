import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ArrowLeftRight, Search, ArrowDown } from "lucide-react";
import ScrollSection from "../components/ScrollSection";
// Background blur managed inside ScrollSection wrapper
import ProjectMiniCard from "../components/ProjectMiniCard";
import ProjectDetailsCard from "../components/ProjectDetailsCard";
import { ProjectsSkeleton } from "../components/SkeletonLoader";
import { supabase, getTransformedUrl } from "../lib/supabase";
import { styles } from "../styles/ProjectsPage.styles";

function getSortOrder(p) {
  if (p.sort_order !== undefined && p.sort_order !== null && !isNaN(Number(p.sort_order))) {
    return Number(p.sort_order);
  }
  const orderTag = (p.tags || []).find((t) => typeof t === "string" && t.startsWith("__order:"));
  if (orderTag) {
    const num = parseInt(orderTag.replace("__order:", "").replace("__", ""));
    if (!isNaN(num)) return num;
  }
  return 999;
}

// Sort projects: custom sort_order first → awards → recommended → alphabetical
function sortProjects(projects) {
  return [...projects].sort((a, b) => {
    const orderA = getSortOrder(a);
    const orderB = getSortOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    if (!!b.award !== !!a.award) return !!b.award - !!a.award;
    if (!!b.is_recommended !== !!a.is_recommended) return !!b.is_recommended - !!a.is_recommended;
    return a.title.localeCompare(b.title);
  });
}

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const [projectsData, setProjectsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState(["All"]);
  const [isLoading, setIsLoading] = useState(true);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [currentImageLoaded, setCurrentImageLoaded] = useState(false);

  // Reset image loaded state when lightbox index changes
  useEffect(() => {
    setCurrentImageLoaded(false);
  }, [lightboxIndex]);

  // Preload next and previous images in the gallery when the current image is loaded
  useEffect(() => {
    if (currentImageLoaded && lightboxOpen && lightboxItems.length > 1) {
      const nextIdx = (lightboxIndex + 1) % lightboxItems.length;
      const prevIdx = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;

      const nextItem = lightboxItems[nextIdx];
      const prevItem = lightboxItems[prevIdx];

      if (nextItem && nextItem.type === "image") {
        const imgNext = new Image();
        imgNext.src = getTransformedUrl(nextItem.url, { width: 1200 });
      }
      if (prevItem && prevItem.type === "image") {
        const imgPrev = new Image();
        imgPrev.src = getTransformedUrl(prevItem.url, { width: 1200 });
      }
    }
  }, [currentImageLoaded, lightboxIndex, lightboxItems, lightboxOpen]);


  // Drag-to-scroll state
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragDistance = useRef(0);



  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleScroll = () => {
      const detailsEl = document.getElementById("project-details");
      if (detailsEl) {
        const rect = detailsEl.getBoundingClientRect();
        setShowScrollIndicator(rect.top > window.innerHeight - 100);
      } else {
        setShowScrollIndicator(window.scrollY < 120);
      }
    };
    handleScroll();

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
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
          const filtered = catData.filter((c) => c.name !== "Achievement" && c.name !== "Activity" && c.name !== "Experience");
          const sorted = [...filtered].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setCategoriesData(["All", ...sorted.map((c) => c.name)]);
        }

        if (projData) {
          const visible = projData.filter((p) => p.category !== "Achievement" && p.category !== "Activity" && p.category !== "Experience");
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

  if (isLoading) return <ProjectsSkeleton />;

  return (
    <div data-testid="projects-container" style={styles.pageContainer}>
      {/* Sticky Project Selector Background */}
      <div className="sticky top-[64px] z-[1] min-h-[calc(100dvh-64px)] flex flex-col justify-center w-full max-w-[1440px] mx-auto">
        <ScrollSection id="project-selector" className="w-full overflow-hidden relative">
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
                  boxShadow: activeFilter === f 
                    ? "6px 10px 22px rgba(13,110,253,0.32), inset 2px 2px 4px rgba(255,255,255,0.4)" 
                    : "4px 6px 14px rgba(13,110,253,0.05), -3px -3px 8px rgba(255,255,255,0.9), inset 1px 1px 2px rgba(255,255,255,0.8)",
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

      {/* Sliding Curtain Overlay containing Project Detail Card with smooth Fade in-out */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.01 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="relative z-[10] backdrop-blur-[16px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_150px)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_150px)] pt-[150px] pb-[80px]"
      >
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
      </motion.div>



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
                  ? <img
                    src={getTransformedUrl(lightboxItems[lightboxIndex].url, { width: 1200 })}
                    alt="Gallery"
                    loading="lazy"
                    onLoad={() => setCurrentImageLoaded(true)}
                    onError={(e) => { e.target.src = lightboxItems[lightboxIndex].url; }}
                    style={{ ...styles.lightboxImage, aspectRatio: "16/9" }}
                  />
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
        {showScrollIndicator && (
          <div style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            pointerEvents: "none"
          }}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6
              }}
            >
              <div style={{
                fontSize: 11,
                fontFamily: "inherit",
                fontWeight: 600,
                color: "#4a6a8a",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}>
                Scroll down for details
              </div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                style={{ willChange: "transform", color: "#0D6EFD" }}
              >
                <ArrowDown size={20} />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

