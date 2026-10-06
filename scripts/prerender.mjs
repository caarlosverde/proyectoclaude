// Compila la web y genera cada página pública como HTML estático (prerender):
// Google y las redes sociales reciben el contenido y los metadatos de cada URL
// sin tener que ejecutar JavaScript. Las rutas de la app (/app) usan app.html.
//
// Variables: VITE_SITE_URL (dominio público), BASE_PATH (subcarpeta, por defecto «/»),
// GOOGLE_SITE_VERIFICATION (código de Search Console, opcional).
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const base = (process.env.BASE_PATH || "/").replace(/\/?$/, "/");
const basename = base === "/" ? undefined : base.replace(/\/$/, "");
const env = { ...process.env, BASE_PATH: base, VITE_ROUTER: "" };
const run = (cmd) => execSync(cmd, { stdio: "inherit", env });

run(`npx vite build --base ${base}`);
run(`npx vite build --base ${base} --ssr src/entry-server.tsx --outDir dist-ssr`);

const ssr = await import(pathToFileURL(resolve("dist-ssr/entry-server.js")).href);
const template = readFileSync("dist/index.html", "utf8");
if (!template.includes("<!--seo-->") || !template.includes('<div id="root"></div>')) {
  throw new Error("index.html no tiene los marcadores esperados");
}

const verification = process.env.GOOGLE_SITE_VERIFICATION
  ? `\n    <meta name="google-site-verification" content="${process.env.GOOGLE_SITE_VERIFICATION}" />`
  : "";
const withHead = (seo) => template.replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, ssr.headTags(seo) + verification);

// Contenedor de la app (sin prerender, no indexable) y página 404
const shell = withHead(ssr.getSeo("/app"));
writeFileSync("dist/app.html", shell);
writeFileSync("dist/404.html", shell);

const paths = ssr.publicPaths();
for (const path of paths) {
  const html = ssr.render((basename ?? "") + path, basename);
  const page = withHead(ssr.getSeo(path)).replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  const file = path === "/" ? "dist/index.html" : join("dist", path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page);
}

const site = ssr.SITE_URL;
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((p) => {
      const seo = ssr.getSeo(p);
      return `  <url><loc>${site}${p === "/" ? "/" : p}</loc><lastmod>${today}</lastmod><priority>${(seo.priority ?? 0.5).toFixed(1)}</priority></url>`;
    })
    .join("\n")}\n</urlset>\n`,
);
writeFileSync("dist/robots.txt", `User-agent: *\nAllow: /\nDisallow: /app\n\nSitemap: ${site}/sitemap.xml\n`);

rmSync("dist-ssr", { recursive: true, force: true });
console.log(`✓ ${paths.length} páginas prerenderizadas · sitemap para ${site}`);
