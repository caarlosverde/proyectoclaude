import { useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertTriangle, ArrowRight, CircleCheck, Clock, FileText, Lock, Plus, Receipt, TrendingUp } from "lucide-react";
import { PageHeader } from "./AppLayout";
import { Badge, Button, Card, Empty, Select, cx } from "../../components/ui";
import { RevenueChart } from "../../components/RevenueChart";
import { useUpgrade } from "../../components/Upgrade";
import { isPro, useStore } from "../../store/store";
import { computeTotals, quarterOf, quarterSummary } from "../../lib/calc";
import { date, money, todayISO } from "../../lib/format";

export default function Dashboard() {
  const invoices = useStore((s) => s.invoices);
  const issuerName = useStore((s) => s.settings.issuer.name);
  const pro = useStore((s) => isPro(s));
  const upgrade = useUpgrade();

  const today = todayISO();
  const year = Number(today.slice(0, 4));
  const [q, setQ] = useState(`${year}-${quarterOf(today)}`);
  const [qYear, qNum] = q.split("-").map(Number);
  const quarter = useMemo(() => quarterSummary(invoices, qYear, qNum), [invoices, qYear, qNum]);

  const stats = useMemo(() => {
    const facturas = invoices.filter((i) => i.kind === "factura" && i.status !== "borrador");
    const sum = (list: typeof facturas) => list.reduce((s, i) => s + computeTotals(i).total, 0);
    return {
      yearBase: facturas.filter((i) => i.issueDate.startsWith(String(year))).reduce((s, i) => s + computeTotals(i).base, 0),
      pending: sum(facturas.filter((i) => i.status === "emitida")),
      overdue: sum(facturas.filter((i) => i.status === "vencida")),
      overdueCount: facturas.filter((i) => i.status === "vencida").length,
      paid: sum(facturas.filter((i) => i.status === "pagada" && i.issueDate.startsWith(String(year)))),
      openQuotes: invoices.filter((i) => i.kind === "presupuesto" && i.status === "emitida").length,
    };
  }, [invoices, year]);

  const quarterOptions = [];
  for (let y = year; y >= year - 1; y--) for (let n = 4; n >= 1; n--) {
    if (y === year && n > quarterOf(today)) continue;
    quarterOptions.push(`${y}-${n}`);
  }

  const kpis = [
    { label: `Facturado ${year}`, value: money(stats.yearBase), hint: "Base imponible", icon: TrendingUp, tone: "text-brand-600 bg-brand-50" },
    { label: "Cobrado", value: money(stats.paid), hint: `Total cobrado en ${year}`, icon: CircleCheck, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Pendiente de cobro", value: money(stats.pending), hint: "Facturas emitidas", icon: Clock, tone: "text-sky-600 bg-sky-50" },
    { label: "Vencido", value: money(stats.overdue), hint: `${stats.overdueCount} factura(s) sin cobrar`, icon: AlertTriangle, tone: "text-rose-600 bg-rose-50" },
  ];

  return (
    <>
      <PageHeader
        title={issuerName ? `Hola, ${issuerName.split(" ")[0]}` : "Tu panel"}
        subtitle="Resumen de tu facturación y cobros"
        actions={
          <>
            <Link to="/app/nuevo/presupuesto"><Button variant="secondary"><Receipt size={16} /> Presupuesto</Button></Link>
            <Link to="/app/nuevo/factura"><Button><Plus size={16} /> Factura</Button></Link>
          </>
        }
      />

      {!issuerName && (
        <Card className="mb-6 flex flex-col gap-3 border-l-4 border-brand-500 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold">Completa tus datos fiscales</div>
            <div className="text-sm text-slate-500">Rellénalos una vez y aparecerán automáticamente en todas tus facturas.</div>
          </div>
          <Link to="/app/ajustes"><Button variant="secondary">Completar ahora <ArrowRight size={16} /></Button></Link>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{k.label}</span>
              <span className={cx("rounded-lg p-1.5", k.tone)}><k.icon size={16} /></span>
            </div>
            <div className="mt-3 text-xl font-bold tabular-nums sm:text-2xl">{k.value}</div>
            <div className="mt-1 text-xs text-slate-400">{k.hint}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Facturación mensual</h2>
              <p className="text-xs text-slate-500">Base imponible · últimos 12 meses</p>
            </div>
          </div>
          <RevenueChart invoices={invoices} />
        </Card>

        <Card className="relative overflow-hidden p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold">Impuestos del trimestre</h2>
              <p className="text-xs text-slate-500">Modelos 303 y 130</p>
            </div>
            <Select value={q} onChange={(e) => setQ(e.target.value)} className="!w-24 shrink-0 py-1 text-xs">
              {quarterOptions.map((o) => <option key={o} value={o}>{o.split("-")[1]}T {o.split("-")[0]}</option>)}
            </Select>
          </div>
          <div className={cx(!pro && "pointer-events-none select-none blur-sm")}>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Facturas emitidas</dt><dd className="font-medium">{quarter.count}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Base imponible</dt><dd className="font-medium tabular-nums">{money(quarter.base)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">IVA repercutido (303)</dt><dd className="font-semibold tabular-nums">{money(quarter.vat)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Retenciones IRPF soportadas</dt><dd className="font-medium tabular-nums">{money(quarter.irpf)}</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-3"><dt className="text-slate-500">Pago fraccionado estimado (130)*</dt><dd className="font-semibold tabular-nums">{money(Math.max(0, quarter.base * 0.2 - quarter.irpf))}</dd></div>
            </dl>
            <p className="mt-4 text-[11px] leading-snug text-slate-400">*Estimación sin gastos deducibles: 20% del rendimiento menos retenciones. Consulta con tu asesor.</p>
          </div>
          {!pro && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 p-6 text-center">
              <div className="rounded-full bg-amber-100 p-2.5 text-amber-600"><Lock size={18} /></div>
              <div className="mt-3 text-sm font-semibold">Informe trimestral Pro</div>
              <p className="mt-1 text-xs text-slate-500">Sabe exactamente cuánto apartar para Hacienda.</p>
              <Button size="sm" className="mt-4" onClick={() => upgrade("Prepara tus trimestres sin sustos")}>Desbloquear</Button>
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold">Últimos documentos</h2>
          <Link to="/app/documentos" className="text-sm font-medium text-brand-600 hover:underline">Ver todos</Link>
        </div>
        {invoices.length === 0 ? (
          <Empty
            icon={<FileText size={28} />}
            title="Aún no has creado ningún documento"
            text="Crea tu primera factura en menos de un minuto. Los totales e impuestos se calculan solos."
            action={<Link to="/app/nuevo/factura"><Button><Plus size={16} /> Crear factura</Button></Link>}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {invoices.slice(0, 6).map((inv) => (
              <li key={inv.id}>
                <Link to={`/app/documentos/${inv.id}`} className="flex items-center gap-4 px-5 py-3 transition hover:bg-slate-50">
                  <div className={cx("rounded-lg p-2", inv.kind === "factura" ? "bg-brand-50 text-brand-600" : "bg-amber-50 text-amber-600")}>
                    {inv.kind === "factura" ? <FileText size={16} /> : <Receipt size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{inv.client.name || "Sin cliente"}</div>
                    <div className="text-xs text-slate-500">{inv.number} · {date(inv.issueDate)}</div>
                  </div>
                  <Badge tone={inv.status}>{inv.status}</Badge>
                  <div className="w-24 text-right text-sm font-semibold tabular-nums">{money(computeTotals(inv).total, inv.currency)}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {stats.openQuotes > 0 && (
        <p className="mt-4 text-sm text-slate-500">Tienes {stats.openQuotes} presupuesto(s) pendientes de respuesta.</p>
      )}
    </>
  );
}
