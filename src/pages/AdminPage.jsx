import { supabase } from "../lib/supabase";
import { styles } from "../styles/AdminPage.styles";

export default function AdminPage() {
  const initialFormState = {
    title: "", category: "Frontend", description: "", image_icon: "💻", year: "2026",
    gradient_from: "#f0f6ff", gradient_to: "#e0f2fe",
    link_url: "", github_url: "", tags: "", tools: "", features: "",
    my_role: "", problem: "", solution: "", results_impact: "", key_learnings: "",
    languages: "",
    video_url: "", gallery_urls: "",
    has_award: false, award_title: "", award_description: "", award_competition: "", award_image_url: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [projectsList, setProjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from("projects").select("*").order("id", { ascending: false });
    if (data) setProjectsList(data);
    if (error) console.error("Error fetching:", error);
    setIsLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title, category: formData.category, description: formData.description,
      image_icon: formData.image_icon, year: formData.year, gradient_from: formData.gradient_from, gradient_to: formData.gradient_to,
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
      } : null
    };

    console.log("เตรียมบันทึกข้อมูล:", payload);
    alert(isEditing ? "จำลองการอัปเดตสำเร็จ!" : "จำลองการเพิ่มสำเร็จ!");
    resetForm();
  };

  const handleEdit = (project) => {
    setIsEditing(true);
    setEditId(project.id);
    setFormData({
      title: project.title || "", category: project.category || "Frontend", description: project.description || "",
      image_icon: project.image_icon || "💻", year: project.year || "", gradient_from: project.gradient_from || "#f0f6ff", gradient_to: project.gradient_to || "#e0f2fe",
      link_url: project.link_url || "", github_url: project.github_url || "",
      my_role: project.my_role || "", problem: project.problem || "", solution: project.solution || "",
      results_impact: project.results_impact || "", key_learnings: project.key_learnings || "",
      tags: project.tags ? project.tags.join(", ") : "", tools: project.tools ? project.tools.join(", ") : "",
      features: project.features ? project.features.join("\n") : "",
      languages: project.languages ? project.languages.map(l => `${l.name}:${l.percent}:${l.color}`).join(", ") : "",
      video_url: project.video_url || "", gallery_urls: project.gallery ? project.gallery.join(", ") : "",
      has_award: !!project.award, award_title: project.award?.title || "", award_description: project.award?.description || "",
      award_competition: project.award?.competition || "", award_image_url: project.award?.image_url || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบโปรเจกต์ "${title}" ?`)) {
      alert(`จำลองการลบโปรเจกต์ "${title}" สำเร็จ!`);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={{ position: "relative", zIndex: 1, marginBottom: 40 }}>
        <div style={styles.cardContainer}>
          <div style={styles.headerRow}>
            <h1 style={styles.pageTitle}>
              {isEditing ? "✏️ Edit Project" : "🛠️ Add New Project"}
            </h1>
            {isEditing && <button onClick={resetForm} style={styles.cancelBtn}>Cancel Edit</button>}
          </div>

          <form onSubmit={handleSubmit} style={styles.formContainer}>
            <div style={styles.sectionStyle}>
              <h3 style={styles.sectionHeading}>📌 Basic Info</h3>
              <div style={styles.gridContainer}>
                <div><label style={styles.labelStyle}>Project Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} required style={styles.inputStyle} /></div>
                <div style={styles.flexRow}>
                  <div style={styles.flex1}><label style={styles.labelStyle}>Category</label><select name="category" value={formData.category} onChange={handleChange} style={styles.inputStyle}><option value="Frontend">Frontend</option><option value="Backend">Backend</option><option value="Database">Database</option><option value="Full-Stack">Full-Stack</option><option value="Game Dev">Game Dev</option></select></div>
                  <div style={styles.flex1}><label style={styles.labelStyle}>Year</label><input type="text" name="year" value={formData.year} onChange={handleChange} style={styles.inputStyle} /></div>
                  <div style={styles.flex1}><label style={styles.labelStyle}>Icon</label><input type="text" name="image_icon" value={formData.image_icon} onChange={handleChange} style={styles.inputStyle} /></div>
                </div>
                <div style={styles.flexRow}>
                  <div style={styles.flex1}><label style={styles.labelStyle}>Gradient From</label><input type="text" name="gradient_from" value={formData.gradient_from} onChange={handleChange} style={styles.inputStyle} placeholder="#f0f6ff" /></div>
                  <div style={styles.flex1}><label style={styles.labelStyle}>Gradient To</label><input type="text" name="gradient_to" value={formData.gradient_to} onChange={handleChange} style={styles.inputStyle} placeholder="#e0f2fe" /></div>
                </div>
                <div><label style={styles.labelStyle}>Short Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows="2" required style={{ ...styles.inputStyle, resize: "vertical" }} /></div>
              </div>
            </div>

            <div style={styles.sectionStyle}>
              <h3 style={{ ...styles.sectionHeading, color: "#ef4444" }}>⚠️ The Problem & Solution</h3>
              <div style={styles.gridContainer}>
                <div><label style={styles.labelStyle}>The Problem</label><textarea name="problem" value={formData.problem} onChange={handleChange} rows="3" style={{ ...styles.inputStyle, resize: "vertical" }} placeholder="ปัญหาที่เจอ..." /></div>
                <div><label style={styles.labelStyle}>The Solution</label><textarea name="solution" value={formData.solution} onChange={handleChange} rows="3" style={{ ...styles.inputStyle, resize: "vertical" }} placeholder="วิธีแก้ปัญหา..." /></div>
              </div>
            </div>

            <div style={styles.sectionStyle}>
              <h3 style={{ ...styles.sectionHeading, color: "#3b82f6" }}>⚙️ Role, Tech Stack & Tools</h3>
              <div style={styles.gridContainer}>
                <div><label style={styles.labelStyle}>My Role</label><input type="text" name="my_role" value={formData.my_role} onChange={handleChange} style={styles.inputStyle} placeholder="เช่น Lead Developer, Data Engineer" /></div>
                <div><label style={styles.labelStyle}>Tech Stack (คั่นด้วยลูกน้ำ)</label><input type="text" name="tags" value={formData.tags} onChange={handleChange} style={styles.inputStyle} placeholder="React, Node.js" /></div>
                <div><label style={styles.labelStyle}>Tools (คั่นด้วยลูกน้ำ)</label><input type="text" name="tools" value={formData.tools} onChange={handleChange} style={styles.inputStyle} placeholder="Figma, Docker, Postman" /></div>
              </div>
            </div>

            <div style={styles.sectionStyle}>
              <h3 style={{ ...styles.sectionHeading, color: "#10b981" }}>✨ Key Features</h3>
              <div><label style={styles.labelStyle}>Features (ขึ้นบรรทัดใหม่ตามรายการ)</label><textarea name="features" value={formData.features} onChange={handleChange} rows="4" style={{ ...styles.inputStyle, resize: "vertical" }} /></div>
            </div>

            <div style={styles.sectionStyle}>
              <h3 style={{ ...styles.sectionHeading, color: "#f59e0b" }}>📈 Results & Learnings</h3>
              <div style={styles.gridContainer}>
                <div><label style={styles.labelStyle}>Results & Impact</label><textarea name="results_impact" value={formData.results_impact} onChange={handleChange} rows="3" style={{ ...styles.inputStyle, resize: "vertical" }} placeholder="ผลลัพธ์ที่ได้..." /></div>
                <div><label style={styles.labelStyle}>Key Learnings</label><textarea name="key_learnings" value={formData.key_learnings} onChange={handleChange} rows="3" style={{ ...styles.inputStyle, resize: "vertical" }} placeholder="สิ่งที่เรียนรู้..." /></div>
              </div>
            </div>

            <div style={styles.sectionStyle}>
              <h3 style={{ ...styles.sectionHeading, color: "#8b5cf6" }}>📊 Languages Used</h3>
              <div><label style={styles.labelStyle}>Languages (รูปแบบ Name:Percent:Color คั่นด้วยลูกน้ำ)</label><input type="text" name="languages" value={formData.languages} onChange={handleChange} style={styles.inputStyle} placeholder="JavaScript:80:#f7df1e, HTML:20:#e34c26" /></div>
            </div>

            <div style={styles.sectionStyle}>
              <h3 style={{ ...styles.sectionHeading, color: "#6366f1" }}>🌍 Media & Links</h3>
              <div style={styles.gridContainer}>
                <div style={styles.flexRow}>
                  <div style={styles.flex1}><label style={styles.labelStyle}>Live Link</label><input type="url" name="link_url" value={formData.link_url} onChange={handleChange} style={styles.inputStyle} /></div>
                  <div style={styles.flex1}><label style={styles.labelStyle}>GitHub</label><input type="url" name="github_url" value={formData.github_url} onChange={handleChange} style={styles.inputStyle} /></div>
                </div>
                <div><label style={styles.labelStyle}>Video URL</label><input type="url" name="video_url" value={formData.video_url} onChange={handleChange} style={styles.inputStyle} /></div>
                <div><label style={styles.labelStyle}>Gallery URLs (คั่นด้วยลูกน้ำ)</label><textarea name="gallery_urls" value={formData.gallery_urls} onChange={handleChange} rows="2" style={{ ...styles.inputStyle, resize: "vertical" }} /></div>
              </div>
            </div>

            <div style={{ ...styles.sectionStyle, background: formData.has_award ? "#fffcf0" : "#f9fafb" }}>
              <label style={{ ...styles.awardCheckboxLabel, color: formData.has_award ? "#874d00" : "#333" }}>
                <input type="checkbox" name="has_award" checked={formData.has_award} onChange={handleChange} style={styles.checkbox} />
                🏆 โปรเจกต์นี้ได้รับรางวัล
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

            <button type="submit" style={{ ...styles.submitBtn, backgroundColor: isEditing ? "#10b981" : "#0D6EFD" }}>
              {isEditing ? "✅ Update Project" : "💾 Save Project"}
            </button>
          </form>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={styles.cardContainer}>
          <h2 style={styles.existingProjectsTitle}>📋 Existing Projects</h2>
          <div style={styles.projectListContainer}>
            {projectsList.map((project) => (
              <div key={project.id} style={styles.projectListItem}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={styles.projectIcon}>{project.image_icon}</div>
                  <div>
                    <div style={styles.projectTitleText}>{project.title}</div>
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

