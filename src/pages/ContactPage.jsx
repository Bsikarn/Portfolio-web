import { motion } from "framer-motion";
import { Mail, Github, Linkedin } from "lucide-react";

export default function ContactPage() {
  const CONTACTS = [
    { icon: <Mail size={28} />, label: "Email", handle: "sikarn.pat@gmail.com", href: "mailto:siakrn.pat@gmail.com", color: "#ffc8d5", accent: "#ff6b6b" },
    { icon: <Github size={28} />, label: "GitHub", handle: "Bsikarn", href: "https://github.com/Bsikarn", color: "#A3D8F4", accent: "#0D6EFD" },
    { icon: <Linkedin size={28} />, label: "LinkedIn", handle: "Sikarn Pattarasirimongkol", href: "https://linkedin.com/in/sbeaut", color: "#c4f0e0", accent: "#0077b5" },
  ];

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={styles.header}>
        <h1 style={styles.title}>
          Let's work <span style={styles.highlightText}>together</span>
        </h1>
        <p style={styles.subtitle}>I'm always open to exciting opportunities and collaborations.</p>
      </motion.div>

      <div style={styles.cardsContainer}>
        {CONTACTS.map((c, i) => (
          <motion.a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(13,110,253,0.18)" }}
            style={styles.card}
          >
            <div style={{ ...styles.iconWrapper, background: c.color, color: c.accent }}>
              {c.icon}
            </div>
            <div>
              <div style={styles.cardLabel}>{c.label}</div>
              <div style={styles.cardHandle}>{c.handle}</div>
            </div>
            <div style={{ ...styles.connectBtn, background: c.color, color: c.accent }}>Connect →</div>
          </motion.a>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={styles.footerInfo}>
        <div style={styles.footerLocation}>Based in Bangkok, TH</div>
        <div style={styles.footerResponse}>⏱️ Usually responds within 24 hours</div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: 64,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(ellipse at 20% 40%, rgba(163,216,244,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(255,200,213,0.18) 0%, transparent 60%)"
  },
  header: { textAlign: "center", marginBottom: 48 },
  title: {
    fontFamily: "'Poppins',sans-serif",
    fontWeight: 800,
    fontSize: 40,
    color: "#0d1b2a",
    margin: "0 0 12px"
  },
  highlightText: {
    background: "linear-gradient(135deg,#0D6EFD,#A3D8F4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  subtitle: { fontFamily: "'Poppins',sans-serif", color: "#8aabcc", fontSize: 15 },
  cardsContainer: { display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" },
  card: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(16px)",
    borderRadius: 24,
    padding: "36px 32px",
    textDecoration: "none",
    width: 200,
    textAlign: "center",
    boxShadow: "0 24px 64px rgba(13,110,253,0.15), 0 8px 24px rgba(13,110,253,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    cursor: "pointer"
  },
  iconWrapper: {
    width: 70, height: 70, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  cardLabel: { fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 16, color: "#0d1b2a" },
  cardHandle: { fontFamily: "'Poppins',sans-serif", fontSize: 12, color: "#8aabcc", marginTop: 4, fontWeight: 500 },
  connectBtn: { padding: "7px 18px", borderRadius: 50, fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 12 },
  footerInfo: {
    marginTop: 60, padding: "24px 40px", background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(16px)", borderRadius: 20,
    boxShadow: "0 24px 64px rgba(13,110,253,0.15), 0 8px 24px rgba(13,110,253,0.05)", textAlign: "center"
  },
  footerLocation: { fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "#8aabcc", marginBottom: 6, fontWeight: 600 },
  footerResponse: { fontFamily: "'Poppins',sans-serif", fontSize: 15, color: "#0d1b2a", fontWeight: 700 }
};