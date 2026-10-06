import { useState } from "react";
import type { Invoice } from "../lib/types";
import { computeTotals } from "../lib/calc";
import { money } from "../lib/format";

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Base imponible facturada por mes en los últimos 12 meses (una sola serie). */
export function RevenueChart({ invoices }: { invoices: Invoice[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const value = invoices
      .filter((inv) => inv.kind === "factura" && inv.status !== "borrador" && inv.issueDate.startsWith(key))
      .reduce((s, inv) => s + computeTotals(inv).base, 0);
    return { key, label: MONTHS[d.getMonth()], year: d.getFullYear(), value };
  });
  const max = Math.max(...months.map((m) => m.value), 1);

  const empty = months.every((m) => m.value === 0);

  return (
    <div>
      <div className="relative flex h-44 items-end gap-[2px] border-b border-slate-200" role="img" aria-label="Facturación mensual, últimos 12 meses">
        {empty && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Emite tu primera factura para ver aquí tu evolución
          </div>
        )}
        {months.map((m, i) => (
          <div
            key={m.key}
            className="group relative flex h-full flex-1 items-end"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div
              className="w-full rounded-t bg-brand-600 transition-opacity"
              style={{ height: `${(m.value / max) * 100}%`, minHeight: m.value ? 3 : 0, opacity: hover === null || hover === i ? 1 : 0.45 }}
            />
            {hover === i && (
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg">
                <div className="text-slate-300 capitalize">{m.label} {m.year}</div>
                <div className="font-semibold tabular-nums">{money(m.value)}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[2px] text-center text-[10px] text-slate-400">
        {months.map((m) => (
          <div key={m.key} className="flex-1 capitalize">{m.label}</div>
        ))}
      </div>
      <table className="sr-only">
        <caption>Facturación mensual (base imponible)</caption>
        <tbody>
          {months.map((m) => (
            <tr key={m.key}><th>{m.label} {m.year}</th><td>{money(m.value)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
