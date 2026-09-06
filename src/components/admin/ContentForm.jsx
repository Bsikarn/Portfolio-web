import { styles } from "../../styles/AdminPage.styles";
import { isSpecialType } from "../../lib/adminHelpers";

// Form for adding/editing a project or special content type
export default function ContentForm({
  formData,
  setFormData,
  isEditing,
  contentType,
  categoriesList,
  isSyncingGithub,
  handleChange,
  handleSubmit,
  handleSyncGithub,
  resetForm,
  setIsFormOpen,
  isFormOpen,
}) {
  return (
    <div style={styles.cardContainer}>
      {/* Form Header with Collapsible Toggle */}
      <div
        onClick={() => setIsFormOpen(!isFormOpen)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none", marginBottom: isFormOpen ? 16 : 0, paddingBottom: isFormOpen ? 16 : 0, borderBottom: isFormOpen ? "1px solid #f1f5f9" : "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <h1 style={{ ...styles.pageTitle, margin: 0 }}>
            {isEditing ? `✏️ Edit ${contentType}` : `🛠️ Add New ${contentType}`}
          </h1>
          {isEditing && <button onClick={(e) => { e.stopPropagation(); resetForm(); }} style={styles.cancelBtn}>Cancel Edit</button>}
        </div>
        <span style={{ fontSize: "14px", color: "#0D6EFD", fontWeight: "bold" }}>
          {isFormOpen ? "▲ Fold" : "▼ Expand"}
        </span>
      </div>

      {/* Project Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} style={styles.formContainer}>

          {/* Basic Info */}
          <div style={styles.sectionStyle}>
            <h3 style={styles.sectionHeading}>📌 Basic Info</h3>
            <div style={styles.gridContainer}>
              <div><label style={styles.labelStyle}>Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} required style={styles.inputStyle} /></div>
              <div style={styles.flexRow}>
                {contentType === "Project" && (
                  <>
                    <div style={styles.flex1}>
                      <label style={styles.labelStyle}>Category 1</label>
                      <select name="category" value={formData.category} onChange={handleChange} style={styles.inputStyle}>
                        {categoriesList.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div style={styles.flex1}>
                      <label style={styles.labelStyle}>Category 2</label>
                      <select name="category2" value={formData.category2} onChange={handleChange} style={styles.inputStyle}>
                        <option value="">None</option>
                        {categoriesList.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <div style={styles.flex1}><label style={styles.labelStyle}>Year</label><input type="text" name="year" value={formData.year} onChange={handleChange} style={styles.inputStyle} /></div>
                {contentType === "Project" && (
                  <div style={styles.flex1}><label style={styles.labelStyle}>Sort Order</label><input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} style={styles.inputStyle} title="Lower number appears first" /></div>
                )}
              </div>
              <div><label style={styles.labelStyle}>Short Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows="2" required style={{ ...styles.inputStyle, resize: "vertical" }} /></div>
            </div>
          </div>

          {contentType === "Project" && (
            <>
              {/* Problem & Solution */}
              <div style={styles.sectionStyle}>
                <h3 style={{ ...styles.sectionHeading, color: "#ef4444" }}>⚠️ The Problem & Solution</h3>
                <div style={styles.gridContainer}>
                  <div><label style={styles.labelStyle}>The Problem</label><textarea name="problem" value={formData.problem} onChange={handleChange} rows="3" style={{ ...styles.inputStyle, resize: "vertical" }} placeholder="Problem encountered..." /></div>
                  <div><label style={styles.labelStyle}>The Solution</label><textarea name="solution" value={formData.solution} onChange={handleChange} rows="3" style={{ ...styles.inputStyle, resize: "vertical" }} placeholder="Solution implemented..." /></div>
                </div>
              </div>

              {/* Role, Tech & Tools */}
              <div style={styles.sectionStyle}>
                <h3 style={{ ...styles.sectionHeading, color: "#3b82f6" }}>⚙️ Role, Tech Stack & Tools</h3>
                <div style={styles.gridContainer}>
                  <div><label style={styles.labelStyle}>My Role</label><input type="text" name="my_role" value={formData.my_role} onChange={handleChange} style={styles.inputStyle} placeholder="e.g. Lead Developer" /></div>
                  <div><label style={styles.labelStyle}>Tech Stack (Comma-separated)</label><input type="text" name="tags" value={formData.tags} onChange={handleChange} style={styles.inputStyle} placeholder="React, Node.js" /></div>
                  <div><label style={styles.labelStyle}>Tools (Comma-separated)</label><input type="text" name="tools" value={formData.tools} onChange={handleChange} style={styles.inputStyle} placeholder="Figma, Docker, Postman" /></div>
                </div>
              </div>

              {/* Features */}
              <div style={styles.sectionStyle}>
                <h3 style={{ ...styles.sectionHeading, color: "#10b981" }}>✨ Key Features</h3>
                <div><label style={styles.labelStyle}>Features (Each feature on a new line)</label><textarea name="features" value={formData.features} onChange={handleChange} rows="4" style={{ ...styles.inputStyle, resize: "vertical" }} /></div>
              </div>

              {/* Results & Learnings */}
              <div style={styles.sectionStyle}>
                <h3 style={{ ...styles.sectionHeading, color: "#f59e0b" }}>📈 Results & Learnings</h3>
                <div style={styles.gridContainer}>
                  <div><label style={styles.labelStyle}>Results & Impact</label><textarea name="results_impact" value={formData.results_impact} onChange={handleChange} rows="3" style={{ ...styles.inputStyle, resize: "vertical" }} /></div>
                  <div><label style={styles.labelStyle}>Key Learnings</label><textarea name="key_learnings" value={formData.key_learnings} onChange={handleChange} rows="3" style={{ ...styles.inputStyle, resize: "vertical" }} /></div>
                </div>
              </div>
            </>
          )}

          {/* Media & Links */}
          <div style={styles.sectionStyle}>
            <h3 style={{ ...styles.sectionHeading, color: "#6366f1" }}>🌍 Media & Links</h3>
            <div style={styles.gridContainer}>
              <div style={styles.flexRow}>
                {isSpecialType(contentType)
                  ? <div style={styles.flex1}><label style={styles.labelStyle}>Linked Project ID</label><input type="text" name="link_url" value={formData.link_url} onChange={handleChange} style={styles.inputStyle} placeholder="e.g. 12" /></div>
                  : <div style={styles.flex1}><label style={styles.labelStyle}>Live Link</label><input type="url" name="link_url" value={formData.link_url} onChange={handleChange} style={styles.inputStyle} /></div>
                }
                <div style={styles.flex1}><label style={styles.labelStyle}>GitHub</label><input type="url" name="github_url" value={formData.github_url} onChange={handleChange} style={styles.inputStyle} /></div>
              </div>
              {contentType === "Project" && (
                <>
                  <div><label style={styles.labelStyle}>Video URL</label><input type="url" name="video_url" value={formData.video_url} onChange={handleChange} style={styles.inputStyle} /></div>
                  <div style={styles.flexRow}>
                    <div style={styles.flex1}><label style={styles.labelStyle}>System Architecture Embed URL (Interactive Embed Box)</label><input type="url" name="flow_pic" value={formData.flow_pic} onChange={handleChange} style={styles.inputStyle} placeholder="https://beaut-architecture.vercel.app/iot-board-aibridge?embed=1" /></div>
                    <div style={styles.flex1}><label style={styles.labelStyle}>System Architecture Link URL (View Architecture Button Link)</label><input type="url" name="flow_url" value={formData.flow_url} onChange={handleChange} style={styles.inputStyle} placeholder="https://beaut-architecture.vercel.app/iot-board-aibridge" /></div>
                  </div>
                </>
              )}
              {contentType === "Project"
                ? <div><label style={styles.labelStyle}>Gallery URLs (Comma-separated)</label><textarea name="gallery_urls" value={formData.gallery_urls} onChange={handleChange} rows="2" style={{ ...styles.inputStyle, resize: "vertical" }} /></div>
                : <>
                    <div>
                      <label style={styles.labelStyle}>Certificate/Verification Image URL</label>
                      <input type="url" name="activity_url" value={formData.activity_url} onChange={handleChange} style={styles.inputStyle} placeholder="https://example.com/certificate.jpg" />
                    </div>
                    <div>
                      <label style={styles.labelStyle}>Activity/Participation Photo URL</label>
                      <input type="url" name="certificate_url" value={formData.certificate_url} onChange={handleChange} style={styles.inputStyle} placeholder="https://example.com/activity.jpg" />
                    </div>
                  </>
              }
            </div>
          </div>

          {contentType === "Project" && (
            <>
              {/* Languages */}
              <div style={styles.sectionStyle}>
                <h3 style={{ ...styles.sectionHeading, color: "#8b5cf6" }}>📊 Languages Used</h3>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 200px" }}>
                    <label style={styles.labelStyle}>Languages (Name:Percent:Color, comma-separated)</label>
                    <input type="text" name="languages" value={formData.languages} onChange={handleChange} style={styles.inputStyle} placeholder="JavaScript:80:#f7df1e, HTML:20:#e34c26" />
                  </div>
                  <button type="button" onClick={handleSyncGithub} disabled={isSyncingGithub} style={{ ...styles.submitBtn, padding: "10px 14px", backgroundColor: isSyncingGithub ? "#ccc" : "#0f172a", whiteSpace: "nowrap" }}>
                    {isSyncingGithub ? "Syncing..." : "🔄 Sync from GitHub"}
                  </button>
                </div>
              </div>

              {/* Award */}
              <div style={{ ...styles.sectionStyle, background: formData.has_award ? "#fffcf0" : "#f9fafb" }}>
                <label style={{ ...styles.awardCheckboxLabel, color: formData.has_award ? "#874d00" : "#333" }}>
                  <input type="checkbox" name="has_award" checked={formData.has_award} onChange={handleChange} style={styles.checkbox} />
                  🏆 This project received an award
                </label>
                {formData.has_award && (
                  <div style={styles.awardFields}>
                    <div><label style={styles.labelStyle}>Award Title</label><input type="text" name="award_title" value={formData.award_title} onChange={handleChange} style={styles.inputStyle} /></div>
                    <div><label style={styles.labelStyle}>Competition</label><input type="text" name="award_competition" value={formData.award_competition} onChange={handleChange} style={styles.inputStyle} /></div>
                    <div><label style={styles.labelStyle}>Description</label><textarea name="award_description" value={formData.award_description} onChange={handleChange} rows="2" style={styles.inputStyle} /></div>
                    <div><label style={styles.labelStyle}>Image URL</label><input type="url" name="award_image_url" value={formData.award_image_url} onChange={handleChange} style={styles.inputStyle} /></div>
                  </div>
                )}
              </div>

              {/* Recommended */}
              <div style={{ ...styles.sectionStyle, background: formData.is_recommended ? "#f0fdfa" : "#f9fafb", marginTop: "16px" }}>
                <label style={{ ...styles.awardCheckboxLabel, color: formData.is_recommended ? "#0f766e" : "#333" }}>
                  <input type="checkbox" name="is_recommended" checked={formData.is_recommended} onChange={handleChange} style={styles.checkbox} />
                  ⭐ Recommend this project
                </label>
              </div>
            </>
          )}

          {/* Hide Option (Only for Achievements and Activities) */}
          {(contentType === "Achievement" || contentType === "Activity") && (
            <div style={{ ...styles.sectionStyle, background: formData.is_hidden ? "#fff7ed" : "#f9fafb", marginTop: "16px" }}>
              <label style={{ ...styles.awardCheckboxLabel, color: formData.is_hidden ? "#c2410c" : "#334155" }}>
                <input type="checkbox" name="is_hidden" checked={formData.is_hidden} onChange={handleChange} style={styles.checkbox} />
                👁️ Hide from main grid (Move to "More" popup)
              </label>
            </div>
          )}

          <button type="submit" style={{ ...styles.submitBtn, backgroundColor: isEditing ? "#10b981" : "#0D6EFD" }}>
            {isEditing ? `✅ Update ${contentType}` : `💾 Save ${contentType}`}
          </button>
        </form>
      )}
    </div>
  );
}
