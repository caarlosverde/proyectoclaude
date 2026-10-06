import { useParams } from "react-router";
import { ArrowRight, BadgePercent, CircleCheck, Lightbulb, Receipt } from "lucide-react";
import { SiteShell } from "../components/Site";
import { Link, LinkButton } from "../components/nav";
import { Breadcrumbs, Faq } from "../components/Breadcrumbs";
import { InvoiceDocument } from "../components/InvoiceDocument";
import { ScaledDoc } from "../components/ScaledDoc";
import { findProfession, professions, type Profession } from "../content/professions";
import { sampleInvoice } from "../lib/sample";
import type { Invoice } from "../lib/types";
import Landing from "./Landing";

export function professionInvoice(p: Profession): Invoice {
  return {
    ...sampleInvoice,
    template: "clasica",
    irpf: p.irpf,
    items: p.lines.map((l, i) => ({ id: String(i), discount: 0, ...l })),
    notes: "Gracias por tu confianza.",
  };
}

export function ProfessionsIndex() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Breadcrumbs items={[{ label: "Factura por profesión", to: "/factura-para" }]} />
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">Modelos de factura para cada profesión</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">Cada oficio tiene sus particularidades de IVA y retención. Elige el tuyo para ver un ejemplo real y empezar con los conceptos ya rellenos.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {professions.map((p) => (
            <Link key={p.slug} to={`/factura-para/${p.slug}`} className="group flex flex-col rounded-2xl p-6 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand-200">
              <span className="inline-flex w-fit rounded-xl bg-brand-50 p-2.5 text-brand-600"><Receipt size={20} /></span>
              <span className="mt-4 font-semibold capitalize">{p.plural}</span>
              <span className="mt-1 text-sm text-slate-500">IVA {p.vat}% · {p.irpf ? `IRPF ${p.irpf}%` : "sin retención habitual"}</span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-600">Ver ejemplo <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

export function ProfessionPage() {
  const { slug } = useParams();
  const p = findProfession(slug);
  if (!p) return <Landing />;
  const others = professions.filter((x) => x.slug !== p.slug).slice(0, 4);

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Breadcrumbs items={[{ label: "Factura por profesión", to: "/factura-para" }, { label: p.plural[0].toUpperCase() + p.plural.slice(1), to: `/factura-para/${p.slug}` }]} />
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="min-w-0">
            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{p.title}</h1>
            <p className="mt-5 text-lg text-slate-600">{p.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton to={`/app/nuevo/factura?plantilla=${p.slug}`} size="lg">Crear factura de {p.singular} <ArrowRight size={18} /></LinkButton>
              <LinkButton to={`/app/nuevo/presupuesto?plantilla=${p.slug}`} size="lg" variant="secondary">Hacer un presupuesto</LinkButton>
            </div>
            <p className="mt-3 text-sm text-slate-500">Gratis, sin registro. Empiezas con los conceptos de ejemplo ya rellenos.</p>

            <h2 className="mt-14 text-2xl font-bold">Qué impuestos lleva una factura de {p.singular}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {p.taxes.map((t) => (
                <div key={t.title} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
                  <div className="flex items-center gap-2 font-semibold"><BadgePercent size={18} className="text-brand-600" /> {t.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.text}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-12 text-2xl font-bold">Consejos para facturar mejor</h2>
            <ul className="mt-5 space-y-3">
              {p.tips.map((t) => (
                <li key={t} className="flex gap-3 text-slate-700"><Lightbulb size={20} className="mt-0.5 shrink-0 text-amber-500" /> <span>{t}</span></li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 lg:sticky lg:top-24">
            <div className="text-sm font-medium text-slate-500">Ejemplo de factura</div>
            <div className="mt-3 overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200">
              <ScaledDoc>
                <InvoiceDocument doc={professionInvoice(p)} />
              </ScaledDoc>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              {["Todos los datos obligatorios de una factura", "IVA y retención calculados al céntimo", "Descarga en PDF lista para enviar"].map((t) => (
                <li key={t} className="flex items-center gap-2"><CircleCheck size={16} className="text-emerald-500" /> {t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold">Preguntas frecuentes</h2>
          <Faq items={p.faqs} />
          <p className="mt-4 text-xs text-slate-400">Información general orientativa. Cada caso puede tener matices: ante la duda, consulta con tu asesor.</p>
        </div>

        <div className="mt-20">
          <h2 className="text-xl font-bold">Otras profesiones</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {others.map((o) => (
              <Link key={o.slug} to={`/factura-para/${o.slug}`} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 capitalize transition hover:bg-brand-50 hover:text-brand-700">{o.plural}</Link>
            ))}
            <Link to="/factura-para" className="rounded-full px-4 py-2 text-sm font-medium text-brand-600 hover:underline">Ver todas</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
