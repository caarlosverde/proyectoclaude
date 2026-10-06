# Facturo

**Generador de facturas y presupuestos para autónomos y freelancers en España.**
IVA, IRPF y recargo de equivalencia automáticos, PDF profesional, control de cobros e informe trimestral (modelos 303 y 130). Funciona 100 % en el navegador: sin registro, sin servidor y sin coste de infraestructura.

## Por qué este proyecto

- **Mercado enorme y recurrente:** más de 3 millones de autónomos en España tienen que emitir facturas cada mes, y muchos todavía usan Word o Excel.
- **Mucha búsqueda orgánica:** consultas como «generador de facturas gratis», «plantilla factura autónomo» o «calcular IRPF factura» tienen un volumen alto y estable todo el año. La landing y la calculadora gratuita están pensadas para captar ese tráfico (SEO + JSON-LD).
- **Momento oportuno:** la normativa de facturación (VeriFactu, factura electrónica B2B) está empujando a los autónomos a dejar las plantillas y pasar a software.
- **Modelo freemium probado:** plan gratuito útil de verdad (5 documentos/mes) con una marca de agua que hace de canal de difusión en cada factura enviada, y un plan Pro a 6,99 €/mes (59 €/año).
- **Coste marginal casi cero:** es una SPA estática; se aloja gratis en Vercel, Netlify o Cloudflare Pages.

## Funciones

| Gratis | Pro |
|---|---|
| 5 facturas o presupuestos al mes | Ilimitados |
| 3 clientes guardados | Ilimitados |
| IVA por línea, IRPF y recargo de equivalencia | ✔ |
| PDF A4 (plantilla Clásica) | 3 plantillas + color de marca + logo |
| Panel de cobros, facturas vencidas automáticas | ✔ |
| Marca de agua «Creado con Facturo» | Sin marca de agua |
| — | Informe trimestral 303/130 |
| — | Exportación a Excel/CSV para la gestoría |

Además: presupuestos convertibles en factura con un clic, duplicar documentos, numeración por series, validación de NIF/NIE/CIF, copia de seguridad JSON, calculadora pública de IVA/IRPF (también inversa: «quiero cobrar X, ¿cuánto facturo?») y diseño adaptado a móvil.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · jsPDF · Vitest. Sin backend: los datos se guardan en `localStorage`. El PDF se genera en el propio navegador con jsPDF (vectorial, texto seleccionable, multipágina) y funciona igual en móvil y ordenador.

## Puesta en marcha

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # tests de cálculo fiscal y validaciones
npm run build      # genera dist/ listo para desplegar
npm run build:embed  # dist-embed/facturo.html: la app entera en un solo archivo (vistas previas, iframes)
```

## Monetización: conectar Stripe

1. Crea un **Payment Link** de suscripción en Stripe para el plan Pro.
2. En la configuración del enlace, pon como URL de éxito: `https://TU-DOMINIO/app/ajustes?pro=activado`.
3. Copia `.env.example` a `.env` y rellena `VITE_STRIPE_PRO_LINK`.

Sin enlace configurado, la app funciona en **modo demo** (el botón «Pasar a Pro» activa Pro al instante), útil para probar.

> **Importante antes de cobrar en serio:** al no haber servidor, la activación de Pro se guarda en el navegador y un usuario técnico podría activarla a mano. Para producción, el siguiente paso es añadir una función serverless (Vercel/Netlify/Cloudflare) que verifique el pago con el webhook de Stripe y emita una licencia firmada, y sincronizar datos entre dispositivos (p. ej. Supabase). La arquitectura está preparada para ello: todo el estado pasa por `src/store/store.ts`.

## Despliegue y SEO

`npm run build` compila la app y **prerenderiza cada página pública** (portada, precios, calculadoras, páginas por profesión y guías) como HTML completo, con su propio `<title>`, descripción, URL canónica, Open Graph y datos estructurados (schema.org). También genera `sitemap.xml` y `robots.txt`. La app privada (`/app/...`) se sirve desde `app.html` y lleva `noindex`.

### Recomendado: Vercel con dominio propio

1. Importa el repositorio en [vercel.com](https://vercel.com) (comando `npm run build`, carpeta `dist`; `vercel.json` ya incluye las reglas).
2. En *Settings → Environment Variables* añade `VITE_SITE_URL` con tu dominio, por ejemplo `https://facturo.es`, y vuelve a desplegar.
3. En *Settings → Domains* conecta el dominio que hayas comprado.
4. Da de alta el dominio en [Google Search Console](https://search.google.com/search-console). Si eliges verificar con etiqueta HTML, pon el código en la variable `GOOGLE_SITE_VERIFICATION` y vuelve a desplegar. Después envía `https://tudominio/sitemap.xml` en *Sitemaps*.

Netlify y Cloudflare Pages funcionan igual (`public/_redirects` ya está incluido).

### GitHub Pages (incluido)

Cada push publica la web automáticamente con `.github/workflows/deploy-pages.yml` en la rama `gh-pages`, también prerenderizada y con URLs limpias, en `https://<usuario>.github.io/<repo>/`. Sirve para enseñar el proyecto; para posicionar es mejor un dominio propio.

### Añadir contenido

- **Profesiones:** añade una entrada en `src/content/professions.ts` → se crea `/factura-para/<slug>`, entra en el sitemap y el editor acepta `?plantilla=<slug>`.
- **Guías:** añade una entrada en `src/content/guides.ts` → se crea `/guias/<slug>`.

## Estructura

```
src/
  lib/          cálculo fiscal (calc.ts), formato y validación NIF, CSV, config de planes
  store/        estado persistente en localStorage + límites del plan
  components/   UI, documento A4 con 3 plantillas, modal de upgrade, gráfico
  pages/        landing, precios, calculadora SEO, privacidad
  pages/app/    panel, documentos, editor, clientes, ajustes
```

## Ideas de crecimiento

- Páginas SEO por profesión («factura para diseñadores», «factura para fotógrafos»…) reutilizando la calculadora.
- Envío de facturas por email y recordatorios automáticos de impago (requiere backend).
- Cumplimiento VeriFactu (huella/hash encadenado y QR) como función Pro.
- Plan para gestorías con varios clientes.

## Aviso

Facturo ayuda a generar facturas con los datos exigidos por el RD 1619/2012, pero no sustituye el asesoramiento fiscal. Las estimaciones del modelo 130 no incluyen gastos deducibles.
