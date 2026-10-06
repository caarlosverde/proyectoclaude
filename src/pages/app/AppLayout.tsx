import { useEffect } from "react";
import { Link, NavLink, Outlet } from "react-router";
import { Crown, FileText, LayoutDashboard, Plus, Settings, Sparkles, Users } from "lucide-react";
import { Button, Logo, cx } from "../../components/ui";
import { useUpgrade } from "../../components/Upgrade";
import { docsThisMonth, isPro, refreshOverdue, useStore } from "../../store/store";
import { FREE_MONTHLY_LIMIT } from "../../lib/config";

const nav = [
  { to: "/app", label: "Panel", icon: LayoutDashboard, end: true },
  { to: "/app/documentos", label: "Documentos", icon: FileText },
  { to: "/app/clientes", label: "Clientes", icon: Users },
  { to: "/app/ajustes", label: "Ajustes", icon: Settings },
];

export default function AppLayout() {
  const pro = useStore((s) => isPro(s));
  const used = useStore((s) => docsThisMonth(s));
  const upgrade = useUpgrade();

  useEffect(() => {
    refreshOverdue();
    document.title = "Facturo — Mis facturas";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center px-6">
          <Link to="/"><Logo /></Link>
        </div>
        <div className="px-4">
          <Link to="/app/nuevo/factura">
            <Button className="w-full"><Plus size={16} /> Nueva factura</Button>
          </Link>
        </div>
        <nav className="mt-6 flex-1 space-y-1 px-3">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )
              }
            >
              <n.icon size={18} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="m-4 rounded-xl bg-gradient-to-br from-slate-900 to-brand-900 p-4 text-white">
          {pro ? (
            <div className="flex items-center gap-2 text-sm font-semibold"><Crown size={16} className="text-amber-400" /> Plan Pro activo</div>
          ) : (
            <>
              <div className="text-sm font-semibold">Plan gratuito</div>
              <div className="mt-1 text-xs text-slate-300">{Math.min(used, FREE_MONTHLY_LIMIT)} de {FREE_MONTHLY_LIMIT} documentos este mes</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(100, (used / FREE_MONTHLY_LIMIT) * 100)}%` }} />
              </div>
              <Button size="sm" className="mt-3 w-full" onClick={() => upgrade()}>
                <Sparkles size={14} /> Pasar a Pro
              </Button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden print:hidden">
        <Link to="/"><Logo /></Link>
        <Link to="/app/nuevo/factura"><Button size="sm"><Plus size={14} /> Nueva</Button></Link>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white lg:hidden">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => cx("flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium", isActive ? "text-brand-600" : "text-slate-500")}
          >
            <n.icon size={20} /> {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
