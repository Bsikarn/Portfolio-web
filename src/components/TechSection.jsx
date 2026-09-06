import { motion } from "framer-motion";
import { FileBadge, Image as ImageIcon, Terminal, Database, Palette, Atom, Layers, Server, Sparkles, Boxes, Zap, GitBranch, Code, Code2, Send, Container, Figma, Wrench, Trophy, Activity } from "lucide-react";
import ScrollSection from "./ScrollSection";
import { isItemHidden } from "../lib/adminHelpers";
import { getCardStyle } from "../styles/ProjectsPage.styles";

// Get Icon component matching tech/language/tool name
function getTechIcon(name) {
  const norm = (name || "").toLowerCase().trim();

  if (norm.includes("javascript") || norm === "js") {
    return <span className="w-[18px] h-[18px] rounded-[4px] bg-[#f7df1e] text-black font-black text-[9px] flex items-center justify-center shrink-0 leading-none">JS</span>;
  }
  if (norm.includes("typescript") || norm === "ts") {
    return <span className="w-[18px] h-[18px] rounded-[4px] bg-[#3178c6] text-white font-black text-[9px] flex items-center justify-center shrink-0 leading-none">TS</span>;
  }
  if (norm.includes("python")) return <Terminal size={16} className="text-[#3776ab] shrink-0" />;
  if (norm.includes("c++") || norm.includes("cpp") || norm.includes("c#") || norm === "c") return <Code2 size={16} className="text-[#00599c] shrink-0" />;
  if (norm.includes("sql") || norm.includes("postgres") || norm.includes("mysql")) return <Database size={16} className="text-[#336791] shrink-0" />;
  if (norm.includes("html")) return <Code2 size={16} className="text-[#e34f26] shrink-0" />;
  if (norm.includes("css")) return <Palette size={16} className="text-[#1572b6] shrink-0" />;
  if (norm.includes("react")) return <Atom size={16} className="text-[#61dafb] shrink-0" />;
  if (norm.includes("next")) return <Layers size={16} className="text-[#000000] shrink-0" />;
  if (norm.includes("node")) return <Server size={16} className="text-[#339933] shrink-0" />;
  if (norm.includes("express")) return <Server size={16} className="text-[#64748b] shrink-0" />;
  if (norm.includes("tailwind")) return <Sparkles size={16} className="text-[#06b6d4] shrink-0" />;
  if (norm.includes("three") || norm.includes("3d")) return <Boxes size={16} className="text-[#000000] shrink-0" />;
  if (norm.includes("framer") || norm.includes("motion")) return <Zap size={16} className="text-[#0055ff] shrink-0" />;
  if (norm.includes("git")) return <GitBranch size={16} className="text-[#f05032] shrink-0" />;
  if (norm.includes("code") || norm.includes("vs")) return <Code size={16} className="text-[#007acc] shrink-0" />;
  if (norm.includes("supabase")) return <Database size={16} className="text-[#3ecf8e] shrink-0" />;
  if (norm.includes("postman")) return <Send size={16} className="text-[#ff6c37] shrink-0" />;
  if (norm.includes("docker")) return <Container size={16} className="text-[#2496ed] shrink-0" />;
  if (norm.includes("figma")) return <Figma size={16} className="text-[#f24e1e] shrink-0" />;
  if (norm.includes("vite")) return <Zap size={16} className="text-[#646cff] shrink-0" />;

  return <Wrench size={16} className="text-[#0D6EFD] shrink-0" />;
}

// Static non-clickable tech badge with icon
export const TechBadge = ({ tag }) => (
  <div className="inline-flex items-center gap-[8px] px-[16px] py-[9px] rounded-[50px] bg-white/90 backdrop-blur-[8px] border border-[#eef3ff] shadow-[0_2px_8px_rgba(13,110,253,0.04)] font-sans font-semibold text-[13px] text-[#334155] select-none hover:shadow-[0_4px_12px_rgba(13,110,253,0.08)] transition-all">
    {getTechIcon(tag)}
    <span>{tag}</span>
  </div>
);

// Single achievement / activity row with media buttons
export const MediaRow = ({ item, setPreviewImage, setPage }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] p-[20px] bg-[#f8fbff] rounded-[16px] border border-[#eef3ff]">
    <div>
      <div className="font-sans font-bold text-[18px] text-brand-dark flex items-center flex-wrap">
        {item.title}
        {item.year && <span className="text-[14px] text-brand-muted font-normal ml-[8px]">({item.year})</span>}
        {item.link_url && (
          <button
            type="button"
            onClick={() => { localStorage.setItem("targetProjectId", item.link_url || item.id || item.title); setPage("Projects"); }}
            className="ml-[12px] bg-[#eef3ff] text-[#0D6EFD] text-[12px] font-semibold px-[12px] py-[4px] rounded-full hover:bg-[#0D6EFD] hover:text-white transition-colors cursor-pointer"
          >
            Project
          </button>
        )}
      </div>
      <div className="font-sans text-[14px] text-brand-muted mt-[4px]">{item.description}</div>
    </div>
    <div className="flex gap-[12px] shrink-0">
      <button
        type="button"
        onClick={() => item.gallery?.[0] && setPreviewImage(item.gallery[0])}
        disabled={!item.gallery?.[0]}
        aria-label="View Certificate"
        className={`w-[44px] h-[44px] rounded-[12px] border border-[#eef3ff] flex items-center justify-center shadow-[0_2px_8px_rgba(13,110,253,0.05)] transition-colors ${item.gallery?.[0] ? "bg-white text-brand-primary hover:bg-[#0D6EFD] hover:text-white cursor-pointer" : "bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-50"}`}
        title="View Certificate"
      >
        <FileBadge size={20} />
      </button>
      <button
        type="button"
        onClick={() => item.gallery?.[1] && setPreviewImage(item.gallery[1])}
        disabled={!item.gallery?.[1]}
        aria-label="View Activity Picture"
        className={`w-[44px] h-[44px] rounded-[12px] border border-[#eef3ff] flex items-center justify-center shadow-[0_2px_8px_rgba(16,185,129,0.05)] transition-colors ${item.gallery?.[1] ? "bg-white text-[#10b981] hover:bg-[#10b981] hover:text-white cursor-pointer" : "bg-[#e0e0e0] text-[#9e9e9e] cursor-not-allowed opacity-50"}`}
        title="View Activity Picture"
      >
        <ImageIcon size={20} />
      </button>
    </div>
  </div>
);

