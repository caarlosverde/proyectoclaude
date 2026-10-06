export const APP_NAME = "Facturo";
export const STRIPE_PRO_LINK: string = import.meta.env.VITE_STRIPE_PRO_LINK ?? "";
export const PRO_PRICE_MONTHLY = 6.99;
export const PRO_PRICE_YEARLY = 59;
/** Documentos al mes incluidos en el plan gratuito. */
export const FREE_MONTHLY_LIMIT = 5;
export const FREE_CLIENT_LIMIT = 3;

export const VAT_RATES = [21, 10, 4, 0];
export const IRPF_RATES = [0, 1, 7, 15, 19];

export const ACCENTS = ["#4f46e5", "#0f766e", "#be123c", "#c2410c", "#0369a1", "#18181b"];
