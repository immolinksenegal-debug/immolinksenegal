import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerImageCache } from "./lib/imageCache";

registerImageCache();

createRoot(document.getElementById("root")!).render(<App />);
