import { PricingCards, SiteShell } from "../components/Site";
import { useTitle } from "../lib/useTitle";

export default function Pricing() {
  useTitle("Precios — Facturo", "Facturo es gratis para empezar. Pasa a Pro por 6,99 €/mes para facturas ilimitadas, logo propio e informes trimestrales.");
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Un precio justo para autónomos</h1>
          <p className="mt-4 text-lg text-slate-600">Menos de lo que cuesta un café a la semana. Y te ahorra horas cada mes.</p>
        </div>
        <PricingCards />
        <p className="mt-10 text-center text-sm text-slate-500">¿Eres gestoría o asesoría y quieres Facturo para tus clientes? <a href="mailto:hola@facturo.app" className="font-medium text-brand-600 hover:underline">Escríbenos</a>.</p>
      </section>
    </SiteShell>
  );
}
