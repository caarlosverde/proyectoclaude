import { SiteShell } from "../components/Site";

export default function Privacy() {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-16 text-slate-700 sm:px-6">
        <h1 className="text-3xl font-extrabold text-slate-900">Política de privacidad</h1>
        <div className="mt-8 space-y-4 leading-relaxed">
          <p>Facturo funciona íntegramente en tu navegador. Las facturas, presupuestos, clientes y ajustes que introduces se guardan en el almacenamiento local (<em>localStorage</em>) de tu dispositivo y no se envían a ningún servidor de Facturo.</p>
          <p>Esto significa que solo tú tienes acceso a tus datos. También significa que, si borras los datos del navegador o cambias de dispositivo, perderás la información salvo que hayas exportado una copia de seguridad desde <strong>Ajustes → Copia de seguridad</strong>.</p>
          <p>Si contratas el plan Pro, el pago lo procesa Stripe, que actúa como responsable independiente del tratamiento de los datos de pago conforme a su propia política de privacidad.</p>
          <p>Para cualquier consulta puedes escribir a <a className="text-brand-600 underline" href="mailto:hola@facturo.app">hola@facturo.app</a>.</p>
        </div>
      </article>
    </SiteShell>
  );
}
