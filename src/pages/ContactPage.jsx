import { motion } from "framer-motion";
import { Mail, Github, Linkedin } from "lucide-react";

export default function ContactPage() {
  const CONTACTS = [
    { icon: <Mail size={28} />, label: "Email", handle: "sikarn.pat@gmail.com", href: "mailto:siakrn.pat@gmail.com", color: "#ffc8d5", accent: "#ff6b6b" },
    { icon: <Github size={28} />, label: "GitHub", handle: "Bsikarn", href: "https://github.com/Bsikarn", color: "#A3D8F4", accent: "#0D6EFD" },
    { icon: <Linkedin size={28} />, label: "LinkedIn", handle: "Sikarn Pattarasirimongkol", href: "www.linkedin.com/in/sbeaut", color: "#c4f0e0", accent: "#0077b5" },
  ];

  return (
    <div style={{ paddingTop: 64, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 20% 40%, rgba(163,216,244,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(255,200,213,0.18) 0%, transparent 60%)" }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 40, color: "#0d1b2a", margin: "0 0 12px" }}>
          Let's work <span style={{ background: "linear-gradient(135deg,#0D6EFD,#A3D8F4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>together</span>
        </h1>
        <p style={{ fontFamily: "'Poppins',sans-serif", color: "#8aabcc", fontSize: 15 }}>I'm always open to exciting opportunities and collaborations.</p>
      </motion.div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {CONTACTS.map((c, i) => (
          <motion.a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(13,110,253,0.18)" }} style={{ background: "white", borderRadius: 24, padding: "36px 32px", textDecoration: "none", width: 200, textAlign: "center", boxShadow: "0 8px 28px rgba(13,110,253,0.08)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, cursor: "pointer" }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", color: c.accent }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 16, color: "#0d1b2a" }}>{c.label}</div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 12, color: "#8aabcc", marginTop: 4, fontWeight: 500 }}>{c.handle}</div>
            </div>
            <div style={{ padding: "7px 18px", borderRadius: 50, background: c.color, fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 12, color: c.accent }}>Connect →</div>
          </motion.a>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ marginTop: 60, padding: "24px 40px", background: "white", borderRadius: 20, boxShadow: "0 8px 28px rgba(13,110,253,0.08)", textAlign: "center" }}>
        <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "#8aabcc", marginBottom: 6, fontWeight: 600 }}>Based in Bangkok, TH</div>
        <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 15, color: "#0d1b2a", fontWeight: 700 }}>⏱️ Usually responds within 24 hours</div>
      </motion.div>
    </div>
  );
}