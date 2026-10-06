import { useState, type ReactNode } from "react";
import { Link, LinkButton } from "./nav";
import { ArrowRight, Check, Menu, X } from "lucide-react";
import { Logo, cx } from "./ui";
import { FREE_CLIENT_LIMIT, FREE_MONTHLY_LIMIT, PRO_PRICE_MONTHLY, PRO_PRICE_YEARLY } from "../lib/config";
import { PRO_FEATURES } from "./Upgrade";
import { money } from "../lib/format";

const links = [
  { to: "/#funciones", label: "Funciones" },
  { to: "/calculadora-iva-irpf", label: "Calculadora IVA/IRPF" },
  { to: "/precios", label: "Precios" },
  { to: "/#faq", label: "Preguntas" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="Facturo, inicio">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="transition hover:text-slate-900">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <LinkButton to="/app" variant="ghost">Mis facturas</LinkButton>
          <LinkButton to="/app/nuevo/factura">
            Crear factura gratis <ArrowRight size={16} />
          </LinkButton>
        </div>
        <button className="-mr-2 rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer" onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-2 shadow-lg lg:hidden">
          <div className="flex flex-col text-base font-medium text-slate-700">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-2 py-3 hover:bg-slate-50">
                {l.label}
              </Link>
            ))}
            <Link to="/app" onClick={() => setOpen(false)} className="rounded-lg px-2 py-3 hover:bg-slate-50">
              Mis facturas
            </Link>
            <LinkButton to="/app/nuevo/factura" size="lg" className="mt-3 w-full" onClick={() => setOpen(false)}>
              Crear factura gratis <ArrowRight size={18} />
            </LinkButton>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-slate-500">
            Facturas y presupuestos profesionales para autónomos, freelancers y pymes. Hecho en España, pensado para la normativa española.
          </p>
        </div>
        <div className="text-sm">
          <div className="mb-3 font-semibold">Producto</div>
          <ul className="space-y-2 text-slate-500">
            <li><Link className="hover:text-slate-900" to="/app/nuevo/factura">Generador de facturas</Link></li>
            <li><Link className="hover:text-slate-900" to="/app/nuevo/presupuesto">Generador de presupuestos</Link></li>
            <li><Link className="hover:text-slate-900" to="/calculadora-iva-irpf">Calculadora IVA e IRPF</Link></li>
            <li><Link className="hover:text-slate-900" to="/precios">Precios</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="mb-3 font-semibold">Legal</div>
          <ul className="space-y-2 text-slate-500">
            <li><Link className="hover:text-slate-900" to="/privacidad">Privacidad</Link></li>
            <li><a className="hover:text-slate-900" href="mailto:hola@facturo.app">Contacto</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Facturo. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PricingCards() {
  const [yearly, setYearly] = useState(true);
  const free = [
    `${FREE_MONTHLY_LIMIT} facturas o presupuestos al mes`,
    `Hasta ${FREE_CLIENT_LIMIT} clientes guardados`,
    "IVA, IRPF y recargo de equivalencia automáticos",
    "Descarga en PDF",
    "Plantilla clásica",
    "Panel de cobros y vencimientos",
  ];
  return (
    <div>
      <div className="mb-10 flex justify-center">
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm font-medium">
          {[false, true].map((y) => (
            <button
              key={String(y)}
              onClick={() => setYearly(y)}
              className={cx("rounded-full px-4 py-1.5 transition cursor-pointer", yearly === y ? "bg-white shadow text-slate-900" : "text-slate-500")}
            >
              {y ? "Anual · −30%" : "Mensual"}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="rounded-3xl p-8 ring-1 ring-slate-200">
          <h3 className="text-lg font-semibold">Gratis</h3>
          <p className="mt-1 text-sm text-slate-500">Para empezar a facturar hoy mismo.</p>
          <div className="mt-6 text-4xl font-extrabold">0 €</div>
          <div className="text-sm text-slate-500">para siempre</div>
          <LinkButton to="/app/nuevo/factura" variant="secondary" size="lg" className="mt-6 w-full">Empezar gratis</LinkButton>
          <ul className="mt-8 space-y-3">
            {free.map((f) => (
              <li key={f} className="flex gap-2.5 text-sm text-slate-700"><Check size={18} className="shrink-0 text-slate-400" />{f}</li>
            ))}
          </ul>
        </div>
        <div className="relative rounded-3xl bg-slate-900 p-8 text-white shadow-2xl shadow-brand-900/30 ring-1 ring-slate-900">
          <div className="absolute -top-3 right-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-xs font-bold text-slate-900">MÁS POPULAR</div>
          <h3 className="text-lg font-semibold">Pro</h3>
          <p className="mt-1 text-sm text-slate-400">Para autónomos que facturan cada semana.</p>
          <div className="mt-6 text-4xl font-extrabold">
            {yearly ? money(PRO_PRICE_YEARLY / 12) : money(PRO_PRICE_MONTHLY)}
            <span className="text-base font-medium text-slate-400">/mes</span>
          </div>
          <div className="text-sm text-slate-400">{yearly ? `${money(PRO_PRICE_YEARLY)} facturados al año` : "facturado mensualmente"} · IVA no incluido</div>
          <LinkButton to="/app/ajustes?plan=pro" size="lg" className="mt-6 w-full">Probar Pro</LinkButton>
          <ul className="mt-8 space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex gap-2.5 text-sm text-slate-200"><Check size={18} className="shrink-0 text-emerald-400" />{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
