import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { useEffect } from "react";

// Add Inter and JetBrains Mono fonts to the document
// These are already linked in index.html but we're adding CSS variables for consistency
document.documentElement.style.setProperty("--font-sans", '"Inter", sans-serif');
document.documentElement.style.setProperty("--font-mono", '"JetBrains Mono", monospace');

createRoot(document.getElementById("root")!).render(<App />);
