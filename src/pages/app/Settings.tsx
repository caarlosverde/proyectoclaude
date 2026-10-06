import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Crown, Download, ImagePlus, Sparkles, Trash2, Upload } from "lucide-react";
import { PageHeader } from "./AppLayout";
import { Badge, Button, Card, Field, Input, Select, Textarea } from "../../components/ui";
import { useUpgrade } from "../../components/Upgrade";
import { activatePro, downgrade, exportBackup, importBackup, isPro, updateSettings, useStore } from "../../store/store";
import type { Party, Settings as S } from "../../lib/types";
import { IRPF_RATES, VAT_RATES } from "../../lib/config";
import { saveFile } from "../../lib/download";
import { useConfirm, useToast } from "../../components/Feedback";
import { date, isValidSpanishTaxId, todayISO } from "../../lib/format";

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const plan = useStore((s) => s.plan);
  const pro = useStore((s) => isPro(s));
  const upgrade = useUpgrade();
  const [params, setParams] = useSearchParams();
  const [form, setForm] = useState<S>(settings);
  const toast = useToast();
  const confirm = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => setForm(settings), [settings]);

  // Retorno desde la pasarela de pago o enlace directo desde la página de precios.
  useEffect(() => {
    if (params.get("pro") === "activado") {
      activatePro();
      toast("¡Bienvenido a Facturo Pro! Todo está desbloqueado.");
      setParams({}, { replace: true });
    } else if (params.get("plan") === "pro") {
      setParams({}, { replace: true });
      if (!pro) upgrade();
    }
  }, [params, setParams, pro, upgrade, toast]);


  const setIssuer = (p: Partial<Party>) => setForm({ ...form, issuer: { ...form.issuer, ...p } });
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    toast("Ajustes guardados");
  };

  const onLogo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast("Elige una imagen (PNG, JPG, SVG o WebP)", "error");
    if (file.size > 5_000_000) return toast("La imagen debe pesar menos de 5 MB", "error");
    const reader = new FileReader();
    reader.onload = () => {
      // Normalizamos a PNG de tamaño razonable: compatible con el PDF y ligero de guardar.
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 600 / img.width, 240 / img.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round((img.width || 600) * scale));
        canvas.height = Math.max(1, Math.round((img.height || 240) * scale));
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        updateSettings({ logo: canvas.toDataURL("image/png") });
        toast("Logo actualizado");
      };
      img.onerror = () => toast("No se pudo leer la imagen", "error");
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onImport = (file?: File) => {
    if (!file) return;
    file.text().then((txt) => {
      try {
        JSON.parse(txt);
      } catch {
        return toast("El archivo no es una copia válida de Facturo", "error");
      }
      confirm({ title: "¿Restaurar esta copia?", text: "Se reemplazarán todos tus datos actuales por los de la copia.", confirmLabel: "Restaurar", danger: true }).then((ok) => {
        if (!ok) return;
        try {
          importBackup(txt);
          toast("Copia restaurada correctamente");
        } catch {
          toast("El archivo no es una copia válida de Facturo", "error");
        }
      });
    });
  };

  const issuerTaxInvalid = form.issuer.taxId && !isValidSpanishTaxId(form.issuer.taxId);

  return (
    <>
      <PageHeader title="Ajustes" subtitle="Tus datos fiscales y preferencias por defecto" />

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={save} className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Datos fiscales del emisor</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre o razón social" className="sm:col-span-2"><Input value={form.issuer.name} onChange={(e) => setIssuer({ name: e.target.value })} placeholder="Ej. Laura Martín García" /></Field>
              <Field label="NIF / CIF" error={issuerTaxInvalid ? "Este NIF/CIF no parece válido" : undefined}><Input value={form.issuer.taxId} onChange={(e) => setIssuer({ taxId: e.target.value.toUpperCase() })} /></Field>
              <Field label="Email"><Input type="email" value={form.issuer.email} onChange={(e) => setIssuer({ email: e.target.value })} /></Field>
              <Field label="Dirección" className="sm:col-span-2"><Input value={form.issuer.address} onChange={(e) => setIssuer({ address: e.target.value })} /></Field>
              <Field label="Código postal"><Input value={form.issuer.postalCode} onChange={(e) => setIssuer({ postalCode: e.target.value })} /></Field>
              <Field label="Ciudad"><Input value={form.issuer.city} onChange={(e) => setIssuer({ city: e.target.value })} /></Field>
              <Field label="Teléfono"><Input value={form.issuer.phone ?? ""} onChange={(e) => setIssuer({ phone: e.target.value })} /></Field>
              <Field label="País"><Input value={form.issuer.country} onChange={(e) => setIssuer({ country: e.target.value })} /></Field>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Numeración y valores por defecto</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Serie facturas"><Input value={form.invoicePrefix} onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })} /></Field>
              <Field label="Siguiente nº factura"><Input type="number" min={1} value={form.nextInvoiceNumber} onChange={(e) => setForm({ ...form, nextInvoiceNumber: Math.max(1, Number(e.target.value)) })} /></Field>
              <Field label="Serie presupuestos"><Input value={form.quotePrefix} onChange={(e) => setForm({ ...form, quotePrefix: e.target.value })} /></Field>
              <Field label="Siguiente nº presupuesto"><Input type="number" min={1} value={form.nextQuoteNumber} onChange={(e) => setForm({ ...form, nextQuoteNumber: Math.max(1, Number(e.target.value)) })} /></Field>
              <Field label="IVA por defecto">
                <Select value={form.defaultVat} onChange={(e) => setForm({ ...form, defaultVat: Number(e.target.value) })}>
                  {VAT_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                </Select>
              </Field>
              <Field label="IRPF por defecto">
                <Select value={form.defaultIrpf} onChange={(e) => setForm({ ...form, defaultIrpf: Number(e.target.value) })}>
                  {IRPF_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                </Select>
              </Field>
              <Field label="Días hasta vencimiento"><Input type="number" min={0} value={form.defaultDueDays} onChange={(e) => setForm({ ...form, defaultDueDays: Number(e.target.value) })} /></Field>
              <Field label="Moneda">
                <Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  {["EUR", "USD", "GBP", "MXN"].map((c) => <option key={c}>{c}</option>)}
                </Select>
              </Field>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Forma de pago por defecto"><Textarea value={form.paymentInfo} onChange={(e) => setForm({ ...form, paymentInfo: e.target.value })} /></Field>
              <Field label="Notas por defecto"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg">Guardar ajustes</Button>
          </div>
        </form>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Tu plan</h2>
              {pro ? <Badge tone="pro"><Crown size={12} /> Pro</Badge> : <Badge tone="borrador">Gratis</Badge>}
            </div>
            {pro ? (
              <>
                <p className="text-sm text-slate-600">Tienes acceso a todas las funciones{plan.activatedAt ? ` desde el ${date(plan.activatedAt)}` : ""}.</p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={async () => { if (await confirm({ title: "¿Volver al plan gratuito?", text: "Conservarás todos tus documentos.", confirmLabel: "Volver al gratuito" })) { downgrade(); toast("Has vuelto al plan gratuito", "info"); } }}>Volver al plan gratuito</Button>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">Facturas ilimitadas, plantillas premium, tu logo e informes trimestrales.</p>
                <Button className="mt-4 w-full" onClick={() => upgrade()}><Sparkles size={16} /> Pasar a Pro</Button>
              </>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Logotipo</h2>
              {!pro && <Badge tone="pro"><Crown size={12} /> Pro</Badge>}
            </div>
            {settings.logo ? (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                <img src={settings.logo} alt="Logo" className="max-h-12 max-w-[160px] object-contain" />
                <button onClick={() => updateSettings({ logo: undefined })} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer" aria-label="Quitar logo"><Trash2 size={16} /></button>
              </div>
            ) : (
              <button
                onClick={() => (pro ? logoRef.current?.click() : upgrade("Añade tu logo a todas tus facturas"))}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-6 text-sm text-slate-500 transition hover:border-brand-300 hover:text-brand-600 cursor-pointer"
              >
                <ImagePlus size={22} /> Subir logo (PNG, JPG o SVG)
              </button>
            )}
            <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => { onLogo(e.target.files?.[0]); e.target.value = ""; }} />
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 font-semibold">Copia de seguridad</h2>
            <p className="mb-4 text-sm text-slate-500">Tus datos viven en este navegador. Descarga una copia periódicamente o para pasarlos a otro dispositivo.</p>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" onClick={async () => { if ((await saveFile(`facturo-copia-${todayISO()}.json`, exportBackup(), "application/json")) === "saved") toast("Copia descargada"); }}>
                <Download size={16} /> Descargar copia
              </Button>
              <Button variant="secondary" onClick={() => fileRef.current?.click()}><Upload size={16} /> Restaurar copia</Button>
              <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { onImport(e.target.files?.[0]); e.target.value = ""; }} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
