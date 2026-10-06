import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import { Button, Modal } from "./ui";
import { FREE_MONTHLY_LIMIT, PRO_PRICE_MONTHLY, PRO_PRICE_YEARLY, STRIPE_PRO_LINK } from "../lib/config";
import { activatePro } from "../store/store";
import { money } from "../lib/format";

export const PRO_FEATURES = [
  "Facturas y presupuestos ilimitados",
  "Clientes ilimitados",
  "3 plantillas premium + color de marca",
  "Tu logotipo en cada documento",
  "Sin marca de agua «Creado con Facturo»",
  "Informe trimestral para modelos 303 y 130",
  "Exportación a Excel/CSV para tu gestoría",
];

const Ctx = createContext<(reason?: string) => void>(() => {});

export function useUpgrade() {
  return useContext(Ctx);
}

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const [reason, setReason] = useState<string | null>(null);
  const open = useCallback((r?: string) => setReason(r ?? "Desbloquea todo el potencial de Facturo"), []);
  const close = useCallback(() => setReason(null), []);

  const checkout = () => {
    if (STRIPE_PRO_LINK) {
      window.location.href = STRIPE_PRO_LINK;
    } else {
      // Modo demo: sin enlace de pago configurado se activa Pro localmente.
      activatePro();
      close();
    }
  };

  return (
    <Ctx.Provider value={open}>
      {children}
      <Modal open={reason !== null} onClose={close}>
        <div className="overflow-hidden rounded-2xl">
          <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-6 pb-6 pt-8 text-white">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">
              <Crown size={14} /> Facturo Pro
            </div>
            <h2 className="text-xl font-bold">{reason}</h2>
            <p className="mt-1 text-sm text-brand-100">
              El plan gratuito incluye {FREE_MONTHLY_LIMIT} documentos al mes. Con Pro, factura sin límites y con imagen de marca.
            </p>
          </div>
          <div className="px-6 py-5">
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check size={18} className="mt-px shrink-0 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <div className="text-3xl font-extrabold">
                  {money(PRO_PRICE_MONTHLY)}
                  <span className="text-sm font-medium text-slate-500">/mes</span>
                </div>
                <div className="text-xs text-slate-500">o {money(PRO_PRICE_YEARLY)}/año (ahorra un 30%) · Cancela cuando quieras</div>
              </div>
            </div>
            <Button size="lg" className="mt-5 w-full" onClick={checkout}>
              <Sparkles size={18} /> Pasar a Pro
            </Button>
            {!STRIPE_PRO_LINK && (
              <p className="mt-2 text-center text-[11px] text-slate-400">Modo demo: no hay pasarela configurada, Pro se activará al instante.</p>
            )}
          </div>
        </div>
      </Modal>
    </Ctx.Provider>
  );
}
