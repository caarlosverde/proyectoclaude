import { useSyncExternalStore } from "react";
import type { Client, Invoice, Plan, Settings } from "../lib/types";
import { FREE_CLIENT_LIMIT, FREE_MONTHLY_LIMIT } from "../lib/config";
import { formatDocNumber, todayISO } from "../lib/format";

const KEY = "facturo:v1";

export interface State {
  invoices: Invoice[];
  clients: Client[];
  settings: Settings;
  plan: Plan;
  onboarded: boolean;
}

export const emptyParty = () => ({
  name: "",
  taxId: "",
  address: "",
  city: "",
  postalCode: "",
  country: "España",
  email: "",
  phone: "",
});

export const defaultSettings = (): Settings => ({
  issuer: emptyParty(),
  invoicePrefix: "F",
  quotePrefix: "P",
  nextInvoiceNumber: 1,
  nextQuoteNumber: 1,
  defaultIrpf: 15,
  defaultVat: 21,
  defaultDueDays: 30,
  currency: "EUR",
  paymentInfo: "Transferencia bancaria a: ES00 0000 0000 0000 0000 0000",
  notes: "Gracias por confiar en mi trabajo.",
  template: "clasica",
  accent: "#4f46e5",
});

const initial = (): State => ({
  invoices: [],
  clients: [],
  settings: defaultSettings(),
  plan: { tier: "free" },
  onboarded: false,
});

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial();
    const parsed = JSON.parse(raw) as Partial<State>;
    const base = initial();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...parsed.settings },
      plan: { ...base.plan, ...parsed.plan },
    };
  } catch {
    return initial();
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento lleno o bloqueado: seguimos en memoria */
  }
}

export function setState(updater: (s: State) => State) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = load();
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

/* ---------- Acciones ---------- */

export const isPro = (s: State = state) => s.plan.tier === "pro";

export function docsThisMonth(s: State = state): number {
  const ym = todayISO().slice(0, 7);
  return s.invoices.filter((i) => i.createdAt.slice(0, 7) === ym).length;
}

export function canCreateDoc(s: State = state): boolean {
  return isPro(s) || docsThisMonth(s) < FREE_MONTHLY_LIMIT;
}

export function canCreateClient(s: State = state): boolean {
  return isPro(s) || s.clients.length < FREE_CLIENT_LIMIT;
}

export function nextNumber(kind: Invoice["kind"], s: State = state): string {
  const year = new Date().getFullYear();
  return kind === "factura"
    ? formatDocNumber(s.settings.invoicePrefix, year, s.settings.nextInvoiceNumber)
    : formatDocNumber(s.settings.quotePrefix, year, s.settings.nextQuoteNumber);
}

export function saveInvoice(inv: Invoice) {
  setState((s) => {
    const exists = s.invoices.some((i) => i.id === inv.id);
    const updated = { ...inv, updatedAt: new Date().toISOString() };
    const settings = { ...s.settings };
    // La primera vez que el usuario rellena sus datos en una factura, los recordamos.
    if (!settings.issuer.name.trim() && inv.issuer.name.trim()) settings.issuer = { ...inv.issuer };
    if (!exists) {
      if (inv.kind === "factura") settings.nextInvoiceNumber += 1;
      else settings.nextQuoteNumber += 1;
    }
    return {
      ...s,
      settings,
      invoices: exists
        ? s.invoices.map((i) => (i.id === inv.id ? updated : i))
        : [updated, ...s.invoices],
    };
  });
}

export function deleteInvoice(id: string) {
  setState((s) => ({ ...s, invoices: s.invoices.filter((i) => i.id !== id) }));
}

export function setInvoiceStatus(id: string, status: Invoice["status"]) {
  setState((s) => ({
    ...s,
    invoices: s.invoices.map((i) =>
      i.id === id
        ? {
            ...i,
            status,
            paidAt: status === "pagada" ? new Date().toISOString() : i.paidAt,
            updatedAt: new Date().toISOString(),
          }
        : i,
    ),
  }));
}

export function saveClient(c: Client) {
  setState((s) => ({
    ...s,
    clients: s.clients.some((x) => x.id === c.id)
      ? s.clients.map((x) => (x.id === c.id ? c : x))
      : [c, ...s.clients],
  }));
}

export function deleteClient(id: string) {
  setState((s) => ({ ...s, clients: s.clients.filter((c) => c.id !== id) }));
}

export function updateSettings(patch: Partial<Settings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

export function activatePro() {
  setState((s) => ({ ...s, plan: { tier: "pro", activatedAt: new Date().toISOString() } }));
}

export function downgrade() {
  setState((s) => ({ ...s, plan: { tier: "free" } }));
}

export function completeOnboarding() {
  setState((s) => ({ ...s, onboarded: true }));
}

export function exportBackup(): string {
  return JSON.stringify(state, null, 2);
}

export function importBackup(json: string) {
  const parsed = JSON.parse(json) as State;
  if (!Array.isArray(parsed.invoices) || !parsed.settings) throw new Error("Copia no válida");
  setState(() => ({ ...initial(), ...parsed }));
}

/** Marca como vencidas las facturas emitidas cuya fecha de vencimiento ya pasó. */
export function refreshOverdue() {
  const today = todayISO();
  const needs = state.invoices.some(
    (i) => i.kind === "factura" && i.status === "emitida" && i.dueDate && i.dueDate < today,
  );
  if (!needs) return;
  setState((s) => ({
    ...s,
    invoices: s.invoices.map((i) =>
      i.kind === "factura" && i.status === "emitida" && i.dueDate && i.dueDate < today
        ? { ...i, status: "vencida" }
        : i,
    ),
  }));
}
