import { motion } from "framer-motion";
import { Mail, Github, Linkedin } from "lucide-react";
import { styles } from "../styles/ContactPage.styles";

export default function ContactPage() {
  const CONTACTS = [
    { icon: <Mail size={28} />, label: "Email", handle: "sikarn.pat@gmail.com", href: "https://mailto:sikarn.pat@gmail.com", color: "#ffc8d5", accent: "#ff6b6b" },
    { icon: <Github size={28} />, label: "GitHub", handle: "Bsikarn", href: "https://github.com/Bsikarn", color: "#A3D8F4", accent: "#0D6EFD" },
    { icon: <Linkedin size={28} />, label: "LinkedIn", handle: "Sikarn Pattarasirimongkol", href: "https://linkedin.com/in/sbeaut", color: "#c4f0e0", accent: "#0077b5" },
  ];

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
        style={styles.headerWrapper}
      >
        <div style={styles.header}>
          <h1 style={styles.title}>
            Let's work <span style={styles.highlightText}>together</span>
          </h1>
          <p style={styles.subtitle}>I'm always open to exciting opportunities and collaborations.</p>
        </div>
      </motion.div>

      <div style={styles.cardsContainer}>
        {CONTACTS.map((c, i) => (
          <motion.a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.6, delay: i * 0.1 }}
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", bounce: 0.5, duration: 0.8, delay: 0.2 }}
        style={styles.footerInfo}
      >
        <div style={styles.footerLocation}>Based in Bangkok, TH</div>
        <div style={styles.footerResponse}>⏱️ Usually responds within 24 hours</div>
      </motion.div>
    </div>
  );
}

