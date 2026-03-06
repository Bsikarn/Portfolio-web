import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Github, ExternalLink, Play, CheckCircle2, Code2, Trophy, Image as ImageIcon, Loader2, X, Target, Lightbulb, UserCog, Wrench, TrendingUp, BookOpen, ArrowLeftRight, Search } from "lucide-react";
import StackedCard from "../components/StackedCard";
import ProjectMiniCard from "../components/ProjectMiniCard";
import ProjectDetailsCard from "../components/ProjectDetailsCard";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/ProjectsPage.styles";

export default function ProjectsPage() {
  // State for filtering projects by category ("All", "Database", etc.)
  const [activeFilter, setActiveFilter] = useState("All");
  // State for project text search
  const [searchQuery, setSearchQuery] = useState("");
  // ID of the currently selected project to display details for
  const [selectedId, setSelectedId] = useState(null);
  // Ref for the horizontal scrolling container of project mini-cards
  const scrollContainerRef = useRef(null);

  // State to store the full list of projects fetched from Supabase
  const [projectsData, setProjectsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState(["All"]); // Start with "All"
  const [isLoading, setIsLoading] = useState(true);

  // Lightbox state for viewing images, videos, or awards in full screen
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Fetch projects and categories from the database on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Categories
        const { data: catData, error: catError } = await supabase.from("categories").select("*").order("name");
        if (catError) throw catError;
        if (catData) {
          setCategoriesData(["All", ...catData.map(c => c.name)]);
        }

        // Fetch Projects
        const { data: projData, error: projError } = await supabase.from("projects").select("*");
        if (projError) throw projError;
        if (projData) {
          // Sort: Projects with awards first, then recommended, then alphabetically by title
          const sortedData = projData.sort((a, b) => {
            const hasAwardA = a.award ? 1 : 0;
            const hasAwardB = b.award ? 1 : 0;
            if (hasAwardA !== hasAwardB) return hasAwardB - hasAwardA;

            // If awards are equal, check generated tag 'Recommended'
            const isRecA = a.is_recommended ? 1 : 0;
            const isRecB = b.is_recommended ? 1 : 0;
            if (isRecA !== isRecB) return isRecB - isRecA;

            return a.title.localeCompare(b.title);
          });
          setProjectsData(sortedData);
          // Auto-select the first project in the sorted list
          if (sortedData.length > 0) setSelectedId(sortedData[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // (Effect logic has been merged into fetchData above)

  // Filter projects based on the active category tab AND search string
  const filtered = projectsData.filter((p) => {
    const matchesCategory = activeFilter === "All" || p.category === activeFilter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  // Find the selected project object based on selectedId
  const selected = filtered.find((p) => p.id === selectedId) || filtered[0] || null;

  // Navigate through projects (left or right)
  const nav = (dir) => {
    const idx = filtered.findIndex((p) => p.id === selectedId);
    const next = (idx + dir + filtered.length) % filtered.length;
    setSelectedId(filtered[next].id);
  };

  // Reset selection if the currently selected project is filtered out
  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((p) => p.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [activeFilter, filtered, selectedId]);

  // Mouse drag-to-scroll logic variables
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragDistance = useRef(0);

  // Mouse event handlers for the horizontal draggable project list
  const handleMouseDown = (e) => { setIsDragging(true); setStartX(e.pageX - scrollContainerRef.current.offsetLeft); setScrollLeft(scrollContainerRef.current.scrollLeft); dragDistance.current = 0; };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => { if (!isDragging) return; e.preventDefault(); const x = e.pageX - scrollContainerRef.current.offsetLeft; const walk = (x - startX) * 2; scrollContainerRef.current.scrollLeft = scrollLeft - walk; dragDistance.current = Math.abs(walk); };

  // Prevent card click if the user was dragging the list instead of clicking
  const handleCardClick = (id) => { if (dragDistance.current > 10) return; setSelectedId(id); };

  // Determine media to show in full-screen lightbox
  const openGalleryLightbox = (startIndex) => {
    if (!selected.gallery || selected.gallery.length === 0) return;
    setLightboxItems(selected.gallery.map(url => ({ type: 'image', url })));
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  const openVideoLightbox = () => {
    if (!selected.video_url) return;
    setLightboxItems([{ type: 'video', url: selected.video_url }]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  const openAwardLightbox = () => {
    if (!selected.award?.image_url) return;
    setLightboxItems([{ type: 'image', url: selected.award.image_url }]);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  // Lightbox navigation functions
  const nextLightboxMedia = (e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev + 1) % lightboxItems.length); };
  const prevLightboxMedia = (e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev - 1 + lightboxItems.length) % lightboxItems.length); };

  // Handle external links safely, notify user if no link exists
  const handleLinkClick = (e, targetUrl) => {
    if (!targetUrl || targetUrl === "#" || targetUrl === "") {
      e.preventDefault();
      // "Link not connected yet. This project is still under development for this channel."
      alert("Link not connected yet. This project is still under development for this channel.");
    }
  };

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Loader2 size={48} /></motion.div>
        <p style={styles.loadingText}>Loading Projects...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>

      {/* Top filter and unselected projects card */}
      <StackedCard stickyTop="64px" zIndex={1}>
        {/* Category Filters & Search */}
        <div style={styles.filterContainer}>
          {/* Search Bar */}
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
                boxShadow: activeFilter === f ? "0 4px 12px rgba(13,110,253,0.3)" : "0 2px 8px rgba(0,0,0,0.05)"
              }}
            >
              {f}
            </motion.button>
          ))}
        </div>

        {/* Project Selection Scroll Menu */}
        <div style={styles.mainContentWrapper}>
          <div style={styles.selectionSection}>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
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
                    cursor: isDragging ? "grabbing" : "grab"
                  }}
                >
                  <AnimatePresence>
                    {filtered.map((p) => (
                      <ProjectMiniCard
                        key={p.id}
                        project={p}
                        selectedId={selectedId}
                        isDragging={isDragging}
                        handleCardClick={handleCardClick}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
              {filtered.length > 0 && (
                <div style={styles.scrollHintWrap}>
                  <motion.div
                    animate={{ x: [-4, 4, -4] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowLeftRight size={14} />
                  </motion.div>
                  <span>drag left-right to see other projects</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </StackedCard>

      {/* Main detail card for the currently selected project */}
      <div style={{ ...styles.mainContentWrapper, position: "relative", zIndex: 2 }}>
        <div style={styles.detailsOuterContainer}>
          <AnimatePresence mode="wait">
            {selected && (
              <ProjectDetailsCard
                selected={selected}
                nav={nav}
                openVideoLightbox={openVideoLightbox}
                openAwardLightbox={openAwardLightbox}
                openGalleryLightbox={openGalleryLightbox}
                handleLinkClick={handleLinkClick}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reusable Lightbox Element for Media */}
      <AnimatePresence>
        {lightboxOpen && lightboxItems.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxOpen(false)} style={styles.lightboxOverlay}>
            <X onClick={() => setLightboxOpen(false)} style={styles.lightboxClose} size={36} />
            {/* Navigators only if there are more than 1 image/video */}
            {lightboxItems.length > 1 && (
              <>
                <button onClick={prevLightboxMedia} style={styles.lightboxLeftBtn}><ChevronLeft size={32} /></button>
                <button onClick={nextLightboxMedia} style={styles.lightboxRightBtn}><ChevronRight size={32} /></button>
                <div style={styles.lightboxCounter}>{lightboxIndex + 1} / {lightboxItems.length}</div>
              </>
            )}
            <div onClick={(e) => e.stopPropagation()} style={styles.lightboxContent}>
              {lightboxItems[lightboxIndex].type === 'image' ? <img src={lightboxItems[lightboxIndex].url} alt="Gallery" style={styles.lightboxImage} /> : <iframe src={lightboxItems[lightboxIndex].url} allowFullScreen style={styles.lightboxVideo} title="Video Player" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}

