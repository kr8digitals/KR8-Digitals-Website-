import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

function mount() {
  try {
    let rootEl = document.getElementById("root");
    if (!rootEl) {
      rootEl = document.createElement("div");
      rootEl.id = "root";
      if (document.body) {
        document.body.appendChild(rootEl);
      } else {
        document.documentElement.appendChild(rootEl);
      }
    }

    const root = createRoot(rootEl);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (err) {
    console.error("Critical mounting error:", err);
  }
}

// Ensure DOM is ready before creating root to prevent Minified React error #299
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
}
