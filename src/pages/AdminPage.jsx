import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase"; // อย่าลืม import supabase นะครับ

export default function AdminPage() {
  // State สำหรับจัดการฟอร์ม
  const initialFormState = {
    title: "",
    category: "Frontend",
    description: "",
    image_icon: "💻",
    year: "2026",
    link_url: "",
    github_url: "",
    tags: "", 
    features: "", 
    video_url: "", 
    gallery_urls: "", 
    has_award: false, 
    award_title: "",
    award_description: "",
    award_competition: "",
    award_image_url: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  
  // State สำหรับจัดการรายชื่อโปรเจกต์และโหมดการทำงาน
  const [projectsList, setProjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // ดึงข้อมูลโปรเจกต์ทั้งหมดมาแสดง
  const fetchProjects = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("id", { ascending: false }); // เรียงจากใหม่ไปเก่า

    if (data) setProjectsList(data);
    if (error) console.error("Error fetching:", error);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // จัดการการพิมพ์ในฟอร์ม
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  // จัดการการกดปุ่ม Save / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // จัดรูปแบบข้อมูลเตรียมส่งเข้า DB
    const payload = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      image_icon: formData.image_icon,
      year: formData.year,
      link_url: formData.link_url,
      github_url: formData.github_url,
      tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      features: formData.features ? formData.features.split("\n").map(f => f.trim()).filter(Boolean) : [],
      video_url: formData.video_url,
      gallery: formData.gallery_urls ? formData.gallery_urls.split(",").map(url => url.trim()).filter(Boolean) : [],
      award: formData.has_award ? {
        title: formData.award_title,
        description: formData.award_description,
        competition: formData.award_competition,
        image_url: formData.award_image_url
      } : null
    };

    console.log("เตรียมบันทึกข้อมูล:", payload);
    
    // ⚠️ หมายเหตุ: ตอนนี้โค้ดเชื่อมกับ Supabase แล้ว แต่ถ้ายิงไปตอนนี้จะ Error RLS (ความปลอดภัย) 
    // เพราะเรายังไม่ได้ทำระบบ Login ครับ เลยใช้ alert แจ้งเตือนไว้ก่อน
    alert(isEditing 
      ? "จำลองการอัปเดตสำเร็จ! (รอต่อระบบ Login Clerk เพื่อปลดล็อกการเขียน DB)" 
      : "จำลองการเพิ่มสำเร็จ! (รอต่อระบบ Login Clerk เพื่อปลดล็อกการเขียน DB)"
    );

    /* --- โค้ดของจริงที่จะเปิดใช้หลังทำ Login เสร็จ ---
    if (isEditing) {
      const { error } = await supabase.from("projects").update(payload).eq("id", editId);
      if (!error) { alert("อัปเดตสำเร็จ!"); fetchProjects(); resetForm(); }
    } else {
      const { error } = await supabase.from("projects").insert([payload]);
      if (!error) { alert("เพิ่มโปรเจกต์สำเร็จ!"); fetchProjects(); resetForm(); }
    }
    --------------------------------------------- */
    
    // สมมติว่าบันทึกเสร็จแล้ว เคลียร์ฟอร์ม
    resetForm();
  };

  // จัดการการกดปุ่ม Edit (แก้ไข)
  const handleEdit = (project) => {
    setIsEditing(true);
    setEditId(project.id);
    
    // เอาข้อมูลเดิมมาใส่ในฟอร์ม
    setFormData({
      title: project.title || "",
      category: project.category || "Frontend",
      description: project.description || "",
      image_icon: project.image_icon || "💻",
      year: project.year || "",
      link_url: project.link_url || "",
      github_url: project.github_url || "",
      tags: project.tags ? project.tags.join(", ") : "",
      features: project.features ? project.features.join("\n") : "",
      video_url: project.video_url || "",
      gallery_urls: project.gallery ? project.gallery.join(", ") : "",
      has_award: !!project.award,
      award_title: project.award?.title || "",
      award_description: project.award?.description || "",
      award_competition: project.award?.competition || "",
      award_image_url: project.award?.image_url || ""
    });

    // เลื่อนหน้าจอขึ้นไปบนสุดตรงฟอร์ม
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // จัดการการกดปุ่ม Delete (ลบ)
  const handleDelete = async (id, title) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบโปรเจกต์ "${title}" ?`)) {
      alert(`จำลองการลบโปรเจกต์ "${title}" สำเร็จ! (รอระบบ Login เพื่อลบใน DB จริง)`);
      
      /* --- โค้ดลบของจริง ---
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (!error) { fetchProjects(); }
      --------------------- */
    }
  };

  // ล้างฟอร์ม
  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
  };

  // สไตล์
  const labelStyle = { display: "block", fontWeight: "bold", marginBottom: 6, fontSize: 14, color: "#333", fontFamily: "'Poppins', sans-serif" };
  const inputStyle = { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: 14, fontFamily: "'Poppins', sans-serif", boxSizing: "border-box" };
  const sectionStyle = { padding: "20px", background: "#f8fbff", border: "1px solid #eef3ff", borderRadius: "8px", marginTop: "10px" };

  return (
    <div style={{ paddingTop: 80, paddingBottom: 60, minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      
      {/* ---------------- ฟอร์มกรอกข้อมูล ---------------- */}
      <div style={{ maxWidth: 700, margin: "0 auto 40px", backgroundColor: "white", padding: "32px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eef3ff", paddingBottom: 16, marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 24, margin: 0, color: "#0d1b2a" }}>
            {isEditing ? "✏️ Edit Project" : "🛠️ Add New Project"}
          </h1>
          {isEditing && (
            <button onClick={resetForm} style={{ padding: "6px 12px", background: "#f3f4f6", border: "none", borderRadius: "6px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontSize: 13, color: "#4b5563", fontWeight: "bold" }}>
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div>
            <label style={labelStyle}>Project Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required style={inputStyle} placeholder="เช่น Cafe POS System" />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="Full-Stack">Full-Stack</option>
                <option value="Game Dev">Game Dev</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Year</label>
              <input type="text" name="year" value={formData.year} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Icon (Emoji)</label>
              <input type="text" name="image_icon" value={formData.image_icon} onChange={handleChange} style={inputStyle} placeholder="สำหรับโชว์ในรายชื่อ" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required style={{ ...inputStyle, resize: "vertical" }} placeholder="อธิบายโปรเจกต์สั้นๆ..."></textarea>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Live Link URL</label>
              <input type="url" name="link_url" value={formData.link_url} onChange={handleChange} style={inputStyle} placeholder="https://..." />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>GitHub URL</label>
              <input type="url" name="github_url" value={formData.github_url} onChange={handleChange} style={inputStyle} placeholder="https://github.com/..." />
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: "0 0 16px 0", fontFamily: "'Poppins', sans-serif", fontSize: 16, color: "#0D6EFD" }}>🖼️ Media (รูปภาพ & วิดีโอ)</h3>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Video URL (ใส่ได้ 1 คลิป)</label>
              <input type="url" name="video_url" value={formData.video_url} onChange={handleChange} style={inputStyle} placeholder="เช่น ลิงก์ YouTube หรือ .mp4" />
            </div>
            <div>
              <label style={labelStyle}>Images Gallery (ใส่กี่รูปก็ได้ พิมพ์ลิงก์คั่นด้วยลูกน้ำ , )</label>
              <textarea name="gallery_urls" value={formData.gallery_urls} onChange={handleChange} rows="2" style={{ ...inputStyle, resize: "vertical" }} placeholder="https://image1.jpg, https://image2.jpg"></textarea>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tech Stack (พิมพ์คั่นด้วยลูกน้ำ)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} style={inputStyle} placeholder="React, Node.js, TailwindCSS" />
          </div>

          <div>
            <label style={labelStyle}>Key Features (ขึ้นบรรทัดใหม่เพื่อแยกข้อ)</label>
            <textarea name="features" value={formData.features} onChange={handleChange} rows="3" style={{ ...inputStyle, resize: "vertical" }} placeholder="- ระบบ Login&#10;- ค้นหาข้อมูลแบบ Real-time"></textarea>
          </div>

          <div style={{ ...sectionStyle, background: formData.has_award ? "#fffcf0" : "#f9fafb", borderColor: formData.has_award ? "#ffe58f" : "#eee" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", cursor: "pointer", fontFamily: "'Poppins', sans-serif", color: formData.has_award ? "#874d00" : "#333" }}>
              <input type="checkbox" name="has_award" checked={formData.has_award} onChange={handleChange} style={{ width: 18, height: 18 }} />
              🏆 โปรเจกต์นี้ได้รับรางวัล!
            </label>

            {formData.has_award && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                <div>
                  <label style={labelStyle}>Award Title (ชื่อรางวัล)</label>
                  <input type="text" name="award_title" value={formData.award_title} onChange={handleChange} required={formData.has_award} style={inputStyle} placeholder="เช่น 1st Runner Up" />
                </div>
                <div>
                  <label style={labelStyle}>Competition Name (ชื่องานแข่ง)</label>
                  <input type="text" name="award_competition" value={formData.award_competition} onChange={handleChange} required={formData.has_award} style={inputStyle} placeholder="เช่น National Hackathon 2026" />
                </div>
                <div>
                  <label style={labelStyle}>Award Description (คำอธิบาย)</label>
                  <textarea name="award_description" value={formData.award_description} onChange={handleChange} rows="2" style={{ ...inputStyle, resize: "vertical" }} placeholder="อธิบายความภูมิใจหรือเกณฑ์ที่ได้รางวัล..."></textarea>
                </div>
                <div>
                  <label style={labelStyle}>Award Image URL (รูปลับโล่/ใบประกาศ)</label>
                  <input type="url" name="award_image_url" value={formData.award_image_url} onChange={handleChange} style={inputStyle} placeholder="https://..." />
                </div>
              </div>
            )}
          </div>

          <button type="submit" style={{ marginTop: "16px", padding: "14px", backgroundColor: isEditing ? "#10b981" : "#0D6EFD", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", fontFamily: "'Poppins', sans-serif", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}>
            {isEditing ? "✅ Update Project" : "💾 Save Project"}
          </button>
        </form>
      </div>

      {/* ---------------- รายการโปรเจกต์ที่มีอยู่ ---------------- */}
      <div style={{ maxWidth: 700, margin: "0 auto", backgroundColor: "white", padding: "32px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, margin: "0 0 20px 0", color: "#0d1b2a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>📋 Existing Projects</span>
          <span style={{ fontSize: 14, color: "#8aabcc", fontWeight: "normal" }}>ทั้งหมด {projectsList.length} รายการ</span>
        </h2>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#8aabcc", fontFamily: "'Poppins', sans-serif" }}>กำลังโหลดข้อมูล...</div>
        ) : projectsList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#8aabcc", fontFamily: "'Poppins', sans-serif", background: "#f9fafb", borderRadius: "8px" }}>
            ยังไม่มีโปรเจกต์ในฐานข้อมูล
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {projectsList.map((project) => (
              <div key={project.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "#f8fbff", border: "1px solid #eef3ff", borderRadius: "10px" }}>
                
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ fontSize: "28px", background: "white", width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    {project.image_icon || "💻"}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 15, color: "#0d1b2a" }}>
                      {project.title} {project.award && <span title="มีรางวัล" style={{ fontSize: 12 }}>🏆</span>}
                    </div>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, color: "#5a7a9a", marginTop: "2px" }}>
                      {project.category} • {project.year}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    onClick={() => handleEdit(project)}
                    style={{ padding: "8px 16px", background: "#e0f2fe", color: "#0D6EFD", border: "none", borderRadius: "6px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13 }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id, project.title)}
                    style={{ padding: "8px 16px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "6px", cursor: "pointer", fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13 }}
                  >
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}