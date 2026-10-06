import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter, MemoryRouter } from "react-router";
import App from "./App";
import "./index.css";

// VITE_ROUTER=memory: versión embebible (iframes aislados, vistas previas) que no toca la URL.
// VITE_ROUTER=hash: alojamientos sin reescritura de rutas. Por defecto: URLs limpias.
const mode = import.meta.env.VITE_ROUTER;
document.documentElement.lang = "es";
const Router = mode === "memory" ? MemoryRouter : mode === "hash" ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
