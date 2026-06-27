/**
 * ContestLens – Userscript Entry Point
 *
 * Mounts the React app inside a Shadow DOM to prevent style collisions
 * with LeetCode's own CSS.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import cssText from "./styles/global.css?inline";

// ── Shadow DOM setup ──────────────────────────────────────────────────────────

const MOUNT_ID = "contestlens-root";

const hostElement = document.createElement("div");
hostElement.id = MOUNT_ID;
document.body.appendChild(hostElement);

const shadowRoot = hostElement.attachShadow({ mode: "open" });

// Inject Tailwind-compiled CSS into the shadow root
const styleTag = document.createElement("style");
styleTag.textContent = cssText;
shadowRoot.appendChild(styleTag);

// Mount point for React
const appContainer = document.createElement("div");
shadowRoot.appendChild(appContainer);

ReactDOM.createRoot(appContainer).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
