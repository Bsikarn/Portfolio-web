import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Github, ExternalLink, Play, CheckCircle2, Code2, Trophy, Image as ImageIcon, Loader2, X } from "lucide-react";
import { supabase } from "../lib/supabase"; 

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const scrollContainerRef = useRef(null);
  
  const [projectsData, setProjectsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ---------- State สำหรับระบบ Popup (Lightbox) ----------
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState([]); // เก็บอาร์เรย์ของสื่อ [{ type: 'image', url: '...' }]
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const FILTERS = ["All", "Database", "Full-Stack", "Game Dev"];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;

        if (data) {
          setProjectsData(data);
          if (data.length > 0) setSelectedId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching projects:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filtered = activeFilter === "All" ? projectsData : projectsData.filter((p) => p.category === activeFilter);
  const selected = filtered.find((p) => p.id === selectedId) || filtered[0] || null;

  const nav = (dir) => {
    const idx = filtered.findIndex((p) => p.id === selectedId);
    const next = (idx + dir + filtered.length) % filtered.length;
    setSelectedId(filtered[next].id);
  };

  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((p) => p.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [activeFilter, filtered, selectedId]);

  // ระบบ Drag to scroll
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragDistance = useRef(0);

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
    if (dragDistance.current > 10) return;
    setSelectedId(id);
  };

  // ---------- ฟังก์ชันเปิด Popup ----------
  const openGalleryLightbox = (startIndex) => {
    if (!selected.gallery || selected.gallery.length === 0) return;
    const items = selected.gallery.map(url => ({ type: 'image', url }));
    setLightboxItems(items);
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

  const nextLightboxMedia = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % lightboxItems.length);
  };

  const prevLightboxMedia = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + lightboxItems.length) % lightboxItems.length);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#0D6EFD" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 size={48} />
        </motion.div>
        <p style={{ marginTop: 16, fontFamily: "'Poppins',sans-serif", fontWeight: 600 }}>Loading Projects...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", position: "relative" }}>
      
      <div style={{ padding: "24px 48px 16px", display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 1440, margin: "0 auto" }}>
        {FILTERS.map((f) => (
          <motion.button
            key={f}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: "8px 20px",
              borderRadius: 50,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Poppins',sans-serif",
              fontWeight: 600,
              fontSize: 13,
              background: activeFilter === f ? "#0D6EFD" : "rgba(163,216,244,0.2)",
              color: activeFilter === f ? "white" : "#4a6a8a",
              boxShadow: activeFilter === f ? "0 4px 14px rgba(13,110,253,0.3)" : "none",
              transition: "all 0.2s",
            }}
          >
            {f}
          </motion.button>
        ))}
      </div>

      <div style={{ maxWidth: 1440, margin: "0 auto", paddingBottom: 80 }}>
        <div style={{ padding: "0 48px", marginBottom: 32 }}>
          <div style={{ background: "white", borderRadius: 24, padding: "24px 0", boxShadow: "0 8px 32px rgba(13,110,253,0.06)" }}>
            <div style={{ padding: "0 24px", marginBottom: 16, fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#0d1b2a" }}>
              Select Project
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: "20px 24px", textAlign: "center", color: "#8aabcc", fontFamily: "'Poppins',sans-serif" }}>No projects found in this category.</div>
            ) : (
              <div 
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{ display: "flex", gap: 20, overflowX: "auto", padding: "10px 24px 32px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollSnapType: isDragging ? "none" : "x mandatory", cursor: isDragging ? "grabbing" : "grab", userSelect: "none" }}
              >
                <AnimatePresence>
                  {filtered.map((p) => {
                    const hasAward = p.award ? true : false;
                    return (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => handleCardClick(p.id)}
                        whileHover={{ y: isDragging ? 0 : -5 }}
                        style={{ flex: "0 0 300px", scrollSnapAlign: "center", borderRadius: 16, background: "white", display: "flex", alignItems: "center", gap: 16, padding: 16, position: "relative", border: selectedId === p.id ? "2px solid #0D6EFD" : "1px solid #eef3ff", boxShadow: selectedId === p.id ? "0 8px 24px rgba(13,110,253,0.15)" : "0 4px 16px rgba(13,110,253,0.05)", transition: "all 0.2s" }}
                      >
                        {hasAward && (
                          <div style={{ position: "absolute", top: -1, right: -1, background: "linear-gradient(135deg, #FFD700, #FDB931)", color: "#855E00", padding: "4px 12px", borderRadius: "0 16px 0 12px", fontSize: 10, fontWeight: 800, fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", gap: 4, boxShadow: "-2px 2px 8px rgba(255,215,0,0.3)", zIndex: 10 }}>
                            <Trophy size={12} /> AWARD
                          </div>
                        )}
                        <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 12, background: `linear-gradient(135deg, ${p.gradient_from || '#f0f6ff'}, ${p.gradient_to || '#e0f2fe'})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{p.image_icon}</div>
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15, color: "#0d1b2a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                          <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: "#8aabcc", fontWeight: 500, marginTop: 4 }}>{p.category}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "0 48px" }}>
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ background: "white", borderRadius: 24, boxShadow: "0 12px 40px rgba(13,110,253,0.06)", overflow: "hidden" }}
              >
                
                {/* 🎬 Media Section (คลิกเพื่อดูวิดีโอ) */}
                <div style={{ height: 350, background: `linear-gradient(135deg, ${selected.gradient_from || '#f0f6ff'}, ${selected.gradient_to || '#e0f2fe'})`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    onClick={openVideoLightbox}
                    style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0D6EFD", cursor: selected.video_url ? "pointer" : "default", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", opacity: selected.video_url ? 1 : 0.5 }}
                  >
                    <Play size={32} style={{ marginLeft: 4 }} />
                  </motion.div>
                  
                  <button onClick={() => nav(-1)} style={{ position: "absolute", left: 24, width: 44, height: 44, borderRadius: "50%", background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", color: "#0D6EFD" }}><ChevronLeft size={24} /></button>
                  <button onClick={() => nav(1)} style={{ position: "absolute", right: 24, width: 44, height: 44, borderRadius: "50%", background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", color: "#0D6EFD" }}><ChevronRight size={24} /></button>
                </div>

                <div style={{ padding: "40px 48px" }}>
                  <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 32, color: "#0d1b2a", margin: "0 0 8px 0" }}>{selected.title}</h2>
                    <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, color: "#8aabcc", fontWeight: 600, marginBottom: 20 }}>{selected.category} · {selected.year}</div>
                    <p style={{ fontFamily: "'Poppins',sans-serif", color: "#5a7a9a", fontSize: 15, lineHeight: 1.8, maxWidth: 800 }}>{selected.description}</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, marginBottom: 40 }}>
                    <div>
                      <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#0d1b2a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><Code2 size={20} color="#0D6EFD" /> Tech Stack</h3>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {selected.tags && selected.tags.map((t) => (
                          <span key={t} style={{ padding: "8px 16px", borderRadius: 50, background: "rgba(163,216,244,0.15)", border: "1px solid rgba(163,216,244,0.4)", fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 13, color: "#0D6EFD" }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#0d1b2a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}><CheckCircle2 size={20} color="#0D6EFD" /> Key Features</h3>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                        {selected.features && selected.features.map((feat, idx) => (
                          <li key={idx} style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, color: "#5a7a9a", display: "flex", alignItems: "flex-start", gap: 10 }}><div style={{ marginTop: 2, color: "#A3D8F4" }}><CheckCircle2 size={16} /></div>{feat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 📸 Gallery Section (สไตล์ Facebook) */}
                  {selected.gallery && selected.gallery.length > 0 && (
                    <div style={{ marginBottom: 48 }}>
                      <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#0d1b2a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <ImageIcon size={20} color="#0D6EFD" /> Project Gallery
                      </h3>
                      
                      <div style={{ 
                        display: "grid", 
                        gap: 8, 
                        gridTemplateColumns: selected.gallery.length === 1 ? "1fr" : "1fr 1fr",
                        borderRadius: 16,
                        overflow: "hidden"
                      }}>
                        {/* รูปที่ 1 */}
                        <div 
                          onClick={() => openGalleryLightbox(0)} 
                          style={{ height: selected.gallery.length === 1 ? 400 : 250, cursor: "pointer", overflow: "hidden" }}
                        >
                          <motion.img whileHover={{ scale: 1.05 }} src={selected.gallery[0]} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} />
                        </div>

                        {/* รูปที่ 2 (และ Overlay เบลอๆ ถ้ามีรูปมากกว่า 2) */}
                        {selected.gallery.length > 1 && (
                          <div 
                            onClick={() => openGalleryLightbox(1)} 
                            style={{ height: 250, cursor: "pointer", position: "relative", overflow: "hidden" }}
                          >
                            <motion.img whileHover={{ scale: selected.gallery.length > 2 ? 1 : 1.05 }} src={selected.gallery[1]} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} />
                            
                            {/* Overlay โชว์จำนวนรูปที่เหลือ */}
                            {selected.gallery.length > 2 && (
                              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 36, fontWeight: 800, fontFamily: "'Poppins',sans-serif" }}>
                                +{selected.gallery.length - 2}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 🏆 ส่วนแสดงรางวัล */}
                  {selected.award && (
                    <div style={{ marginBottom: 48, background: "linear-gradient(135deg, #fffcf0 0%, #fff9e6 100%)", borderRadius: 20, border: "1px solid #ffe58f", padding: 32, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
                      <div style={{ flex: "1 1 300px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ffd666", color: "#ad6800", padding: "6px 14px", borderRadius: 50, fontSize: 12, fontWeight: 700, fontFamily: "'Poppins',sans-serif", marginBottom: 16 }}><Trophy size={14} /> AWARDS & RECOGNITION</div>
                        <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 22, color: "#874d00", margin: "0 0 8px 0" }}>{selected.award.title}</h3>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "#ad6800", fontWeight: 600, marginBottom: 12 }}>📍 {selected.award.competition}</p>
                        <p style={{ fontFamily: "'Poppins',sans-serif", color: "#874d00", fontSize: 14, lineHeight: 1.7, opacity: 0.9 }}>{selected.award.description}</p>
                      </div>
                      
                      {/* รูปรางวัล (คลิกได้) */}
                      <motion.div 
                        whileHover={{ scale: selected.award.image_url ? 1.02 : 1 }}
                        onClick={openAwardLightbox}
                        style={{ flex: "0 0 240px", height: 160, background: selected.award.image_url ? "transparent" : "#ffe58f", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#d48806", boxShadow: "0 8px 24px rgba(250, 173, 20, 0.2)", position: "relative", overflow: "hidden", cursor: selected.award.image_url ? "pointer" : "default" }}
                      >
                        {selected.award.image_url ? (
                           <img src={selected.award.image_url} alt="Award" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <>
                            <ImageIcon size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 600 }}>Event Photo</span>
                          </>
                        )}
                      </motion.div>
                    </div>
                  )}

                  {/* Language Percentage Bar */}
                  {selected.languages && selected.languages.length > 0 && (
                    <div style={{ marginBottom: 48, maxWidth: 800 }}>
                      <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#0d1b2a", marginBottom: 16 }}>Languages</h3>
                      <div style={{ height: 12, borderRadius: 10, display: "flex", overflow: "hidden", marginBottom: 16, background: "#f0f6ff" }}>
                        {selected.languages.map((lang) => (
                          <div key={lang.name} style={{ width: `${lang.percent}%`, background: lang.color, transition: "width 1s ease-in-out" }} title={`${lang.name} ${lang.percent}%`} />
                        ))}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                        {selected.languages.map((lang) => (
                          <div key={lang.name} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "#5a7a9a", fontWeight: 500 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: lang.color }} />
                            {lang.name} <span style={{ color: "#8aabcc" }}>{lang.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <hr style={{ border: "none", borderTop: "1px solid rgba(163,216,244,0.3)", marginBottom: 32 }} />

                  <div style={{ display: "flex", gap: 16 }}>
                    <motion.a href={selected.link_url || "#"} whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(13,110,253,0.3)" }} whileTap={{ scale: 0.95 }} style={{ padding: "14px 28px", borderRadius: 12, background: "#0D6EFD", color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: 10, fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 4px 14px rgba(13,110,253,0.2)" }}><ExternalLink size={18} /> Live Preview</motion.a>
                    <motion.a href={selected.github_url || "#"} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: "14px 28px", borderRadius: 12, background: "#f0f6ff", color: "#0D6EFD", border: "2px solid #d0e8ff", textDecoration: "none", display: "flex", alignItems: "center", gap: 10, fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14 }}><Github size={18} /> Source Code</motion.a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 🌑 Popup Lightbox (ทำงานเมื่อคลิกรูปหรือวิดีโอ) */}
      <AnimatePresence>
        {lightboxOpen && lightboxItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)} // คลิกพื้นหลังเพื่อปิด
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {/* ปุ่มปิด */}
            <X onClick={() => setLightboxOpen(false)} style={{ position: "absolute", top: 24, right: 24, color: "white", cursor: "pointer", zIndex: 10000 }} size={36} />

            {/* ปุ่มเลื่อนซ้าย-ขวา (แสดงเฉพาะถ้ามีหลายรูป) */}
            {lightboxItems.length > 1 && (
              <>
                <button onClick={prevLightboxMedia} style={{ position: "absolute", left: 24, width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}><ChevronLeft size={32} /></button>
                <button onClick={nextLightboxMedia} style={{ position: "absolute", right: 24, width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}><ChevronRight size={32} /></button>
                <div style={{ position: "absolute", bottom: 24, color: "white", fontFamily: "'Poppins',sans-serif", fontSize: 14, letterSpacing: 2 }}>{lightboxIndex + 1} / {lightboxItems.length}</div>
              </>
            )}

            {/* คอนเทนต์หลักใน Popup */}
            <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "85vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
              {lightboxItems[lightboxIndex].type === 'image' ? (
                <img src={lightboxItems[lightboxIndex].url} alt="Gallery" style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: 8 }} />
              ) : (
                <iframe src={lightboxItems[lightboxIndex].url} allowFullScreen style={{ width: "80vw", height: "70vh", border: "none", borderRadius: 16, backgroundColor: "black" }} title="Video Player" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}