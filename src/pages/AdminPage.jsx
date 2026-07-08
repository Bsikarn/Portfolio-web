import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/AdminPage.styles";
import LoadingPage from "../components/LoadingPage";
import SettingsPanel from "../components/admin/SettingsPanel";
import CategoryManager from "../components/admin/CategoryManager";

// Default form state for a new project
const INITIAL_FORM = {
  title: "", category: "Frontend", category2: "", description: "", image_icon: "💻", year: "2026",
  link_url: "", github_url: "", tags: "", tools: "", features: "",
  my_role: "", problem: "", solution: "", results_impact: "", key_learnings: "",
  languages: "", video_url: "", gallery_urls: "", certificate_url: "", activity_url: "",
  has_award: false, award_title: "", award_description: "", award_competition: "", award_image_url: "",
  is_recommended: false,
};

// Parse a project from DB back to form-compatible shape
function projectToForm(project) {
  const cats = (project.category || "").split(",").map((c) => c.trim());
  return {
    title: project.title || "",
    category: cats[0] || "Frontend",
    category2: cats[1] || "",
    description: project.description || "",
    image_icon: project.image_icon || "💻",
    year: project.year || "",
    link_url: project.link_url || "",
    github_url: project.github_url || "",
    my_role: project.my_role || "",
    problem: project.problem || "",
    solution: project.solution || "",
    results_impact: project.results_impact || "",
    key_learnings: project.key_learnings || "",
    tags: project.tags?.join(", ") || "",
    tools: project.tools?.join(", ") || "",
    features: project.features?.join("\n") || "",
    languages: project.languages?.map((l) => `${l.name}:${l.percent}:${l.color}`).join(", ") || "",
    video_url: project.video_url || "",
    gallery_urls: project.gallery?.join(", ") || "",
    certificate_url: project.gallery?.[0] || "",
    activity_url: project.gallery?.[1] || "",
    has_award: !!project.award,
    award_title: project.award?.title || "",
    award_description: project.award?.description || "",
    award_competition: project.award?.competition || "",
    award_image_url: project.award?.image_url || "",
    is_recommended: project.is_recommended || false,
  };
}

// Build the Supabase payload from form data
function buildPayload(formData, contentType) {
  const isSpecial = contentType === "Achievement" || contentType === "Activity";
  const selectedCats = [formData.category, formData.category2].filter(Boolean);
  return {
    title: formData.title,
    category: isSpecial ? contentType : selectedCats.join(", "),
    description: formData.description,
    image_icon: formData.image_icon,
    year: formData.year,
    link_url: formData.link_url,
    github_url: formData.github_url,
    my_role: formData.my_role,
    problem: formData.problem,
    solution: formData.solution,
    results_impact: formData.results_impact,
    key_learnings: formData.key_learnings,
    tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    tools: formData.tools ? formData.tools.split(",").map((t) => t.trim()).filter(Boolean) : [],
    features: formData.features ? formData.features.split("\n").map((f) => f.trim()).filter(Boolean) : [],
    languages: formData.languages
      ? formData.languages.split(",").map((l) => { const [name, percent, color] = l.split(":"); return { name: name?.trim(), percent: Number(percent) || 0, color: color?.trim() || "#ccc" }; })
      : [],
    video_url: formData.video_url,
    gallery: isSpecial
      ? [formData.certificate_url?.trim() || "", formData.activity_url?.trim() || ""]
      : (formData.gallery_urls ? formData.gallery_urls.split(",").map((u) => u.trim()).filter(Boolean) : []),
    award: formData.has_award
      ? { title: formData.award_title, description: formData.award_description, competition: formData.award_competition, image_url: formData.award_image_url }
      : null,
    is_recommended: formData.is_recommended,
  };
}

