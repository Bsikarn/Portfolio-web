import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Code2, GraduationCap, Languages, Award, User, Heart, Users } from "lucide-react";
import AnimatedBlob from "../components/AnimatedBlob";
import { TOOLS_TAGS, ABOUT_ME } from "../data/constants";
import { supabase } from "../lib/supabase";

export default function HomePage({ setPage }) {
  const [realStats, setRealStats] = useState([
    { icon: <Code2 size={24} />, label: "Total Projects", value: "..." },
    { icon: <Users size={24} />, label: "Profile Views", value: "..." },
    { icon: <Heart size={24} />, label: "Cheer Ups", value: "..." },
  ]);

  // ใช้ useRef เพื่อเก็บจำนวนโปรเจกต์ไว้ จะได้ไม่หายตอนยอดวิวอัปเดต
  const projectCountRef = useRef(0);

  useEffect(() => {
    // ฟังก์ชันสำหรับจัดรูปแบบข้อมูลใส่ State
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

    // 🟢 เปิดระบบดักฟัง (Realtime Subscription)
    const subscription = supabase
      .channel('site_stats_channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_stats', filter: 'id=eq.1' },
        (payload) => {
          // ทันทีที่มีใครกดปุ่ม หรือมีคนเข้าเว็บใหม่ ข้อมูลก้อนใหม่ (payload.new) จะเด้งเข้ามาที่นี่
          const newData = payload.new;
          updateStatsUI(projectCountRef.current, newData.views, newData.cheer_ups);
        }
      )
      .subscribe();

    // ล้างการเชื่อมต่อเมื่อเปลี่ยนหน้าเว็บ
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div style={{ paddingTop: 64 }}>
      {/* 1. Hero Section */}
      <section style={{ minHeight: "90vh", display: "flex", alignItems: "center", padding: "0 48px", gap: 48, maxWidth: 1440, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} style={{ flex: 1 }}>
          <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 50, background: "rgba(163,216,244,0.25)", border: "1px solid rgba(163,216,244,0.5)", fontSize: 13, fontWeight: 600, color: "#0D6EFD", marginBottom: 20, fontFamily: "'Poppins',sans-serif" }}>
            👋 Available for hire
          </div>
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem, 5vw, 3.6rem)", lineHeight: 1.15, color: "#0d1b2a", margin: "0 0 18px" }}>
            Hi, I'm <span style={{ background: "linear-gradient(135deg,#0D6EFD 0%,#A3D8F4 50%,#ffc8d5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{ABOUT_ME?.name?.split(' ')[0] || "Alex"}</span><br />{ABOUT_ME?.role?.split(' & ')[0] || "Developer"}
          </h1>
          <p style={{ fontFamily: "'Poppins',sans-serif", color: "#5a7a9a", fontSize: 16, lineHeight: 1.7, maxWidth: 460, marginBottom: 32 }}>
            I craft scalable data pipelines and web applications with clean code. Passionate about Next.js, Cloud Data, and pushing the limits of development.
          </p>
          <div style={{ display: "flex", gap: 14 }}>
            <motion.button whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(13,110,253,0.35)" }} whileTap={{ scale: 0.95 }} onClick={() => setPage("Projects")} style={{ padding: "13px 28px", borderRadius: 50, background: "#0D6EFD", border: "none", color: "white", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 16px rgba(13,110,253,0.28)" }}>
              View My Work →
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPage("Contact")} style={{ padding: "13px 28px", borderRadius: 50, background: "transparent", border: "2px solid #A3D8F4", color: "#0D6EFD", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Contact Me
            </motion.button>
          </div>
        </motion.div>

        {/* 3D Canvas */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ flex: 1, height: 420, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(163,216,244,0.35) 0%, rgba(255,200,213,0.2) 60%, transparent 80%)", filter: "blur(30px)" }} />
          <Canvas camera={{ position: [0, 0, 3.5] }} style={{ width: "100%", height: "100%" }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <pointLight position={[-5, -5, -5]} color="#ffc8d5" intensity={0.5} />
            <AnimatedBlob />
          </Canvas>
        </motion.div>
      </section>

      {/* 2. About Me Section */}
      <section style={{ padding: "40px 48px", maxWidth: 1440, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: "white", borderRadius: 24, padding: "48px", boxShadow: "0 8px 32px rgba(13,110,253,0.06)", display: "flex", flexDirection: "column", gap: 32 }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ width: 120, height: 120, borderRadius: 24, background: "linear-gradient(135deg, #e0f2fe, #fce7f3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, flexShrink: 0, boxShadow: "inset 0 0 0 1px rgba(163,216,244,0.5)" }}>
              <User size={56} color="#A3D8F4" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 28, color: "#0d1b2a", margin: "0 0 4px" }}>{ABOUT_ME?.name}</h2>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 15, color: "#0D6EFD", fontWeight: 600, marginBottom: 12 }}>{ABOUT_ME?.role}</div>
              <p style={{ fontFamily: "'Poppins',sans-serif", color: "#5a7a9a", fontSize: 14, lineHeight: 1.7, margin: 0, maxWidth: 800 }}>
                {ABOUT_ME?.intro}
              </p>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px dashed #eef3ff" }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f0f6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#0D6EFD" }}><GraduationCap size={20} /></div>
              <div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, color: "#0d1b2a" }}>Education</div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "#5a7a9a", marginTop: 4 }}>{ABOUT_ME?.education}</div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff0f4", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6b6b" }}><Award size={20} /></div>
              <div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, color: "#0d1b2a" }}>GPA</div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "#5a7a9a", marginTop: 4 }}>{ABOUT_ME?.gpa}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e" }}><Languages size={20} /></div>
              <div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, color: "#0d1b2a" }}>Languages</div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "#5a7a9a", marginTop: 4 }}>{ABOUT_ME?.languages?.join(" • ")}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Tech Stack & Tools */}
      <section style={{ padding: "40px 48px", maxWidth: 1440, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 24, color: "#0d1b2a", marginBottom: 24, textAlign: "center" }}>Tools & Technologies</h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            {TOOLS_TAGS?.map((tag, i) => (
              <motion.span 
                key={tag} 
                initial={{ opacity: 0, scale: 0.8 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05, background: "#0D6EFD", color: "white" }}
                style={{ 
                  padding: "10px 20px", 
                  borderRadius: 50, 
                  background: "white", 
                  border: "1px solid #eef3ff",
                  boxShadow: "0 4px 12px rgba(13,110,253,0.04)",
                  fontFamily: "'Poppins',sans-serif", 
                  fontWeight: 600, 
                  fontSize: 13, 
                  color: "#4a6a8a",
                  cursor: "default",
                  transition: "color 0.2s, background 0.2s"
                }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 4. Mini Dashboard (Real-time) */}
      <section style={{ padding: "40px 48px 100px", maxWidth: 1440, margin: "0 auto" }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          style={{ 
            background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)", 
            borderRadius: 32, 
            padding: "48px", 
            boxShadow: "0 12px 40px rgba(13,110,253,0.08)",
            border: "1px solid rgba(163,216,244,0.3)"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 24, color: "#0d1b2a", margin: "0 0 8px" }}>Dashboard Overview</h2>
            <p style={{ fontFamily: "'Poppins',sans-serif", color: "#8aabcc", fontSize: 14 }}>Real-time statistics of my portfolio</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {realStats.map((s) => (
              <motion.div 
                key={s.label} 
                whileHover={{ y: -5, boxShadow: "0 12px 24px rgba(13,110,253,0.12)" }} 
                style={{ 
                  background: "white", 
                  borderRadius: 24, 
                  padding: "32px 24px", 
                  boxShadow: "0 4px 16px rgba(13,110,253,0.05)", 
                  textAlign: "center",
                  border: "1px solid #eef3ff"
                }}
              >
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0f6ff", color: "#0D6EFD", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  {s.icon}
                </div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 36, color: "#0d1b2a", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "#8aabcc", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginTop: 12 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

    </div>
  );
}