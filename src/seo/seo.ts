import { findGuide, guides } from "../content/guides";
import { findProfession, professions } from "../content/professions";

/** URL pública del sitio, sin barra final (p. ej. https://facturo.es). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://facturo.es").replace(/\/+$/, "");
export const SITE_NAME = "Facturo";

export interface PageSeo {
  title: string;
  description: string;
  /** Ruta canónica dentro del sitio (p. ej. /precios) */
  path: string;
  noindex?: boolean;
  priority?: number;
  ogType?: "website" | "article";
}

const STATIC: Record<string, Omit<PageSeo, "path">> = {
  "/": {
    title: "Facturo — Generador de facturas gratis para autónomos (IVA e IRPF)",
    description:
      "Crea facturas y presupuestos profesionales en segundos. IVA, IRPF y recargo de equivalencia automáticos, PDF al instante y control de cobros. Gratis y sin registro.",
    priority: 1,
  },
  "/precios": {
    title: "Precios — Facturo",
    description: "Facturo es gratis para empezar. Pasa a Pro por 6,99 €/mes para facturas ilimitadas, tu logo, plantillas premium e informes trimestrales.",
    priority: 0.7,
  },
  "/calculadora-iva-irpf": {
    title: "Calculadora de IVA e IRPF para autónomos — Facturo",
    description:
      "Calcula al instante el IVA, la retención de IRPF y el total de tu factura de autónomo. También a la inversa: cuánto facturar para cobrar un neto concreto.",
    priority: 0.9,
  },
  "/calculadora-precio-hora": {
    title: "Calculadora de precio por hora para freelance y autónomos — Facturo",
    description:
      "Descubre cuánto cobrar por hora como autónomo según el sueldo que quieres ganar, tus gastos, la cuota de autónomos, los impuestos y tus vacaciones.",
    priority: 0.9,
  },
  "/factura-para": {
    title: "Modelos de factura por profesión — Facturo",
    description: "Ejemplos de factura y presupuesto para diseñadores, programadores, fotógrafos, traductores, reformas y más, con el IVA y la retención de cada caso.",
    priority: 0.8,
  },
  "/guias": {
    title: "Guías de facturación e impuestos para autónomos — Facturo",
    description: "Guías claras sobre cómo hacer una factura, la retención de IRPF, los modelos 303 y 130 y cómo facturar a clientes extranjeros.",
    priority: 0.8,
  },
  "/privacidad": {
    title: "Política de privacidad — Facturo",
    description: "Cómo trata Facturo tus datos: todo se guarda en tu navegador y no se envía a ningún servidor.",
    priority: 0.2,
  },
};

const APP_SEO: Omit<PageSeo, "path"> = {
  title: "Facturo — Mis facturas",
  description: "Tu panel de facturas y presupuestos.",
  noindex: true,
};

const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

export function getSeo(rawPath: string): PageSeo {
  const path = trim(rawPath.split(/[?#]/)[0] || "/");
  if (path === "/app" || path.startsWith("/app/")) return { ...APP_SEO, path };
  if (STATIC[path]) return { ...STATIC[path], path };

  const prof = path.match(/^\/factura-para\/([^/]+)$/);
  if (prof) {
    const p = findProfession(prof[1]);
    if (p) return { title: `${p.title} — Facturo`, description: p.description, path, priority: 0.8 };
  }
  const guide = path.match(/^\/guias\/([^/]+)$/);
  if (guide) {
    const g = findGuide(guide[1]);
    if (g) return { title: `${g.title} — Facturo`, description: g.description, path, priority: 0.7, ogType: "article" };
  }
  return { ...STATIC["/"], path: "/", noindex: true };
}

/** Rutas públicas que se generan como HTML estático e incluyen el sitemap. */
export function publicPaths(): string[] {
  return [
    ...Object.keys(STATIC),
    ...professions.map((p) => `/factura-para/${p.slug}`),
    ...guides.map((g) => `/guias/${g.slug}`),
  ];
}

export const absoluteUrl = (path: string) => SITE_URL + (path === "/" ? "/" : path);

/** Actualiza el <head> en el navegador al cambiar de página. */
export function applySeo(seo: PageSeo) {
  if (typeof document === "undefined") return;
  document.title = seo.title;
  const setMeta = (attr: "name" | "property", key: string, value: string) => {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.content = value;
  };
  setMeta("name", "description", seo.description);
  setMeta("name", "robots", seo.noindex ? "noindex, nofollow" : "index, follow");
  setMeta("property", "og:title", seo.title);
  setMeta("property", "og:description", seo.description);
  setMeta("property", "og:url", absoluteUrl(seo.path));
  setMeta("property", "og:type", seo.ogType ?? "website");
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = absoluteUrl(seo.path);
}

/** Etiquetas del <head> como HTML, para el prerenderizado. */
export function headTags(seo: PageSeo): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const url = absoluteUrl(seo.path);
  return [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<meta name="robots" content="${seo.noindex ? "noindex, nofollow" : "index, follow"}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${seo.ogType ?? "website"}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE_URL}/og.png" />`,
    `<meta property="og:locale" content="es_ES" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${SITE_URL}/og.png" />`,
  ].join("\n    ");
}
