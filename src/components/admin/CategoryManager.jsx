import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { styles } from "../../styles/AdminPage.styles";

export default function CategoryManager({ categoriesList, setCategoriesList, fetchCategories, setPendingCategoryActions }) {
  const [newName, setNewName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Add a new category
  const handleAdd = async () => {
    if (!newName.trim()) return;
    const catName = newName.trim();
    setNewName("");
    if (setPendingCategoryActions) {
      setCategoriesList((prev) => [...prev, { id: "temp_" + Date.now(), name: catName, sort_order: prev.length + 1 }]);
      setPendingCategoryActions((prev) => [...prev, { type: "add", name: catName }]);
    } else {
      const { error } = await supabase.rpc("admin_insert_category", { p_name: catName });
      if (error) return alert("Error adding category: " + error.message);
      fetchCategories();
    }
  };

  // Delete a category
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    if (setPendingCategoryActions) {
      setCategoriesList((prev) => prev.filter((c) => c.id !== id));
      setPendingCategoryActions((prev) => [...prev, { type: "delete", id, name }]);
    } else {
      const { error } = await supabase.rpc("admin_delete_category", { p_id: id });
      if (error) return alert("Error deleting category: " + error.message);
      fetchCategories();
    }
  };

  // Update sort order
  const handleOrderChange = async (id, newOrder) => {
    const parsed = parseInt(newOrder) || 0;
    setCategoriesList((prev) =>
      [...prev.map((c) => (c.id === id ? { ...c, sort_order: parsed } : c))].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    );
    if (setPendingCategoryActions) {
      setPendingCategoryActions((prev) => [...prev.filter((a) => !(a.type === "reorder" && a.id === id)), { type: "reorder", id, sort_order: parsed }]);
    } else {
      const { error } = await supabase.rpc("admin_update_category_order", { p_id: id, p_sort_order: parsed });
      if (error) { console.error("Order update failed:", error); fetchCategories(); }
    }
  };

  return (
    <div style={{ ...styles.cardContainer, marginBottom: "20px" }}>
      {/* Collapsible Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h2 style={{ ...styles.existingProjectsTitle, margin: 0 }}>🏷️ Manage Categories</h2>
          <span style={{ fontSize: "12px", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "12px", fontWeight: "600" }}>
            {categoriesList.length} items
          </span>
        </div>
        <span style={{ fontSize: "14px", color: "#0D6EFD", fontWeight: "bold" }}>
          {isOpen ? "▲ Fold" : "▼ Expand"}
        </span>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
          {/* Add Category Row */}
          <div style={{ ...styles.flexRow, marginBottom: "16px" }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New Category Name (e.g. Fullstack, AI/ML)"
              style={{ ...styles.inputStyle, flex: 2 }}
            />
            <button onClick={handleAdd} style={{ ...styles.submitBtn, padding: "10px 20px", flex: 1 }}>+ Add Category</button>
          </div>

          {/* Category List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {categoriesList.map((cat) => (
              <div key={cat.id} style={{ display: "flex", alignItems: "center", background: "#f8fafc", padding: "10px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", color: "#0f172a" }}>
                <span style={{ flex: 1, fontWeight: "600" }}>{cat.name}</span>
                <span style={{ fontSize: "12px", color: "#64748b", marginRight: "6px" }}>Sort Order:</span>
                <input
                  type="number"
                  value={cat.sort_order || 0}
                  onChange={(e) => handleOrderChange(cat.id, e.target.value)}
                  style={{ width: "55px", padding: "4px 6px", marginRight: "16px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "13px", fontWeight: "bold", textAlign: "center" }}
                  title="Sort Order (Lower is first)"
                />
                <button onClick={() => handleDelete(cat.id, cat.name)} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
