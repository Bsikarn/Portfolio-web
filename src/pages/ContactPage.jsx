import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin } from "lucide-react";
import { styles } from "../styles/ContactPage.styles";

export default function ContactPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Predefined contact links and their visual properties
  const CONTACTS = [
    { icon: <Mail size={28} />, label: "Email", handle: "sikarn.pat@gmail.com", href: "mailto:sikarn.pat@gmail.com", color: "#ffc8d5", accent: "#ff6b6b" },
    { icon: <Github size={28} />, label: "GitHub", handle: "Bsikarn", href: "https://github.com/Bsikarn", color: "#A3D8F4", accent: "#0D6EFD" },
    { icon: <Linkedin size={28} />, label: "LinkedIn", handle: "Sikarn Pattarasirimongkol", href: "https://linkedin.com/in/sbeaut", color: "#c4f0e0", accent: "#0077b5" },
  ];

  return (
    <div style={styles.container}>
      {/* Header section with entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        style={{ ...styles.headerWrapper, padding: isMobile ? "32px 24px" : "48px 64px" }}
      >
        <div style={styles.header}>
          <h1 style={{ ...styles.title, fontSize: isMobile ? 32 : 40 }}>
            Let's work <span style={styles.highlightText}>together</span>
          </h1>
          <p style={styles.subtitle}>I'm always open to exciting opportunities and collaborations.</p>
        </div>
      </motion.div>

      {/* Grid container for contact cards */}
      <div style={styles.cardsContainer}>
        {CONTACTS.map((c, i) => (
          <motion.a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            // Staggered entrance animation based on index
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.6, delay: i * 0.1 }}
            // Hover effect to lift the card up and add a shadow
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(13,110,253,0.18)" }}
            style={styles.card}
          >
            {/* Contact Icon Box */}
            <div style={{ ...styles.iconWrapper, background: c.color, color: c.accent }}>
              {c.icon}
            </div>

            {/* Contact Details */}
            <div>
              <div style={styles.cardLabel}>{c.label}</div>
              <div style={styles.cardHandle}>{c.handle}</div>
            </div>

            {/* "Connect" Button styling on the right side of the card */}
            <div style={{ ...styles.connectBtn, background: c.color, color: c.accent }}>Connect →</div>
          </motion.a>
        ))}
      </div>

      {/* Footer information section with scroll-triggered animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} // Animation triggers only once when scrolled into view
        transition={{ type: "spring", bounce: 0.5, duration: 0.8, delay: 0.2 }}
        style={styles.footerInfo}
      >
        <div style={styles.footerLocation}>Based in Bangkok, TH</div>
        <div style={styles.footerResponse}>⏱️ Usually responds within 24 hours</div>
      </motion.div>
    </div>
  );
}

