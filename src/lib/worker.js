/**
 * Web Worker: processes project tag/language data off the main thread.
 * Prevents heavy array iterations from blocking the UI.
 */

self.onmessage = function (e) {
  const { type, payload } = e.data;
  if (type !== "PROCESS_PROJECT_TAGS") return;

  const counts = {};
  const langSet = new Set();

  payload.forEach((project) => {
    // Count language occurrences and collect unique names
    project.languages?.forEach((l) => {
      langSet.add(l.name);
      counts[l.name] = (counts[l.name] || 0) + 1;
    });

    // Normalize "React" → "React.js" and count tags + tools
    [...(project.tags || []), ...(project.tools || [])].forEach((item) => {
      const key = item === "React" ? "React.js" : item;
      counts[key] = (counts[key] || 0) + 1;
    });
  });

  self.postMessage({
    type: "PROCESS_PROJECT_TAGS_RESULT",
    payload: { counts, portfolioLanguages: Array.from(langSet) },
  });
};