// Section card for Achievements / Activities with visible/hidden split
export const ContentSection = ({ id, icon, iconBg, iconColor, title, items, setPreviewImage, setPage, setHiddenModal, modalTitle, isMobile }) => {
  const visible = items.filter((a) => !isItemHidden(a));
  const hidden = items.filter((a) => isItemHidden(a));
  const cardPad = isMobile ? "p-[32px_24px] gap-[24px]" : "p-[48px] gap-[32px]";
  return (
    <section className={`max-w-[1440px] mx-auto ${isMobile ? "p-[0px_24px_40px]" : "p-[0px_48px_40px]"}`}>
      <ScrollSection id={id} rootMargin="-25% 0px -25% 0px" style={getCardStyle()} className={`flex flex-col ${cardPad}`}>
        <div className="flex items-center gap-[16px]">
          <div className={`w-[48px] h-[48px] rounded-[16px] flex items-center justify-center shrink-0 ${iconBg}`} style={{ color: iconColor }}>{icon}</div>
          <h2 className="font-sans font-extrabold text-[28px] text-brand-dark m-0">{title}</h2>
        </div>
        <div className="flex flex-col gap-[20px]">
          {visible.length > 0
            ? visible.map((item) => <MediaRow key={item.id} item={item} setPreviewImage={setPreviewImage} setPage={setPage} />)
            : <div className="text-brand-muted text-[14px]">No {title.toLowerCase()} added yet.</div>
          }
        </div>
        {hidden.length > 0 && (
          <div className="flex justify-center -mt-[16px] mb-[-16px]">
            <button
              type="button"
              onClick={() => setHiddenModal({ isOpen: true, title: modalTitle, items: hidden })}
              className="px-[16px] py-[6px] rounded-[50px] bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#334155] border border-[#cbd5e1] text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-[6px] shadow-sm"
            >
              more
            </button>
          </div>
        )}
      </ScrollSection>
    </section>
  );
};

// Technologies & Tools section: Languages, Technologies, Tools badges
export const TechSkillsSection = ({ portfolioLanguages, portfolioTags, portfolioTools, isMobile }) => {
  const sectionPad = isMobile ? "p-[40px_24px]" : "p-[40px_48px]";
  return (
    <section className={`max-w-[1440px] mx-auto ${sectionPad}`}>
      <ScrollSection id="technologies-and-tools" rootMargin="-25% 0px -25% 0px" style={getCardStyle()} className={isMobile ? "p-[32px_24px]" : "p-[48px]"}>
        {portfolioLanguages.length > 0 && (
          <>
            <h2 className="font-sans font-extrabold text-[24px] text-brand-dark mb-[24px] text-center">LANGUAGES</h2>
            <div className="flex flex-wrap justify-center gap-[12px] mb-[32px]">
              {portfolioLanguages.map((tag) => <TechBadge key={tag} tag={tag} />)}
            </div>
          </>
        )}
        {portfolioTags.length > 0 && (
          <>
            <h2 className="font-sans font-extrabold text-[24px] text-brand-dark mb-[24px] text-center">Technologies</h2>
            <div className="flex flex-wrap justify-center gap-[12px] mb-[32px]">
              {portfolioTags.map((tag) => <TechBadge key={tag} tag={tag} />)}
            </div>
          </>
        )}
        {portfolioTools.length > 0 && (
          <>
            <h2 className="font-sans font-extrabold text-[24px] text-brand-dark mb-[24px] text-center mt-[16px]">Tools</h2>
            <div className="flex flex-wrap justify-center gap-[12px]">
              {portfolioTools.map((tag) => <TechBadge key={tag} tag={tag} />)}
            </div>
          </>
        )}
      </ScrollSection>
    </section>
  );
};

// Section icon helpers (exported for use in HomePage)
export const SECTION_ICONS = {
  achievements: { icon: <Trophy size={24} />, iconBg: "bg-gradient-to-br from-[#fff0f4] to-[#ffe4e6]", iconColor: "#ff6b6b" },
  activities: { icon: <Activity size={24} />, iconBg: "bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7]", iconColor: "#10b981" },
};
