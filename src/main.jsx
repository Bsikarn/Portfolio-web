import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Import global CSS resetting and typography styles
import App from "./App.jsx"; // Import the main Application component

// Initialize the React application and attach it to the root DOM element.
// StrictMode enables additional development checks and warnings.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
