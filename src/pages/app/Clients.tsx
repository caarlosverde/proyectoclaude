import { useState } from "react";
import { Building2, Mail, Pencil, Plus, Trash2, Users } from "lucide-react";
import { PageHeader } from "./AppLayout";
import { Button, Card, Empty, Field, Input, Modal } from "../../components/ui";
import { useUpgrade } from "../../components/Upgrade";
import { useConfirm, useToast } from "../../components/Feedback";
import { canCreateClient, deleteClient, emptyParty, saveClient, useStore } from "../../store/store";
import type { Client } from "../../lib/types";
import { computeTotals } from "../../lib/calc";
import { isValidSpanishTaxId, money, uid } from "../../lib/format";

export default function Clients() {
  const clients = useStore((s) => s.clients);
  const invoices = useStore((s) => s.invoices);
  const upgrade = useUpgrade();
  const confirm = useConfirm();
  const toast = useToast();
  const [editing, setEditing] = useState<Client | null>(null);

  const billedTo = (c: Client) =>
    invoices
      .filter((i) => i.kind === "factura" && i.status !== "borrador" && (i.clientId === c.id || (i.client.taxId && i.client.taxId === c.taxId)))
      .reduce((s, i) => s + computeTotals(i).base, 0);

  const create = () => {
    if (!canCreateClient()) return upgrade("Guarda clientes ilimitados con Pro");
    setEditing({ ...emptyParty(), id: uid(), createdAt: new Date().toISOString() });
  };

  return (
    <>
      <PageHeader title="Clientes" subtitle="Tu agenda de clientes para facturar en un clic" actions={<Button onClick={create}><Plus size={16} /> Nuevo cliente</Button>} />
      {clients.length === 0 ? (
        <Card>
          <Empty icon={<Users size={28} />} title="Sin clientes guardados" text="Guarda los datos fiscales de tus clientes y rellena facturas en segundos." action={<Button onClick={create}><Plus size={16} /> Añadir cliente</Button>} />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((c) => (
            <Card key={c.id} className="group p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-700">
                    {c.name.slice(0, 1).toUpperCase() || <Building2 size={16} />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.taxId || "Sin NIF"}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer" aria-label="Editar"><Pencil size={15} /></button>
                  <button onClick={async () => { if (await confirm({ title: `¿Eliminar a ${c.name}?`, text: "Sus facturas no se borrarán.", confirmLabel: "Eliminar", danger: true })) { deleteClient(c.id); toast("Cliente eliminado"); } }} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer" aria-label="Eliminar"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="mt-4 space-y-1 text-sm text-slate-600">
                {c.email && <div className="flex items-center gap-2 truncate"><Mail size={14} className="text-slate-400" /> {c.email}</div>}
                {(c.city || c.address) && <div className="truncate text-slate-500">{[c.address, c.city].filter(Boolean).join(", ")}</div>}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-500">Facturado</span>
                <span className="font-semibold tabular-nums">{money(billedTo(c))}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <form
            className="p-6"
            onSubmit={(e) => {
              e.preventDefault();
              saveClient(editing);
              toast(clients.some((c) => c.id === editing.id) ? "Cliente actualizado" : "Cliente añadido");
              setEditing(null);
            }}
          >
            <h2 className="mb-5 text-lg font-semibold">{clients.some((c) => c.id === editing.id) ? "Editar cliente" : "Nuevo cliente"}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nombre o razón social" className="sm:col-span-2"><Input required autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="NIF / CIF" error={editing.taxId && editing.country === "España" && !isValidSpanishTaxId(editing.taxId) ? "NIF/CIF no válido" : undefined}>
                <Input value={editing.taxId} onChange={(e) => setEditing({ ...editing, taxId: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="Email"><Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
              <Field label="Dirección" className="sm:col-span-2"><Input value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
              <Field label="Código postal"><Input value={editing.postalCode} onChange={(e) => setEditing({ ...editing, postalCode: e.target.value })} /></Field>
              <Field label="Ciudad"><Input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></Field>
              <Field label="País" className="sm:col-span-2"><Input value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button type="submit">Guardar cliente</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
