/**
 * Web Worker: processes project tag/language data off the main thread.
 * Prevents heavy array iterations from blocking the UI.
 */

self.onmessage = function (e) {
  const { type, payload } = e.data;
  if (type !== "PROCESS_PROJECT_TAGS") return;

  const counts = {};
  const langSet = new Set();
  const tagSet = new Set();
  const toolSet = new Set();

  payload.forEach((project) => {
    // Count language occurrences and collect unique names
    project.languages?.forEach((l) => {
      langSet.add(l.name);
      counts[l.name] = (counts[l.name] || 0) + 1;
    });

    // Collect and count unique technology tags
    project.tags?.forEach((t) => {
      const key = t === "React" ? "React.js" : t;
      tagSet.add(key);
      counts[key] = (counts[key] || 0) + 1;
    });

    // Collect and count unique tool tags
    project.tools?.forEach((tool) => {
      toolSet.add(tool);
      counts[tool] = (counts[tool] || 0) + 1;
    });
  });

  self.postMessage({
    type: "PROCESS_PROJECT_TAGS_RESULT",
    payload: {
      counts,
      portfolioLanguages: Array.from(langSet),
      portfolioTags: Array.from(tagSet),
      portfolioTools: Array.from(toolSet)
    },
  });
};
