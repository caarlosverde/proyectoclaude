import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { findProfession } from "../../content/professions";
import { Link } from "../../components/nav";
import { ArrowLeft, Check, Copy, Crown, Eye, FileDown, Loader2, Pencil, Plus, Save, Trash2, UserPlus } from "lucide-react";
import { Badge, Button, Card, Field, Input, Select, Textarea, cx } from "../../components/ui";
import { InvoiceDocument } from "../../components/InvoiceDocument";
import { ScaledDoc } from "../../components/ScaledDoc";
import { useToast } from "../../components/Feedback";
import { buildInvoicePdf, docFilename } from "../../lib/pdf";
import { saveFile } from "../../lib/download";
import { useUpgrade } from "../../components/Upgrade";
import {
  canCreateClient, canCreateDoc, emptyParty, getState, isPro, nextNumber, saveClient, saveInvoice, useStore,
} from "../../store/store";
import type { DocKind, Invoice, LineItem, Party, TemplateId } from "../../lib/types";
import { ACCENTS, IRPF_RATES, VAT_RATES } from "../../lib/config";
import { computeTotals } from "../../lib/calc";
import { addDays, isValidSpanishTaxId, money, todayISO, uid } from "../../lib/format";

const TEMPLATES: { id: TemplateId; label: string; pro: boolean }[] = [
  { id: "clasica", label: "Clásica", pro: false },
  { id: "moderna", label: "Moderna", pro: true },
  { id: "minimal", label: "Minimal", pro: true },
];

function newItem(vat: number): LineItem {
  return { id: uid(), description: "", quantity: 1, unitPrice: 0, discount: 0, vat };
}

