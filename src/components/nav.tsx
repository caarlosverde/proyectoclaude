import { forwardRef, type AnchorHTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { buttonClass, cx, type ButtonSize, type ButtonVariant } from "./ui";

/**
 * Navegación interna que no depende de que el navegador procese <a href>.
 * Funciona igual en un dominio propio, dentro de un iframe aislado o en móvil.
 */
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: string; children: ReactNode };

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
  const { pathname } = useLocation();
  return () => {
    const [path, hash] = to.split("#");
    const target = path || pathname;
    if (target !== pathname || !hash) navigate(target);
    if (hash) scrollToId(hash);
    else if (target === pathname) window.scrollTo({ top: 0, behavior: "smooth" });
  };
}

export const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ to, onClick, children, ...rest }, ref) {
  const go = useGo(to);
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
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
    <a ref={ref} role="link" tabIndex={0} {...rest} onClick={handle} onKeyDown={onKey} className={cx("cursor-pointer", rest.className)}>
      {children}
    </a>
  );
});

export function NavLink({ to, end, className, children }: { to: string; end?: boolean; className: (s: { isActive: boolean }) => string; children: ReactNode }) {
  const { pathname } = useLocation();
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
