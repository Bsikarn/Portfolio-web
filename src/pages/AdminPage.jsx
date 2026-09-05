import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/AdminPage.styles";
import LoadingPage from "../components/LoadingPage";
import SettingsPanel from "../components/admin/SettingsPanel";
import CategoryManager from "../components/admin/CategoryManager";
import ContentForm from "../components/admin/ContentForm";
import ProjectList from "../components/admin/ProjectList";
import { isSpecialType, sortByOrder, filterByContentType, parseLanguages, getTableName, getSortOrder, isItemHidden } from "../lib/adminHelpers";

// Default form state for a new project
const INITIAL_FORM = {
  title: "", category: "Frontend", category2: "", description: "", year: "2026",
  link_url: "", github_url: "", tags: "", tools: "", features: "",
  my_role: "", problem: "", solution: "", results_impact: "", key_learnings: "",
  languages: "", video_url: "", gallery_urls: "", certificate_url: "", activity_url: "",
  has_award: false, award_title: "", award_description: "", award_competition: "", award_image_url: "",
  is_recommended: false, sort_order: 0, is_hidden: false,
};

// Parse a project from DB back to form-compatible shape
function projectToForm(project) {
  const cats = (project.category || "").split(",").map((c) => c.trim());
  const isHidden = typeof project.is_hidden === "boolean"
    ? project.is_hidden
    : (Array.isArray(project.tags) && project.tags.includes("__hidden__"));
  const userTags = (project.tags || []).filter((t) => typeof t === "string" && t !== "__hidden__" && !t.startsWith("__order:"));

  const sortOrder = (project.sort_order !== undefined && project.sort_order !== null && !isNaN(Number(project.sort_order)))
    ? Number(project.sort_order)
    : 0;

  return {
    title: project.title || "",
    category: cats[0] || "Frontend",
    category2: cats[1] || "",
    description: project.description || "",
    year: project.year || "",
    link_url: project.link_url || "",
    github_url: project.github_url || "",
    my_role: project.my_role || "",
    problem: project.problem || "",
    solution: project.solution || "",
    results_impact: project.results_impact || "",
    key_learnings: project.key_learnings || "",
    tags: userTags.join(", "),
    tools: project.tools?.join(", ") || "",
    features: project.features?.join("\n") || "",
    languages: project.languages?.map((l) => `${l.name}:${l.percent}:${l.color}`).join(", ") || "",
    video_url: project.video_url || "",
    gallery_urls: project.gallery?.join(", ") || "",
    activity_url: project.gallery?.[0] || "",
    certificate_url: project.gallery?.[1] || "",
    has_award: !!project.award,
    award_title: project.award?.title || "",
    award_description: project.award?.description || "",
    award_competition: project.award?.competition || "",
    award_image_url: project.award?.image_url || "",
    is_recommended: project.is_recommended || false,
    sort_order: sortOrder,
    is_hidden: isHidden,
  };
}

// Build the Supabase payload from form data
function buildPayload(formData, contentType) {
  const selectedCats = [formData.category, formData.category2].filter(Boolean);

  let parsedTags = formData.tags
    ? formData.tags.split(",").map((t) => t.trim()).filter((t) => Boolean(t) && t !== "__hidden__" && !t.startsWith("__order:"))
    : [];
  if (formData.is_hidden) parsedTags.push("__hidden__");
  const sortVal = Number(formData.sort_order) || 0;
  parsedTags.push(`__order:${sortVal}__`);

  return {
    title: formData.title,
    category: isSpecialType(contentType) ? contentType : selectedCats.join(", "),
    description: formData.description,
    year: formData.year,
    link_url: formData.link_url,
    github_url: formData.github_url,
    my_role: formData.my_role,
    problem: formData.problem,
    solution: formData.solution,
    results_impact: formData.results_impact,
    key_learnings: formData.key_learnings,
    tags: parsedTags,
    tools: formData.tools ? formData.tools.split(",").map((t) => t.trim()).filter(Boolean) : [],
    features: formData.features ? formData.features.split("\n").map((f) => f.trim()).filter(Boolean) : [],
    languages: parseLanguages(formData.languages),
    video_url: formData.video_url,
    gallery: isSpecialType(contentType)
      ? [formData.activity_url?.trim() || "", formData.certificate_url?.trim() || ""]
      : (formData.gallery_urls ? formData.gallery_urls.split(",").map((u) => u.trim()).filter(Boolean) : []),
    award: formData.has_award
      ? { title: formData.award_title, description: formData.award_description, competition: formData.award_competition, image_url: formData.award_image_url }
      : null,
    is_recommended: formData.is_recommended,
    sort_order: sortVal,
    is_hidden: !!formData.is_hidden,
  };
}

