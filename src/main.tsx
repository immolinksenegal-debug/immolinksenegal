import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Dev-only lightweight FPS / paint monitor.
if (import.meta.env.DEV) {
  import("./lib/perfMonitor").then(({ startPerfMonitor }) => startPerfMonitor());
}

createRoot(document.getElementById("root")!).render(<App />);
