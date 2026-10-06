import { useParams } from "react-router";
import { ArrowRight, BookOpen, Clock, Lightbulb } from "lucide-react";
import { SiteShell } from "../components/Site";
import { Link, LinkButton } from "../components/nav";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { findGuide, guides, type Block } from "../content/guides";
import { JsonLd } from "../seo/JsonLd";
import { absoluteUrl, SITE_NAME } from "../seo/seo";
import { date } from "../lib/format";
import Landing from "./Landing";

export function GuidesIndex() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <Breadcrumbs items={[{ label: "Guías", to: "/guias" }]} />
        <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">Guías de facturación e impuestos para autónomos</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">Explicaciones claras, con ejemplos y sin jerga, para facturar bien y llegar tranquilo a cada trimestre.</p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {guides.map((g) => (
            <Link key={g.slug} to={`/guias/${g.slug}`} className="group flex flex-col rounded-2xl p-6 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand-200">
              <span className="flex items-center gap-2 text-xs font-medium text-slate-500"><BookOpen size={14} className="text-brand-600" /> Guía · {g.readMinutes} min</span>
              <span className="mt-3 text-lg font-semibold leading-snug">{g.title}</span>
              <span className="mt-2 text-sm text-slate-600">{g.summary}</span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">Leer guía <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case "p":
      return <p className="leading-relaxed text-slate-700">{b.text}</p>;
    case "h2":
      return <h2 className="pt-4 text-2xl font-bold text-slate-900">{b.text}</h2>;
    case "ul":
      return <ul className="list-disc space-y-2 pl-6 text-slate-700 marker:text-brand-500">{b.items.map((i) => <li key={i}>{i}</li>)}</ul>;
    case "ol":
      return <ol className="list-decimal space-y-2 pl-6 text-slate-700 marker:font-semibold marker:text-brand-600">{b.items.map((i) => <li key={i}>{i}</li>)}</ol>;
    case "tip":
      return (
        <div className="flex gap-3 rounded-2xl bg-brand-50 p-5 text-sm leading-relaxed text-brand-900 ring-1 ring-brand-100">
          <Lightbulb size={20} className="mt-0.5 shrink-0 text-brand-600" /> <p>{b.text}</p>
        </div>
      );
    case "example":
      return (
        <figure className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
          <figcaption className="bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">{b.title}</figcaption>
          <dl className="divide-y divide-slate-100 text-sm">
            {b.rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-5 py-2.5"><dt className="text-slate-600">{k}</dt><dd className="shrink-0 font-medium tabular-nums">{v}</dd></div>
            ))}
            {b.total && (
              <div className="flex justify-between gap-4 bg-slate-900 px-5 py-3 text-white"><dt className="font-semibold">{b.total[0]}</dt><dd className="font-bold tabular-nums">{b.total[1]}</dd></div>
            )}
          </dl>
        </figure>
      );
  }
}

export function GuidePage() {
  const { slug } = useParams();
  const g = findGuide(slug);
  if (!g) return <Landing />;
  const others = guides.filter((x) => x.slug !== g.slug).slice(0, 3);

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Breadcrumbs items={[{ label: "Guías", to: "/guias" }, { label: g.title.split(":")[0], to: `/guias/${g.slug}` }]} />
        <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{g.title}</h1>
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1.5"><Clock size={14} /> {g.readMinutes} min de lectura</span>
          <span>Actualizada el {date(g.updated)}</span>
        </div>
        <div className="mt-10 space-y-5">
          {g.blocks.map((b, i) => <BlockView key={i} b={b} />)}
        </div>
        <div className="mt-12 rounded-3xl bg-slate-900 p-8 text-white">
          <div className="text-xl font-bold">Ponlo en práctica en 30 segundos</div>
          <p className="mt-2 text-sm text-slate-300">Facturo calcula IVA y retención por ti y genera el PDF al momento. Gratis y sin registro.</p>
          <LinkButton to={g.cta.to} className="mt-5">{g.cta.text} <ArrowRight size={16} /></LinkButton>
        </div>
        <p className="mt-6 text-xs text-slate-400">Información general orientativa basada en la normativa vigente en la fecha de actualización. No sustituye el asesoramiento profesional.</p>

        <div className="mt-16">
          <h2 className="text-xl font-bold">Sigue leyendo</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {others.map((o) => (
              <Link key={o.slug} to={`/guias/${o.slug}`} className="rounded-2xl p-5 text-sm font-medium leading-snug ring-1 ring-slate-200 transition hover:ring-brand-200 hover:shadow-md">{o.title}</Link>
            ))}
          </div>
        </div>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: g.title,
            description: g.description,
            dateModified: g.updated,
            datePublished: g.updated,
            inLanguage: "es",
            mainEntityOfPage: absoluteUrl(`/guias/${g.slug}`),
            author: { "@type": "Organization", name: SITE_NAME },
            publisher: { "@type": "Organization", name: SITE_NAME },
          }}
        />
      </article>
    </SiteShell>
  );
}
