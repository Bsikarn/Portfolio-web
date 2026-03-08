import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/AdminPage.styles";

export default function AdminPage() {
  // Initial state for the project form
  const initialFormState = {
    title: "", category: "Frontend", description: "", image_icon: "💻", year: "2026",
    link_url: "", github_url: "", tags: "", tools: "", features: "",
    my_role: "", problem: "", solution: "", results_impact: "", key_learnings: "",
    languages: "",
    video_url: "", gallery_urls: "",
    has_award: false, award_title: "", award_description: "", award_competition: "", award_image_url: "",
    is_recommended: false
  };

  const [formData, setFormData] = useState(initialFormState);
  const [projectsList, setProjectsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Fetch all projects from Supabase to populate the list
  const fetchProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("projects").select("*").order("id", { ascending: false });
    if (data) setProjectsList(data);
    if (error) console.error("Error fetching projects:", error);
    setIsLoading(false);
  };

  // Fetch categories from Supabase
  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (data) {
      const sortedCats = data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setCategoriesList(sortedCats);
      if (sortedCats.length > 0 && formData.category === "Frontend") {
        // Set default to first category if not already set by edit
        setFormData(prev => ({ ...prev, category: sortedCats[0].name }));
      }
    }
    if (error) console.error("Error fetching categories:", error);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  // Generic handler for form inputs, including checkboxes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "has_award" && checked) {
        setFormData((prev) => ({ ...prev, has_award: true, is_recommended: false }));
      } else if (name === "is_recommended" && checked) {
        setFormData((prev) => ({ ...prev, is_recommended: true, has_award: false }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Add new category handler
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const { error } = await supabase.rpc("admin_insert_category", { p_name: newCategoryName.trim() });
    if (error) {
      alert("Error adding category: " + error.message);
    } else {
      setNewCategoryName("");
      fetchCategories();
    }
  };

  // Delete category handler
  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      const { error } = await supabase.rpc("admin_delete_category", { p_id: id });
      if (error) {
        alert("Error deleting category: " + error.message);
      } else {
        fetchCategories();
      }
    }
  };

  // Update category sort order
  const handleUpdateCategoryOrder = async (id, newOrder) => {
    const parsedOrder = parseInt(newOrder) || 0;
    // Optimistically update UI
    setCategoriesList(prev => prev.map(c => c.id === id ? { ...c, sort_order: parsedOrder } : c).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));

    // Attempt RPC call
    const { error } = await supabase.rpc("admin_update_category_order", { p_id: id, p_sort_order: parsedOrder });
    if (error) {
      console.error("Order update failed (SQL missing?). Reverting.", error);
      fetchCategories(); // Revert on failure
    }
  };

  // GitHub Language Sync handler
  const handleSyncGithub = async () => {
    if (!formData.github_url) {
      alert("Please enter a GitHub URL first.");
      return;
    }

    // Extract owner and repo from URL (e.g., https://github.com/owner/repo)
    const match = formData.github_url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      alert("Invalid GitHub URL format. Should be https://github.com/owner/repo");
      return;
    }

    setIsSyncingGithub(true);
    const owner = match[1];
    const repo = match[2];

    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
      if (!response.ok) throw new Error("Failed to fetch language data from GitHub.");

      const data = await response.json();
      let totalBytes = 0;
      for (const bytes of Object.values(data)) {
        totalBytes += bytes;
      }

      if (totalBytes === 0) {
        alert("No language data found for this repository.");
        setIsSyncingGithub(false);
        return;
      }

      // Define some generic colors for common languages
      const languageColors = {
        "JavaScript": "#f1e05a", "TypeScript": "#3178c6", "HTML": "#e34c26",
        "CSS": "#563d7c", "Python": "#3572A5", "Go": "#00ADD8",
        "Rust": "#dea584", "C++": "#f34b7d", "Java": "#b07219",
        "C#": "#178600", "PHP": "#4F5D95", "Ruby": "#701516", "Shell": "#89e051"
      };

      const formattedLanguages = Object.entries(data).map(([lang, bytes]) => {
        const percent = ((bytes / totalBytes) * 100).toFixed(1);
        const color = languageColors[lang] || "#888888";
        return `${lang}:${percent}:${color}`;
      }).join(", ");

      setFormData(prev => ({ ...prev, languages: formattedLanguages }));
      alert("Languages synced successfully!");

    } catch (error) {
      alert("Error syncing languages: " + error.message);
    } finally {
      setIsSyncingGithub(false);
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Transform comma-separated and newline-separated strings into arrays for Supabase
    const payload = {
      title: formData.title, category: formData.category, description: formData.description,
      image_icon: formData.image_icon, year: formData.year,
      link_url: formData.link_url, github_url: formData.github_url,
      my_role: formData.my_role, problem: formData.problem, solution: formData.solution,
      results_impact: formData.results_impact, key_learnings: formData.key_learnings,
      tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      tools: formData.tools ? formData.tools.split(",").map(t => t.trim()).filter(Boolean) : [],
      features: formData.features ? formData.features.split("\n").map(f => f.trim()).filter(Boolean) : [],
      languages: formData.languages ? formData.languages.split(",").map(l => {
        const [name, percent, color] = l.split(":");
        return { name: name?.trim(), percent: Number(percent) || 0, color: color?.trim() || "#ccc" };
      }) : [],
      video_url: formData.video_url,
      gallery: formData.gallery_urls ? formData.gallery_urls.split(",").map(url => url.trim()).filter(Boolean) : [],
      award: formData.has_award ? {
        title: formData.award_title, description: formData.award_description,
        competition: formData.award_competition, image_url: formData.award_image_url
      } : null,
      is_recommended: formData.is_recommended
    };

    if (isEditing) {
      const { error } = await supabase.rpc("admin_update_project", { p_id: editId, payload });
      if (error) {
        alert("Error updating project via RPC: " + error.message);
      } else {
        alert("Project updated successfully!");
        resetForm();
        fetchProjects();
      }
    } else {
      const { error } = await supabase.rpc("admin_insert_project", { payload });
      if (error) {
        alert("Error adding project via RPC: " + error.message);
      } else {
        alert("Project added successfully!");
        resetForm();
        fetchProjects();
      }
    }
  };

  // Populate form with existing project data for editing
  const handleEdit = (project) => {
    setIsEditing(true);
    setEditId(project.id);
    setFormData({
      title: project.title || "", category: project.category || (categoriesList.length > 0 ? categoriesList[0].name : "Frontend"), description: project.description || "",
      image_icon: project.image_icon || "💻", year: project.year || "",
      link_url: project.link_url || "", github_url: project.github_url || "",
      my_role: project.my_role || "", problem: project.problem || "", solution: project.solution || "",
      results_impact: project.results_impact || "", key_learnings: project.key_learnings || "",
      // Convert arrays back to strings for textarea/input inputs
      tags: project.tags ? project.tags.join(", ") : "", tools: project.tools ? project.tools.join(", ") : "",
      features: project.features ? project.features.join("\n") : "",
      languages: project.languages ? project.languages.map(l => `${l.name}:${l.percent}:${l.color}`).join(", ") : "",
      video_url: project.video_url || "", gallery_urls: project.gallery ? project.gallery.join(", ") : "",
      has_award: !!project.award, award_title: project.award?.title || "", award_description: project.award?.description || "",
      award_competition: project.award?.competition || "", award_image_url: project.award?.image_url || "",
      is_recommended: project.is_recommended || false
    });
    // Scroll to top to ensure form is in view
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete project handler
  const handleDelete = async (id, title) => {
    // Confirm before deletion
    if (window.confirm(`Are you sure you want to delete the project "${title}"?`)) {
      const { error } = await supabase.rpc("admin_delete_project", { p_id: id });
      if (error) {
        alert("Error deleting project: " + error.message);
      } else {
        alert(`Project "${title}" deleted successfully!`);
        fetchProjects();
      }
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      ...initialFormState,
      category: categoriesList.length > 0 ? categoriesList[0].name : "Frontend"
    });
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "flex-end", paddingBottom: 20 }}>
        <button onClick={handleSignOut} style={{ padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}>
          🚪 Sign Out
        </button>
      </div>
      <div style={{ position: "relative", zIndex: 1, marginBottom: 40 }}>

        {/* Category Management */}
        <div style={{ ...styles.cardContainer, marginBottom: "20px" }}>
          <h2 style={styles.existingProjectsTitle}>🏷️ Manage Categories</h2>
          <div style={{ ...styles.flexRow, marginBottom: "16px" }}>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New Category Name"
              style={{ ...styles.inputStyle, flex: 2 }}
            />
            <button onClick={handleAddCategory} style={{ ...styles.submitBtn, padding: "10px", flex: 1 }}>Add Category</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", flexDirection: "column" }}>
            {categoriesList.map(cat => (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", background: "#f4f4f5", padding: "8px 12px", border: "1px solid #e4e4e7", fontSize: "14px", color: "#18181b" }}>
                <span style={{ flex: 1, fontWeight: "bold" }}>{cat.name}</span>
                <span style={{ fontSize: "12px", color: "#71717a", marginRight: "8px" }}>Order:</span>
                <input
                  type="number"
                  value={cat.sort_order || 0}
                  onChange={(e) => handleUpdateCategoryOrder(cat.id, e.target.value)}
                  style={{ width: "60px", padding: "4px", marginRight: "16px", border: "1px solid #d4d4d8", fontSize: "14px" }}
                  title="Sort Order (Lower is first)"
                />
                <button onClick={() => handleDeleteCategory(cat.id, cat.name)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>Delete</button>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.cardContainer}>

          {/* Form Header */}
          <div style={styles.headerRow}>
            <h1 style={styles.pageTitle}>
              {isEditing ? "✏️ Edit Project" : "🛠️ Add New Project"}
            </h1>
            {isEditing && <button onClick={resetForm} style={styles.cancelBtn}>Cancel Edit</button>}
          </div>

          {/* Project Form */}
          <form onSubmit={handleSubmit} style={styles.formContainer}>

            {/* Basic Information Section */}
            <div style={styles.sectionStyle}>
              <h3 style={styles.sectionHeading}>📌 Basic Info</h3>
              <div style={styles.gridContainer}>
                <div><label style={styles.labelStyle}>Project Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} required style={styles.inputStyle} /></div>
                <div style={styles.flexRow}>
                  <div style={styles.flex1}>
                    <label style={styles.labelStyle}>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} style={styles.inputStyle}>
                      {categoriesList.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.flex1}><label style={styles.labelStyle}>Year</label><input type="text" name="year" value={formData.year} onChange={handleChange} style={styles.inputStyle} /></div>
                  <div style={styles.flex1}><label style={styles.labelStyle}>Icon</label><input type="text" name="image_icon" value={formData.image_icon} onChange={handleChange} style={styles.inputStyle} /></div>
                </div>
                <div><label style={styles.labelStyle}>Short Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows="2" required style={{ ...styles.inputStyle, resize: "vertical" }} /></div>
              </div>
            </div>

            {/* Problem & Solution Section */}
            <div style={styles.sectionStyle}>
              <h3 style={{ ...styles.sectionHeading, color: "#ef4444" }}>⚠️ The Problem & Solution</h3>
              <div style={styles.gridContainer}>
                <div><label style={styles.labelStyle}>The Problem</label><textarea name="problem" value={formData.problem} onChange={handleChange} rows="3" style={{ ...styles.inputStyle, resize: "vertical" }} placeholder="Problem encountered..." /></div>
                <div><label style={styles.labelStyle}>The Solution</label><textarea name="solution" value={formData.solution} onChange={handleChange} rows="3" style={{ ...styles.inputStyle, resize: "vertical" }} placeholder="Solution implemented..." /></div>
              </div>
            </div>

            {/* Role, Tech Stack & Tools Section */}
            <div style={styles.sectionStyle}>
              <h3 style={{ ...styles.sectionHeading, color: "#3b82f6" }}>⚙️ Role, Tech Stack & Tools</h3>
              <div style={styles.gridContainer}>
                <div><label style={styles.labelStyle}>My Role</label><input type="text" name="my_role" value={formData.my_role} onChange={handleChange} style={styles.inputStyle} placeholder="e.g. Lead Developer, Data Engineer" /></div>
                <div><label style={styles.labelStyle}>Tech Stack (Comma-separated)</label><input type="text" name="tags" value={formData.tags} onChange={handleChange} style={styles.inputStyle} placeholder="React, Node.js" /></div>
                <div><label style={styles.labelStyle}>Tools (Comma-separated)</label><input type="text" name="tools" value={formData.tools} onChange={handleChange} style={styles.inputStyle} placeholder="Figma, Docker, Postman" /></div>
              </div>
            </div>

            {/* Key Features Section */}
            <div style={styles.sectionStyle}>
              <h3 style={{ ...styles.sectionHeading, color: "#10b981" }}>✨ Key Features</h3>
              <div><label style={styles.labelStyle}>Features (Each feature on a new line)</label><textarea name="features" value={formData.features} onChange={handleChange} rows="4" style={{ ...styles.inputStyle, resize: "vertical" }} /></div>
            </div>

            {/* Results & Learnings Section */}
            <div style={styles.sectionStyle}>
              <h3 style={{ ...styles.sectionHeading, color: "#f59e0b" }}>📈 Results & Learnings</h3>
              <div style={styles.gridContainer}>
                <div><label style={styles.labelStyle}>Results & Impact</label><textarea name="results_impact" value={formData.results_impact} onChange={handleChange} rows="3" style={{ ...styles.inputStyle, resize: "vertical" }} placeholder="Achieved results..." /></div>
                <div><label style={styles.labelStyle}>Key Learnings</label><textarea name="key_learnings" value={formData.key_learnings} onChange={handleChange} rows="3" style={{ ...styles.inputStyle, resize: "vertical" }} placeholder="Lessons learned..." /></div>
              </div>
            </div>

            {/* Media & Links Section */}
            <div style={styles.sectionStyle}>
              <h3 style={{ ...styles.sectionHeading, color: "#6366f1" }}>🌍 Media & Links</h3>
              <div style={styles.gridContainer}>
                <div style={styles.flexRow}>
                  <div style={styles.flex1}><label style={styles.labelStyle}>Live Link</label><input type="url" name="link_url" value={formData.link_url} onChange={handleChange} style={styles.inputStyle} /></div>
                  <div style={styles.flex1}><label style={styles.labelStyle}>GitHub</label><input type="url" name="github_url" value={formData.github_url} onChange={handleChange} style={styles.inputStyle} /></div>
                </div>
                <div><label style={styles.labelStyle}>Video URL</label><input type="url" name="video_url" value={formData.video_url} onChange={handleChange} style={styles.inputStyle} /></div>
                <div><label style={styles.labelStyle}>Gallery URLs (Comma-separated)</label><textarea name="gallery_urls" value={formData.gallery_urls} onChange={handleChange} rows="2" style={{ ...styles.inputStyle, resize: "vertical" }} /></div>
              </div>
            </div>

            {/* Languages Section */}
            <div style={styles.sectionStyle}>
              <h3 style={{ ...styles.sectionHeading, color: "#8b5cf6" }}>📊 Languages Used</h3>
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.labelStyle}>Languages (Format Name:Percent:Color, comma-separated)</label>
                  <input type="text" name="languages" value={formData.languages} onChange={handleChange} style={styles.inputStyle} placeholder="JavaScript:80:#f7df1e, HTML:20:#e34c26" />
                </div>
                <button type="button" onClick={handleSyncGithub} disabled={isSyncingGithub} style={{ ...styles.submitBtn, padding: "10px", marginTop: "25px", backgroundColor: isSyncingGithub ? "#ccc" : "#0f172a", whiteSpace: "nowrap" }}>
                  {isSyncingGithub ? "Syncing..." : "🔄 Sync from GitHub"}
                </button>
              </div>
            </div>

            {/* Awards Section (Conditional Fields) */}
            <div style={{ ...styles.sectionStyle, background: formData.has_award ? "#fffcf0" : "#f9fafb" }}>
              <label style={{ ...styles.awardCheckboxLabel, color: formData.has_award ? "#874d00" : "#333" }}>
                <input type="checkbox" name="has_award" checked={formData.has_award} onChange={handleChange} style={styles.checkbox} />
                🏆 This project received an award
              </label>

              {/* Show award details fields only if has_award is true */}
              {formData.has_award && (
                <div style={styles.awardFields}>
                  <div><label style={styles.labelStyle}>Award Title</label><input type="text" name="award_title" value={formData.award_title} onChange={handleChange} style={styles.inputStyle} /></div>
                  <div><label style={styles.labelStyle}>Competition</label><input type="text" name="award_competition" value={formData.award_competition} onChange={handleChange} style={styles.inputStyle} /></div>
                  <div><label style={styles.labelStyle}>Description</label><textarea name="award_description" value={formData.award_description} onChange={handleChange} rows="2" style={styles.inputStyle} /></div>
                  <div><label style={styles.labelStyle}>Image URL</label><input type="url" name="award_image_url" value={formData.award_image_url} onChange={handleChange} style={styles.inputStyle} /></div>
                </div>
              )}
            </div>

            {/* Recommended Section */}
            <div style={{ ...styles.sectionStyle, background: formData.is_recommended ? "#f0fdfa" : "#f9fafb", marginTop: "16px" }}>
              <label style={{ ...styles.awardCheckboxLabel, color: formData.is_recommended ? "#0f766e" : "#333" }}>
                <input type="checkbox" name="is_recommended" checked={formData.is_recommended} onChange={handleChange} style={styles.checkbox} />
                ⭐ Recommend this project
              </label>
            </div>

            <button type="submit" style={{ ...styles.submitBtn, backgroundColor: isEditing ? "#10b981" : "#0D6EFD" }}>
              {isEditing ? "✅ Update Project" : "💾 Save Project"}
            </button>
          </form>
        </div>
      </div>

      {/* Existing Projects List View */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={styles.cardContainer}>
          <h2 style={styles.existingProjectsTitle}>📋 Existing Projects</h2>
          <div style={styles.projectListContainer}>
            {projectsList.map((project) => (
              <div key={project.id} style={styles.projectListItem}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ ...styles.projectIcon, background: "linear-gradient(135deg, #f0f6ff, #e0f2fe)", borderRadius: "12px", padding: "8px", width: "40px", height: "40px", display: "flex", justifyContent: "center", alignItems: "center" }}>{project.image_icon}</div>
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
    </div>
  );
}

