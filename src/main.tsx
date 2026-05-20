import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initNative } from "./lib/native";

createRoot(document.getElementById("root")!).render(<App />);

// Initialize native shell (status bar, splash, keyboard, back button).
// Safe no-op on the web.
initNative();