export default function AdminPage({ setPage }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [projectsList, setProjectsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [contentType, setContentType] = useState("Project");
  const [adminTab, setAdminTab] = useState("Content");

  const fetchProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("projects").select("*").order("id", { ascending: false });
    if (data) setProjectsList(data);
    if (error) console.error("Error fetching projects:", error);
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (data) {
      const sorted = [...data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setCategoriesList(sorted);
      // Set default category to first available if not already edited
      if (sorted.length > 0 && formData.category === "Frontend") {
        setFormData((prev) => ({ ...prev, category: sorted[0].name }));
      }
    }
    if (error) console.error("Error fetching categories:", error);
  };

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  // Generic form field change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      // Ensure has_award and is_recommended are mutually exclusive
      if (name === "has_award" && checked) return setFormData((p) => ({ ...p, has_award: true, is_recommended: false }));
      if (name === "is_recommended" && checked) return setFormData((p) => ({ ...p, is_recommended: true, has_award: false }));
      return setFormData((p) => ({ ...p, [name]: checked }));
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Sync language usage from GitHub API
  const handleSyncGithub = async () => {
    if (!formData.github_url) return alert("Please enter a GitHub URL first.");

    const match = formData.github_url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return alert("Invalid GitHub URL format. Should be https://github.com/owner/repo");

    setIsSyncingGithub(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${match[1]}/${match[2]}/languages`);
      if (!res.ok) throw new Error("Failed to fetch language data from GitHub.");

      const data = await res.json();
      const totalBytes = Object.values(data).reduce((sum, b) => sum + b, 0);
      if (!totalBytes) return alert("No language data found for this repository.");

      const LANG_COLORS = { JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#563d7c", Python: "#3572A5", Go: "#00ADD8", Rust: "#dea584", "C++": "#f34b7d", Java: "#b07219", "C#": "#178600", PHP: "#4F5D95", Ruby: "#701516", Shell: "#89e051" };
      const formatted = Object.entries(data)
        .map(([lang, bytes]) => `${lang}:${((bytes / totalBytes) * 100).toFixed(1)}:${LANG_COLORS[lang] || "#888"}`)
        .join(", ");

      setFormData((p) => ({ ...p, languages: formatted }));
      alert("Languages synced successfully!");
    } catch (error) {
      alert("Error syncing languages: " + error.message);
    } finally {
      setIsSyncingGithub(false);
    }
  };

  // Submit form (insert or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = buildPayload(formData, contentType);

    if (isEditing) {
      const { error } = await supabase.rpc("admin_update_project", { p_id: editId, payload });
      if (error) return alert("Error updating project: " + error.message);
      alert("Project updated successfully!");
    } else {
      const { error } = await supabase.rpc("admin_insert_project", { payload });
      if (error) return alert("Error adding project: " + error.message);
      alert("Project added successfully!");
    }

    resetForm();
    fetchProjects();
  };

  const handleEdit = (project) => {
    setIsEditing(true);
    setEditId(project.id);
    setContentType(project.category === "Achievement" || project.category === "Activity" ? project.category : "Project");
    setFormData(projectToForm(project));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    const { error } = await supabase.rpc("admin_delete_project", { p_id: id });
    if (error) return alert("Error deleting project: " + error.message);
    alert(`"${title}" deleted successfully!`);
    fetchProjects();
  };

  const resetForm = () => {
    setFormData({ ...INITIAL_FORM, category: categoriesList[0]?.name || "Frontend", category2: "" });
    setIsEditing(false);
    setEditId(null);
    setContentType("Project");
  };

  return (
    <div style={styles.pageContainer}>
      {isLoading && <LoadingPage />}

      {/* Main Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px", position: "relative", zIndex: 10 }}>
        {["Content", "Settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setAdminTab(tab)}
            style={{ flex: 1, padding: "16px", borderRadius: "16px", fontWeight: "bold", cursor: "pointer", border: "none", background: adminTab === tab ? "#0f172a" : "#f8fafc", color: adminTab === tab ? "white" : "#475569" }}
          >
            {tab === "Content" ? "📝 Manage Content" : "⚙️ Personal Info & Links"}
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "flex-end", paddingBottom: 20 }}>
        <button onClick={async () => { await supabase.auth.signOut(); setPage?.("Home"); }} style={{ padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", boxShadow: "0 4px 12px rgba(239,68,68,0.3)" }}>
          🚪 Sign Out
        </button>
      </div>

      {adminTab === "Content" ? (
        <>
          <div style={{ position: "relative", zIndex: 1, marginBottom: 40 }}>
            <CategoryManager categoriesList={categoriesList} setCategoriesList={setCategoriesList} fetchCategories={fetchCategories} />

            <div style={styles.cardContainer}>
              {/* Form Header */}
              <div style={styles.headerRow}>
                <h1 style={styles.pageTitle}>{isEditing ? "✏️ Edit Project" : "🛠️ Add New Project"}</h1>
                {isEditing && <button onClick={resetForm} style={styles.cancelBtn}>Cancel Edit</button>}
              </div>

              {/* Project Form */}
              <form onSubmit={handleSubmit} style={styles.formContainer}>

                {/* Content Type Selector */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  {["Project", "Achievement", "Activity"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setContentType(type)}
                      style={{ flex: 1, padding: "12px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", border: "none", background: contentType === type ? "#0D6EFD" : "#eef3ff", color: contentType === type ? "white" : "#3b82f6", boxShadow: contentType === type ? "0 4px 12px rgba(13,110,253,0.3)" : "none" }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Basic Info */}
                <div style={styles.sectionStyle}>
                  <h3 style={styles.sectionHeading}>📌 Basic Info</h3>
                  <div style={styles.gridContainer}>
                    <div><label style={styles.labelStyle}>Project Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} required style={styles.inputStyle} /></div>
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
                      <div style={styles.flex1}><label style={styles.labelStyle}>Icon</label><input type="text" name="image_icon" value={formData.image_icon} onChange={handleChange} style={styles.inputStyle} /></div>
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
                      {contentType === "Achievement"
                        ? <div style={styles.flex1}><label style={styles.labelStyle}>Linked Project ID</label><input type="text" name="link_url" value={formData.link_url} onChange={handleChange} style={styles.inputStyle} placeholder="e.g. 12" /></div>
                        : <div style={styles.flex1}><label style={styles.labelStyle}>Live Link</label><input type="url" name="link_url" value={formData.link_url} onChange={handleChange} style={styles.inputStyle} /></div>
                      }
                      <div style={styles.flex1}><label style={styles.labelStyle}>GitHub</label><input type="url" name="github_url" value={formData.github_url} onChange={handleChange} style={styles.inputStyle} /></div>
                    </div>
                    <div><label style={styles.labelStyle}>Video URL</label><input type="url" name="video_url" value={formData.video_url} onChange={handleChange} style={styles.inputStyle} /></div>
                    {contentType === "Project"
                      ? <div><label style={styles.labelStyle}>Gallery URLs (Comma-separated)</label><textarea name="gallery_urls" value={formData.gallery_urls} onChange={handleChange} rows="2" style={{ ...styles.inputStyle, resize: "vertical" }} /></div>
                      : <>
                          <div><label style={styles.labelStyle}>Certificate Image URL</label><input type="url" name="certificate_url" value={formData.certificate_url} onChange={handleChange} style={styles.inputStyle} /></div>
                          <div><label style={styles.labelStyle}>Activity Picture URL</label><input type="url" name="activity_url" value={formData.activity_url} onChange={handleChange} style={styles.inputStyle} /></div>
                        </>
                    }
                  </div>
                </div>

                {contentType === "Project" && (
                  <>
                    {/* Languages */}
                    <div style={styles.sectionStyle}>
                      <h3 style={{ ...styles.sectionHeading, color: "#8b5cf6" }}>📊 Languages Used</h3>
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <label style={styles.labelStyle}>Languages (Name:Percent:Color, comma-separated)</label>
                          <input type="text" name="languages" value={formData.languages} onChange={handleChange} style={styles.inputStyle} placeholder="JavaScript:80:#f7df1e, HTML:20:#e34c26" />
                        </div>
                        <button type="button" onClick={handleSyncGithub} disabled={isSyncingGithub} style={{ ...styles.submitBtn, padding: "10px", marginTop: "25px", backgroundColor: isSyncingGithub ? "#ccc" : "#0f172a", whiteSpace: "nowrap" }}>
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

                <button type="submit" style={{ ...styles.submitBtn, backgroundColor: isEditing ? "#10b981" : "#0D6EFD" }}>
                  {isEditing ? "✅ Update Project" : "💾 Save Project"}
                </button>
              </form>
            </div>
          </div>

          {/* Existing Content List */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={styles.cardContainer}>
              <h2 style={styles.existingProjectsTitle}>📋 Existing Content</h2>

              {/* Content Type Filter */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                {["Project", "Achievement", "Activity"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setContentType(type)}
                    style={{ padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", border: "none", background: contentType === type ? "#0D6EFD" : "#eef3ff", color: contentType === type ? "white" : "#3b82f6" }}
                  >
                    {type}s
                  </button>
                ))}
              </div>

              <div style={styles.projectListContainer}>
                {projectsList
                  .filter((p) => contentType === "Project" ? p.category !== "Achievement" && p.category !== "Activity" : p.category === contentType)
                  .map((project) => (
                    <div key={project.id} style={styles.projectListItem}>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ ...styles.projectIcon, background: "linear-gradient(135deg,#f0f6ff,#e0f2fe)", borderRadius: "12px", padding: "8px", width: "40px", height: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}>{project.image_icon}</div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={styles.projectTitleText}>{project.title}</div>
                            {project.award && <span style={{ fontSize: "12px", background: "#fef08a", color: "#854d0e", padding: "2px 6px", borderRadius: "12px" }}>🏆 Award</span>}
                            {project.is_recommended && <span style={{ fontSize: "12px", background: "#ccfbf1", color: "#0f766e", padding: "2px 6px", borderRadius: "12px" }}>⭐ Recommend</span>}
                          </div>
                          <div style={styles.projectCategoryText}>{project.category}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleEdit(project)} style={styles.editBtn}>Edit</button>
                        <button onClick={() => handleDelete(project.id, project.title)} style={styles.deleteBtn}>Del</button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <SettingsPanel />
      )}
    </div>
  );
}
