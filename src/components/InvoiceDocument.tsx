import type { Invoice, Party } from "../lib/types";
import { computeTotals } from "../lib/calc";
import { date, money, num } from "../lib/format";
import { cx } from "./ui";

interface Props {
  doc: Invoice;
  logo?: string;
  watermark?: boolean;
}

function PartyBlock({ title, party, accent, align = "left" }: { title: string; party: Party; accent: string; align?: "left" | "right" }) {
  return (
    <div className={cx("text-[12px] leading-relaxed", align === "right" && "text-right")}>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: accent }}>
        {title}
      </div>
      <div className="text-[14px] font-semibold text-slate-900">{party.name || "—"}</div>
      {party.taxId && <div className="text-slate-600">NIF: {party.taxId}</div>}
      {party.address && <div className="text-slate-600">{party.address}</div>}
      {(party.postalCode || party.city) && (
        <div className="text-slate-600">
          {[party.postalCode, party.city].filter(Boolean).join(" ")}
          {party.country && party.country !== "España" ? `, ${party.country}` : ""}
        </div>
      )}
      {party.email && <div className="text-slate-600">{party.email}</div>}
      {party.phone && <div className="text-slate-600">{party.phone}</div>}
    </div>
  );
}

export function InvoiceDocument({ doc, logo, watermark }: Props) {
  const t = computeTotals(doc);
  const accent = doc.accent || "#4f46e5";
  const title = doc.kind === "factura" ? "Factura" : "Presupuesto";
  const cur = doc.currency || "EUR";
  const tpl = doc.template;

  const header =
    tpl === "moderna" ? (
      <div className="-mx-[18mm] -mt-[16mm] mb-10 px-[18mm] pb-8 pt-[16mm] text-white" style={{ background: accent }}>
        <div className="flex items-start justify-between">
          <div>
            {logo ? (
              <img src={logo} alt="" className="mb-4 max-h-14 max-w-[180px] rounded bg-white/95 p-1.5 object-contain" />
            ) : (
              <div className="mb-2 text-xl font-bold">{doc.issuer.name}</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold tracking-tight">{title}</div>
            <div className="mt-1 text-sm opacity-90">Nº {doc.number}</div>
          </div>
        </div>
        <div className="mt-6 flex gap-10 text-[12px]">
          <div>
            <div className="opacity-75">Fecha de emisión</div>
            <div className="font-semibold">{date(doc.issueDate)}</div>
          </div>
          {doc.dueDate && (
            <div>
              <div className="opacity-75">{doc.kind === "factura" ? "Vencimiento" : "Válido hasta"}</div>
              <div className="font-semibold">{date(doc.dueDate)}</div>
            </div>
          )}
        </div>
      </div>
    ) : (
      <div className={cx("mb-10 flex items-start justify-between", tpl === "clasica" && "border-b-4 pb-6")} style={tpl === "clasica" ? { borderColor: accent } : undefined}>
        <div>
          {logo ? (
            <img src={logo} alt="" className="max-h-16 max-w-[200px] object-contain" />
          ) : (
            <div className="text-2xl font-bold" style={{ color: accent }}>
              {doc.issuer.name || "Tu empresa"}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className={cx("font-extrabold tracking-tight", tpl === "minimal" ? "text-2xl font-light uppercase tracking-[0.3em] text-slate-800" : "text-4xl")} style={tpl === "clasica" ? { color: accent } : undefined}>
            {title}
          </div>
          <div className="mt-2 text-[12px] text-slate-600">
            <div>
              <span className="text-slate-400">Nº </span>
              <span className="font-semibold text-slate-800">{doc.number}</span>
            </div>
            <div>
              <span className="text-slate-400">Fecha </span>
              {date(doc.issueDate)}
            </div>
            {doc.dueDate && (
              <div>
                <span className="text-slate-400">{doc.kind === "factura" ? "Vence " : "Válido hasta "}</span>
                {date(doc.dueDate)}
              </div>
            )}
          </div>
        </div>
      </div>
    );

  return (
    <div className="a4 relative flex flex-col overflow-hidden bg-white px-[18mm] py-[16mm] font-sans text-slate-800">
      {header}

      <div className="mb-10 grid grid-cols-2 gap-10">
        <PartyBlock title="Emisor" party={doc.issuer} accent={accent} />
        <PartyBlock title="Cliente" party={doc.client} accent={accent} align="right" />
      </div>

      <table className="w-full text-[12px]">
        <thead>
          <tr
            className={cx(tpl === "minimal" ? "border-b border-slate-300 text-slate-500" : "text-white")}
            style={tpl !== "minimal" ? { background: accent } : undefined}
          >
            <th className="py-2.5 pl-3 text-left font-semibold">Concepto</th>
            <th className="w-14 py-2.5 text-right font-semibold">Cant.</th>
            <th className="w-24 py-2.5 text-right font-semibold">Precio</th>
            <th className="w-14 py-2.5 text-right font-semibold">Dto.</th>
            <th className="w-14 py-2.5 text-right font-semibold">IVA</th>
            <th className="w-28 py-2.5 pr-3 text-right font-semibold">Importe</th>
          </tr>
        </thead>
        <tbody>
          {doc.items.map((it, idx) => {
            const amount = it.quantity * it.unitPrice * (1 - (it.discount || 0) / 100);
            return (
              <tr key={it.id} className={cx("border-b border-slate-100 align-top", tpl === "clasica" && idx % 2 === 1 && "bg-slate-50")}>
                <td className="whitespace-pre-line py-2.5 pl-3 pr-2">{it.description || <span className="text-slate-300">Sin descripción</span>}</td>
                <td className="py-2.5 text-right tabular-nums">{num(it.quantity)}</td>
                <td className="py-2.5 text-right tabular-nums">{money(it.unitPrice, cur)}</td>
                <td className="py-2.5 text-right tabular-nums">{it.discount ? `${num(it.discount)}%` : "—"}</td>
                <td className="py-2.5 text-right tabular-nums">{it.vat}%</td>
                <td className="py-2.5 pr-3 text-right font-medium tabular-nums">{money(amount, cur)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="w-[78mm] text-[12px]">
          {t.discountTotal > 0 && (
            <>
              <Row label="Subtotal" value={money(t.subtotal, cur)} />
              <Row label="Descuentos" value={`−${money(t.discountTotal, cur)}`} />
            </>
          )}
          <Row label="Base imponible" value={money(t.base, cur)} />
          {t.breakdown.map((b) => (
            <div key={b.rate}>
              <Row label={`IVA ${b.rate}%${t.breakdown.length > 1 ? ` s/ ${money(b.base, cur)}` : ""}`} value={money(b.vat, cur)} />
              {b.surchargeRate > 0 && <Row label={`Recargo equiv. ${num(b.surchargeRate, 1)}%`} value={money(b.surcharge, cur)} />}
            </div>
          ))}
          {doc.irpf > 0 && <Row label={`Retención IRPF ${doc.irpf}%`} value={`−${money(t.irpfTotal, cur)}`} />}
          <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-3 text-white" style={{ background: tpl === "minimal" ? "#0f172a" : accent }}>
            <span className="text-[13px] font-semibold">Total</span>
            <span className="text-[18px] font-bold tabular-nums">{money(t.total, cur)}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-8 pt-12 text-[11px] text-slate-600">
        {doc.paymentInfo && (
          <div>
            <div className="mb-1 font-semibold uppercase tracking-[0.12em] text-[10px]" style={{ color: accent }}>
              Forma de pago
            </div>
            <p className="whitespace-pre-line">{doc.paymentInfo}</p>
          </div>
        )}
        {doc.notes && (
          <div>
            <div className="mb-1 font-semibold uppercase tracking-[0.12em] text-[10px]" style={{ color: accent }}>
              Notas
            </div>
            <p className="whitespace-pre-line">{doc.notes}</p>
          </div>
        )}
      </div>

      {watermark && (
        <div className="mt-8 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400">
          Creado gratis con <span className="font-semibold text-slate-500">Facturo</span> · facturo.app
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 px-3 py-1.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium tabular-nums text-slate-800">{value}</span>
    </div>
  );
}
