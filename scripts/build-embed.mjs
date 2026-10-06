// Genera dist-embed/facturo.html: la app completa en un solo archivo HTML
// (router en memoria, CSS y JS en línea). Útil para vistas previas e iframes aislados.
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const out = "dist-embed";
execSync(`npx vite build --outDir ${out} --emptyOutDir`, { stdio: "inherit", env: { ...process.env, VITE_ROUTER: "memory" } });

const assets = join(out, "assets");
const files = readdirSync(assets);
const css = readFileSync(join(assets, files.find((f) => f.endsWith(".css"))), "utf8");
const js = readFileSync(join(assets, files.find((f) => f.endsWith(".js"))), "utf8").replace(/<\/script/gi, "<\\/script");

const html = `<meta charset="utf-8">
<title>Facturo</title>
<meta name="description" content="Generador de facturas y presupuestos para autónomos con IVA e IRPF automáticos.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;
writeFileSync(join(out, "facturo.html"), html);
console.log(`✓ ${out}/facturo.html (${(html.length / 1024).toFixed(0)} KB)`);
