import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Github, ExternalLink, Play, CheckCircle2, Code2, Trophy, Image as ImageIcon, Target, Lightbulb, UserCog, Wrench, TrendingUp, BookOpen, Languages } from "lucide-react";
import { styles } from "../styles/ProjectsPage.styles";
import { getTransformedUrl } from "../lib/supabase";

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
function ActionLink({ href, isValid, onClick, whileHoverScale = 1.05, style, children }) {
  return (
    <motion.a
      href={isValid ? href : "#"}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      whileHover={isValid ? { scale: whileHoverScale } : {}}
      whileTap={isValid ? { scale: 0.95 } : {}}
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

export default function ProjectDetailsCard({ selected, nav, openVideoLightbox, openAwardLightbox, openGalleryLightbox, handleLinkClick, isMobile }) {
  if (!selected) return null;

  const liveValid = isValidUrl(selected.link_url);
  const ghValid = isValidUrl(selected.github_url);

  return (
    <motion.div
      key={selected.id}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
      style={styles.detailsMainCard}
    >
      {/* Cover Header with play button */}
      <div style={{ ...styles.coverHeader, background: getCoverBg(selected.video_url) }}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          onClick={openVideoLightbox}
          style={{ ...styles.playVideoButton, cursor: selected.video_url ? "pointer" : "default", opacity: selected.video_url ? 1 : 0.5 }}
        >
          <Play size={32} style={styles.playIconMargin} />
        </motion.div>
      </div>

      <div style={{ ...styles.detailsPadding, padding: isMobile ? "32px 24px" : "40px 48px" }}>

        {/* Title & Meta */}
        <div style={styles.titleSection}>
          <h2 style={styles.mainTitle}>{selected.title}</h2>
          <div style={styles.metaData}>{selected.category} · {selected.year}</div>
          <p style={styles.mainDesc}>{selected.description}</p>
        </div>

        {/* Problem & Solution */}
        {(selected.problem || selected.solution) && (
          <div style={{ ...styles.infoBlock, marginBottom: 24 }}>
            <div style={styles.flexColGap24}>
              {selected.problem && (
                <div>
                  <h3 style={styles.subHeadingStyle}><Target size={20} color="#ff6b6b" /> The Problem</h3>
                  <p style={styles.textStyle}>{selected.problem}</p>
                </div>
              )}
              {selected.solution && (
                <div>
                  <h3 style={styles.subHeadingStyle}><Lightbulb size={20} color="#f59e0b" /> The Solution</h3>
                  <p style={styles.textStyle}>{selected.solution}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tech Stack, Role, Tools & Features */}
        <div style={styles.techFeatureGrid}>
          <div style={{ ...styles.infoBlock, ...styles.flexColGap24 }}>
            {selected.my_role && (
              <div>
                <h3 style={styles.subHeadingStyle}><UserCog size={20} color="#0D6EFD" /> My Role</h3>
                <div style={styles.roleText}>{selected.my_role}</div>
              </div>
            )}
            {selected.languages?.length > 0 && (
              <div>
                <h3 style={styles.subHeadingStyle}><Languages size={20} color="#10b981" /> LANGUAGES</h3>
                <div style={styles.tagWrap}>{selected.languages.map((l) => <span key={l.name} style={styles.techTag}>{l.name}</span>)}</div>
              </div>
            )}
            {selected.tags?.length > 0 && (
              <div>
                <h3 style={styles.subHeadingStyle}><Code2 size={20} color="#0D6EFD" /> Technologies</h3>
                <div style={styles.tagWrap}>{selected.tags.map((t) => <span key={t} style={styles.techTag}>{t}</span>)}</div>
              </div>
            )}
            {selected.tools?.length > 0 && (
              <div>
                <h3 style={styles.subHeadingStyle}><Wrench size={20} color="#64748b" /> Tools Used</h3>
                <div style={styles.tagWrap}>{selected.tools.map((t) => <span key={t} style={styles.toolTag}>{t}</span>)}</div>
              </div>
            )}
          </div>

          {selected.features?.length > 0 && (
            <div style={styles.infoBlock}>
              <h3 style={styles.subHeadingStyle}><CheckCircle2 size={20} color="#10b981" /> Key Features</h3>
              <ul style={styles.featureList}>
                {selected.features.map((feat, idx) => (
                  <li key={idx} style={styles.featureItem}>
                    <div style={styles.featureCheck}><CheckCircle2 size={18} /></div>
                    <span style={styles.featureTextLine}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Results & Key Learnings */}
        {(selected.results_impact || selected.key_learnings) && (
          <div style={styles.resultLearningGrid}>
            {selected.results_impact && (
              <div style={{ ...styles.infoBlock, background: "rgba(240,253,244,0.15)", backdropFilter: "blur(16px)", borderColor: "rgba(187,247,208,0.4)" }}>
                <h3 style={styles.subHeadingStyle}><TrendingUp size={20} color="#16a34a" /> Results & Impact</h3>
                <p style={styles.textStyle}>{selected.results_impact}</p>
              </div>
            )}
            {selected.key_learnings && (
              <div style={{ ...styles.infoBlock, background: "rgba(255,251,235,0.15)", backdropFilter: "blur(16px)", borderColor: "rgba(253,230,138,0.4)" }}>
                <h3 style={styles.subHeadingStyle}><BookOpen size={20} color="#d97706" /> Key Learnings</h3>
                <p style={styles.textStyle}>{selected.key_learnings}</p>
              </div>
            )}
          </div>
        )}

        {/* Gallery (Facebook-style) */}
        {selected.gallery?.length > 0 && (
          <div style={styles.gallerySection}>
            <h3 style={styles.subHeadingStyle}><ImageIcon size={20} color="#0D6EFD" /> Project Gallery</h3>
            <div style={{ ...styles.galleryGrid, gridTemplateColumns: selected.gallery.length === 1 ? "1fr" : "1fr 1fr" }}>
              <div onClick={() => openGalleryLightbox(0)} style={{ ...styles.galleryLargeItem, height: selected.gallery.length === 1 ? 400 : 250 }}>
                <motion.img 
                  whileHover={{ scale: 1.05 }} 
                  src={getTransformedUrl(selected.gallery[0], { width: 800 })} 
                  loading="lazy" 
                  onError={(e) => { e.target.src = selected.gallery[0]; }}
                  style={{ ...styles.galleryImage, aspectRatio: "16/9" }} 
                />
              </div>
              {selected.gallery.length > 1 && (
                <div onClick={() => openGalleryLightbox(1)} style={styles.gallerySmallItem}>
                  <motion.img 
                    whileHover={{ scale: selected.gallery.length > 2 ? 1 : 1.05 }} 
                    src={getTransformedUrl(selected.gallery[1], { width: 600 })} 
                    loading="lazy" 
                    onError={(e) => { e.target.src = selected.gallery[1]; }}
                    style={{ ...styles.galleryImage, aspectRatio: "16/9" }} 
                  />
                  {selected.gallery.length > 2 && <div style={styles.galleryOverlay}>+{selected.gallery.length - 2}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Award */}
        {selected.award && (
          <div style={styles.awardSection}>
            <div style={styles.awardTextSide}>
              <div style={styles.awardLabelTag}><Trophy size={14} /> Achievements</div>
              <h3 style={styles.awardTitle}>{selected.award.title}</h3>
              <p style={styles.awardComp}>📍 {selected.award.competition}</p>
              <p style={styles.awardDesc}>{selected.award.description}</p>
            </div>
            <motion.div
              whileHover={{ scale: selected.award.image_url ? 1.02 : 1 }}
              onClick={openAwardLightbox}
              style={{ ...styles.awardImageSide, background: selected.award.image_url ? "transparent" : "#ffe58f", cursor: selected.award.image_url ? "pointer" : "default" }}
            >
              {selected.award.image_url
                ? <img 
                    src={getTransformedUrl(selected.award.image_url, { width: 600 })} 
                    alt="Award" 
                    loading="lazy" 
                    onError={(e) => { e.target.src = selected.award.image_url; }}
                    style={{ ...styles.coverImage, aspectRatio: "16/9" }} 
                  />
                : <><ImageIcon size={32} style={styles.placeholderIcon} /><span style={styles.placeholderText}>Event Photo</span></>
              }
            </motion.div>
          </div>
        )}

        {/* Footer: Language bar + Action buttons */}
        <div style={{ ...styles.infoBlock, ...styles.footerRow }}>
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
              onClick={(e) => { if (!liveValid) e.preventDefault(); else handleLinkClick(e, selected.link_url); }}
              style={{ ...styles.liveBtn, padding: "10px", width: "40px", height: "40px", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "12px" }}
              title="Live Preview"
            >
              <ExternalLink size={20} />
            </ActionLink>
            <ActionLink
              href={selected.github_url}
              isValid={ghValid}
              onClick={(e) => { if (!ghValid) e.preventDefault(); else handleLinkClick(e, selected.github_url); }}
              style={styles.githubBtn}
            >
              <Github size={16} /> GitHub
            </ActionLink>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
