import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ArrowLeftRight, Search, ArrowDown, Minimize2 } from "lucide-react";
import ScrollSection from "../components/ScrollSection";
// Background blur managed inside ScrollSection wrapper
import ProjectMiniCard from "../components/ProjectMiniCard";
import ProjectDetailsCard from "../components/ProjectDetailsCard";
import ImageModal from "../components/ImageModal";
import { ProjectsSkeleton } from "../components/SkeletonLoader";
import { supabase, getTransformedUrl } from "../lib/supabase";
import { getSortOrder } from "../lib/adminHelpers";
import { styles } from "../styles/ProjectsPage.styles";

// Sort projects: strictly by sort_order / __order tag first, then by id
function sortProjects(projects) {
  return [...projects].sort((a, b) => {
    const orderA = getSortOrder(a);
    const orderB = getSortOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.id - b.id;
  });
}

// Helper function to normalize strings for robust fuzzy comparison (handles URLs, titles, IDs, slugs)
function cleanStr(str) {
  if (!str || (typeof str !== "string" && typeof str !== "number")) return "";
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "")
    .replace(/[^a-z0-9]/g, "");
}

// Robust multi-pass project matching helper
function findMatchedProject(rawTarget, projects) {
  if (!rawTarget || !projects || projects.length === 0) return null;

  const targetStr = String(rawTarget).trim();
  const targetClean = cleanStr(targetStr);
  const targetNum = Number(targetStr);

  // 1. Direct Numeric ID match
  if (!isNaN(targetNum) && targetNum > 0) {
    const byId = projects.find((p) => Number(p.id) === targetNum);
    if (byId) return byId;
  }

  // 2. String ID match
  const byStringId = projects.find((p) => String(p.id) === targetStr);
  if (byStringId) return byStringId;

  // 3. Clean Normalized Match (Title, Link URL, GitHub URL)
  if (targetClean) {
    const byClean = projects.find((p) => {
      if (cleanStr(p.title) === targetClean) return true;
      if (p.link_url && cleanStr(p.link_url) === targetClean) return true;
      if (p.github_url && cleanStr(p.github_url) === targetClean) return true;
      return false;
    });
    if (byClean) return byClean;
  }

  // 4. Clean Substring / Partial Match
  if (targetClean.length >= 2) {
    const bySubstring = projects.find((p) => {
      const pTitleClean = cleanStr(p.title);
      const pLinkClean = cleanStr(p.link_url);
      const pGitClean = cleanStr(p.github_url);
      return (
        (pTitleClean && (pTitleClean.includes(targetClean) || targetClean.includes(pTitleClean))) ||
        (pLinkClean && (pLinkClean.includes(targetClean) || targetClean.includes(pLinkClean))) ||
        (pGitClean && (pGitClean.includes(targetClean) || targetClean.includes(pGitClean)))
      );
    });
    if (bySubstring) return bySubstring;
  }

  return null;
}

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

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

  // Toggle filter logic: unselect if clicked again (except 'All')
  const handleFilterClick = (f) => {
    localStorage.removeItem("targetProjectId");
    const nextFilter = activeFilter === f && f !== "All" ? "All" : f;
    setActiveFilter(nextFilter);
    const newFiltered = projectsData.filter((p) => {
      const cats = p.category ? p.category.split(",").map((c) => c.trim()) : [];
      const matchCat = nextFilter === "All" || cats.includes(nextFilter);
      const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
    if (newFiltered.length > 0 && !newFiltered.some((p) => p.id === selectedId)) {
      setSelectedId(newFiltered[0].id);
    }
  };

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
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use IntersectionObserver to avoid Forced Reflow from getBoundingClientRect
  useEffect(() => {
    const detailsEl = document.getElementById("project-details");
    if (!detailsEl) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowScrollIndicator(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(detailsEl);
    return () => observer.disconnect();
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

          // Smart auto-select from localStorage or default to first
          const rawTarget = localStorage.getItem("targetProjectId");
          const matchedProject = findMatchedProject(rawTarget, sorted);

          const initialSelectedId = matchedProject ? matchedProject.id : (sorted.length > 0 ? sorted[0].id : null);

          if (matchedProject) {
            setActiveFilter("All");
            setSearchQuery("");
          }

          // Batch state updates together so React renders the correct selected project on the very first frame
          setSelectedId(initialSelectedId);
          setProjectsData(sorted);
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

  // Instant horizontal auto-scroll before paint to center the selected project card in the selector container
  useEffect(() => {
    if (!isLoading && selectedId && scrollContainerRef.current) {
      const cardEl = scrollContainerRef.current.querySelector(`[data-project-id="${selectedId}"]`);
      if (cardEl) {
        const container = scrollContainerRef.current;
        const cardLeft = cardEl.offsetLeft;
        const cardWidth = cardEl.offsetWidth;
        const containerWidth = container.clientWidth;
        container.scrollLeft = cardLeft - (containerWidth / 2) + (cardWidth / 2);
      }
    }
  }, [selectedId, isLoading]);

  // Navigate between projects
  const nav = (dir) => {
    localStorage.removeItem("targetProjectId");
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
  const handleCardClick = (id) => {
    if (dragDistance.current <= 10) {
      localStorage.removeItem("targetProjectId");
      setSelectedId(id);
    }
  };

  // Lightbox openers
  const openFlowLightbox = () => {
    const flowImg = selected?.flow_pic || selected?.flow_image || selected?.flow_architecture_url;
    if (!flowImg) return;
    setLightboxItems([{ type: "image", url: flowImg }]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };
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
            {/* Expandable Search Box */}
            <motion.div
              initial={false}
              animate={{
                width: isSearchOpen ? (isMobile ? "100%" : 310) : 42,
                borderRadius: isSearchOpen ? 50 : 14,
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              onClick={() => {
                if (!isSearchOpen) {
                  setIsSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 100);
                }
              }}
              style={{
                ...styles.searchBarWrap,
                cursor: isSearchOpen ? "text" : "pointer",
                justifyContent: isSearchOpen ? "flex-start" : "center",
                border: searchQuery ? "1px solid #0D6EFD" : styles.searchBarWrap.border,
              }}
              title={!isSearchOpen ? (searchQuery ? `Search active: "${searchQuery}". Click to expand` : "Click to search projects") : undefined}
            >
              <div style={{ position: "absolute", left: 12, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <Search size={18} style={{ ...styles.searchIcon, color: searchQuery ? "#0D6EFD" : "#8aabcc" }} />
                {!isSearchOpen && searchQuery && (
                  <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#0D6EFD" }} />
                )}
              </div>
              
              {isSearchOpen && (
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search project name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ ...styles.searchInput, paddingRight: searchQuery ? "64px" : "38px" }}
                />
              )}

              {/* Action Buttons Right Side */}
              {isSearchOpen && (
                <div style={{ position: "absolute", right: 10, display: "flex", alignItems: "center", gap: 4 }}>
                  {/* Clear Button (Only when there is search text) */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      style={{
                        background: "#f1f5f9",
                        border: "none",
                        borderRadius: "50%",
                        width: 22,
                        height: 22,
                        cursor: "pointer",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                      title="Clear search text"
                      aria-label="Clear search text"
                    >
                      <X size={13} />
                    </button>
                  )}

                  {/* Fold / Minimize Button (Always visible when expanded) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSearchOpen(false);
                    }}
                    style={{
                      background: "#eef3ff",
                      border: "1px solid #d0e8ff",
                      borderRadius: "50%",
                      width: 26,
                      height: 26,
                      cursor: "pointer",
                      color: "#0D6EFD",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                    title="Fold search bar (keep search text)"
                    aria-label="Fold search bar"
                  >
                    <Minimize2 size={13} />
                  </button>
                </div>
              )}
            </motion.div>

            {/* Category Filter Tabs - Hidden when search is expanded */}
            <AnimatePresence>
              {!isSearchOpen &&
                categoriesData.map((f) => (
                  <motion.button
                    key={f}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.18 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFilterClick(f)}
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
            </AnimatePresence>
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
                    style={{
                      ...styles.scrollRow,
                      scrollSnapType: isDragging ? "none" : "x mandatory",
                      cursor: isDragging ? "grabbing" : "grab",
                    }}
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
                    openFlowLightbox={openFlowLightbox}
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

      {/* Lightbox — ImageModal */}
      <ImageModal
        isOpen={lightboxOpen && lightboxItems.length > 0}
        onClose={() => setLightboxOpen(false)}
        items={lightboxItems}
        initialIndex={lightboxIndex}
      />

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

