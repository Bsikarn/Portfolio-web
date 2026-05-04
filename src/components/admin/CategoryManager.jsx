import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { styles } from "../../styles/AdminPage.styles";

export default function CategoryManager({ categoriesList, setCategoriesList, fetchCategories }) {
  const [newCategoryName, setNewCategoryName] = useState("");

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

  return (
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
  );
}
