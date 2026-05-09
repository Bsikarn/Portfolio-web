import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { styles } from "../../styles/AdminPage.styles";

// Flatten DB settings record to a flat form-friendly object
function flattenSettings(data) {
  return {
    ...data.about_me,
    ...data.contact_links,
    languages: Array.isArray(data.about_me?.languages)
      ? data.about_me.languages.join(", ")
      : (data.about_me?.languages || ""),
  };
}

// Build the Supabase update payload from the flat form object
function buildPayload(s) {
  return {
    about_me: {
      name: s.name, role: s.role, intro: s.intro, gpa: s.gpa, education: s.education,
      languages: s.languages ? s.languages.split(",").map((l) => l.trim()).filter(Boolean) : [],
      image_url: s.image_url || "",
    },
    contact_links: {
      email: s.email, github_handle: s.github_handle, github_url: s.github_url,
      linkedin_handle: s.linkedin_handle, linkedin_url: s.linkedin_url,
      resume_url: s.resume_url, portfolio_url: s.portfolio_url,
    },
  };
}

const INITIAL_SETTINGS = {
  name: "", role: "", intro: "", gpa: "", education: "", languages: "", image_url: "",
  email: "", github_handle: "", github_url: "", linkedin_handle: "", linkedin_url: "", resume_url: "", portfolio_url: "",
};

export default function SettingsPanel() {
  const [settingsData, setSettingsData] = useState(INITIAL_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing settings from DB on mount
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from("portfolio_settings").select("*").eq("id", 1).single();
      if (data) setSettingsData(flattenSettings(data));
      if (error) console.error("Error fetching settings:", error);
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettingsData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase.from("portfolio_settings").update(buildPayload(settingsData)).eq("id", 1);
    setIsSaving(false);
    if (error) return alert("Error saving settings: " + error.message);
    alert("Settings saved successfully!");
  };

  // Helper for a labeled input field
  const Field = ({ label, name, type = "text", placeholder = "" }) => (
    <div>
      <label style={styles.labelStyle}>{label}</label>
      <input type={type} name={name} value={settingsData[name] || ""} onChange={handleChange} style={styles.inputStyle} placeholder={placeholder} />
    </div>
  );

  return (
    <div style={{ position: "relative", zIndex: 1, marginBottom: 40 }}>
      <div style={styles.cardContainer}>
        <h2 style={styles.sectionHeading}>⚙️ Personal Info & Contact Links</h2>
        <form onSubmit={handleSave} style={styles.formContainer}>

          {/* About Me */}
          <div style={styles.sectionStyle}>
            <h3 style={styles.sectionHeading}>👤 About Me</h3>
            <div style={styles.gridContainer}>
              <Field label="Name" name="name" />
              <Field label="Role" name="role" />
              <div>
                <label style={styles.labelStyle}>Intro</label>
                <textarea name="intro" value={settingsData.intro || ""} onChange={handleChange} rows="4" style={{ ...styles.inputStyle, resize: "vertical" }} />
              </div>
              <Field label="Education" name="education" />
              <div style={styles.flexRow}>
                <div style={styles.flex1}><Field label="GPA" name="gpa" /></div>
                <div style={styles.flex1}><Field label="Languages" name="languages" placeholder="Thai (Native), English (Professional)" /></div>
              </div>
              <Field label="Profile Image URL" name="image_url" type="url" placeholder="https://..." />
            </div>
          </div>

          {/* Contact Links */}
          <div style={styles.sectionStyle}>
            <h3 style={styles.sectionHeading}>🔗 Contact Links</h3>
            <div style={styles.gridContainer}>
              <Field label="Email" name="email" type="email" />
              <div style={styles.flexRow}>
                <div style={styles.flex1}><Field label="GitHub Handle" name="github_handle" placeholder="e.g. Bsikarn" /></div>
                <div style={styles.flex1}><Field label="GitHub URL" name="github_url" type="url" /></div>
              </div>
              <div style={styles.flexRow}>
                <div style={styles.flex1}><Field label="LinkedIn Handle" name="linkedin_handle" /></div>
                <div style={styles.flex1}><Field label="LinkedIn URL" name="linkedin_url" type="url" /></div>
              </div>
              <div style={styles.flexRow}>
                <div style={styles.flex1}><Field label="Resume/CV URL" name="resume_url" placeholder="# or https://..." /></div>
                <div style={styles.flex1}><Field label="Portfolio URL" name="portfolio_url" placeholder="# or https://..." /></div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSaving} style={{ ...styles.submitBtn, backgroundColor: isSaving ? "#ccc" : "#10b981" }}>
            {isSaving ? "Saving..." : "💾 Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
