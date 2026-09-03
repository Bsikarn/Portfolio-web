// Shared helper functions for the Admin panel

// Check if a content type is a "special" (non-project) type
export const isSpecialType = (type) =>
  type === "Achievement" || type === "Activity" || type === "Experience";

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
