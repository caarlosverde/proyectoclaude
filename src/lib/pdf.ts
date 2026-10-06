import type { jsPDF as JsPDF } from "jspdf";
import type { Invoice, Party } from "./types";
import { computeTotals } from "./calc";
import { date, money, num } from "./format";

/** Las fuentes estándar de PDF no incluyen «−» (U+2212): usamos guion. */
const t = (s: string) => s.replace(/−/g, "-").replace(/ /g, " ");
const m = (n: number, cur: string) => t(money(n, cur));

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

const W = 210;
const H = 297;
const MX = 18;
const INK: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [100, 116, 139];
const FAINT: [number, number, number] = [148, 163, 184];
const LINE: [number, number, number] = [226, 232, 240];

export function docFilename(doc: Invoice) {
  const kind = doc.kind === "factura" ? "Factura" : "Presupuesto";
  const client = doc.client.name ? ` - ${doc.client.name}` : "";
  return `${kind} ${doc.number}${client}`.replace(/[\\/:*?"<>|]/g, "").slice(0, 120).replace(/[.\s]+$/, "") + ".pdf";
}

/** Genera un PDF A4 vectorial (texto seleccionable) del documento. */
export async function buildInvoicePdf(doc: Invoice, opts: { logo?: string; watermark?: boolean } = {}): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pdf: JsPDF = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const tot = computeTotals(doc);
  const cur = doc.currency || "EUR";
  const accent = rgb(doc.accent || "#4f46e5");
  const tpl = doc.template;
  const title = doc.kind === "factura" ? "Factura" : "Presupuesto";
  const dueLabel = doc.kind === "factura" ? "Vencimiento" : "Válido hasta";
  const tableFill = tpl === "minimal" ? null : accent;

  pdf.setProperties({ title: `${title} ${doc.number}`, author: doc.issuer.name || "Facturo", creator: "Facturo" });

  const text = (s: string, x: number, y: number, o: { size?: number; bold?: boolean; color?: [number, number, number]; align?: "left" | "right" | "center"; spacing?: number } = {}) => {
    pdf.setFont("helvetica", o.bold ? "bold" : "normal");
    pdf.setFontSize(o.size ?? 9);
    pdf.setTextColor(...(o.color ?? INK));
    pdf.setCharSpace(o.spacing ?? 0);
    // jsPDF no tiene en cuenta el espaciado entre letras al alinear a la derecha.
    const shift = o.spacing && o.align === "right" ? o.spacing * t(s).length : 0;
    pdf.text(t(s), x - shift, y, { align: o.align ?? "left", baseline: "alphabetic" });
    pdf.setCharSpace(0);
  };

  const logoSize = (maxW: number, maxH: number) => {
    if (!opts.logo) return null;
    try {
      const p = pdf.getImageProperties(opts.logo);
      const r = Math.min(maxW / p.width, maxH / p.height);
      return { w: p.width * r, h: p.height * r };
    } catch {
      return null;
    }
  };

  let y = 0;

  /* ---------- Cabecera ---------- */
  if (tpl === "moderna") {
    pdf.setFillColor(...accent);
    pdf.rect(0, 0, W, 58, "F");
    const ls = logoSize(50, 16);
    if (ls && opts.logo) {
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(MX - 1.5, 14.5, ls.w + 3, ls.h + 3, 1.5, 1.5, "F");
      pdf.addImage(opts.logo, MX, 16, ls.w, ls.h);
    } else {
      text(doc.issuer.name || "", MX, 24, { size: 15, bold: true, color: [255, 255, 255] });
    }
    text(title, W - MX, 26, { size: 26, bold: true, color: [255, 255, 255], align: "right" });
    text(`Nº ${doc.number}`, W - MX, 33, { size: 10, color: [255, 255, 255], align: "right" });
    text("Fecha de emisión", MX, 44, { size: 8, color: [224, 231, 255] });
    text(date(doc.issueDate), MX, 49.5, { size: 9.5, bold: true, color: [255, 255, 255] });
    if (doc.dueDate) {
      text(dueLabel, MX + 40, 44, { size: 8, color: [224, 231, 255] });
      text(date(doc.dueDate), MX + 40, 49.5, { size: 9.5, bold: true, color: [255, 255, 255] });
    }
    y = 72;
  } else {
    const ls = logoSize(60, 20);
    if (ls && opts.logo) pdf.addImage(opts.logo, MX, 16, ls.w, ls.h);
    else text(doc.issuer.name || "Tu empresa", MX, 25, { size: 17, bold: true, color: tpl === "minimal" ? INK : accent });
    if (tpl === "minimal") text(title.toUpperCase(), W - MX, 24, { size: 17, color: INK, align: "right", spacing: 1.6 });
    else text(title, W - MX, 26, { size: 26, bold: true, color: accent, align: "right" });
    let ry = 33;
    const meta = (label: string, value: string) => {
      const vw = pdf.setFont("helvetica", "bold").setFontSize(9).getTextWidth(t(value));
      text(value, W - MX, ry, { size: 9, bold: true, align: "right" });
      text(label, W - MX - vw - 1.5, ry, { size: 9, color: FAINT, align: "right" });
      ry += 5;
    };
    meta("Nº", doc.number);
    meta("Fecha", date(doc.issueDate));
    if (doc.dueDate) meta(doc.kind === "factura" ? "Vence" : "Válido hasta", date(doc.dueDate));
    y = Math.max(ry, 40) + 2;
    if (tpl === "clasica") {
      pdf.setFillColor(...accent);
      pdf.rect(MX, y, W - 2 * MX, 1.3, "F");
      y += 12;
    } else {
      pdf.setDrawColor(...LINE);
      pdf.setLineWidth(0.3);
      pdf.line(MX, y, W - MX, y);
      y += 12;
    }
  }

  /* ---------- Emisor / Cliente ---------- */
  const party = (label: string, p: Party, x: number, align: "left" | "right") => {
    let py = y;
    text(label.toUpperCase(), x, py, { size: 7, bold: true, color: accent, align, spacing: 0.6 });
    py += 5.5;
    text(p.name || "-", x, py, { size: 11, bold: true, align });
    py += 5;
    const lines = [
      p.taxId && `NIF: ${p.taxId}`,
      p.address,
      [p.postalCode, p.city].filter(Boolean).join(" ") + (p.country && p.country !== "España" ? `, ${p.country}` : ""),
      p.email,
      p.phone,
    ].filter((l): l is string => !!l && l.trim().length > 0);
    for (const l of lines) {
      for (const part of pdf.setFontSize(9).splitTextToSize(t(l), 80) as string[]) {
        text(part, x, py, { size: 9, color: MUTED, align });
        py += 4.3;
      }
    }
    return py;
  };
  y = Math.max(party("Emisor", doc.issuer, MX, "left"), party("Cliente", doc.client, W - MX, "right")) + 8;

  /* ---------- Tabla de conceptos ---------- */
  const cols = { desc: MX + 3, qty: 120, price: 143, disc: 157, vat: 170, amount: W - MX - 3 };
  const header = () => {
    if (tableFill) {
      pdf.setFillColor(...tableFill);
      pdf.rect(MX, y, W - 2 * MX, 8, "F");
    } else {
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.line(MX, y + 8, W - MX, y + 8);
    }
    const c: [number, number, number] = tableFill ? [255, 255, 255] : MUTED;
    const hy = y + 5.3;
    text("Concepto", cols.desc, hy, { size: 8.5, bold: true, color: c });
    text("Cant.", cols.qty, hy, { size: 8.5, bold: true, color: c, align: "right" });
    text("Precio", cols.price, hy, { size: 8.5, bold: true, color: c, align: "right" });
    text("Dto.", cols.disc, hy, { size: 8.5, bold: true, color: c, align: "right" });
    text("IVA", cols.vat, hy, { size: 8.5, bold: true, color: c, align: "right" });
    text("Importe", cols.amount, hy, { size: 8.5, bold: true, color: c, align: "right" });
    y += 8;
  };
  header();

  doc.items.forEach((it, idx) => {
    const desc = pdf.setFont("helvetica", "normal").setFontSize(9).splitTextToSize(t(it.description || "Sin descripción"), cols.qty - cols.desc - 16) as string[];
    const rowH = Math.max(8, desc.length * 4.2 + 3.8);
    if (y + rowH > H - 30) {
      pdf.addPage();
      y = 20;
      header();
    }
    if (tpl === "clasica" && idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(MX, y, W - 2 * MX, rowH, "F");
    }
    const ry = y + 5.3;
    desc.forEach((line, i) => text(line, cols.desc, ry + i * 4.2, { size: 9, color: it.description ? INK : FAINT }));
    const amount = it.quantity * it.unitPrice * (1 - (it.discount || 0) / 100);
    text(num(it.quantity), cols.qty, ry, { size: 9, align: "right" });
    text(m(it.unitPrice, cur), cols.price, ry, { size: 9, align: "right" });
    text(it.discount ? `${num(it.discount)}%` : "-", cols.disc, ry, { size: 9, align: "right" });
    text(`${it.vat}%`, cols.vat, ry, { size: 9, align: "right" });
    text(m(amount, cur), cols.amount, ry, { size: 9, bold: true, align: "right" });
    y += rowH;
    pdf.setDrawColor(241, 245, 249);
    pdf.setLineWidth(0.25);
    pdf.line(MX, y, W - MX, y);
  });

  /* ---------- Totales ---------- */
  const rows: [string, string][] = [];
  if (tot.discountTotal > 0) {
    rows.push(["Subtotal", m(tot.subtotal, cur)], ["Descuentos", `-${m(tot.discountTotal, cur)}`]);
  }
  rows.push(["Base imponible", m(tot.base, cur)]);
  for (const b of tot.breakdown) {
    rows.push([`IVA ${b.rate}%${tot.breakdown.length > 1 ? ` s/ ${m(b.base, cur)}` : ""}`, m(b.vat, cur)]);
    if (b.surchargeRate > 0) rows.push([`Recargo equiv. ${num(b.surchargeRate, 1)}%`, m(b.surcharge, cur)]);
  }
  if (doc.irpf > 0) rows.push([`Retención IRPF ${doc.irpf}%`, `-${m(tot.irpfTotal, cur)}`]);

  const boxW = 80;
  const bx = W - MX - boxW;
  const needed = rows.length * 6.5 + 20;
  if (y + needed + 6 > H - 40) {
    pdf.addPage();
    y = 20;
  } else y += 6;
  for (const [label, value] of rows) {
    text(label, bx + 3, y + 4.4, { size: 9, color: MUTED });
    text(value, W - MX - 3, y + 4.4, { size: 9, bold: true, align: "right" });
    y += 6.5;
    pdf.setDrawColor(241, 245, 249);
    pdf.line(bx, y, W - MX, y);
  }
  y += 2.5;
  pdf.setFillColor(...(tpl === "minimal" ? ([15, 23, 42] as [number, number, number]) : accent));
  pdf.roundedRect(bx, y, boxW, 12, 1.8, 1.8, "F");
  text("Total", bx + 4, y + 7.7, { size: 10.5, bold: true, color: [255, 255, 255] });
  text(m(tot.total, cur), W - MX - 4, y + 8, { size: 14, bold: true, color: [255, 255, 255], align: "right" });
  y += 12;

  /* ---------- Pie: pago y notas ---------- */
  const foot = (label: string, body: string, x: number, width: number) => {
    const lines = pdf.setFont("helvetica", "normal").setFontSize(8.5).splitTextToSize(t(body), width) as string[];
    return { label, lines, x, h: 6 + lines.length * 3.9 };
  };
  const blocks = [
    doc.paymentInfo && foot("Forma de pago", doc.paymentInfo, MX, 80),
    doc.notes && foot("Notas", doc.notes, doc.paymentInfo ? MX + 92 : MX, 80),
  ].filter(Boolean) as ReturnType<typeof foot>[];
  const footH = Math.max(0, ...blocks.map((b) => b.h));
  const footY = Math.max(y + 14, H - 22 - footH - (opts.watermark ? 8 : 0));
  if (footY + footH > H - 12) pdf.addPage();
  const fy = footY + footH > H - 12 ? 20 : footY;
  for (const b of blocks) {
    text(b.label.toUpperCase(), b.x, fy, { size: 7, bold: true, color: accent, spacing: 0.6 });
    b.lines.forEach((l, i) => text(l, b.x, fy + 5 + i * 3.9, { size: 8.5, color: MUTED }));
  }

  if (opts.watermark) {
    pdf.setDrawColor(241, 245, 249);
    pdf.line(MX, H - 16, W - MX, H - 16);
    text("Creado gratis con Facturo · facturo.app", W / 2, H - 11, { size: 7.5, color: FAINT, align: "center" });
  }

  const pages = pdf.getNumberOfPages();
  if (pages > 1) {
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i);
      text(`${doc.number} · Página ${i} de ${pages}`, W - MX, H - 6, { size: 7, color: FAINT, align: "right" });
    }
  }

  return pdf.output("blob");
}
