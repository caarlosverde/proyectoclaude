/** Páginas «Factura para…»: una por profesión, pensadas para búsquedas concretas. */
export interface ProfessionLine {
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
}

export interface Profession {
  slug: string;
  /** «diseñadores» */
  plural: string;
  /** «diseñador gráfico» */
  singular: string;
  title: string;
  description: string;
  intro: string;
  vat: number;
  irpf: number;
  lines: ProfessionLine[];
  taxes: { title: string; text: string }[];
  tips: string[];
  faqs: { q: string; a: string }[];
}

export const professions: Profession[] = [
  {
    slug: "disenadores",
    plural: "diseñadores",
    singular: "diseñador gráfico",
    title: "Factura para diseñadores gráficos y freelance creativos",
    description:
      "Crea gratis facturas y presupuestos de diseño gráfico con IVA e IRPF calculados. Ejemplo de factura de diseñador y qué impuestos aplicar.",
    intro:
      "Identidad visual, maquetación, ilustración o diseño web: factura tus proyectos creativos con una imagen tan cuidada como tu trabajo, y sin pelearte con la retención.",
    vat: 21,
    irpf: 15,
    lines: [
      { description: "Diseño de identidad visual (logotipo y manual de marca)", quantity: 1, unitPrice: 1200, vat: 21 },
      { description: "Diseño de cartelería para campaña", quantity: 3, unitPrice: 180, vat: 21 },
      { description: "Ronda adicional de cambios", quantity: 2, unitPrice: 60, vat: 21 },
    ],
    taxes: [
      { title: "IVA del 21%", text: "Los servicios de diseño tributan al tipo general. Si trabajas para una empresa de otro país de la UE, la factura va sin IVA por inversión del sujeto pasivo." },
      { title: "Retención del 15% (o 7%)", text: "Si estás dado de alta como profesional y facturas a empresas o autónomos, aplica un 15% de IRPF. El año en que empiezas y los dos siguientes puedes aplicar el 7%. A particulares no se retiene." },
    ],
    tips: [
      "Divide los proyectos grandes en fases (propuesta, desarrollo, entrega) y factura cada una: cobras antes y reduces riesgo.",
      "Deja claro en el presupuesto cuántas rondas de cambios incluye el precio y cuánto cuesta cada ronda extra.",
      "Indica en las notas la cesión de derechos de uso de los diseños, y si es exclusiva o no.",
    ],
    faqs: [
      { q: "¿Tengo que poner retención si facturo a una agencia?", a: "Sí, si estás en una actividad profesional y la agencia es una empresa o un autónomo, aplica la retención del 15% (o del 7% si eres nuevo autónomo)." },
      { q: "¿Puedo facturar el diseño y la impresión en la misma factura?", a: "Sí, en líneas separadas. Ten en cuenta que la impresión suele ser actividad empresarial y no lleva retención; si es tu caso, consúltalo con tu asesor." },
    ],
  },
  {
    slug: "programadores",
    plural: "programadores",
    singular: "programador o desarrollador",
    title: "Factura para programadores y desarrolladores freelance",
    description:
      "Plantilla de factura para programadores autónomos: horas, proyectos y mantenimiento con IVA e IRPF automáticos. Incluye cómo facturar a clientes extranjeros.",
    intro:
      "Proyectos cerrados, bolsas de horas o mantenimiento mensual: crea facturas claras para tus clientes, también si están fuera de España.",
    vat: 21,
    irpf: 15,
    lines: [
      { description: "Desarrollo de aplicación web (sprint 1)", quantity: 1, unitPrice: 2400, vat: 21 },
      { description: "Horas de consultoría técnica", quantity: 8, unitPrice: 55, vat: 21 },
      { description: "Mantenimiento y hosting mensual", quantity: 1, unitPrice: 90, vat: 21 },
    ],
    taxes: [
      { title: "IVA del 21%", text: "Para clientes en España. A empresas de otros países de la UE con NIF-IVA válido se factura sin IVA (inversión del sujeto pasivo) y fuera de la UE la operación normalmente no está sujeta a IVA español." },
      { title: "Retención del 15% (o 7%)", text: "Solo cuando el cliente es una empresa o autónomo en España. A clientes extranjeros no se les aplica retención." },
    ],
    tips: [
      "Si cobras por horas, detalla el periodo y las horas en la descripción: evita discusiones y agiliza el pago.",
      "Para mantenimientos mensuales, duplica la factura del mes anterior y cambia solo la fecha.",
      "Antes de facturar sin IVA a una empresa de la UE, comprueba su NIF-IVA en el sistema VIES y date de alta en el ROI.",
    ],
    faqs: [
      { q: "¿Cómo facturo a una empresa de Estados Unidos?", a: "Sin IVA español (operación no sujeta por reglas de localización) y sin retención de IRPF. En Facturo elige IVA 0% e IRPF «sin retención», e indica el motivo en las notas." },
      { q: "¿Puedo facturar en dólares?", a: "Sí, puedes elegir la moneda en Ajustes. Para tu contabilidad en España tendrás que registrar el importe equivalente en euros." },
    ],
  },
  {
    slug: "fotografos",
    plural: "fotógrafos",
    singular: "fotógrafo",
    title: "Factura para fotógrafos: bodas, eventos y sesiones",
    description:
      "Crea facturas y presupuestos de fotografía gratis. Qué IVA llevan las sesiones y reportajes y cuándo aplicar retención de IRPF siendo fotógrafo.",
    intro:
      "Bodas, producto, eventos o sesiones de retrato: presupuesta, cobra la reserva y factura el resto sin errores.",
    vat: 21,
    irpf: 0,
    lines: [
      { description: "Reportaje fotográfico de boda (8 horas)", quantity: 1, unitPrice: 1500, vat: 21 },
      { description: "Álbum impreso 30x30", quantity: 1, unitPrice: 320, vat: 21 },
      { description: "Desplazamiento", quantity: 120, unitPrice: 0.3, vat: 21 },
    ],
    taxes: [
      { title: "IVA del 21%", text: "Los servicios fotográficos y los productos como álbumes o copias tributan al tipo general." },
      { title: "Retención: depende de tu alta", text: "Muchos fotógrafos están dados de alta en una actividad empresarial y no aplican retención. Si tu alta es en una actividad profesional o artística y facturas a empresas, sí debes aplicarla. Revisa tu epígrafe del IAE." },
    ],
    tips: [
      "Pide una señal al confirmar la reserva y emite la factura correspondiente; en la final descuenta lo ya cobrado.",
      "Especifica en el presupuesto número de fotos editadas, plazo de entrega y derechos de uso.",
      "Si facturas a particulares (bodas, sesiones familiares) no se aplica retención en ningún caso.",
    ],
    faqs: [
      { q: "¿Una boda lleva retención?", a: "No: los novios son particulares, y a particulares nunca se aplica retención de IRPF." },
      { q: "¿Cómo cobro la señal de reserva?", a: "Crea una factura por el importe de la señal y, al terminar el trabajo, una factura final por el resto indicando en las notas la factura de la señal." },
    ],
  },
  {
    slug: "traductores",
    plural: "traductores",
    singular: "traductor",
    title: "Factura para traductores e intérpretes autónomos",
    description:
      "Factura traducciones por palabra o por proyecto con IVA e IRPF calculados. Ejemplo de factura de traductor y cómo facturar a agencias de otros países.",
    intro:
      "Por palabra, por página o por proyecto, para agencias o clientes directos de cualquier país: tus facturas de traducción, listas en segundos.",
    vat: 21,
    irpf: 15,
    lines: [
      { description: "Traducción EN>ES manual técnico (palabras)", quantity: 6500, unitPrice: 0.08, vat: 21 },
      { description: "Revisión y control de calidad (horas)", quantity: 3, unitPrice: 35, vat: 21 },
      { description: "Recargo por entrega urgente", quantity: 1, unitPrice: 75, vat: 21 },
    ],
    taxes: [
      { title: "IVA del 21%", text: "Las traducciones tributan al tipo general. Para agencias de otros países de la UE se factura sin IVA por inversión del sujeto pasivo; fuera de la UE, normalmente no sujeto." },
      { title: "Retención del 15% (o 7%)", text: "Aplícala cuando trabajes para agencias o empresas españolas. A clientes extranjeros y particulares no se retiene." },
    ],
    tips: [
      "Usa la cantidad para el número de palabras y el precio por palabra: Facturo calcula el importe exacto.",
      "Indica el par de idiomas y el nombre del documento en la descripción para que la agencia lo asocie al pedido.",
      "Si una agencia te pide su número de pedido (PO), añádelo en las notas para cobrar antes.",
    ],
    faqs: [
      { q: "¿Las traducciones juradas llevan IVA?", a: "Sí, en general tributan al 21% como el resto de traducciones." },
      { q: "¿Puedo poner precios con tres decimales por palabra?", a: "Sí. El importe de cada línea se redondea a céntimos al calcular la factura." },
    ],
  },
  {
    slug: "consultores",
    plural: "consultores",
    singular: "consultor",
    title: "Factura para consultores y formadores autónomos",
    description:
      "Facturas de consultoría, asesoramiento y formación con IVA e IRPF. Cuándo la formación puede ir exenta de IVA y cómo facturar proyectos por fases.",
    intro:
      "Proyectos de consultoría, sesiones de mentoría o cursos para empresas: factura de forma profesional y deja claro qué incluye cada servicio.",
    vat: 21,
    irpf: 15,
    lines: [
      { description: "Diagnóstico y plan de acción (fase 1)", quantity: 1, unitPrice: 1800, vat: 21 },
      { description: "Sesiones de seguimiento", quantity: 4, unitPrice: 150, vat: 21 },
      { description: "Taller formativo para el equipo", quantity: 1, unitPrice: 600, vat: 21 },
    ],
    taxes: [
      { title: "IVA del 21% (o exento)", text: "La consultoría tributa al 21%. Algunos servicios de enseñanza pueden estar exentos de IVA (por ejemplo, la formación reglada o determinadas clases a particulares). Si es tu caso, elige IVA 0% e indica la exención en las notas." },
      { title: "Retención del 15% (o 7%)", text: "Como profesional, aplica retención cuando factures a empresas o autónomos en España." },
    ],
    tips: [
      "Envía primero un presupuesto con las fases y conviértelo en factura en cuanto el cliente lo acepte.",
      "Factura por hitos: un porcentaje al inicio y el resto al entregar.",
      "Si das formación exenta, cita en la factura el artículo de la ley del IVA que la justifica.",
    ],
    faqs: [
      { q: "¿La formación a empresas lleva IVA?", a: "Por lo general sí. La exención se limita a casos concretos, como la enseñanza reglada. Ante la duda, consulta con tu asesor." },
      { q: "¿Puedo facturar gastos de desplazamiento?", a: "Sí, añádelos como una línea más. Llevan el mismo IVA que el servicio principal." },
    ],
  },
  {
    slug: "reformas",
    plural: "fontaneros, electricistas y reformas",
    singular: "profesional de reformas",
    title: "Factura para fontaneros, electricistas y reformas",
    description:
      "Presupuestos y facturas de fontanería, electricidad y reformas. Cuándo aplicar el IVA reducido del 10% en viviendas y la retención del 1% en módulos.",
    intro:
      "Presupuesta en la propia obra, conviértelo en factura al terminar y aplica el IVA correcto en cada caso.",
    vat: 10,
    irpf: 0,
    lines: [
      { description: "Sustitución de bajantes y desagües (mano de obra)", quantity: 6, unitPrice: 38, vat: 10 },
      { description: "Material de fontanería", quantity: 1, unitPrice: 145, vat: 10 },
      { description: "Desplazamiento y retirada de escombros", quantity: 1, unitPrice: 40, vat: 10 },
    ],
    taxes: [
      { title: "IVA del 10% en viviendas", text: "Las obras de renovación y reparación de viviendas pueden tributar al 10% si el cliente es un particular que usa la vivienda, la vivienda tiene más de dos años y el material aportado no supera el 40% del total. Si no se cumplen las condiciones, se aplica el 21%." },
      { title: "Sin retención (o 1% en módulos)", text: "Los oficios son actividad empresarial: normalmente no se aplica retención. Si tributas en estimación objetiva (módulos) y facturas a una empresa, debes aplicar el 1%." },
    ],
    tips: [
      "Separa mano de obra y materiales en líneas distintas: es clave para justificar el IVA reducido.",
      "Para aplicar el 10%, pide al cliente una declaración de que la vivienda es para uso particular.",
      "Si trabajas para comunidades de propietarios o empresas, aplica el 21% salvo que se cumplan los requisitos.",
    ],
    faqs: [
      { q: "¿Cuándo aplico el 10% de IVA en una reparación?", a: "Cuando el cliente es una persona física que no actúa como empresario, la vivienda se usa como tal, tiene más de dos años y el material que aportas no supera el 40% del total." },
      { q: "¿Estoy en módulos, qué retención pongo?", a: "Un 1% cuando factures a empresas o profesionales. A particulares, ninguna." },
    ],
  },
  {
    slug: "profesores-particulares",
    plural: "profesores particulares",
    singular: "profesor particular",
    title: "Factura para profesores particulares y clases",
    description:
      "Cómo facturar clases particulares siendo autónomo: cuándo están exentas de IVA, si se aplica retención y ejemplo de factura mensual de clases.",
    intro:
      "Clases de refuerzo, idiomas, música o preparación de exámenes: factura cada mes en segundos y sin dudas sobre el IVA.",
    vat: 0,
    irpf: 0,
    lines: [
      { description: "Clases particulares de matemáticas (horas, octubre)", quantity: 8, unitPrice: 20, vat: 0 },
      { description: "Material didáctico", quantity: 1, unitPrice: 15, vat: 0 },
    ],
    taxes: [
      { title: "IVA exento en muchos casos", text: "Las clases particulares impartidas por una persona física sobre materias de los planes de estudios oficiales pueden estar exentas de IVA. Otras actividades, como clases de ocio, pueden llevar el 21%." },
      { title: "Retención solo a empresas", text: "Si facturas a familias (particulares) no se aplica retención. Si das clases a través de una academia o empresa y eres profesional, normalmente sí." },
    ],
    tips: [
      "Haz una factura mensual por alumno con las horas del mes: con «Duplicar» la preparas en segundos.",
      "Si tus clases están exentas, añade en las notas la mención a la exención del artículo 20 de la ley del IVA.",
      "Guarda los datos de cada familia en Clientes para no volver a escribirlos.",
    ],
    faqs: [
      { q: "¿Tengo que hacer factura a las familias?", a: "Sí, como autónomo debes emitir factura por tus servicios, aunque el cliente sea un particular." },
      { q: "¿Las clases de guitarra están exentas?", a: "Depende de si forman parte de planes de estudios oficiales. Consulta tu caso concreto con un asesor." },
    ],
  },
  {
    slug: "marketing",
    plural: "community managers y marketing digital",
    singular: "community manager",
    title: "Factura para community managers y marketing digital",
    description:
      "Factura tus servicios de redes sociales, SEO, publicidad y contenidos con IVA e IRPF. Ejemplo de factura mensual de community manager.",
    intro:
      "Gestión de redes, campañas, SEO o contenidos: factura tus cuotas mensuales y los extras sin perder tiempo.",
    vat: 21,
    irpf: 15,
    lines: [
      { description: "Gestión de redes sociales (cuota mensual)", quantity: 1, unitPrice: 450, vat: 21 },
      { description: "Creación de contenidos para Reels", quantity: 4, unitPrice: 60, vat: 21 },
      { description: "Gestión de campañas de publicidad", quantity: 1, unitPrice: 200, vat: 21 },
    ],
    taxes: [
      { title: "IVA del 21%", text: "Los servicios de marketing tributan al tipo general. Para empresas de otros países de la UE, sin IVA por inversión del sujeto pasivo." },
      { title: "Retención del 15% (o 7%)", text: "Si estás de alta como profesional y tus clientes son empresas o autónomos en España." },
    ],
    tips: [
      "No incluyas en tu factura la inversión publicitaria que el cliente paga directamente a la plataforma.",
      "Para cuotas mensuales, duplica la factura del mes anterior: misma descripción, nueva fecha.",
      "Detalla en el presupuesto cuántas publicaciones y qué redes incluye la cuota.",
    ],
    faqs: [
      { q: "¿Facturo la inversión en anuncios?", a: "Si la pagas tú y luego la repercutes, sí, como una línea más. Si la paga el cliente directamente a la plataforma, no." },
      { q: "¿Qué retención aplico si acabo de darme de alta?", a: "El 7% durante el año de alta y los dos siguientes, siempre que no hayas tenido actividad profesional el año anterior." },
    ],
  },
];

export const findProfession = (slug?: string) => professions.find((p) => p.slug === slug);
