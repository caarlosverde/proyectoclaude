import { forwardRef, type AnchorHTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { useHref, useLocation, useNavigate } from "react-router";
import { buttonClass, cx, type ButtonSize, type ButtonVariant } from "./ui";

/**
 * Navegación interna que no depende de que el navegador procese <a href>:
 * el clic se gestiona siempre en la app. Funciona igual en un dominio propio,
 * dentro de un iframe aislado o en móvil. En la web normal el enlace lleva
 * href real (para buscadores, abrir en otra pestaña, etc.); en la versión
 * embebible no, porque el visor podría interceptarlo.
 */
const EMBEDDED = import.meta.env.VITE_ROUTER === "memory";
const norm = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: string; children: ReactNode };

/** Lleva el inicio de la app a la vista (ventana y contenedores que la envuelvan). */
export function scrollAppTop() {
  window.scrollTo(0, 0);
  try {
    document.getElementById("root")?.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
  } catch {
    /* navegadores antiguos */
  }
}

export function scrollToId(id: string) {
  let tries = 0;
  const tick = () => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else if (tries++ < 20) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function useGo(to: string) {
  const navigate = useNavigate();
  const { pathname: rawPath, search } = useLocation();
  const pathname = norm(rawPath);
  return () => {
    const [path, hash] = to.split("#");
    const here = pathname + search;
    const target = path || here;
    if (target !== here) navigate(target);
    if (hash) scrollToId(hash);
    else if (target === here) scrollAppTop();
  };
}

export const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ to, onClick, children, ...rest }, ref) {
  const go = useGo(to);
  const href = useHref(to);
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    // Ctrl/Cmd + clic o clic central: dejar que el navegador abra otra pestaña.
    if (!EMBEDDED && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)) return;
    e.preventDefault();
    e.stopPropagation();
    onClick?.(e);
    go();
  };
  const onKey = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  };
  return (
    <a ref={ref} href={EMBEDDED ? undefined : href} role={EMBEDDED ? "link" : undefined} tabIndex={0} {...rest} onClick={handle} onKeyDown={EMBEDDED ? onKey : undefined} className={cx("cursor-pointer", rest.className)}>
      {children}
    </a>
  );
});

export function NavLink({ to, end, className, children }: { to: string; end?: boolean; className: (s: { isActive: boolean }) => string; children: ReactNode }) {
  const pathname = norm(useLocation().pathname);
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  return (
    <Link to={to} className={className({ isActive })} aria-current={isActive ? "page" : undefined}>
      {children}
    </Link>
  );
}

export function LinkButton({ to, variant = "primary", size = "md", className, children, onClick }: { to: string; variant?: ButtonVariant; size?: ButtonSize; className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
