import { useMemo, useState } from "react";
import { Link } from "react-router";
import { CircleCheck, FileSpreadsheet, FileText, Plus, Receipt, Search, Trash2 } from "lucide-react";
import { PageHeader } from "./AppLayout";
import { Badge, Button, Card, Empty, Input, cx } from "../../components/ui";
import { useUpgrade } from "../../components/Upgrade";
import { deleteInvoice, isPro, setInvoiceStatus, useStore } from "../../store/store";
import { computeTotals } from "../../lib/calc";
import { date, money, todayISO } from "../../lib/format";
import { download, invoicesToCsv } from "../../lib/csv";

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "factura", label: "Facturas" },
  { id: "presupuesto", label: "Presupuestos" },
  { id: "pendientes", label: "Pendientes" },
  { id: "vencida", label: "Vencidas" },
] as const;

export default function Documents() {
  const invoices = useStore((s) => s.invoices);
  const pro = useStore((s) => isPro(s));
  const upgrade = useUpgrade();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("todos");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return invoices
      .filter((i) => {
        if (filter === "factura" || filter === "presupuesto") return i.kind === filter;
        if (filter === "pendientes") return i.kind === "factura" && (i.status === "emitida" || i.status === "vencida");
        if (filter === "vencida") return i.status === "vencida";
        return true;
      })
      .filter((i) => !term || i.number.toLowerCase().includes(term) || i.client.name.toLowerCase().includes(term))
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.number.localeCompare(a.number));
  }, [invoices, filter, q]);

  const exportCsv = () => {
    if (!pro) return upgrade("Exporta a Excel para tu gestoría");
    download(`facturo-${todayISO()}.csv`, invoicesToCsv(list));
  };

  const remove = (id: string, number: string) => {
    if (confirm(`¿Eliminar ${number}? Esta acción no se puede deshacer.`)) deleteInvoice(id);
  };

  return (
    <>
      <PageHeader
        title="Documentos"
        subtitle={`${invoices.length} documento(s) en total`}
        actions={
          <>
            <Button variant="secondary" onClick={exportCsv}><FileSpreadsheet size={16} /> Exportar Excel</Button>
            <Link to="/app/nuevo/presupuesto"><Button variant="secondary"><Receipt size={16} /> Presupuesto</Button></Link>
            <Link to="/app/nuevo/factura"><Button><Plus size={16} /> Factura</Button></Link>
          </>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cx("whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition cursor-pointer", filter === f.id ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Buscar por número o cliente" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
        </div>

        {list.length === 0 ? (
          <Empty
            icon={<FileText size={28} />}
            title={invoices.length ? "No hay resultados" : "Todavía no hay documentos"}
            text={invoices.length ? "Prueba con otro filtro o búsqueda." : "Tu primera factura está a un clic."}
            action={!invoices.length && <Link to="/app/nuevo/factura"><Button><Plus size={16} /> Crear factura</Button></Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Número</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="hidden px-5 py-3 md:table-cell">Fecha</th>
                  <th className="hidden px-5 py-3 md:table-cell">Vence</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((inv) => (
                  <tr key={inv.id} className="group hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link to={`/app/documentos/${inv.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                        {inv.number}
                      </Link>
                      <div className="text-xs capitalize text-slate-400">{inv.kind}</div>
                    </td>
                    <td className="max-w-[200px] truncate px-5 py-3">{inv.client.name || <span className="text-slate-400">—</span>}</td>
                    <td className="hidden px-5 py-3 text-slate-500 md:table-cell">{date(inv.issueDate)}</td>
                    <td className="hidden px-5 py-3 text-slate-500 md:table-cell">{date(inv.dueDate)}</td>
                    <td className="px-5 py-3"><Badge tone={inv.status}>{inv.status}</Badge></td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{money(computeTotals(inv).total, inv.currency)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                        {inv.kind === "factura" && inv.status !== "pagada" && (
                          <button title="Marcar como pagada" onClick={() => setInvoiceStatus(inv.id, "pagada")} className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer">
                            <CircleCheck size={16} />
                          </button>
                        )}
                        <button title="Eliminar" onClick={() => remove(inv.id, inv.number)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
