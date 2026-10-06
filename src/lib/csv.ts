import type { Invoice } from "./types";
import { computeTotals } from "./calc";

function esc(v: string | number): string {
  const s = String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const n = (x: number) => x.toFixed(2).replace(".", ",");

/** CSV con separador «;» y decimales con coma, listo para Excel en español. */
export function invoicesToCsv(invoices: Invoice[]): string {
  const header = [
    "Tipo", "Número", "Fecha", "Vencimiento", "Estado", "Cliente", "NIF cliente",
    "Base imponible", "IVA", "Recargo", "IRPF", "Total",
  ];
  const rows = invoices.map((i) => {
    const t = computeTotals(i);
    return [
      i.kind, i.number, i.issueDate, i.dueDate, i.status, i.client.name, i.client.taxId,
      n(t.base), n(t.vatTotal), n(t.surchargeTotal), n(t.irpfTotal), n(t.total),
    ].map(esc).join(";");
  });
  return "﻿" + [header.join(";"), ...rows].join("\n");
}

export function download(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
