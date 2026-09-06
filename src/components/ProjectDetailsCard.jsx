import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Github,
  ExternalLink,
  Play,
  CheckCircle2,
  Code2,
  Trophy,
  Image as ImageIcon,
  Target,
  Lightbulb,
  UserCog,
  Wrench,
  TrendingUp,
  BookOpen,
  Workflow,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { styles } from "../styles/ProjectsPage.styles";
import { getTransformedUrl } from "../lib/supabase";
import { cleanTechTags } from "../lib/adminHelpers";

// Check if a link is valid (not empty or placeholder)
const isValidUrl = (url) => url && url !== "#" && url !== "";

// Build background for cover header using YouTube thumbnail if available
function getCoverBg(videoUrl) {
  if (videoUrl?.includes("youtube.com/embed/")) {
    const id = videoUrl.split("embed/")[1].split("?")[0];
    return `linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.2)), url(https://img.youtube.com/vi/${id}/maxresdefault.jpg) center/cover no-repeat`;
  }
  return "linear-gradient(135deg,#f0f6ff,#e0f2fe)";
}

// Generic action link button (live or GitHub) with disabled state
function ActionLink({ href, isValid, onClick, whileHoverScale = 1.05, style, children, title }) {
  return (
    <motion.a
      href={isValid ? href : "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      whileHover={isValid ? { scale: whileHoverScale } : {}}
      whileTap={isValid ? { scale: 0.95 } : {}}
      title={title}
      style={{
        ...style,
        opacity: isValid ? 1 : 0.5,
        cursor: isValid ? "pointer" : "not-allowed",
        background: isValid ? style.background : "#e0e0e0",
        color: isValid ? style.color : "#9e9e9e",
        border: isValid ? style.border : "none",
      }}
    >
      {children}
    </motion.a>
  );
}

export default function ProjectDetailsCard({
  selected,
  nav,
  openVideoLightbox,
  openFlowLightbox,
  openAwardLightbox,
  openGalleryLightbox,
  handleLinkClick,
  isMobile,
}) {
  const [isFlowExpanded, setIsFlowExpanded] = useState(false);

  useEffect(() => {
    setIsFlowExpanded(false);
  }, [selected?.id]);

  if (!selected) return null;

  const liveValid = isValidUrl(selected.link_url);
  const ghValid = isValidUrl(selected.github_url);

  const flowEmbedUrl = selected.flow_pic || selected.flow_image || selected.flow_url;
  const flowLinkUrl = selected.flow_url || selected.flow_pic;
  const hasFlowEmbed = isValidUrl(flowEmbedUrl);
  const hasFlowLink = isValidUrl(flowLinkUrl);

  const cleanTags = cleanTechTags(selected.tags);
  const hasCard2Content = Boolean(hasFlowEmbed || selected.gallery?.length > 0 || selected.award);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ========================================================================= */}
      {/* CARD 1: MAIN DETAILS (Header, Info, Problem/Solution, Role/Tech/Features) */}
      {/* ========================================================================= */}
      <motion.div
        key={`card1-${selected.id}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.7 }}
        style={styles.detailsMainCard}
      >
        {/* Cover Header with play button */}
        <div style={{ ...styles.coverHeader, background: getCoverBg(selected.video_url) }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            onClick={openVideoLightbox}
            style={{
              ...styles.playVideoButton,
              cursor: selected.video_url ? "pointer" : "default",
              opacity: selected.video_url ? 1 : 0.5,
            }}
          >
            <Play size={32} style={styles.playIconMargin} />
          </motion.div>
        </div>

        <div style={{ ...styles.detailsPadding, padding: isMobile ? "28px 20px" : "40px 48px" }}>
          {/* Title & Meta */}
          <div style={styles.titleSection}>
            <h2 style={styles.mainTitle}>{selected.title}</h2>
            <div style={styles.metaData}>
              {selected.category} · {selected.year}
            </div>
            <p style={styles.mainDesc}>{selected.description}</p>
          </div>

          {/* Problem & Solution Box (Red style matching Key Features) */}
          {(selected.problem || selected.solution) && (
            <div
              style={{
                ...styles.infoBlock,
                border: "1px solid #ef4444",
                background: "rgba(254, 242, 242, 0.4)",
                marginBottom: 28,
              }}
            >
              <div style={styles.flexColGap24}>
                {selected.problem && (
                  <div>
                    <h3 style={styles.subHeadingStyle}>
                      <Target size={20} color="#ef4444" /> The Problem
                    </h3>
                    <p style={styles.textStyle}>{selected.problem}</p>
                  </div>
                )}
                {selected.solution && (
                  <div>
                    <h3 style={styles.subHeadingStyle}>
                      <Lightbulb size={20} color="#f59e0b" /> The Solution
                    </h3>
                    <p style={styles.textStyle}>{selected.solution}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Role, Technologies, Tools Used & Key Features Grid */}
          <div style={{ ...styles.techFeatureGrid, marginBottom: 28 }}>
            {/* Left Column: Role, Technologies & Tools */}
            <div style={{ ...styles.infoBlock, ...styles.flexColGap24 }}>
              {selected.my_role && (
                <div>
                  <h3 style={styles.subHeadingStyle}>
                    <UserCog size={20} color="#0D6EFD" /> My Role
                  </h3>
                  <div style={styles.roleText}>{selected.my_role}</div>
                </div>
              )}
              {cleanTags.length > 0 && (
                <div>
                  <h3 style={styles.subHeadingStyle}>
                    <Code2 size={20} color="#0D6EFD" /> Technologies
                  </h3>
                  <div style={styles.tagWrap}>
                    {cleanTags.map((t) => (
                      <span key={t} style={styles.techTag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selected.tools?.length > 0 && (
                <div style={{ border: "none" }}>
                  <h3 style={styles.subHeadingStyle}>
                    <Wrench size={20} color="#64748b" /> Tools Used
                  </h3>
                  <div style={styles.tagWrap}>
                    {selected.tools.map((t) => (
                      <span key={t} style={styles.toolTag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Key Features Box (Green Border, Checkmark Header, Green Dots for Bullet items) */}
            {selected.features?.length > 0 && (
              <div
                style={{
                  ...styles.infoBlock,
                  border: "1px solid #10b981",
                  background: "rgba(240,253,244,0.3)",
                }}
              >
                <h3 style={{ ...styles.subHeadingStyle, color: "#065f46" }}>
                  <CheckCircle2 size={20} color="#10b981" /> Key Features
                </h3>
                <ul style={styles.featureList}>
                  {selected.features.map((feat, idx) => (
                    <li key={idx} style={styles.featureItem}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#10b981",
                          flexShrink: 0,
                          marginTop: 7,
                        }}
                      />
                      <span style={styles.featureTextLine}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Combined Box: Results & Impact (Left) + Key Learnings (Right) Side-by-Side Dashboard Container */}
          {(selected.results_impact || selected.key_learnings) && (
            <div
              style={{
                ...styles.infoBlock,
                border: "1px solid #3b82f6",
                background: "rgba(240, 246, 255, 0.35)",
                padding: isMobile ? 20 : 28,
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : (selected.results_impact && selected.key_learnings ? "1fr 1fr" : "1fr"),
                gap: isMobile ? 24 : 0,
              }}
            >
              {/* Left Column: Results & Impact */}
              {selected.results_impact && (
                <div
                  style={{
                    paddingRight: isMobile ? 0 : (selected.key_learnings ? 28 : 0),
                    borderRight: (!isMobile && selected.key_learnings) ? "1px solid rgba(226, 232, 240, 0.8)" : "none",
                  }}
                >
                  <h3 style={styles.subHeadingStyle}>
                    <TrendingUp size={20} color="#16a34a" /> Results & Impact
                  </h3>
                  <p style={styles.textStyle}>{selected.results_impact}</p>
                </div>
              )}

              {/* Right Column: Key Learnings */}
              {selected.key_learnings && (
                <div
                  style={{
                    paddingLeft: isMobile ? 0 : (selected.results_impact ? 28 : 0),
                  }}
                >
                  <h3 style={styles.subHeadingStyle}>
                    <BookOpen size={20} color="#f59e0b" /> Key Learnings
                  </h3>
                  <p style={styles.textStyle}>{selected.key_learnings}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* CARD 2: MEDIA & ACHIEVEMENTS (Flow Architecture, Gallery, Achievements)    */}
      {/* ========================================================================= */}
      {hasCard2Content && (
        <motion.div
          key={`card2-${selected.id}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.7, delay: 0.1 }}
          style={styles.detailsMainCard}
        >
          <div style={{ ...styles.detailsPadding, padding: isMobile ? "28px 20px" : "40px 48px" }}>
            {/* System Architecture Section (Collapsible Dropdown Accordion with Lazy-Loaded Embed) */}
            {hasFlowEmbed && (
              <div style={{ ...styles.gallerySection, marginBottom: selected.gallery?.length > 0 || selected.award ? 40 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: isFlowExpanded ? 16 : 0 }}>
                  {/* Clickable Title & Dropdown Toggle Pill */}
                  <button
                    type="button"
                    onClick={() => setIsFlowExpanded((prev) => !prev)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 10,
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    title={isFlowExpanded ? "Click to hide System Architecture diagram" : "Click to load and view System Architecture diagram"}
                  >
                    <h3 style={{ ...styles.subHeadingStyle, margin: 0, display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Workflow size={20} color="#0D6EFD" /> System Architecture Diagram
                    </h3>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 12px",
                        borderRadius: 20,
                        background: isFlowExpanded ? "rgba(13,110,253,0.15)" : "rgba(226, 232, 240, 0.7)",
                        color: isFlowExpanded ? "#0D6EFD" : "#475569",
                        fontSize: "12px",
                        fontWeight: 600,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {isFlowExpanded ? (
                        <>Hide Diagram <ChevronUp size={14} /></>
                      ) : (
                        <>Show Diagram <ChevronDown size={14} /></>
                      )}
                    </span>
                  </button>

                  <ActionLink
                    href={flowLinkUrl}
                    isValid={hasFlowLink}
                    onClick={(e) => {
                      if (!hasFlowLink) e.preventDefault();
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "50px",
                      background: "linear-gradient(135deg, #2b7fff, #0D6EFD)",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      textDecoration: "none",
                      boxShadow: hasFlowLink ? "0 4px 12px rgba(13,110,253,0.2)" : "none",
                    }}
                    title={hasFlowLink ? "Open System Architecture Diagram Link" : "No link connected for this architecture"}
                  >
                    View Architecture <ExternalLink size={14} />
                  </ActionLink>
                </div>

                {/* Lazy-Loaded Embed Container (only renders iframe when opened) */}
                {isFlowExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      borderRadius: 16,
                      overflow: "hidden",
                      border: "1px solid rgba(226, 232, 240, 0.8)",
                      background: "#f8fbff",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                      position: "relative",
                      width: "100%",
                      maxWidth: "100%",
                      height: isMobile ? 550 : 750,
                      minHeight: isMobile ? 480 : 650,
                      boxSizing: "border-box",
                    }}
                  >
                    <iframe
                      src={flowEmbedUrl}
                      title={`${selected.title} System Architecture Diagram`}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                        borderRadius: 16,
                        display: "block",
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      loading="lazy"
                    />
                  </motion.div>
                )}
              </div>
            )}

            {/* Project Gallery */}
            {selected.gallery?.length > 0 && (
              <div style={{ ...styles.gallerySection, marginBottom: selected.award ? 40 : 0 }}>
                <h3 style={styles.subHeadingStyle}>
                  <ImageIcon size={20} color="#0D6EFD" /> Project Gallery
                </h3>
                <div style={{ ...styles.galleryGrid, gridTemplateColumns: selected.gallery.length === 1 ? "1fr" : "1fr 1fr" }}>
                  <div
                    onClick={() => openGalleryLightbox(0)}
                    style={{ ...styles.galleryLargeItem, height: selected.gallery.length === 1 ? 400 : 250 }}
                  >
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={getTransformedUrl(selected.gallery[0], { width: 800 })}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = selected.gallery[0];
                      }}
                      style={{ ...styles.galleryImage, aspectRatio: "16/9" }}
                    />
                  </div>
                  {selected.gallery.length > 1 && (
                    <div onClick={() => openGalleryLightbox(1)} style={styles.gallerySmallItem}>
                      <motion.img
                        whileHover={{ scale: selected.gallery.length > 2 ? 1 : 1.05 }}
                        src={getTransformedUrl(selected.gallery[1], { width: 600 })}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = selected.gallery[1];
                        }}
                        style={{ ...styles.galleryImage, aspectRatio: "16/9" }}
                      />
                      {selected.gallery.length > 2 && (
                        <div style={styles.galleryOverlay}>+{selected.gallery.length - 2}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Achievements / Award */}
            {selected.award && (
              <div style={{ ...styles.awardSection, marginBottom: 0 }}>
                <div style={styles.awardTextSide}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "linear-gradient(135deg, #FFDF40, #FFC107)",
                      color: "#855E00",
                      padding: "8px 18px",
                      borderRadius: 50,
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "'Poppins',sans-serif",
                      marginBottom: 16,
                      boxShadow: "0 4px 14px rgba(255,193,7,0.35)",
                      border: "none",
                    }}
                  >
                    <Trophy size={15} /> Achievements
                  </div>
                  <h3 style={styles.awardTitle}>{selected.award.title}</h3>
                  <p style={styles.awardComp}>📍 {selected.award.competition}</p>
                  <p style={styles.awardDesc}>{selected.award.description}</p>
                </div>
                <motion.div
                  whileHover={{ scale: selected.award.image_url ? 1.02 : 1 }}
                  onClick={openAwardLightbox}
                  style={{
                    ...styles.awardImageSide,
                    background: selected.award.image_url ? "transparent" : "#ffe58f",
                    cursor: selected.award.image_url ? "pointer" : "default",
                  }}
                >
                  {selected.award.image_url ? (
                    <img
                      src={getTransformedUrl(selected.award.image_url, { width: 600 })}
                      alt="Award"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = selected.award.image_url;
                      }}
                      style={{ ...styles.coverImage, aspectRatio: "16/9" }}
                    />
                  ) : (
                    <>
                      <ImageIcon size={32} style={styles.placeholderIcon} />
                      <span style={styles.placeholderText}>Event Photo</span>
                    </>
                  )}
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* CARD 3: FOOTER CARD (Languages & Action Buttons)                          */}
      {/* ========================================================================= */}
      <motion.div
        key={`card3-${selected.id}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.7, delay: 0.2 }}
        style={{
          ...styles.detailsMainCard,
          padding: isMobile ? "24px 20px" : "32px 48px",
        }}
      >
        <div style={styles.footerRow}>
          {/* Language Bar */}
          <div style={styles.langBarWrap}>
            <h3 style={styles.langTitle}>Languages</h3>
            {selected.languages?.length > 0 ? (
              <>
                <div style={styles.langBarTrack}>
                  {selected.languages.map((l) => (
                    <div key={l.name} style={{ width: `${l.percent}%`, background: l.color }} title={`${l.name} ${l.percent}%`} />
                  ))}
                </div>
                <div style={styles.langLegendWrap}>
                  {selected.languages.map((l) => (
                    <div key={l.name} style={styles.langLegendItem}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
                      {l.name} <span style={styles.langPercent}>{l.percent}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={styles.noLangText}>No language data available.</div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={styles.actionBtnsWrap}>
            <ActionLink
              href={selected.link_url}
              isValid={liveValid}
              onClick={(e) => {
                if (!liveValid) e.preventDefault();
                else handleLinkClick(e, selected.link_url);
              }}
              style={{
                ...styles.liveBtn,
                padding: "10px",
                width: "40px",
                height: "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "12px",
              }}
              title="Live Preview"
            >
              <ExternalLink size={20} />
            </ActionLink>
            <ActionLink
              href={selected.github_url}
              isValid={ghValid}
              onClick={(e) => {
                if (!ghValid) e.preventDefault();
                else handleLinkClick(e, selected.github_url);
              }}
              style={styles.githubBtn}
            >
              <Github size={16} /> GitHub
            </ActionLink>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