// GitHub language colors map
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#563d7c",
  Python: "#3572A5", Go: "#00ADD8", Rust: "#dea584", "C++": "#f34b7d",
  Java: "#b07219", "C#": "#178600", PHP: "#4F5D95", Ruby: "#701516", Shell: "#89e051",
};

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
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isExistingOpen, setIsExistingOpen] = useState(true);

  // Batch pending states
  const [pendingProjectIds, setPendingProjectIds] = useState(new Set());
  const [pendingCategoryActions, setPendingCategoryActions] = useState([]);
  const [isSavingBatch, setIsSavingBatch] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const [pRes, achRes, actRes, expRes] = await Promise.all([
        supabase.from("projects").select("*"),
        supabase.from("achievements").select("*"),
        supabase.from("activities").select("*"),
        supabase.from("experiences").select("*"),
      ]);

      const processRows = (rows, defaultCategory) => (rows || []).map((p) => ({
        ...p,
        category: p.category || defaultCategory,
        sort_order: getSortOrder(p),
        is_hidden: isItemHidden(p),
      }));

      const allItems = [
        ...processRows(pRes.data, "Frontend"),
        ...processRows(achRes.data, "Achievement"),
        ...processRows(actRes.data, "Activity"),
        ...processRows(expRes.data, "Experience"),
      ];

      setProjectsList(allItems.sort(sortByOrder));
    } catch (err) {
      console.error("Error fetching content items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (data) {
      const sorted = [...data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setCategoriesList(sorted);
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

  const handleToggleHide = (project) => {
    const newHidden = !project.is_hidden;
    setProjectsList((prev) =>
      prev.map((p) => {
        if (p.id !== project.id) return p;
        const currentTags = Array.isArray(p.tags) ? p.tags : [];
        const newTags = newHidden
          ? [...currentTags.filter((t) => t !== "__hidden__"), "__hidden__"]
          : currentTags.filter((t) => t !== "__hidden__");
        return { ...p, is_hidden: newHidden, tags: newTags };
      })
    );
    setPendingProjectIds((prev) => new Set(prev).add(project.id));
  };

  const handleProjectOrderChange = (id, newOrder) => {
    const parsed = parseInt(newOrder) || 0;
    setProjectsList((prev) =>
      [...prev.map((p) => {
        if (p.id !== id) return p;
        const currentTags = Array.isArray(p.tags) ? p.tags : [];
        const cleanTags = currentTags.filter((t) => typeof t === "string" && !t.startsWith("__order:"));
        cleanTags.push(`__order:${parsed}__`);
        return { ...p, sort_order: parsed, tags: cleanTags };
      })].sort(sortByOrder)
    );
    setPendingProjectIds((prev) => new Set(prev).add(id));
  };

  const handleMoveProject = (id, direction) => {
    const currentFiltered = filterByContentType(projectsList, contentType);
    const index = currentFiltered.findIndex((p) => p.id === id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentFiltered.length) return;

    const currentItem = currentFiltered[index];
    const targetItem = currentFiltered[targetIndex];
    const currentOrder = currentItem.sort_order || (index + 1);
    const targetOrder = targetItem.sort_order || (targetIndex + 1);

    let newCurrentOrder = targetOrder;
    let newTargetOrder = currentOrder;
    if (currentOrder === targetOrder) {
      newCurrentOrder = direction === "up" ? targetOrder - 1 : targetOrder + 1;
    }

    handleProjectOrderChange(currentItem.id, newCurrentOrder);
    handleProjectOrderChange(targetItem.id, newTargetOrder);
  };

  const handleSaveAllBatch = async () => {
    const hasProjectChanges = pendingProjectIds.size > 0;
    const hasCategoryChanges = pendingCategoryActions.length > 0;
    if (!hasProjectChanges && !hasCategoryChanges) { alert("No unsaved changes!"); return; }

    setIsSavingBatch(true);
    setSaveSuccessMsg("");
    try {
      const promises = [];

      for (const id of pendingProjectIds) {
        const targetProject = projectsList.find((p) => p.id === id);
        if (!targetProject) continue;
        const pCategory = isSpecialType(targetProject.category) ? targetProject.category : "Project";
        const tableName = getTableName(pCategory);
        const payload = buildPayload(projectToForm(targetProject), pCategory);

        const updateOp = supabase
          .from(tableName)
          .update(payload)
          .eq("id", id)
          .then(async ({ error }) => {
            if (error) {
              if (tableName === "projects") {
                const { error: rpcErr } = await supabase.rpc("admin_update_project", { p_id: id, payload });
                if (rpcErr) throw rpcErr;
              } else {
                throw error;
              }
            }
          });
        promises.push(updateOp);
      }

      for (const action of pendingCategoryActions) {
        if (action.type === "add") {
          promises.push(supabase.rpc("admin_insert_category", { p_name: action.name }));
        } else if (action.type === "delete" && typeof action.id === "number") {
          promises.push(supabase.rpc("admin_delete_category", { p_id: action.id }));
        } else if (action.type === "reorder" && typeof action.id === "number") {
          promises.push(supabase.rpc("admin_update_category_order", { p_id: action.id, p_sort_order: action.sort_order }));
        }
      }

      await Promise.all(promises);
      setPendingProjectIds(new Set());
      setPendingCategoryActions([]);
      setSaveSuccessMsg("✅ All changes saved successfully!");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Batch save error:", err);
      alert("Error saving changes: " + err.message);
    } finally {
      setIsSavingBatch(false);
      fetchProjects();
      fetchCategories();
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      if (name === "has_award" && checked) return setFormData((p) => ({ ...p, has_award: true, is_recommended: false }));
      if (name === "is_recommended" && checked) return setFormData((p) => ({ ...p, is_recommended: true, has_award: false }));
      return setFormData((p) => ({ ...p, [name]: checked }));
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = buildPayload(formData, contentType);
    const tableName = getTableName(contentType);

    if (isEditing) {
      const { error } = await supabase.from(tableName).update(payload).eq("id", editId);
      if (error && tableName === "projects") {
        const { error: rpcErr } = await supabase.rpc("admin_update_project", { p_id: editId, payload });
        if (rpcErr) return alert("Error updating project: " + rpcErr.message);
      } else if (error) {
        return alert(`Error updating ${contentType.toLowerCase()}: ` + error.message);
      }
      alert(`${contentType} updated successfully!`);
    } else {
      const { error } = await supabase.from(tableName).insert(payload);
      if (error && tableName === "projects") {
        const { error: rpcErr } = await supabase.rpc("admin_insert_project", { payload });
        if (rpcErr) return alert("Error adding project: " + rpcErr.message);
      } else if (error) {
        return alert(`Error adding ${contentType.toLowerCase()}: ` + error.message);
      }
      alert(`${contentType} added successfully!`);
    }
    resetForm();
    fetchProjects();
  };

  const handleEdit = (project) => {
    setIsEditing(true);
    setIsFormOpen(true);
    setEditId(project.id);
    setContentType(isSpecialType(project.category) ? project.category : "Project");
    setFormData(projectToForm(project));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    const targetItem = projectsList.find((p) => p.id === id);
    const categoryToUse = targetItem?.category || contentType;
    const tableName = getTableName(categoryToUse);

    if (tableName === "projects") {
      const { error } = await supabase.rpc("admin_delete_project", { p_id: id });
      if (error) {
        const { error: directErr } = await supabase.from("projects").delete().eq("id", id);
        if (directErr) return alert("Error deleting project: " + directErr.message);
      }
    } else {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) return alert("Error deleting item: " + error.message);
    }
    alert(`"${title}" deleted successfully!`);
    fetchProjects();
  };

  const resetForm = () => {
    setFormData({ ...INITIAL_FORM, category: categoriesList[0]?.name || "Frontend", category2: "" });
    setIsEditing(false);
    setEditId(null);
    setContentType("Project");
  };

  const hasPendingChanges = pendingProjectIds.size > 0 || pendingCategoryActions.length > 0;

  return (
    <div style={styles.pageContainer}>
      {isLoading && <LoadingPage />}

      <div style={{ maxWidth: 920, margin: "0 auto 20px" }}>
        {/* Top Header Row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>⚙️ Admin Panel</h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0 0" }}>Manage projects, content categories, and site settings</p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); setPage?.("Home"); }}
            style={{ padding: "8px 16px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
          >
            🚪 Sign Out
          </button>
        </div>

        {/* Main Navigation Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", background: "#ffffff", padding: "6px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
          {["Content", "Settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setAdminTab(tab)}
              style={{
                flex: "1 1 140px", padding: "12px 16px", borderRadius: "10px", fontWeight: "700", fontSize: "14px",
                cursor: "pointer", border: "none",
                background: adminTab === tab ? "#0D6EFD" : "transparent",
                color: adminTab === tab ? "#ffffff" : "#64748b",
                transition: "all 0.15s ease",
              }}
            >
              {tab === "Content" ? "📝 Manage Content" : "⚙️ Personal Info & Links"}
            </button>
          ))}
        </div>
      </div>

      {adminTab === "Content" ? (
        <>
          <div style={{ maxWidth: 920, margin: "0 auto 40px" }}>
            {/* Global Content Type Selector Bar */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px", background: "#ffffff", padding: "6px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)" }}>
              {["Project", "Achievement", "Activity", "Experience"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setContentType(type)}
                  style={{
                    flex: "1 1 40%", minWidth: "120px", padding: "10px 12px", borderRadius: "10px", fontWeight: "700", fontSize: "13px",
                    cursor: "pointer", border: "none",
                    background: contentType === type ? "#0D6EFD" : "transparent",
                    color: contentType === type ? "#ffffff" : "#475569",
                    transition: "all 0.15s ease",
                  }}
                >
                  {type}s
                </button>
              ))}
            </div>

            {/* 1. Add / Edit Content Form */}
            <ContentForm
              formData={formData}
              setFormData={setFormData}
              isEditing={isEditing}
              contentType={contentType}
              categoriesList={categoriesList}
              isSyncingGithub={isSyncingGithub}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleSyncGithub={handleSyncGithub}
              resetForm={resetForm}
              setIsFormOpen={setIsFormOpen}
              isFormOpen={isFormOpen}
            />

            {/* 2. Existing Content List */}
            <ProjectList
              projectsList={projectsList}
              contentType={contentType}
              handleProjectOrderChange={handleProjectOrderChange}
              handleMoveProject={handleMoveProject}
              handleToggleHide={handleToggleHide}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              isExistingOpen={isExistingOpen}
              setIsExistingOpen={setIsExistingOpen}
            />

            {/* 3. Manage Categories */}
            <CategoryManager
              categoriesList={categoriesList}
              setCategoriesList={setCategoriesList}
              fetchCategories={fetchCategories}
              setPendingCategoryActions={setPendingCategoryActions}
            />
          </div>
        </>
      ) : (
        <SettingsPanel />
      )}

      {/* Floating Fixed Save Button at Bottom-Left */}
      <div style={{ position: "fixed", bottom: "24px", left: "24px", zIndex: 9999, display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          type="button"
          onClick={handleSaveAllBatch}
          disabled={isSavingBatch}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 22px", borderRadius: "50px",
            background: hasPendingChanges ? "linear-gradient(135deg, #0D6EFD 0%, #2563eb 100%)" : "#0f172a",
            color: "#ffffff", fontWeight: "700", fontSize: "14px",
            border: hasPendingChanges ? "2px solid #60a5fa" : "1px solid #334155",
            boxShadow: hasPendingChanges
              ? "0 10px 25px -5px rgba(13, 110, 253, 0.5), 0 0 15px rgba(96, 165, 250, 0.3)"
              : "0 4px 12px rgba(0,0,0,0.15)",
            cursor: isSavingBatch ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            transform: hasPendingChanges ? "scale(1.04)" : "scale(1)",
          }}
        >
          <span style={{ fontSize: "16px" }}>{isSavingBatch ? "⏳" : "💾"}</span>
          <span>
            {isSavingBatch
              ? "Saving..."
              : hasPendingChanges
                ? `Save All Changes (${pendingProjectIds.size + pendingCategoryActions.length})`
                : "Save All Changes"
            }
          </span>
        </button>

        {saveSuccessMsg && (
          <div style={{ background: "#10b981", color: "white", padding: "8px 16px", borderRadius: "30px", fontSize: "13px", fontWeight: "bold", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
            {saveSuccessMsg}
          </div>
        )}
      </div>
    </div>
  );
}
