import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Github, Linkedin, X, Check } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function ContactPopup({ isOpen, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchContacts = async () => {
      try {
        const { data } = await supabase.from("portfolio_settings").select("contact_links").eq("id", 1).single();
        if (data?.contact_links) {
          const cl = data.contact_links;
          setContacts([
            { icon: <Mail size={24} />, label: "Email", handle: cl.email || "N/A", href: cl.email ? `mailto:${cl.email}` : "#", color: "#ffc8d5", accent: "#ff6b6b", isEmail: true },
            { icon: <Github size={24} />, label: "GitHub", handle: cl.github_handle || "N/A", href: cl.github_url || "#", color: "#A3D8F4", accent: "#0D6EFD" },
            { icon: <Linkedin size={24} />, label: "LinkedIn", handle: cl.linkedin_handle || "N/A", href: cl.linkedin_url || "#", color: "#c4f0e0", accent: "#0077b5" },
          ]);
        }
      } catch (err) {
        console.error("Error loading contacts popup:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();
  }, [isOpen]);

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-[24px]">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-dark/20 backdrop-blur-[4px]"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative z-10 w-full max-w-[420px] bg-white/90 backdrop-blur-[16px] border border-brand-secondary/35 rounded-[24px] shadow-[0_16px_48px_rgba(13,110,253,0.14)] p-[28px] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-[20px]">
          <h3 className="font-sans font-extrabold text-[20px] text-brand-dark m-0">
            Let's work <span className="bg-gradient-to-br from-brand-primary to-brand-secondary bg-clip-text text-transparent">together</span>
          </h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-[32px] h-[32px] rounded-full bg-[#f0f6ff] hover:bg-[#e0eeff] flex items-center justify-center border-none text-[#4a6a8a] hover:text-brand-primary cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="py-[32px] text-center font-sans text-brand-muted text-[14px]">Loading contact info...</div>
        ) : (
          <div className="flex flex-col gap-[14px]">
            {contacts.map((c) => (
              <div
                key={c.label}
                className="flex items-center justify-between gap-[16px] p-[16px] bg-[#f8fbff] rounded-[16px] border border-[#eef3ff] hover:border-brand-secondary/30 transition-all"
              >
                <div className="flex items-center gap-[12px]">
                  <div
                    className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center shrink-0"
                    style={{ background: c.color, color: c.accent }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div className="font-sans font-bold text-[13px] text-brand-muted uppercase tracking-[0.5px]">
                      {c.label}
                    </div>
                    <div className="font-sans font-semibold text-[14px] text-brand-dark break-all">
                      {c.handle}
                    </div>
                  </div>
                </div>

                {c.isEmail ? (
                  <button
                    onClick={() => handleCopyEmail(c.handle)}
                    className="shrink-0 px-[12px] py-[6px] rounded-[50px] bg-white border border-[#eef3ff] hover:border-brand-primary/30 text-brand-primary font-sans font-bold text-[12px] cursor-pointer flex items-center gap-[4px] shadow-[0_2px_6px_rgba(13,110,253,0.03)]"
                  >
                    {copied ? <><Check size={12} /> Copied</> : "Copy"}
                  </button>
                ) : (
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-[12px] py-[6px] rounded-[50px] bg-white border border-[#eef3ff] hover:border-brand-primary/30 text-brand-primary font-sans font-bold text-[12px] no-underline cursor-pointer flex items-center gap-[2px] shadow-[0_2px_6px_rgba(13,110,253,0.03)]"
                  >
                    Go →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-[20px] text-center font-sans text-[12px] text-brand-muted opacity-85">
          Based in Bangkok, TH
        </div>
      </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
