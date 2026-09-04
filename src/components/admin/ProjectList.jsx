import { styles } from "../../styles/AdminPage.styles";
import { isSpecialType, filterByContentType, sortByOrder } from "../../lib/adminHelpers";

// Existing content list panel with sort order controls
export default function ProjectList({
  projectsList,
  contentType,
  handleProjectOrderChange,
  handleMoveProject,
  handleToggleHide,
  handleEdit,
  handleDelete,
  isExistingOpen,
  setIsExistingOpen,
}) {
  const filtered = filterByContentType(projectsList, contentType).sort((a, b) => {
    if (contentType === "Project") return sortByOrder(a, b);
    const yearDiff = (b.year || "").localeCompare(a.year || "");
    return yearDiff !== 0 ? yearDiff : b.id - a.id;
  });

  return (
    <div style={styles.cardContainer}>
      {/* Header with Collapsible Toggle */}
      <div
        onClick={() => setIsExistingOpen(!isExistingOpen)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2 style={{ ...styles.existingProjectsTitle, margin: 0 }}>📋 Existing {contentType}s</h2>
          <span style={{ fontSize: "12px", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "12px", fontWeight: "600" }}>
            {filtered.length} items
          </span>
        </div>
        <span style={{ fontSize: "14px", color: "#0D6EFD", fontWeight: "bold" }}>
          {isExistingOpen ? "▲ Fold" : "▼ Expand"}
        </span>
      </div>

      {isExistingOpen && (
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
          <div style={styles.projectListContainer}>
            {filtered.map((project) => (
              <div
                key={project.id}
                style={{
                  ...styles.projectListItem,
                  opacity: (project.is_hidden && (contentType === "Achievement" || contentType === "Activity")) ? 0.75 : 1,
                  background: (project.is_hidden && (contentType === "Achievement" || contentType === "Activity")) ? "#fffbf5" : "#ffffff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: "1 1 220px", minWidth: 0 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <div style={styles.projectTitleText}>{project.title}</div>
                      {project.award && <span style={{ fontSize: "11px", background: "#fef08a", color: "#854d0e", padding: "2px 6px", borderRadius: "12px", whiteSpace: "nowrap" }}>🏆 Award</span>}
                      {project.is_recommended && <span style={{ fontSize: "11px", background: "#ccfbf1", color: "#0f766e", padding: "2px 6px", borderRadius: "12px", whiteSpace: "nowrap" }}>⭐ Recommend</span>}
                      {project.is_hidden && (contentType === "Achievement" || contentType === "Activity") && <span style={{ fontSize: "11px", background: "#ffedd5", color: "#c2410c", padding: "2px 6px", borderRadius: "12px", fontWeight: "bold", whiteSpace: "nowrap" }}>👁️ Hidden</span>}
                    </div>
                    <div style={styles.projectCategoryText}>{project.category} {project.year ? `(${project.year})` : ""}</div>
                  </div>
                </div>

                {/* Action Controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginLeft: "auto" }}>
                  {contentType === "Project" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f8fafc", padding: "4px 6px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Order:</span>
                      <input
                        type="number"
                        value={project.sort_order || 0}
                        onChange={(e) => handleProjectOrderChange(project.id, e.target.value)}
                        style={{ width: "42px", padding: "2px 4px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", textAlign: "center" }}
                        title="Display Order (Lower appears first)"
                      />
                      <button type="button" onClick={() => handleMoveProject(project.id, "up")} style={{ padding: "2px 5px", background: "#eef3ff", border: "1px solid #d0e8ff", color: "#0D6EFD", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }} title="Move Up">▲</button>
                      <button type="button" onClick={() => handleMoveProject(project.id, "down")} style={{ padding: "2px 5px", background: "#eef3ff", border: "1px solid #d0e8ff", color: "#0D6EFD", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }} title="Move Down">▼</button>
                    </div>
                  )}
                  {(contentType === "Achievement" || contentType === "Activity") && (
                    <button
                      type="button"
                      onClick={() => handleToggleHide(project)}
                      style={{
                        padding: "6px 12px",
                        background: project.is_hidden ? "#ffedd5" : "#f1f5f9",
                        border: project.is_hidden ? "1px solid #fed7aa" : "1px solid #cbd5e1",
                        color: project.is_hidden ? "#c2410c" : "#475569",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                      title={project.is_hidden ? "Unhide item" : "Hide item to More popup"}
                    >
                      {project.is_hidden ? "Unhide" : "Hide"}
                    </button>
                  )}
                  <button onClick={() => handleEdit(project)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(project.id, project.title)} style={styles.deleteBtn}>Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