function blankDoc(kind: DocKind, preset?: string): Invoice {
  const s = getState();
  const prof = findProfession(preset);
  const st = s.settings;
  const today = todayISO();
  const pro = isPro(s);
  return {
    id: uid(),
    kind,
    number: nextNumber(kind, s),
    status: "borrador",
    issueDate: today,
    dueDate: addDays(today, st.defaultDueDays),
    issuer: { ...st.issuer },
    client: emptyParty(),
    items: prof ? prof.lines.map((l) => ({ ...newItem(l.vat), ...l })) : [newItem(st.defaultVat)],
    irpf: prof ? prof.irpf : st.defaultIrpf,
    surcharge: false,
    currency: st.currency,
    notes: st.notes,
    paymentInfo: kind === "factura" ? st.paymentInfo : "",
    template: pro ? st.template : "clasica",
    accent: pro ? st.accent : "#4f46e5",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function Editor() {
  const { id, kind } = useParams();
  const [search] = useSearchParams();
  const preset = search.get("plantilla") ?? undefined;
  const navigate = useNavigate();
  const upgrade = useUpgrade();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const existing = useStore((s) => (id ? s.invoices.find((i) => i.id === id) : undefined));
  const clients = useStore((s) => s.clients);
  const logo = useStore((s) => s.settings.logo);
  const pro = useStore((s) => isPro(s));

  const [doc, setDoc] = useState<Invoice>(() => existing ?? blankDoc(kind === "presupuesto" ? "presupuesto" : "factura", preset));
  const [tab, setTab] = useState<"editar" | "vista">("editar");
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const isNew = !existing;

  useEffect(() => {
    if (existing && existing.id !== doc.id) setDoc(existing);
  }, [existing, doc.id]);

  useEffect(() => {
    if (!isNew) return;
    setDoc(blankDoc(kind === "presupuesto" ? "presupuesto" : "factura", preset));
  }, [kind, isNew, preset]);

  useEffect(() => {
    document.title = `${doc.kind === "factura" ? "Factura" : "Presupuesto"} ${doc.number} — Facturo`;
  }, [doc.kind, doc.number]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const totals = useMemo(() => computeTotals(doc), [doc]);

  const patch = (p: Partial<Invoice>) => {
    setDoc((d) => ({ ...d, ...p }));
    setDirty(true);
    setSaved(false);
  };
  const patchParty = (key: "issuer" | "client", p: Partial<Party>) => patch({ [key]: { ...doc[key], ...p } } as Partial<Invoice>);
  const patchItem = (itemId: string, p: Partial<LineItem>) =>
    patch({ items: doc.items.map((it) => (it.id === itemId ? { ...it, ...p } : it)) });

  const persist = (overrides: Partial<Invoice> = {}): boolean => {
    if (isNew && !canCreateDoc()) {
      upgrade("Has alcanzado el límite gratuito de este mes");
      return false;
    }
    const finalDoc = { ...doc, ...overrides };
    saveInvoice(finalDoc);
    setDoc(finalDoc);
    setDirty(false);
    setSaved(true);
    if (!overrides.status) toast(isNew ? "Documento creado" : "Cambios guardados");
    setTimeout(() => setSaved(false), 2000);
    if (isNew) navigate(`/app/documentos/${finalDoc.id}`, { replace: true });
    return true;
  };

  const download = async () => {
    const overrides: Partial<Invoice> = doc.status === "borrador" ? { status: "emitida" } : {};
    if (!persist(overrides)) return;
    setBusy(true);
    try {
      const finalDoc = { ...doc, ...overrides };
      const blob = await buildInvoicePdf(finalDoc, { logo: pro ? logo : undefined, watermark: !pro });
      const r = await saveFile(docFilename(finalDoc), blob);
      if (r === "saved") toast("PDF descargado");
      else if (r === "unavailable") toast("Este navegador no permite descargar archivos aquí", "error");
    } catch {
      toast("No se pudo generar el PDF. Inténtalo de nuevo.", "error");
    } finally {
      setBusy(false);
    }
  };

  const pickClient = (clientId: string) => {
    const c = clients.find((x) => x.id === clientId);
    if (!c) return;
    const { id: _id, createdAt: _c, ...party } = c;
    patch({ client: party, clientId });
  };

  const saveAsClient = () => {
    if (!doc.client.name) return;
    if (!canCreateClient()) return upgrade("Guarda clientes ilimitados con Pro");
    const c = { ...doc.client, id: uid(), createdAt: new Date().toISOString() };
    saveClient(c);
    patch({ clientId: c.id });
    toast("Cliente guardado");
  };

  const convertToInvoice = () => {
    if (!canCreateDoc()) return upgrade("Has alcanzado el límite gratuito de este mes");
    const s = getState();
    const inv: Invoice = {
      ...doc,
      id: uid(),
      kind: "factura",
      number: nextNumber("factura", s),
      status: "borrador",
      issueDate: todayISO(),
      dueDate: addDays(todayISO(), s.settings.defaultDueDays),
      paymentInfo: doc.paymentInfo || s.settings.paymentInfo,
      fromQuoteId: doc.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveInvoice({ ...doc, status: "aceptado" });
    saveInvoice(inv);
    toast("Presupuesto aceptado y convertido en factura");
    navigate(`/app/documentos/${inv.id}`);
  };

  const duplicate = () => {
    if (!canCreateDoc()) return upgrade("Has alcanzado el límite gratuito de este mes");
    const s = getState();
    const copy: Invoice = {
      ...doc,
      id: uid(),
      number: nextNumber(doc.kind, s),
      status: "borrador",
      issueDate: todayISO(),
      dueDate: addDays(todayISO(), s.settings.defaultDueDays),
      items: doc.items.map((i) => ({ ...i, id: uid() })),
      paidAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveInvoice(copy);
    toast("Documento duplicado");
    navigate(`/app/documentos/${copy.id}`);
  };

  const clientTaxIdInvalid = doc.client.taxId.length > 0 && doc.client.country === "España" && !isValidSpanishTaxId(doc.client.taxId);
  const issuerTaxIdInvalid = doc.issuer.taxId.length > 0 && doc.issuer.country === "España" && !isValidSpanishTaxId(doc.issuer.taxId);

  const preview = <InvoiceDocument doc={doc} logo={pro ? logo : undefined} watermark={!pro} />;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/app/documentos" className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900" aria-label="Volver">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={cx("text-xl font-bold", !isNew && "capitalize")}>{isNew ? (doc.kind === "factura" ? "Nueva factura" : "Nuevo presupuesto") : `${doc.kind} ${doc.number}`}</h1>
              <Badge tone={doc.status}>{doc.status}</Badge>
            </div>
            <p className="text-xs text-slate-500">{dirty ? "Cambios sin guardar" : isNew ? "Se guarda en tu navegador" : "Guardado"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && doc.kind === "presupuesto" && doc.status !== "aceptado" && (
            <Button variant="secondary" onClick={convertToInvoice}><Check size={16} /> Convertir en factura</Button>
          )}
          {!isNew && <Button variant="secondary" onClick={duplicate}><Copy size={16} /> Duplicar</Button>}
          <Button variant="secondary" onClick={() => persist()}>
            {saved ? <Check size={16} className="text-emerald-600" /> : <Save size={16} />} Guardar
          </Button>
          <Button onClick={download} disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} Descargar PDF</Button>
        </div>
      </div>

      {/* Tabs móvil */}
      <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-200/60 p-1 text-sm font-medium xl:hidden">
        {(["editar", "vista"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cx("flex items-center justify-center gap-1.5 rounded-lg py-2 cursor-pointer", tab === t ? "bg-white shadow" : "text-slate-500")}>
            {t === "editar" ? <Pencil size={14} /> : <Eye size={14} />} {t === "editar" ? "Editar" : "Vista previa"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className={cx("space-y-6", tab === "vista" && "hidden xl:block")}>
          {/* Datos generales */}
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Datos del documento</h2>
            <div className="grid grid-cols-2 gap-4 2xl:grid-cols-4">
              <Field label="Número"><Input value={doc.number} onChange={(e) => patch({ number: e.target.value })} /></Field>
              <Field label="Fecha de emisión"><Input type="date" value={doc.issueDate} onChange={(e) => patch({ issueDate: e.target.value })} /></Field>
              <Field label={doc.kind === "factura" ? "Vencimiento" : "Válido hasta"}><Input type="date" value={doc.dueDate} onChange={(e) => patch({ dueDate: e.target.value })} /></Field>
              <Field label="Estado">
                <Select value={doc.status} onChange={(e) => patch({ status: e.target.value as Invoice["status"] })}>
                  {(doc.kind === "factura" ? ["borrador", "emitida", "pagada", "vencida"] : ["borrador", "emitida", "aceptado", "rechazado"]).map((s) => (
                    <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          {/* Partes */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Tus datos</h2>
                <Link to="/app/ajustes" className="text-xs font-medium text-brand-600 hover:underline">Editar predeterminados</Link>
              </div>
              <PartyForm party={doc.issuer} onChange={(p) => patchParty("issuer", p)} taxIdError={issuerTaxIdInvalid} />
            </Card>
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="font-semibold">Cliente</h2>
                {clients.length > 0 && (
                  <Select value={doc.clientId ?? ""} onChange={(e) => pickClient(e.target.value)} className="w-auto max-w-[55%] py-1 text-xs">
                    <option value="">Elegir guardado…</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                )}
              </div>
              <PartyForm party={doc.client} onChange={(p) => patch({ client: { ...doc.client, ...p }, clientId: undefined })} taxIdError={clientTaxIdInvalid} />
              {doc.client.name && !doc.clientId && (
                <button onClick={saveAsClient} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline cursor-pointer">
                  <UserPlus size={14} /> Guardar en mis clientes
                </button>
              )}
            </Card>
          </div>

          {/* Conceptos */}
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Conceptos</h2>
            <div className="hidden grid-cols-[1fr_70px_100px_64px_76px_32px] gap-2 px-1 pb-2 text-xs font-medium text-slate-500 md:grid">
              <span>Descripción</span><span>Cant.</span><span>Precio (€)</span><span>Dto. %</span><span>IVA</span><span />
            </div>
            <div className="space-y-3">
              {doc.items.map((it) => (
                <div key={it.id} className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 md:grid-cols-[1fr_70px_100px_64px_76px_32px] md:bg-transparent md:p-0">
                  <Textarea rows={1} placeholder="Ej. Diseño web, horas de consultoría…" value={it.description} onChange={(e) => patchItem(it.id, { description: e.target.value })} className="col-span-2 min-h-[38px] md:col-span-1" />
                  <Input type="number" step="any" aria-label="Cantidad" value={it.quantity} onChange={(e) => patchItem(it.id, { quantity: Number(e.target.value) })} />
                  <Input type="number" step="0.01" aria-label="Precio" value={it.unitPrice} onChange={(e) => patchItem(it.id, { unitPrice: Number(e.target.value) })} />
                  <Input type="number" min={0} max={100} aria-label="Descuento" value={it.discount} onChange={(e) => patchItem(it.id, { discount: Number(e.target.value) })} />
                  <Select aria-label="IVA" value={it.vat} onChange={(e) => patchItem(it.id, { vat: Number(e.target.value) })}>
                    {VAT_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                  </Select>
                  <button
                    onClick={() => patch({ items: doc.items.filter((x) => x.id !== it.id) })}
                    disabled={doc.items.length === 1}
                    className="flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                    aria-label="Eliminar línea"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => patch({ items: [...doc.items, newItem(doc.items.at(-1)?.vat ?? 21)] })}>
              <Plus size={14} /> Añadir concepto
            </Button>

            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <div className="space-y-4">
                <Field label="Retención IRPF" hint="15% general · 7% nuevos autónomos · 0% a particulares">
                  <Select value={doc.irpf} onChange={(e) => patch({ irpf: Number(e.target.value) })}>
                    {IRPF_RATES.map((r) => <option key={r} value={r}>{r === 0 ? "Sin retención" : `${r}%`}</option>)}
                  </Select>
                </Field>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={doc.surcharge} onChange={(e) => patch({ surcharge: e.target.checked })} className="h-4 w-4 rounded accent-brand-600" />
                  Aplicar recargo de equivalencia
                </label>
              </div>
              <dl className="space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Base imponible</dt><dd className="tabular-nums">{money(totals.base, doc.currency)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">IVA</dt><dd className="tabular-nums">{money(totals.vatTotal, doc.currency)}</dd></div>
                {totals.surchargeTotal > 0 && <div className="flex justify-between"><dt className="text-slate-500">Recargo</dt><dd className="tabular-nums">{money(totals.surchargeTotal, doc.currency)}</dd></div>}
                {totals.irpfTotal > 0 && <div className="flex justify-between"><dt className="text-slate-500">IRPF</dt><dd className="tabular-nums">−{money(totals.irpfTotal, doc.currency)}</dd></div>}
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{money(totals.total, doc.currency)}</dd></div>
              </dl>
            </div>
          </Card>

          {/* Pie */}
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Pago y notas</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Forma de pago"><Textarea value={doc.paymentInfo} onChange={(e) => patch({ paymentInfo: e.target.value })} placeholder="IBAN, Bizum, plazos…" /></Field>
              <Field label="Notas"><Textarea value={doc.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Condiciones, agradecimiento…" /></Field>
            </div>
          </Card>

          {/* Diseño */}
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Diseño</h2>
              {!pro && <Badge tone="pro"><Crown size={12} /> Pro</Badge>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => (t.pro && !pro ? upgrade("Plantillas premium con tu marca") : patch({ template: t.id }))}
                  className={cx(
                    "relative rounded-xl px-3 py-3 text-sm font-medium ring-1 transition cursor-pointer",
                    doc.template === t.id ? "bg-brand-50 text-brand-700 ring-2 ring-brand-500" : "ring-slate-200 hover:ring-slate-300",
                  )}
                >
                  {t.label}
                  {t.pro && !pro && <Crown size={12} className="absolute right-2 top-2 text-amber-500" />}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="mr-1 text-xs font-medium text-slate-500">Color</span>
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => (pro ? patch({ accent: c }) : upgrade("Usa los colores de tu marca"))}
                  className={cx("h-7 w-7 rounded-full ring-offset-2 transition cursor-pointer", doc.accent === c && "ring-2 ring-slate-900")}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </Card>
        </div>

        <div className={cx("xl:sticky xl:top-6 xl:self-start", tab === "editar" && "hidden xl:block")}>
          <div className="overflow-hidden rounded-xl shadow-xl ring-1 ring-slate-200">
            <ScaledDoc>{preview}</ScaledDoc>
          </div>
          {!pro && (
            <p className="mt-3 text-center text-xs text-slate-500">
              ¿Quieres quitar la marca de agua y añadir tu logo?{" "}
              <button className="font-medium text-brand-600 hover:underline cursor-pointer" onClick={() => upgrade()}>Pásate a Pro</button>
            </p>
          )}
        </div>
      </div>
    </>
  );
}

function PartyForm({ party, onChange, taxIdError }: { party: Party; onChange: (p: Partial<Party>) => void; taxIdError?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Nombre o razón social" className="sm:col-span-2"><Input value={party.name} onChange={(e) => onChange({ name: e.target.value })} /></Field>
      <Field label="NIF / CIF" error={taxIdError ? "Este NIF/CIF no parece válido" : undefined}>
        <Input value={party.taxId} onChange={(e) => onChange({ taxId: e.target.value.toUpperCase() })} />
      </Field>
      <Field label="Email"><Input type="email" value={party.email} onChange={(e) => onChange({ email: e.target.value })} /></Field>
      <Field label="Dirección" className="sm:col-span-2"><Input value={party.address} onChange={(e) => onChange({ address: e.target.value })} /></Field>
      <Field label="Código postal"><Input value={party.postalCode} onChange={(e) => onChange({ postalCode: e.target.value })} /></Field>
      <Field label="Ciudad"><Input value={party.city} onChange={(e) => onChange({ city: e.target.value })} /></Field>
    </div>
  );
}
