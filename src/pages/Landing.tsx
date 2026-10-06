import { useState } from "react";
import { LinkButton } from "../components/nav";
import {
  ArrowRight, BellRing, Calculator, ChevronDown, CircleCheck, FileDown, FileSpreadsheet,
  Lock, Palette, Receipt, Shield, TrendingUp, Users, Zap,
} from "lucide-react";
import { PricingCards, SiteShell } from "../components/Site";
import { cx } from "../components/ui";
import { InvoiceDocument } from "../components/InvoiceDocument";
import { ScaledDoc } from "../components/ScaledDoc";
import { sampleInvoice } from "../lib/sample";

const features = [
  { icon: Calculator, title: "Impuestos sin errores", text: "IVA por línea, retención de IRPF y recargo de equivalencia calculados al céntimo. Olvídate de la calculadora." },
  { icon: FileDown, title: "PDF profesional al instante", text: "Plantillas limpias en formato A4 listas para enviar. Tu marca, tus colores, tu logo." },
  { icon: Receipt, title: "Presupuestos que se convierten", text: "Envía un presupuesto y, cuando lo acepten, conviértelo en factura con un clic." },
  { icon: BellRing, title: "Control de cobros", text: "Ve de un vistazo qué está pagado, pendiente o vencido. Las facturas vencidas se marcan solas." },
  { icon: FileSpreadsheet, title: "Listo para tu gestoría", text: "Resumen trimestral para los modelos 303 y 130 y exportación a Excel en un clic." },
  { icon: Lock, title: "Tus datos, en tu dispositivo", text: "Sin registro y sin servidores: la información se guarda en tu navegador. Privacidad total." },
];

const steps = [
  { n: "1", title: "Rellena tus datos", text: "Una sola vez. Facturo los recuerda para las siguientes." },
  { n: "2", title: "Añade conceptos", text: "Cantidades, precios y descuentos. Los totales se calculan solos." },
  { n: "3", title: "Descarga y envía", text: "PDF perfecto en un clic. Marca como pagada cuando cobres." },
];

