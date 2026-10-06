import type { Invoice, LineItem } from "./types";

/** Redondeo a céntimos evitando errores de coma flotante. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Recargo de equivalencia asociado a cada tipo de IVA (art. 161 LIVA). */
export const SURCHARGE_BY_VAT: Record<number, number> = {
  21: 5.2,
  10: 1.4,
  4: 0.5,
  0: 0,
};

export function lineBase(item: Pick<LineItem, "quantity" | "unitPrice" | "discount">): number {
  const qty = Number.isFinite(item.quantity) ? item.quantity : 0;
  const price = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;
  const disc = Math.min(Math.max(item.discount || 0, 0), 100);
  return round2(qty * price * (1 - disc / 100));
}

export interface TaxBreakdown {
  rate: number;
  base: number;
  vat: number;
  surchargeRate: number;
  surcharge: number;
}

export interface Totals {
  subtotal: number;
  discountTotal: number;
  base: number;
  vatTotal: number;
  surchargeTotal: number;
  irpfTotal: number;
  total: number;
  breakdown: TaxBreakdown[];
}

export function computeTotals(
  doc: Pick<Invoice, "items" | "irpf" | "surcharge">,
): Totals {
  const groups = new Map<number, number>();
  let subtotal = 0;
  let base = 0;

  for (const item of doc.items) {
    const gross = round2((item.quantity || 0) * (item.unitPrice || 0));
    const net = lineBase(item);
    subtotal += gross;
    base += net;
    groups.set(item.vat, round2((groups.get(item.vat) ?? 0) + net));
  }

  const breakdown: TaxBreakdown[] = [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([rate, groupBase]) => {
      const surchargeRate = doc.surcharge ? (SURCHARGE_BY_VAT[rate] ?? 0) : 0;
      return {
        rate,
        base: groupBase,
        vat: round2((groupBase * rate) / 100),
        surchargeRate,
        surcharge: round2((groupBase * surchargeRate) / 100),
      };
    });

  base = round2(base);
  subtotal = round2(subtotal);
  const vatTotal = round2(breakdown.reduce((s, b) => s + b.vat, 0));
  const surchargeTotal = round2(breakdown.reduce((s, b) => s + b.surcharge, 0));
  const irpfTotal = round2((base * (doc.irpf || 0)) / 100);
  const total = round2(base + vatTotal + surchargeTotal - irpfTotal);

  return {
    subtotal,
    discountTotal: round2(subtotal - base),
    base,
    vatTotal,
    surchargeTotal,
    irpfTotal,
    total,
    breakdown,
  };
}

/**
 * Calcula, a partir de un neto deseado (lo que quieres cobrar en mano),
 * la base imponible necesaria con un IVA y una retención dados.
 */
export function reverseFromNet(net: number, vat: number, irpf: number) {
  const factor = 1 + vat / 100 - irpf / 100;
  const base = factor > 0 ? round2(net / factor) : 0;
  return {
    base,
    vat: round2((base * vat) / 100),
    irpf: round2((base * irpf) / 100),
    total: round2(base + (base * vat) / 100 - (base * irpf) / 100),
  };
}

/** Trimestre natural (1-4) de una fecha ISO. */
export function quarterOf(isoDate: string): number {
  const m = Number(isoDate.slice(5, 7));
  return Math.floor((m - 1) / 3) + 1;
}

export interface QuarterSummary {
  year: number;
  quarter: number;
  base: number;
  vat: number;
  irpf: number;
  total: number;
  count: number;
}

/** Resumen para modelos 303 (IVA repercutido) y 130 (ingresos) por trimestre. */
export function quarterSummary(invoices: Invoice[], year: number, quarter: number): QuarterSummary {
  const relevant = invoices.filter(
    (i) =>
      i.kind === "factura" &&
      i.status !== "borrador" &&
      Number(i.issueDate.slice(0, 4)) === year &&
      quarterOf(i.issueDate) === quarter,
  );
  const acc = { base: 0, vat: 0, irpf: 0, total: 0 };
  for (const inv of relevant) {
    const t = computeTotals(inv);
    acc.base += t.base;
    acc.vat += t.vatTotal + t.surchargeTotal;
    acc.irpf += t.irpfTotal;
    acc.total += t.total;
  }
  return {
    year,
    quarter,
    base: round2(acc.base),
    vat: round2(acc.vat),
    irpf: round2(acc.irpf),
    total: round2(acc.total),
    count: relevant.length,
  };
}
