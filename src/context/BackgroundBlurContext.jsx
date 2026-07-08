import { createContext, useState, useCallback, useContext } from "react";

// Create context for managing global background blur state
const BackgroundBlurContext = createContext();

export function BackgroundBlurProvider({ children }) {
  // Store the set of section IDs that are currently intersecting the viewport
  const [activeSections, setActiveSections] = useState(new Set());

  // Register or unregister a section based on its intersection state
  const registerSection = useCallback((id, isIntersecting) => {
    setActiveSections((prev) => {
      const next = new Set(prev);
      if (isIntersecting) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  // Determine the blur amount. If at least one section is active, apply 15px blur
  const blurAmount = activeSections.size > 0 ? 15 : 0;

  return (
    <BackgroundBlurContext.Provider value={{ blurAmount, registerSection, activeSections }}>
      {children}
    </BackgroundBlurContext.Provider>
  );
}

// Hook to easily consume the background blur context in children components
export function useBackgroundBlur() {
  const context = useContext(BackgroundBlurContext);
  if (!context) {
    throw new Error("useBackgroundBlur must be used within a BackgroundBlurProvider");
  }
  return context;
}
