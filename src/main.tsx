import "./polyfills";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter, HashRouter, MemoryRouter } from "react-router";
import App from "./App";
import "./index.css";

// VITE_ROUTER=memory: versión embebible (iframes aislados, vistas previas) que no toca la URL.
// VITE_ROUTER=hash: alojamientos sin reescritura de rutas. Por defecto: URLs limpias (mejor para SEO).
const mode = import.meta.env.VITE_ROUTER;
const basename = import.meta.env.BASE_URL.replace(/\/+$/, "") || undefined;
document.documentElement.lang = "es";

const app = (
  <StrictMode>
    {mode === "memory" ? (
      <MemoryRouter><App /></MemoryRouter>
    ) : mode === "hash" ? (
      <HashRouter><App /></HashRouter>
    ) : (
      <BrowserRouter basename={basename}><App /></BrowserRouter>
    )}
  </StrictMode>
);

const root = document.getElementById("root")!;
// Las páginas públicas llegan ya renderizadas (prerender): las «hidratamos».
if (root.hasChildNodes() && !mode) hydrateRoot(root, app);
else createRoot(root).render(app);
