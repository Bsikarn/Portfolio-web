import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { styles } from "../../styles/AdminPage.styles";

export default function SettingsPanel() {
  const [settingsData, setSettingsData] = useState({
    name: "", role: "", intro: "", gpa: "", education: "", languages: "", image_url: "",
    email: "", github_handle: "", github_url: "", linkedin_handle: "", linkedin_url: "", resume_url: "", portfolio_url: ""
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Fetch settings from Supabase
  const fetchSettings = async () => {
    const { data, error } = await supabase.from("portfolio_settings").select("*").eq("id", 1).single();
    if (data) {
      setSettingsData({
        ...data.about_me,
        ...data.contact_links,
        languages: Array.isArray(data.about_me?.languages) ? data.about_me.languages.join(", ") : (data.about_me?.languages || "")
      });
    }
    if (error) console.error("Error fetching settings:", error);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettingsData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const payload = {
      about_me: { 
        name: settingsData.name, role: settingsData.role, intro: settingsData.intro, 
        gpa: settingsData.gpa, education: settingsData.education, 
        languages: settingsData.languages ? settingsData.languages.split(",").map(l => l.trim()).filter(Boolean) : [],
        image_url: settingsData.image_url || ""
      },
      contact_links: { 
        email: settingsData.email, github_handle: settingsData.github_handle, github_url: settingsData.github_url, 
        linkedin_handle: settingsData.linkedin_handle, linkedin_url: settingsData.linkedin_url, 
        resume_url: settingsData.resume_url, portfolio_url: settingsData.portfolio_url 
      }
    };
    
    const { error } = await supabase.from("portfolio_settings").update(payload).eq("id", 1);
    setIsSavingSettings(false);
    if (error) {
      alert("Error saving settings: " + error.message);
    } else {
      alert("Settings saved successfully!");
    }
  };

  return (
    <div style={{ position: "relative", zIndex: 1, marginBottom: 40 }}>
      <div style={styles.cardContainer}>
        <h2 style={styles.sectionHeading}>⚙️ Personal Info & Contact Links</h2>
        <form onSubmit={handleSaveSettings} style={styles.formContainer}>
          <div style={styles.sectionStyle}>
            <h3 style={styles.sectionHeading}>👤 About Me</h3>
            <div style={styles.gridContainer}>
              <div><label style={styles.labelStyle}>Name</label><input type="text" name="name" value={settingsData.name} onChange={handleSettingsChange} style={styles.inputStyle} required /></div>
              <div><label style={styles.labelStyle}>Role</label><input type="text" name="role" value={settingsData.role} onChange={handleSettingsChange} style={styles.inputStyle} required /></div>
              <div><label style={styles.labelStyle}>Intro</label><textarea name="intro" value={settingsData.intro} onChange={handleSettingsChange} rows="4" style={{...styles.inputStyle, resize: "vertical"}} /></div>
              <div><label style={styles.labelStyle}>Education</label><input type="text" name="education" value={settingsData.education} onChange={handleSettingsChange} style={styles.inputStyle} /></div>
              <div style={styles.flexRow}>
                <div style={styles.flex1}><label style={styles.labelStyle}>GPA</label><input type="text" name="gpa" value={settingsData.gpa} onChange={handleSettingsChange} style={styles.inputStyle} /></div>
                <div style={styles.flex1}><label style={styles.labelStyle}>Languages</label><input type="text" name="languages" value={settingsData.languages} onChange={handleSettingsChange} style={styles.inputStyle} placeholder="Thai (Native), English (Professional)" /></div>
              </div>
              <div><label style={styles.labelStyle}>Profile Image URL</label><input type="url" name="image_url" value={settingsData.image_url || ""} onChange={handleSettingsChange} style={styles.inputStyle} placeholder="https://..." /></div>
            </div>
          </div>

          <div style={styles.sectionStyle}>
            <h3 style={styles.sectionHeading}>🔗 Contact Links</h3>
            <div style={styles.gridContainer}>
              <div><label style={styles.labelStyle}>Email</label><input type="email" name="email" value={settingsData.email} onChange={handleSettingsChange} style={styles.inputStyle} /></div>
              <div style={styles.flexRow}>
                <div style={styles.flex1}><label style={styles.labelStyle}>GitHub Handle</label><input type="text" name="github_handle" value={settingsData.github_handle} onChange={handleSettingsChange} style={styles.inputStyle} placeholder="e.g. Bsikarn" /></div>
                <div style={styles.flex1}><label style={styles.labelStyle}>GitHub URL</label><input type="url" name="github_url" value={settingsData.github_url} onChange={handleSettingsChange} style={styles.inputStyle} /></div>
              </div>
              <div style={styles.flexRow}>
                <div style={styles.flex1}><label style={styles.labelStyle}>LinkedIn Handle</label><input type="text" name="linkedin_handle" value={settingsData.linkedin_handle} onChange={handleSettingsChange} style={styles.inputStyle} /></div>
                <div style={styles.flex1}><label style={styles.labelStyle}>LinkedIn URL</label><input type="url" name="linkedin_url" value={settingsData.linkedin_url} onChange={handleSettingsChange} style={styles.inputStyle} /></div>
              </div>
              <div style={styles.flexRow}>
                <div style={styles.flex1}><label style={styles.labelStyle}>Resume/CV URL</label><input type="text" name="resume_url" value={settingsData.resume_url} onChange={handleSettingsChange} style={styles.inputStyle} placeholder="# or https://..." /></div>
                <div style={styles.flex1}><label style={styles.labelStyle}>Portfolio URL</label><input type="text" name="portfolio_url" value={settingsData.portfolio_url} onChange={handleSettingsChange} style={styles.inputStyle} placeholder="# or https://..." /></div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isSavingSettings} style={{ ...styles.submitBtn, backgroundColor: isSavingSettings ? "#ccc" : "#10b981" }}>
            {isSavingSettings ? "Saving..." : "💾 Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
