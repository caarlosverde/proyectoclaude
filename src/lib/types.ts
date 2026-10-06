export type DocKind = "factura" | "presupuesto";
export type DocStatus = "borrador" | "emitida" | "pagada" | "vencida" | "aceptado" | "rechazado";
export type TemplateId = "clasica" | "moderna" | "minimal";

export interface Party {
  name: string;
  taxId: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  phone?: string;
}

export interface Client extends Party {
  id: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  /** Descuento en % (0-100) */
  discount: number;
  /** Tipo de IVA en % (21, 10, 4, 0) */
  vat: number;
}

export interface Invoice {
  id: string;
  kind: DocKind;
  number: string;
  status: DocStatus;
  issueDate: string;
  dueDate: string;
  issuer: Party;
  client: Party;
  clientId?: string;
  items: LineItem[];
  /** Retención de IRPF en % (15, 7, 0...) */
  irpf: number;
  /** Aplicar recargo de equivalencia */
  surcharge: boolean;
  currency: string;
  notes: string;
  paymentInfo: string;
  template: TemplateId;
  accent: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  /** Presupuesto del que procede esta factura */
  fromQuoteId?: string;
}

export interface Settings {
  issuer: Party;
  logo?: string;
  invoicePrefix: string;
  quotePrefix: string;
  nextInvoiceNumber: number;
  nextQuoteNumber: number;
  defaultIrpf: number;
  defaultVat: number;
  defaultDueDays: number;
  currency: string;
  paymentInfo: string;
  notes: string;
  template: TemplateId;
  accent: string;
}

export interface Plan {
  tier: "free" | "pro";
  activatedAt?: string;
}
