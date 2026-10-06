import { useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { SiteShell } from "../components/Site";
import { LinkButton } from "../components/nav";
import { Breadcrumbs, Faq } from "../components/Breadcrumbs";
import { Card, Field, Input } from "../components/ui";
import { hourlyRate, type HourlyInput } from "../lib/hourly";
import { money, num } from "../lib/format";

const FIELDS: { key: keyof HourlyInput; label: string; hint: string; step?: string }[] = [
  { key: "netMonthly", label: "Sueldo neto que quieres al mes (€)", hint: "Lo que quieres que te quede limpio para vivir" },
  { key: "expensesMonthly", label: "Gastos del negocio al mes (€)", hint: "Software, equipo, coworking, gestoría…" },
  { key: "quotaMonthly", label: "Cuota de autónomos al mes (€)", hint: "Depende de tus rendimientos; consulta tu tramo" },
  { key: "taxRate", label: "IRPF efectivo estimado (%)", hint: "Para ingresos medios suele estar entre el 15% y el 25%" },
  { key: "weeksOff", label: "Semanas sin facturar al año", hint: "Vacaciones, festivos, bajas y huecos entre proyectos" },
  { key: "billableHours", label: "Horas facturables a la semana", hint: "Sin contar comerciales, administración ni formación" },
];

export default function HourlyRate() {
  const [v, setV] = useState<HourlyInput>({ netMonthly: 2000, expensesMonthly: 150, quotaMonthly: 300, taxRate: 20, weeksOff: 7, billableHours: 25 });
  const r = hourlyRate(v);

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Breadcrumbs items={[{ label: "Calculadora de precio por hora", to: "/calculadora-precio-hora" }]} />
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">¿Cuánto cobrar por hora como autónomo?</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">Parte del sueldo que quieres ganar y descubre la tarifa mínima que necesitas, contando impuestos, cuota, gastos y las horas que de verdad puedes facturar.</p>

        <Card className="mt-10 grid overflow-hidden md:grid-cols-2">
          <div className="grid gap-4 p-6 sm:p-8">
            {FIELDS.map((f) => (
              <Field key={f.key} label={f.label} hint={f.hint}>
                <Input id={`hr-${f.key}`} type="number" min={0} inputMode="decimal" value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: Number(e.target.value) || 0 })} />
              </Field>
            ))}
          </div>
          <div className="flex flex-col bg-slate-900 p-6 text-white sm:p-8">
            <div className="text-sm text-slate-400">Tu precio mínimo por hora</div>
            <div className="mt-1 text-5xl font-extrabold tabular-nums">{money(r.rate)}</div>
            <div className="mt-1 text-sm text-slate-400">≈ {money(r.dayRate)} por jornada de 8 horas · sin IVA</div>
            <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between"><dt className="text-slate-400">Facturación necesaria al año</dt><dd className="font-semibold tabular-nums">{money(r.revenueYear)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Al mes</dt><dd className="font-semibold tabular-nums">{money(r.revenueMonth)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Impuestos estimados al año</dt><dd className="font-semibold tabular-nums">{money(r.taxesYear)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Gastos y cuota al año</dt><dd className="font-semibold tabular-nums">{money(r.expensesYear)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Horas facturables al año</dt><dd className="font-semibold tabular-nums">{num(r.hoursYear, 0)} h</dd></div>
            </dl>
            <p className="mt-6 flex gap-2 rounded-xl bg-white/5 p-4 text-xs leading-relaxed text-slate-300">
              <Info size={14} className="mt-0.5 shrink-0" /> Es un mínimo para cubrir costes. Añade un margen para imprevistos, impagos y crecimiento.
            </p>
            <LinkButton to="/app/nuevo/presupuesto" className="mt-6">Hacer un presupuesto con esta tarifa <ArrowRight size={16} /></LinkButton>
          </div>
        </Card>

        <div className="mt-16 max-w-3xl space-y-5 text-slate-700">
          <h2 className="text-2xl font-bold text-slate-900">Por qué tu tarifa debe ser mayor de lo que parece</h2>
          <p className="leading-relaxed">Un trabajador por cuenta ajena cobra 52 semanas al año, incluidas vacaciones, y su empresa paga la Seguridad Social y el equipo. Como autónomo, tu tarifa tiene que cubrir todo eso y, además, las horas que dedicas a buscar clientes, preparar presupuestos o hacer papeleo, que nadie te paga.</p>
          <p className="leading-relaxed">Por eso es habitual que un freelance solo pueda facturar entre 20 y 30 horas a la semana aunque trabaje 40. Si calculas tu precio dividiendo el sueldo que quieres entre 160 horas al mes, te quedarás corto.</p>
          <h2 className="pt-4 text-2xl font-bold text-slate-900">Cómo se calcula</h2>
          <ol className="list-decimal space-y-2 pl-6 marker:font-semibold marker:text-brand-600">
            <li>Sueldo neto anual ÷ (1 − tipo de IRPF) = lo que necesitas antes de impuestos.</li>
            <li>Súmale los gastos del negocio y la cuota de autónomos de todo el año.</li>
            <li>Divide el resultado entre tus horas facturables: (52 − semanas sin facturar) × horas por semana.</li>
          </ol>
        </div>

        <div className="mt-16 max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold">Preguntas frecuentes</h2>
          <Faq
            items={[
              { q: "¿El precio por hora incluye IVA?", a: "No. Es la base imponible. A tus clientes les sumarás el IVA que corresponda, que luego ingresas en Hacienda." },
              { q: "¿Cuánto es la cuota de autónomos?", a: "Desde 2023 depende de tus rendimientos netos, con tramos que se actualizan cada año. Si estás empezando, puedes tener derecho a una tarifa reducida." },
              { q: "¿Es mejor cobrar por hora o por proyecto?", a: "Por proyecto suele ser más rentable cuando ganas experiencia y eficiencia. Aun así, conocer tu precio por hora te sirve para presupuestar cualquier proyecto sin perder dinero." },
            ]}
          />
        </div>
      </section>
    </SiteShell>
  );
}
