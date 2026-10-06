import { ChevronRight } from "lucide-react";
import { Link } from "./nav";
import { JsonLd } from "../seo/JsonLd";
import { absoluteUrl } from "../seo/seo";

export function Breadcrumbs({ items }: { items: { label: string; to: string }[] }) {
  const all = [{ label: "Inicio", to: "/" }, ...items];
  return (
    <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((it, i) => (
          <li key={it.to} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-slate-300" />}
            {i < all.length - 1 ? (
              <Link to={it.to} className="hover:text-slate-900">{it.label}</Link>
            ) : (
              <span aria-current="page" className="text-slate-700">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: absoluteUrl(it.to) })),
        }}
      />
    </nav>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <>
      <div className="divide-y divide-slate-200 rounded-2xl ring-1 ring-slate-200">
        {items.map((f) => (
          <details key={f.q} className="group px-6 py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronRight size={18} className="shrink-0 text-slate-400 transition group-open:rotate-90" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </>
  );
}
