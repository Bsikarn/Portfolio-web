import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin } from "lucide-react";
import ScrollSection from "../components/ScrollSection";
import { styles } from "../styles/ContactPage.styles";
import { supabase } from "../lib/supabase";
import LoadingPage from "../components/LoadingPage";

// Default contact info shown before DB data loads
const DEFAULT_CONTACTS = [
  { icon: <Mail size={28} />, label: "Email", handle: "sikarn.pat@gmail.com", href: "mailto:sikarn.pat@gmail.com", color: "#ffc8d5", accent: "#ff6b6b" },
  { icon: <Github size={28} />, label: "GitHub", handle: "Bsikarn", href: "https://github.com/Bsikarn", color: "#A3D8F4", accent: "#0D6EFD" },
  { icon: <Linkedin size={28} />, label: "LinkedIn", handle: "Sikarn Pattarasirimongkol", href: "https://linkedin.com/in/sbeaut", color: "#c4f0e0", accent: "#0077b5" },
];

// Map contact_links DB record to UI contact items
function mapContactLinks(cl) {
  return [
    { icon: <Mail size={28} />, label: "Email", handle: cl.email || "N/A", href: cl.email ? `mailto:${cl.email}` : "#", color: "#ffc8d5", accent: "#ff6b6b" },
    { icon: <Github size={28} />, label: "GitHub", handle: cl.github_handle || "N/A", href: cl.github_url || "#", color: "#A3D8F4", accent: "#0D6EFD" },
    { icon: <Linkedin size={28} />, label: "LinkedIn", handle: cl.linkedin_handle || "N/A", href: cl.linkedin_url || "#", color: "#c4f0e0", accent: "#0077b5" },
  ];
}

export default function ContactPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);

  // Listen for window resize to toggle mobile layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch contact links from Supabase on mount
  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase.from("portfolio_settings").select("contact_links").eq("id", 1).single();
      if (data?.contact_links) setContacts(mapContactLinks(data.contact_links));
      setIsLoading(false);
    };
    fetchContacts();
  }, []);

  if (isLoading) return <LoadingPage />;

  return (
    <div style={styles.container}>
      {/* Header */}
      <ScrollSection
        id="contact-header"
        style={{ ...styles.headerWrapper, padding: isMobile ? "32px 24px" : "48px 64px" }}
      >
        <div style={styles.header}>
          <h1 style={{ ...styles.title, fontSize: isMobile ? 32 : 40 }}>
            Let's work <span style={styles.highlightText}>together</span>
          </h1>
          <p style={styles.subtitle}>I'm always open to exciting opportunities and collaborations.</p>
        </div>
      </ScrollSection>

      {/* Contact Cards */}
      <ScrollSection id="contact-cards" style={styles.cardsContainer}>
        {contacts.map((c, i) => (
          <motion.a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(13,110,253,0.18)" }}
            style={styles.card}
          >
            <div style={{ ...styles.iconWrapper, background: c.color, color: c.accent }}>{c.icon}</div>
            <div>
              <div style={styles.cardLabel}>{c.label}</div>
              <div style={styles.cardHandle}>{c.handle}</div>
            </div>
            <div style={{ ...styles.connectBtn, background: c.color, color: c.accent }}>Connect →</div>
          </motion.a>
        ))}
      </ScrollSection>

      {/* Footer Info */}
      <ScrollSection
        id="contact-footer"
        style={styles.footerInfo}
      >
        <div style={styles.footerLocation}>Based in Bangkok, TH</div>
        <div style={styles.footerResponse}>⏱️ Usually responds within 24 hours</div>
      </ScrollSection>
    </div>
  );
}
