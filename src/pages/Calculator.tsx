import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ArrowRightLeft } from "lucide-react";
import { SiteShell } from "../components/Site";
import { Button, Card, Field, Input, Select, cx } from "../components/ui";
import { IRPF_RATES, VAT_RATES } from "../lib/config";
import { computeTotals, reverseFromNet } from "../lib/calc";
import { money } from "../lib/format";
import { useTitle } from "../lib/useTitle";

export default function Calculator() {
  useTitle(
    "Calculadora de IVA e IRPF para autónomos 2026 — Facturo",
    "Calcula al instante el IVA, la retención de IRPF y el total de tu factura. También a la inversa: cuánto facturar para cobrar un neto concreto.",
  );
  const [mode, setMode] = useState<"base" | "neto">("base");
  const [amount, setAmount] = useState(1000);
  const [vat, setVat] = useState(21);
  const [irpf, setIrpf] = useState(15);

  const res =
    mode === "base"
      ? (() => {
          const t = computeTotals({ items: [{ id: "x", description: "", quantity: 1, unitPrice: amount, discount: 0, vat }], irpf, surcharge: false });
          return { base: t.base, vat: t.vatTotal, irpf: t.irpfTotal, total: t.total };
        })()
      : reverseFromNet(amount, vat, irpf);

  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Calculadora de IVA e IRPF</h1>
          <p className="mt-4 text-lg text-slate-600">Calcula el total de tu factura de autónomo en segundos, o averigua cuánto facturar para cobrar lo que quieres.</p>
        </div>

        <Card className="mx-auto mt-12 grid max-w-4xl overflow-hidden md:grid-cols-2">
          <div className="space-y-5 p-6 sm:p-8">
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-medium">
              {(["base", "neto"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={cx("rounded-lg py-2 transition cursor-pointer", mode === m ? "bg-white shadow text-slate-900" : "text-slate-500")}>
                  {m === "base" ? "Desde base imponible" : "Desde total a cobrar"}
                </button>
              ))}
            </div>
            <Field label={mode === "base" ? "Base imponible (€)" : "Total que quiero cobrar (€)"}>
              <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="text-lg font-semibold" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="IVA">
                <Select value={vat} onChange={(e) => setVat(Number(e.target.value))}>
                  {VAT_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                </Select>
              </Field>
              <Field label="Retención IRPF">
                <Select value={irpf} onChange={(e) => setIrpf(Number(e.target.value))}>
                  {IRPF_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                </Select>
              </Field>
            </div>
            <p className="flex items-start gap-2 text-xs text-slate-500">
              <ArrowRightLeft size={14} className="mt-0.5 shrink-0" />
              Profesionales: 15% general · 7% en el año de alta y los dos siguientes · 0% si facturas a particulares.
            </p>
          </div>
          <div className="bg-slate-900 p-6 text-white sm:p-8">
            <div className="text-sm text-slate-400">Resultado</div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-400">Base imponible</dt><dd className="font-semibold tabular-nums">{money(res.base)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">IVA ({vat}%)</dt><dd className="font-semibold tabular-nums">+ {money(res.vat)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Retención IRPF ({irpf}%)</dt><dd className="font-semibold tabular-nums">− {money(res.irpf)}</dd></div>
            </dl>
            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="text-sm text-slate-400">Total factura (lo que cobras)</div>
              <div className="mt-1 text-4xl font-extrabold tabular-nums">{money(res.total)}</div>
            </div>
            <div className="mt-6 rounded-xl bg-white/5 p-4 text-xs leading-relaxed text-slate-300">
              Reserva <strong className="text-white">{money(res.vat)}</strong> para el modelo 303: ese IVA no es tuyo, es de Hacienda.
            </div>
            <Link to="/app/nuevo/factura">
              <Button className="mt-6 w-full">Crear factura con estos datos <ArrowRight size={16} /></Button>
            </Link>
          </div>
        </Card>

        <div className="mx-auto mt-20 max-w-3xl space-y-6 text-slate-700">
          <h2 className="text-2xl font-bold text-slate-900">¿Cómo se calcula una factura de autónomo?</h2>
          <p>El total de una factura se obtiene sumando a la <strong>base imponible</strong> la cuota de <strong>IVA</strong> y restando la <strong>retención de IRPF</strong>. Por ejemplo, con una base de 1.000 €, IVA del 21% y retención del 15%: 1.000 + 210 − 150 = <strong>1.060 €</strong>.</p>
          <h2 className="text-2xl font-bold text-slate-900">¿Qué tipo de IVA aplico?</h2>
          <p>El tipo general es el 21%. El 10% se aplica, entre otros, a hostelería y transporte de viajeros, y el 4% a productos de primera necesidad como pan, libros o medicamentos. Algunas actividades, como la formación reglada o servicios sanitarios, están exentas.</p>
          <h2 className="text-2xl font-bold text-slate-900">¿Cuándo aplico retención de IRPF?</h2>
          <p>Si eres profesional (estás dado de alta en una actividad de la sección segunda del IAE) y facturas a una empresa u otro autónomo, debes aplicar retención: el 15% con carácter general o el 7% durante el año de inicio y los dos siguientes. A particulares no se aplica retención.</p>
        </div>
      </section>
    </SiteShell>
  );
}
