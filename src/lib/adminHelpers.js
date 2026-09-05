// Shared helper functions used across Admin, ProjectsPage, and HomePage

// Check if a content type is a "special" (non-project) type
export const isSpecialType = (type) =>
  type === "Achievement" || type === "Activity" || type === "Experience";

// Map contentType to Supabase table name
export const getTableName = (type) => {
  if (type === "Achievement") return "achievements";
  if (type === "Activity") return "activities";
  if (type === "Experience") return "experiences";
  return "projects";
};

// Sort comparator for projects by sort_order, then by id desc
export function sortByOrder(a, b) {
  const orderA = a.sort_order !== undefined && a.sort_order !== null ? a.sort_order : 999;
  const orderB = b.sort_order !== undefined && b.sort_order !== null ? b.sort_order : 999;
  if (orderA !== orderB) return orderA - orderB;
  return b.id - a.id;
}

// Filter the full projects list to show only items matching the active content type
export function filterByContentType(list, contentType) {
  if (contentType === "Project") {
    return list.filter((p) => !isSpecialType(p.category));
  }
  return list.filter((p) => p.category === contentType);
}

// Parse "Name:Percent:Color, ..." string from the form into a languages array for DB
export function parseLanguages(str) {
  if (!str) return [];
  const parts = str.split(",").map((l) => l.trim()).filter(Boolean);
  const isSimple = parts.some((p) => !p.includes(":"));
  if (isSimple) {
    return parts.map((name) => ({ name, percent: 0, color: "#888" }));
  }
  return parts.map((l) => {
    const [name, percent, color] = l.split(":");
    return { name: name?.trim(), percent: Number(percent) || 0, color: color?.trim() || "#ccc" };
  });
}

// Extract numeric sort order from a project row (checks __order: tag first, then sort_order column)
export function getSortOrder(p) {
  if (Array.isArray(p.tags)) {
    const orderTag = p.tags.find((t) => typeof t === "string" && t.startsWith("__order:"));
    if (orderTag) {
      const match = orderTag.match(/__order:(\d+)__/);
      if (match) return Number(match[1]);
    }
  }
  if (p.sort_order !== undefined && p.sort_order !== null && !isNaN(Number(p.sort_order))) {
    return Number(p.sort_order);
  }
  return 999;
}

// Check if a list item is hidden (by is_hidden flag or __hidden__ tag)
export const isItemHidden = (item) =>
  item.is_hidden === true || (Array.isArray(item.tags) && item.tags.includes("__hidden__"));
