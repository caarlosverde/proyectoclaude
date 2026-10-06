/** Guías: contenido de referencia para autónomos, en bloques sencillos de maquetar. */
export type Block =
  | { t: "p"; text: string }
  | { t: "h2"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "tip"; text: string }
  | { t: "example"; title: string; rows: [string, string][]; total?: [string, string] };

export interface Guide {
  slug: string;
  title: string;
  description: string;
  /** Texto corto para tarjetas y listados */
  summary: string;
  updated: string;
  readMinutes: number;
  blocks: Block[];
  cta: { text: string; to: string };
}

export const guides: Guide[] = [
  {
    slug: "como-hacer-una-factura-autonomo",
    title: "Cómo hacer una factura siendo autónomo: datos obligatorios y ejemplo",
    description:
      "Qué datos debe llevar una factura en España según el Reglamento de facturación, plazos para emitirla, numeración y errores habituales. Con ejemplo.",
    summary: "Los datos obligatorios, la numeración, los plazos y un ejemplo completo.",
    updated: "2026-10-06",
    readMinutes: 6,
    blocks: [
      { t: "p", text: "Como autónomo tienes la obligación de emitir factura por cada trabajo que realizas, tanto si tu cliente es una empresa como si es un particular. Las normas están en el Reglamento de facturación (Real Decreto 1619/2012) y, aunque parecen muchas, se resumen en una lista corta de datos que no pueden faltar." },
      { t: "h2", text: "Datos obligatorios de una factura completa" },
      { t: "ol", items: [
        "Número de factura y, si las usas, serie. La numeración debe ser correlativa (F2026-0001, F2026-0002…).",
        "Fecha de expedición y, si es distinta, fecha en que hiciste el trabajo.",
        "Tu nombre y apellidos o razón social, tu NIF y tu domicilio.",
        "Nombre o razón social, NIF y domicilio del cliente.",
        "Descripción de los servicios o productos, con su precio unitario sin IVA y los descuentos.",
        "Base imponible, tipo de IVA aplicado y cuota de IVA de cada tipo.",
        "Retención de IRPF, si corresponde.",
        "Importe total de la factura.",
        "Si la operación está exenta o hay inversión del sujeto pasivo, la mención que lo justifica.",
      ] },
      { t: "tip", text: "Facturo incluye todos estos campos y calcula base, IVA, retención y total automáticamente, para que no se te escape ninguno." },
      { t: "h2", text: "Cómo numerar tus facturas" },
      { t: "p", text: "La numeración debe ser correlativa dentro de cada serie y sin saltos. Puedes usar series distintas para separar, por ejemplo, las facturas normales de las rectificativas. Lo más práctico es incluir el año: así cada enero empiezas en la 0001 sin riesgo de repetir números." },
      { t: "h2", text: "Cuándo emitir la factura" },
      { t: "p", text: "La regla general es emitirla en el momento de hacer el trabajo. Si el cliente es una empresa o un autónomo, puedes hacerlo como tarde antes del día 16 del mes siguiente. Por eso muchos profesionales emiten todas sus facturas a final de mes." },
      { t: "h2", text: "Ejemplo de factura de autónomo" },
      { t: "example", title: "Diseño web para una empresa (profesional con retención del 15%)", rows: [["Base imponible", "1.000,00 €"], ["IVA 21%", "+210,00 €"], ["Retención IRPF 15%", "−150,00 €"]], total: ["Total a cobrar", "1.060,00 €"] },
      { t: "h2", text: "Errores habituales" },
      { t: "ul", items: [
        "Calcular la retención sobre el total con IVA: se calcula siempre sobre la base imponible.",
        "Aplicar retención a un particular: solo se aplica cuando el cliente es empresa o profesional.",
        "Borrar o modificar una factura ya enviada: si hay un error, se emite una factura rectificativa.",
        "Olvidar el NIF del cliente cuando es empresa: sin él, el cliente no puede deducirse el IVA.",
      ] },
      { t: "h2", text: "¿Cuánto tiempo debo guardar las facturas?" },
      { t: "p", text: "Hacienda puede revisar los últimos cuatro años, así que conserva como mínimo las facturas emitidas y recibidas de ese periodo. La normativa mercantil eleva el plazo a seis años para los libros y documentos de la actividad empresarial." },
    ],
    cta: { text: "Crear mi factura ahora", to: "/app/nuevo/factura" },
  },
  {
    slug: "retencion-irpf-factura",
    title: "Retención de IRPF en facturas: ¿15% o 7%? Cuándo aplicarla",
    description:
      "Cuándo un autónomo debe aplicar retención de IRPF en sus facturas, cuándo puede aplicar el 7%, a quién no se le retiene y cómo se calcula.",
    summary: "Quién retiene, cuándo aplicar el 7% de nuevo autónomo y cómo se calcula.",
    updated: "2026-10-06",
    readMinutes: 5,
    blocks: [
      { t: "p", text: "La retención de IRPF es un adelanto de tu impuesto sobre la renta que tu cliente descuenta de la factura e ingresa en Hacienda en tu nombre. No es un coste extra: lo recuperas en tu declaración de la renta y en tus pagos trimestrales." },
      { t: "h2", text: "¿Quién tiene que aplicar retención?" },
      { t: "p", text: "Deben aplicarla los autónomos que realizan actividades profesionales (diseñadores, programadores, consultores, abogados, traductores…) cuando facturan a una empresa o a otro autónomo en España." },
      { t: "ul", items: [
        "A particulares nunca se les aplica retención.",
        "A clientes extranjeros tampoco: no están obligados a retener en España.",
        "Las actividades empresariales (comercio, hostelería, oficios…) en estimación directa no aplican retención.",
        "En estimación objetiva (módulos), algunas actividades aplican un 1% cuando facturan a empresas.",
      ] },
      { t: "h2", text: "15% general o 7% para nuevos autónomos" },
      { t: "p", text: "El tipo general es el 15%. Puedes aplicar el 7% en el año en que empiezas la actividad y en los dos siguientes, siempre que no hayas ejercido ninguna actividad profesional en el año anterior al inicio. Debes comunicárselo por escrito a tus clientes para que te apliquen ese tipo." },
      { t: "h2", text: "Cómo se calcula" },
      { t: "p", text: "La retención se calcula sobre la base imponible, es decir, el importe sin IVA. Después se resta del total." },
      { t: "example", title: "Factura de 2.000 € de base con retención del 7%", rows: [["Base imponible", "2.000,00 €"], ["IVA 21%", "+420,00 €"], ["Retención IRPF 7%", "−140,00 €"]], total: ["Total a cobrar", "2.280,00 €"] },
      { t: "tip", text: "Usa la calculadora de IVA e IRPF de Facturo para comprobar cualquier importe, o para saber cuánto facturar si quieres cobrar una cantidad concreta." },
      { t: "h2", text: "¿Qué pasa después con la retención?" },
      { t: "p", text: "Tu cliente la ingresa en Hacienda con su modelo 111. Tú la restas en tus pagos fraccionados (modelo 130) y en la declaración anual de la renta. Si te han retenido más de lo que te corresponde pagar, Hacienda te lo devuelve." },
    ],
    cta: { text: "Calcular mi factura", to: "/calculadora-iva-irpf" },
  },
  {
    slug: "modelo-303-iva-trimestral",
    title: "Modelo 303: cómo calcular el IVA trimestral siendo autónomo",
    description:
      "Qué es el modelo 303, plazos de presentación, cómo se calcula el IVA a pagar restando el IVA soportado y un ejemplo práctico paso a paso.",
    summary: "Plazos, cómo se calcula y un ejemplo con IVA repercutido y soportado.",
    updated: "2026-10-06",
    readMinutes: 6,
    blocks: [
      { t: "p", text: "El modelo 303 es la declaración trimestral del IVA. En ella le dices a Hacienda cuánto IVA has cobrado a tus clientes (IVA repercutido) y cuánto has pagado en tus compras y gastos de la actividad (IVA soportado). La diferencia es lo que pagas o, si es negativa, lo que queda a tu favor." },
      { t: "h2", text: "Plazos de presentación" },
      { t: "ul", items: [
        "Primer trimestre: del 1 al 20 de abril.",
        "Segundo trimestre: del 1 al 20 de julio.",
        "Tercer trimestre: del 1 al 20 de octubre.",
        "Cuarto trimestre: del 1 al 30 de enero del año siguiente.",
      ] },
      { t: "p", text: "Si domicilias el pago, el plazo termina unos días antes. Además, en enero se presenta el resumen anual del IVA (modelo 390), salvo en los casos en que no es obligatorio." },
      { t: "h2", text: "Cómo se calcula" },
      { t: "ol", items: [
        "Suma el IVA de todas las facturas emitidas en el trimestre (repercutido).",
        "Suma el IVA de las facturas de gastos deducibles de tu actividad (soportado).",
        "Resta: IVA repercutido − IVA soportado = resultado del modelo 303.",
      ] },
      { t: "example", title: "Ejemplo de un trimestre", rows: [["IVA repercutido (facturas por 9.000 € de base al 21%)", "1.890,00 €"], ["IVA soportado (gastos por 1.500 € de base al 21%)", "−315,00 €"]], total: ["A ingresar", "1.575,00 €"] },
      { t: "h2", text: "¿Y si sale negativo?" },
      { t: "p", text: "Si en un trimestre has soportado más IVA del que has cobrado, el resultado queda «a compensar» en los siguientes trimestres. Solo en la declaración del último trimestre puedes elegir entre seguir compensando o pedir la devolución." },
      { t: "tip", text: "El panel de Facturo te muestra en cada trimestre el IVA que has cobrado, para que lo reserves y no te lleves sorpresas al presentar el 303." },
      { t: "h2", text: "Consejo práctico" },
      { t: "p", text: "El IVA que cobras no es tuyo: es de Hacienda. Muchos autónomos lo apartan en una cuenta separada cada vez que cobran una factura. Así, cuando llega el plazo, el dinero ya está ahí." },
    ],
    cta: { text: "Ver mi resumen trimestral", to: "/app" },
  },
  {
    slug: "modelo-130-pago-fraccionado",
    title: "Modelo 130: el pago fraccionado del IRPF explicado con un ejemplo",
    description:
      "Quién debe presentar el modelo 130, cómo se calcula el 20% del rendimiento, cómo restar las retenciones y cuándo no es obligatorio presentarlo.",
    summary: "Quién lo presenta, cómo se calcula el 20% y cuándo estás exento.",
    updated: "2026-10-06",
    readMinutes: 5,
    blocks: [
      { t: "p", text: "El modelo 130 es un adelanto trimestral de tu IRPF para autónomos en estimación directa. En lugar de pagar todo el impuesto en la declaración de la renta, vas pagando una parte cada trimestre según lo que ganas." },
      { t: "h2", text: "¿Quién tiene que presentarlo?" },
      { t: "p", text: "Los autónomos en estimación directa. Sin embargo, los profesionales no están obligados si en el año anterior al menos el 70% de sus ingresos tuvo retención de IRPF. Por eso muchos freelance que trabajan sobre todo para empresas no lo presentan." },
      { t: "h2", text: "Cómo se calcula" },
      { t: "ol", items: [
        "Calcula el rendimiento neto acumulado del año: ingresos menos gastos deducibles desde el 1 de enero.",
        "Aplica el 20% a ese rendimiento.",
        "Resta los pagos fraccionados de trimestres anteriores del mismo año.",
        "Resta las retenciones que te han practicado en el año.",
      ] },
      { t: "example", title: "Ejemplo del primer trimestre", rows: [["Ingresos del trimestre", "8.000,00 €"], ["Gastos deducibles", "−2.000,00 €"], ["Rendimiento neto", "6.000,00 €"], ["20% del rendimiento", "1.200,00 €"], ["Retenciones soportadas", "−450,00 €"]], total: ["A ingresar", "750,00 €"] },
      { t: "p", text: "Los plazos son los mismos que los del modelo 303: del 1 al 20 de abril, julio y octubre, y del 1 al 30 de enero." },
      { t: "tip", text: "Facturo te muestra una estimación del pago fraccionado de cada trimestre, a partir de tus facturas. Recuerda que no incluye los gastos deducibles, así que el importe real será menor si tienes gastos." },
    ],
    cta: { text: "Ver mi estimación trimestral", to: "/app" },
  },
  {
    slug: "facturar-clientes-extranjero",
    title: "Cómo facturar a clientes extranjeros: UE y fuera de la UE",
    description:
      "Cómo hacer una factura a una empresa de otro país siendo autónomo: inversión del sujeto pasivo, ROI, VIES, modelo 349 y clientes fuera de la UE.",
    summary: "Inversión del sujeto pasivo, ROI, VIES y clientes fuera de la UE.",
    updated: "2026-10-06",
    readMinutes: 6,
    blocks: [
      { t: "p", text: "Trabajar para clientes de otros países es cada vez más habitual entre freelance. La buena noticia es que la factura es igual de sencilla; solo cambian el IVA y alguna mención obligatoria." },
      { t: "h2", text: "Empresas de la Unión Europea" },
      { t: "p", text: "Si prestas servicios a una empresa o profesional de otro país de la UE, la factura va sin IVA. Es el cliente quien declara el IVA en su país: es la llamada inversión del sujeto pasivo." },
      { t: "ol", items: [
        "Date de alta en el Registro de Operadores Intracomunitarios (ROI) con el modelo 036.",
        "Comprueba que el número de IVA de tu cliente es válido en el sistema VIES de la Comisión Europea.",
        "Emite la factura con IVA 0% e incluye la mención «Operación con inversión del sujeto pasivo».",
        "Declara estas operaciones en el modelo 349 y en tu modelo 303.",
      ] },
      { t: "h2", text: "Clientes fuera de la UE" },
      { t: "p", text: "Los servicios que prestas a empresas de fuera de la UE (Estados Unidos, Reino Unido, Suiza…) normalmente no están sujetos al IVA español por las reglas de localización. La factura va sin IVA e indicando que la operación no está sujeta." },
      { t: "h2", text: "¿Y la retención de IRPF?" },
      { t: "p", text: "Los clientes extranjeros no aplican retención en España, así que tus facturas para ellos van sin retención. Ten en cuenta que, al no adelantar IRPF, es posible que tengas que presentar el modelo 130." },
      { t: "h2", text: "Clientes particulares de otros países" },
      { t: "p", text: "Si tu cliente es un particular de la UE, en general se aplica el IVA español. Hay reglas especiales para servicios digitales, telecomunicaciones o formación online a particulares de otros países, que pueden obligar a aplicar el IVA del país del cliente." },
      { t: "tip", text: "En Facturo elige IVA 0% e IRPF «sin retención» y escribe la mención correspondiente en el campo de notas. Puedes cambiar la moneda en Ajustes si cobras en dólares o libras." },
    ],
    cta: { text: "Crear factura internacional", to: "/app/nuevo/factura" },
  },
];

export const findGuide = (slug?: string) => guides.find((g) => g.slug === slug);
