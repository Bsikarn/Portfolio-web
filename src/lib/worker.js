/**
 * Web Worker for parsing heavy calculations in the background.
 * Prevents synchronous array calculations from blocking the Main UI Thread.
 */

self.onmessage = function (e) {
  const { type, payload } = e.data;

  // Process and count tags, tools, and languages from all projects
  if (type === 'PROCESS_PROJECT_TAGS') {
    const allProjectsData = payload;
    const counts = {};
    const langSet = new Set();

    // Iterate over projects to count occurrences
    allProjectsData.forEach((p) => {
      const items = [...(p.tags || []), ...(p.tools || [])];

      if (p.languages) {
        p.languages.forEach((l) => {
          langSet.add(l.name);
          counts[l.name] = (counts[l.name] || 0) + 1;
        });
      }

      items.forEach((item) => {
        // Normalize the string "React" to "React.js" to merge tag counts
        let normalizedItem = item;
        if (item === "React") normalizedItem = "React.js";
        counts[normalizedItem] = (counts[normalizedItem] || 0) + 1;
      });
    });

    // Send the processed result back to the main thread
    self.postMessage({
      type: 'PROCESS_PROJECT_TAGS_RESULT',
      payload: {
        counts,
        portfolioLanguages: Array.from(langSet)
      }
    });
  }
};
