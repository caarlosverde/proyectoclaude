import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App";

export { getSeo, headTags, publicPaths, SITE_URL } from "./seo/seo";

/** Renderiza una ruta pública a HTML (se usa al compilar, no en el navegador). */
export function render(url: string, basename?: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url} basename={basename}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}
