import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CircleCheck, Info, X } from "lucide-react";
import { Button, Modal, cx } from "./ui";

type ToastTone = "success" | "error" | "info";
interface Toast { id: number; text: string; tone: ToastTone }
interface ConfirmOpts { title: string; text?: string; confirmLabel?: string; danger?: boolean }

const ToastCtx = createContext<(text: string, tone?: ToastTone) => void>(() => {});
const ConfirmCtx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);

export const useToast = () => useContext(ToastCtx);
/** Confirmación dentro de la propia página (los diálogos nativos no funcionan en todos los entornos). */
export const useConfirm = () => useContext(ConfirmCtx);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<ConfirmOpts | null>(null);
  const resolver = useRef<(v: boolean) => void>(() => {});
  const seq = useRef(0);

  const toast = useCallback((text: string, tone: ToastTone = "success") => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-2), { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const confirm = useCallback((o: ConfirmOpts) => {
    setPending(o);
    return new Promise<boolean>((res) => (resolver.current = res));
  }, []);

  const close = (v: boolean) => {
    resolver.current(v);
    setPending(null);
  };

  return (
    <ToastCtx.Provider value={toast}>
      <ConfirmCtx.Provider value={confirm}>
        {children}
        <Modal open={!!pending} onClose={() => close(false)}>
          {pending && (
            <div className="p-6">
              <div className="flex gap-4">
                <div className={cx("h-fit rounded-full p-2.5", pending.danger ? "bg-rose-50 text-rose-600" : "bg-brand-50 text-brand-600")}>
                  {pending.danger ? <AlertTriangle size={20} /> : <Info size={20} />}
                </div>
                <div className="pr-6">
                  <h2 className="text-base font-semibold">{pending.title}</h2>
                  {pending.text && <p className="mt-1 text-sm text-slate-500">{pending.text}</p>}
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={() => close(false)}>Cancelar</Button>
                <Button variant={pending.danger ? "danger" : "primary"} className={pending.danger ? "!bg-rose-600 !text-white hover:!bg-rose-700" : ""} onClick={() => close(true)} autoFocus>
                  {pending.confirmLabel ?? "Confirmar"}
                </Button>
              </div>
            </div>
          )}
        </Modal>
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl animate-[toast-in_.2s_ease-out]">
              {t.tone === "success" && <CircleCheck size={18} className="shrink-0 text-emerald-400" />}
              {t.tone === "error" && <AlertTriangle size={18} className="shrink-0 text-rose-400" />}
              {t.tone === "info" && <Info size={18} className="shrink-0 text-sky-400" />}
              <span>{t.text}</span>
              <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="ml-1 text-slate-400 hover:text-white cursor-pointer" aria-label="Cerrar aviso"><X size={14} /></button>
            </div>
          ))}
        </div>
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
}
