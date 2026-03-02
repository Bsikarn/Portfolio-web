import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Github, ExternalLink, Play, CheckCircle2, Code2, Trophy, Image as ImageIcon } from "lucide-react";
import { PROJECTS, mockFeatures, mockLanguages } from "../data/constants";

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(1);
  
  // ----------------------------------------------------
  // ระบบสำหรับ Click & Drag เลื่อนซ้ายขวา
  // ----------------------------------------------------
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragDistance = useRef(0); // ใช้เช็คว่าลากไปไกลแค่ไหน จะได้ไม่ทับกับการคลิกเลือกโปรเจกต์

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    dragDistance.current = 0; // รีเซ็ตระยะทางตอนเริ่มคลิก
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // ป้องกันการคลุมดำ Text อัตโนมัติ
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // ความเร็วในการลาก (คูณ 2)
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    dragDistance.current = Math.abs(walk); // บันทึกระยะทางที่ลากไป
  };

  const handleCardClick = (id) => {
    // ถ้าลากเมาส์ไปไกลกว่า 10px ให้ถือว่าเป็นการ "เลื่อน" ไม่ใช่การ "คลิกเลือก"
    if (dragDistance.current > 10) return;
    setSelectedId(id);
  };
  // ----------------------------------------------------

  const FILTERS = ["All", "Frontend", "Backend", "Database"];

  const filtered = activeFilter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === activeFilter);
  const selected = filtered.find((p) => p.id === selectedId) || filtered[0] || null;

  const nav = (dir) => {
    const idx = filtered.findIndex((p) => p.id === selectedId);
    const next = (idx + dir + filtered.length) % filtered.length;
    setSelectedId(filtered[next].id);
  };

  useEffect(() => {
    if (filtered.length && !filtered.find((p) => p.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [activeFilter, filtered, selectedId]);

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh" }}>
      
      {/* 1. Filter Bar */}
      <div style={{ padding: "24px 48px 16px", display: "flex", gap: 10, maxWidth: 1440, margin: "0 auto" }}>
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
        
        {/* 2. Horizontal Project List (ครอบด้วย Card สีขาว) */}
        <div style={{ padding: "0 48px", marginBottom: 32 }}>
          <div style={{ background: "white", borderRadius: 24, padding: "24px 0", boxShadow: "0 8px 32px rgba(13,110,253,0.06)" }}>
            
            <div style={{ padding: "0 24px", marginBottom: 16, fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#0d1b2a" }}>
              Select Project
            </div>

            {/* คอนเทนเนอร์สำหรับลาก (Drag Container) */}
            <div 
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              style={{ 
                display: "flex", 
                gap: 20, 
                overflowX: "auto", 
                padding: "10px 24px 32px", // เผื่อเงาด้านล่าง
                scrollbarWidth: "none", 
                WebkitOverflowScrolling: "touch",
                scrollSnapType: isDragging ? "none" : "x mandatory", // ยกเลิก Snap ตอนกำลังลากให้ลื่นๆ
                cursor: isDragging ? "grabbing" : "grab", // เปลี่ยนรูปเมาส์
                userSelect: "none" // ห้ามคลุมดำข้อความตอนลาก
              }}
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
                      onClick={() => handleCardClick(p.id)} // ใช้ฟังก์ชันคลิกแบบใหม่
                      whileHover={{ y: isDragging ? 0 : -5 }} // ห้ามเด้งขึ้นตอนกำลังลาก
                      style={{
                        flex: "0 0 300px",
                        scrollSnapAlign: "center", // ให้หยุดตรงกลางพอดีตอนลากเสร็จ
                        borderRadius: 16,
                        background: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: 16,
                        position: "relative",
                        border: selectedId === p.id ? "2px solid #0D6EFD" : "1px solid #eef3ff",
                        boxShadow: selectedId === p.id ? "0 8px 24px rgba(13,110,253,0.15)" : "0 4px 16px rgba(13,110,253,0.05)",
                        transition: "all 0.2s",
                      }}
                    >
                      {/* ป้ายคาดรางวัล */}
                      {hasAward && (
                        <div style={{ position: "absolute", top: -1, right: -1, background: "linear-gradient(135deg, #FFD700, #FDB931)", color: "#855E00", padding: "4px 12px", borderRadius: "0 16px 0 12px", fontSize: 10, fontWeight: 800, fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", gap: 4, boxShadow: "-2px 2px 8px rgba(255,215,0,0.3)", zIndex: 10 }}>
                          <Trophy size={12} /> AWARD
                        </div>
                      )}

                      {/* รูปสี่เหลี่ยมจัตุรัส */}
                      <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 12, background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                        {p.image}
                      </div>

                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15, color: "#0d1b2a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.title}
                        </div>
                        <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: "#8aabcc", fontWeight: 500, marginTop: 4 }}>
                          {p.category}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 3. Project Detail Section */}
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
                
                {/* Media Section: วิดีโอ / รูปภาพใหญ่ */}
                <div style={{ height: 350, background: `linear-gradient(135deg, ${selected.gradientFrom}, ${selected.gradientTo})`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0D6EFD", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                    <Play size={28} style={{ marginLeft: 4 }} />
                  </div>
                  
                  <button onClick={() => nav(-1)} style={{ position: "absolute", left: 24, width: 44, height: 44, borderRadius: "50%", background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", color: "#0D6EFD" }}>
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={() => nav(1)} style={{ position: "absolute", right: 24, width: 44, height: 44, borderRadius: "50%", background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", color: "#0D6EFD" }}>
                    <ChevronRight size={24} />
                  </button>
                </div>

                {/* เนื้อหารายละเอียด */}
                <div style={{ padding: "40px 48px" }}>
                  
                  {/* Header & Description */}
                  <div style={{ marginBottom: 40 }}>
                    <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 32, color: "#0d1b2a", margin: "0 0 8px 0" }}>{selected.title}</h2>
                    <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, color: "#8aabcc", fontWeight: 600, marginBottom: 20 }}>{selected.category} · {selected.year}</div>
                    <p style={{ fontFamily: "'Poppins',sans-serif", color: "#5a7a9a", fontSize: 15, lineHeight: 1.8, maxWidth: 800 }}>{selected.description}</p>
                  </div>

                  {/* 2-Column Grid (Tech Stack & Features) */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, marginBottom: 48 }}>
                    <div>
                      <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#0d1b2a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <Code2 size={20} color="#0D6EFD" /> Tech Stack
                      </h3>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {selected.tags.map((t) => (
                          <span key={t} style={{ padding: "8px 16px", borderRadius: 50, background: "rgba(163,216,244,0.15)", border: "1px solid rgba(163,216,244,0.4)", fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 13, color: "#0D6EFD" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#0d1b2a", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle2 size={20} color="#0D6EFD" /> Key Features
                      </h3>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                        {(selected.features || mockFeatures).map((feat, idx) => (
                          <li key={idx} style={{ fontFamily: "'Poppins',sans-serif", fontSize: 14, color: "#5a7a9a", display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <div style={{ marginTop: 2, color: "#A3D8F4" }}><CheckCircle2 size={16} /></div>
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 🏆 ส่วนแสดงรางวัล (ซ่อนถ้าไม่มีข้อมูล award) */}
                  {selected.award && (
                    <div style={{ marginBottom: 48, background: "linear-gradient(135deg, #fffcf0 0%, #fff9e6 100%)", borderRadius: 20, border: "1px solid #ffe58f", padding: 32, display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
                      <div style={{ flex: "1 1 300px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#ffd666", color: "#ad6800", padding: "6px 14px", borderRadius: 50, fontSize: 12, fontWeight: 700, fontFamily: "'Poppins',sans-serif", marginBottom: 16 }}>
                          <Trophy size={14} /> AWARDS & RECOGNITION
                        </div>
                        <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 22, color: "#874d00", margin: "0 0 8px 0" }}>
                          {selected.award.title}
                        </h3>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "#ad6800", fontWeight: 600, marginBottom: 12 }}>
                          📍 {selected.award.competition}
                        </p>
                        <p style={{ fontFamily: "'Poppins',sans-serif", color: "#874d00", fontSize: 14, lineHeight: 1.7, opacity: 0.9 }}>
                          {selected.award.description}
                        </p>
                      </div>
                      
                      {/* กรอบรูปภาพบรรยากาศตอนแข่ง */}
                      <div style={{ flex: "0 0 240px", height: 160, background: "#ffe58f", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#d48806", boxShadow: "0 8px 24px rgba(250, 173, 20, 0.2)", position: "relative", overflow: "hidden" }}>
                        <ImageIcon size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                        <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, fontWeight: 600 }}>Event Photo / Certificate</span>
                      </div>
                    </div>
                  )}

                  {/* Language Percentage Bar */}
                  <div style={{ marginBottom: 48, maxWidth: 800 }}>
                    <h3 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 18, color: "#0d1b2a", marginBottom: 16 }}>Languages</h3>
                    <div style={{ height: 12, borderRadius: 10, display: "flex", overflow: "hidden", marginBottom: 16, background: "#f0f6ff" }}>
                      {(selected.languages || mockLanguages).map((lang) => (
                        <div key={lang.name} style={{ width: `${lang.percent}%`, background: lang.color, transition: "width 1s ease-in-out" }} title={`${lang.name} ${lang.percent}%`} />
                      ))}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                      {(selected.languages || mockLanguages).map((lang) => (
                        <div key={lang.name} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "#5a7a9a", fontWeight: 500 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: lang.color }} />
                          {lang.name} <span style={{ color: "#8aabcc" }}>{lang.percent}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid rgba(163,216,244,0.3)", marginBottom: 32 }} />

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: 16 }}>
                    <motion.a 
                      href={selected.link} 
                      whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(13,110,253,0.3)" }} 
                      whileTap={{ scale: 0.95 }}
                      style={{ padding: "14px 28px", borderRadius: 12, background: "#0D6EFD", color: "white", textDecoration: "none", display: "flex", alignItems: "center", gap: 10, fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, boxShadow: "0 4px 14px rgba(13,110,253,0.2)" }}
                    >
                      <ExternalLink size={18} /> Live Preview
                    </motion.a>
                    <motion.a 
                      href={selected.github} 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                      style={{ padding: "14px 28px", borderRadius: 12, background: "#f0f6ff", color: "#0D6EFD", border: "2px solid #d0e8ff", textDecoration: "none", display: "flex", alignItems: "center", gap: 10, fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14 }}
                    >
                      <Github size={18} /> Source Code
                    </motion.a>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}