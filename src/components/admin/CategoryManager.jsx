import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { styles } from "../../styles/AdminPage.styles";

export default function CategoryManager({ categoriesList, setCategoriesList, fetchCategories }) {
  const [newName, setNewName] = useState("");

  // Add a new category via RPC
  const handleAdd = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.rpc("admin_insert_category", { p_name: newName.trim() });
    if (error) return alert("Error adding category: " + error.message);
    setNewName("");
    fetchCategories();
  };

  // Delete a category after confirmation
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    const { error } = await supabase.rpc("admin_delete_category", { p_id: id });
    if (error) return alert("Error deleting category: " + error.message);
    fetchCategories();
  };

  // Optimistically update sort order then persist via RPC
  const handleOrderChange = async (id, newOrder) => {
    const parsed = parseInt(newOrder) || 0;
    setCategoriesList((prev) =>
      [...prev.map((c) => (c.id === id ? { ...c, sort_order: parsed } : c))].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    );
    const { error } = await supabase.rpc("admin_update_category_order", { p_id: id, p_sort_order: parsed });
    if (error) { console.error("Order update failed:", error); fetchCategories(); }
  };

  return (
    <div style={{ ...styles.cardContainer, marginBottom: "20px" }}>
      <h2 style={styles.existingProjectsTitle}>🏷️ Manage Categories</h2>

      {/* Add Category Row */}
      <div style={{ ...styles.flexRow, marginBottom: "16px" }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New Category Name"
          style={{ ...styles.inputStyle, flex: 2 }}
        />
        <button onClick={handleAdd} style={{ ...styles.submitBtn, padding: "10px", flex: 1 }}>Add Category</button>
      </div>

      {/* Category List */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", flexDirection: "column" }}>
        {categoriesList.map((cat) => (
          <div key={cat.id} style={{ display: "flex", alignItems: "center", background: "#f4f4f5", padding: "8px 12px", border: "1px solid #e4e4e7", fontSize: "14px", color: "#18181b" }}>
            <span style={{ flex: 1, fontWeight: "bold" }}>{cat.name}</span>
            <span style={{ fontSize: "12px", color: "#71717a", marginRight: "8px" }}>Order:</span>
            <input
              type="number"
              value={cat.sort_order || 0}
              onChange={(e) => handleOrderChange(cat.id, e.target.value)}
              style={{ width: "60px", padding: "4px", marginRight: "16px", border: "1px solid #d4d4d8", fontSize: "14px" }}
              title="Sort Order (Lower is first)"
            />
            <button onClick={() => handleDelete(cat.id, cat.name)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
