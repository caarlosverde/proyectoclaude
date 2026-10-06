import { createPortal } from "react-dom";
import type { ReactNode } from "react";

let el: HTMLElement | null = null;
function target() {
  if (!el) {
    el = document.getElementById("print-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "print-root";
      document.body.appendChild(el);
    }
  }
  return el;
}

/** Renderiza el documento a tamaño real fuera de la app, solo visible al imprimir. */
export function PrintPortal({ children }: { children: ReactNode }) {
  return createPortal(children, target());
}

/** Abre el diálogo de impresión (Guardar como PDF) con un nombre de archivo sugerido. */
export function printDocument(filename: string) {
  const prev = document.title;
  document.title = filename;
  window.print();
  setTimeout(() => (document.title = prev), 500);
}