const faqs = [
  { q: "¿Es realmente gratis?", a: "Sí. El plan gratuito te permite crear 5 facturas o presupuestos al mes, sin tarjeta y sin registro. Si necesitas más volumen, logo propio o informes trimestrales, puedes pasar a Pro." },
  { q: "¿Las facturas son válidas legalmente en España?", a: "Facturo incluye todos los datos obligatorios del Reglamento de facturación (RD 1619/2012): número y serie, fecha, datos fiscales de emisor y cliente, desglose de base, tipo y cuota de IVA, y retención si aplica. Te recomendamos revisar con tu gestoría los requisitos de VeriFactu que te afecten." },
  { q: "¿Qué retención de IRPF debo aplicar?", a: "Con carácter general, los profesionales aplican un 15%. Durante el año de inicio de actividad y los dos siguientes puedes aplicar el 7%. Si facturas a particulares o eres actividad empresarial (módulos), normalmente no aplicas retención." },
  { q: "¿Dónde se guardan mis facturas?", a: "En el almacenamiento local de tu navegador. Nadie más tiene acceso. Puedes exportar una copia de seguridad en cualquier momento desde Ajustes." },
  { q: "¿Puedo cancelar Pro cuando quiera?", a: "Claro. Sin permanencia. Si cancelas, conservas todas tus facturas y vuelves al plan gratuito." },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" /> Actualizado a la normativa fiscal de 2026
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-6xl">
              Factura en <span className="bg-gradient-to-r from-brand-600 to-fuchsia-500 bg-clip-text text-transparent">30 segundos</span>.<br />
              Cobra antes.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              El generador de facturas y presupuestos para autónomos y freelancers. IVA e IRPF automáticos, PDF profesional y control de cobros. Sin registro, sin complicaciones.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton to="/app/nuevo/factura" size="lg" className="w-full sm:w-auto">
                  Crear mi primera factura <ArrowRight size={18} />
                </LinkButton>
              <LinkButton to="/calculadora-iva-irpf" size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Calculator size={18} /> Calculadora IVA/IRPF
                </LinkButton>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              {["Gratis para siempre", "Sin tarjeta", "Sin registro"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><CircleCheck size={16} className="text-emerald-500" /> {t}</span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rotate-2 rounded-3xl bg-gradient-to-br from-brand-200 to-fuchsia-200 opacity-60 blur-xl" />
            <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/10">
              <ScaledDoc>
                <InvoiceDocument doc={sampleInvoice} />
              </ScaledDoc>
            </div>
            <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl ring-1 ring-slate-200 sm:flex">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><TrendingUp size={18} /></div>
              <div>
                <div className="text-xs text-slate-500">Factura pagada</div>
                <div className="text-sm font-bold">+ 2.689,50 €</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 text-center sm:px-6 md:grid-cols-4">
          {[
            ["+3 M", "autónomos en España"],
            ["< 30 s", "para crear una factura"],
            ["0 €", "para empezar"],
            ["100%", "privado y en tu navegador"],
          ].map(([k, v]) => (
            <div key={v}>
              <div className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{k}</div>
              <div className="mt-1 text-sm text-slate-500">{v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="funciones" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold text-brand-600">Todo lo que necesitas</div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Deja de pelearte con Excel y Word</h2>
          <p className="mt-4 text-slate-600">Facturo hace el trabajo aburrido por ti, para que dediques tu tiempo a lo que de verdad te paga.</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl p-6 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand-200">
              <div className="mb-4 inline-flex rounded-xl bg-brand-50 p-3 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Tan fácil como 1, 2, 3</h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-lg font-bold">{s.n}</div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <LinkButton to="/app/nuevo/factura" size="lg">Probar ahora, es gratis <Zap size={18} /></LinkButton>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Pensado para quien trabaja por su cuenta</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "Diseñadores y creativos", d: "Factura proyectos por fases, aplica descuentos y presenta documentos con tu identidad visual.", i: Palette },
            { t: "Desarrolladores y consultores", d: "Horas, retenciones del 15% (o 7% si empiezas) y resumen trimestral para tus modelos 303 y 130.", i: FileSpreadsheet },
            { t: "Oficios y pequeños comercios", d: "Presupuesta, convierte en factura al aceptar y aplica recargo de equivalencia si lo necesitas.", i: Users },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100">
              <span className="inline-flex rounded-full bg-white p-2.5 text-brand-600 ring-1 ring-slate-200"><c.i size={18} /></span>
              <h3 className="mt-4 font-semibold">{c.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" className="scroll-mt-20 bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Precios claros. Sin sorpresas.</h2>
            <p className="mt-4 text-slate-600">Empieza gratis. Pasa a Pro cuando tu negocio lo pida.</p>
          </div>
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-24 sm:px-6">
        <h2 className="text-center text-3xl font-extrabold tracking-tight">Preguntas frecuentes</h2>
        <div className="mt-10 divide-y divide-slate-200 rounded-2xl ring-1 ring-slate-200">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium cursor-pointer"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                {f.q}
                <ChevronDown size={18} className={cx("shrink-0 text-slate-400 transition", openFaq === i && "rotate-180")} />
              </button>
              {openFaq === i && <p className="-mt-1 px-6 pb-5 text-sm leading-relaxed text-slate-600">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-900 px-6 py-16 text-center text-white shadow-2xl">
          <div className="grid-bg absolute inset-0 opacity-30" />
          <div className="relative">
            <Shield className="mx-auto mb-4 opacity-80" size={36} />
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tu próxima factura, lista en 30 segundos</h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100">Gratis, sin registro y sin tarjeta.</p>
            <LinkButton to="/app/nuevo/factura" size="lg" variant="secondary" className="mt-8">Crear factura gratis <ArrowRight size={18} /></LinkButton>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
