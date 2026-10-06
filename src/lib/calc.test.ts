import { describe, expect, it } from "vitest";
import { computeTotals, lineBase, quarterSummary, reverseFromNet, round2 } from "./calc";
import { formatDocNumber, isValidSpanishTaxId } from "./format";
import type { Invoice, LineItem } from "./types";

const item = (p: Partial<LineItem>): LineItem => ({
  id: Math.random().toString(),
  description: "x",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  vat: 21,
  ...p,
});

describe("cálculos de factura", () => {
  it("redondea a céntimos", () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(1.005)).toBe(1.01);
  });

  it("aplica descuentos por línea", () => {
    expect(lineBase({ quantity: 3, unitPrice: 100, discount: 10 })).toBe(270);
  });

  it("calcula IVA 21% e IRPF 15% de un autónomo", () => {
    const t = computeTotals({ items: [item({ unitPrice: 1000 })], irpf: 15, surcharge: false });
    expect(t.base).toBe(1000);
    expect(t.vatTotal).toBe(210);
    expect(t.irpfTotal).toBe(150);
    expect(t.total).toBe(1060);
  });

  it("agrupa varios tipos de IVA y aplica recargo de equivalencia", () => {
    const t = computeTotals({
      items: [item({ unitPrice: 100, vat: 21 }), item({ unitPrice: 50, quantity: 2, vat: 10 })],
      irpf: 0,
      surcharge: true,
    });
    expect(t.breakdown).toHaveLength(2);
    expect(t.vatTotal).toBe(31);
    expect(t.surchargeTotal).toBe(6.6);
    expect(t.total).toBe(237.6);
  });

  it("calcula la base a partir del neto deseado", () => {
    const r = reverseFromNet(1060, 21, 15);
    expect(r.base).toBe(1000);
    expect(r.total).toBe(1060);
  });

  it("resume el trimestre ignorando borradores y presupuestos", () => {
    const base = {
      items: [item({ unitPrice: 1000 })],
      irpf: 15,
      surcharge: false,
      status: "emitida",
      kind: "factura",
      issueDate: "2026-05-10",
    } as unknown as Invoice;
    const s = quarterSummary(
      [
        base,
        { ...base, status: "borrador" },
        { ...base, kind: "presupuesto" },
        { ...base, issueDate: "2026-08-01" },
      ],
      2026,
      2,
    );
    expect(s.count).toBe(1);
    expect(s.vat).toBe(210);
    expect(s.irpf).toBe(150);
  });
});

describe("utilidades", () => {
  it("formatea números de documento", () => {
    expect(formatDocNumber("F", 2026, 7)).toBe("F2026-0007");
  });

  it("valida NIF, NIE y CIF", () => {
    expect(isValidSpanishTaxId("12345678Z")).toBe(true);
    expect(isValidSpanishTaxId("12345678A")).toBe(false);
    expect(isValidSpanishTaxId("X1234567L")).toBe(true);
    expect(isValidSpanishTaxId("B12345674")).toBe(true);
  });
});

import { hourlyRate } from "./hourly";

describe("precio por hora", () => {
  it("cubre sueldo neto, impuestos, gastos y cuota", () => {
    const r = hourlyRate({ netMonthly: 2000, expensesMonthly: 100, quotaMonthly: 300, taxRate: 20, weeksOff: 6, billableHours: 25 });
    // 24.000 / 0,8 = 30.000 + 4.800 de gastos y cuota = 34.800 / (46·25 = 1.150 h)
    expect(r.revenueYear).toBe(34800);
    expect(r.hoursYear).toBe(1150);
    expect(r.rate).toBe(30.26);
  });
});
