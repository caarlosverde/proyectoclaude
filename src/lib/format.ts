export function money(n: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);
}

export function num(n: number, digits = 2): string {
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: digits }).format(n || 0);
}

export function date(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Número de documento: PREFIJO-AÑO-0001 */
export function formatDocNumber(prefix: string, year: number, n: number): string {
  return `${prefix}${year}-${String(n).padStart(4, "0")}`;
}

/** Validación básica de NIF / NIE / CIF español. */
export function isValidSpanishTaxId(raw: string): boolean {
  const v = raw.toUpperCase().replace(/[\s-]/g, "");
  const letters = "TRWAGMYFPDXBNJZSQVHLCKE";
  if (/^\d{8}[A-Z]$/.test(v)) return letters[Number(v.slice(0, 8)) % 23] === v[8];
  if (/^[XYZ]\d{7}[A-Z]$/.test(v)) {
    const n = "XYZ".indexOf(v[0]) + v.slice(1, 8);
    return letters[Number(n) % 23] === v[8];
  }
  if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(v)) {
    const digits = v.slice(1, 8);
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      let d = Number(digits[i]);
      if (i % 2 === 0) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    const control = (10 - (sum % 10)) % 10;
    const last = v[8];
    return last === String(control) || last === "JABCDEFGHI"[control];
  }
  return false;
}
