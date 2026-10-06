import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const empty = fileURLToPath(new URL("./src/stubs/empty.js", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const embedded = (process.env.VITE_ROUTER ?? env.VITE_ROUTER) === "memory";
  return {
    plugins: [react(), tailwindcss()],
    // jsPDF carga estos módulos solo para html()/SVG, que no usamos: los sustituimos por un módulo vacío.
    resolve: { alias: { html2canvas: empty, dompurify: empty, canvg: empty } },
    // La versión embebible se genera como un único archivo JS (sin chunks dinámicos).
    build: embedded ? { rollupOptions: { output: { inlineDynamicImports: true } } } : {},
  };
});
