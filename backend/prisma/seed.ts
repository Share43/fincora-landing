import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dateES(dd: number, mm: number, yyyy: number): Date {
  return new Date(yyyy, mm - 1, dd);
}

function parseDDMMYYYY(s: string): Date {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
}

const MES: Record<string, number> = {
  Ene: 1, Feb: 2, Mar: 3, Abr: 4, May: 5, Jun: 6,
  Jul: 7, Ago: 8, Sep: 9, Oct: 10, Nov: 11, Dic: 12,
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Iniciando seed…");

  // ── Admin ──────────────────────────────────────────────────────────────────
  let admin = await prisma.administrator.findUnique({ where: { email: "admin@fincora.es" } });
  if (!admin) {
    admin = await prisma.administrator.create({
      data: {
        email: "admin@fincora.es",
        name: "Miguel García",
        passwordHash: await bcrypt.hash("password123", 10),
      },
    });
    console.log("  ✓ Admin creado: admin@fincora.es / password123");
  } else {
    console.log("  · Admin ya existía, reutilizando.");
  }

  // ── Comunidades ────────────────────────────────────────────────────────────
  const commDefs = [
    { slug: "goya",        name: "Comunidad Goya",        address: "C/ Goya 47, Madrid 28001",                    president: "Antonio Ruiz Moreno" },
    { slug: "espana",      name: "Comunidad Plaza España", address: "Plaza de España 3, Madrid 28008",             president: "Carmen Vidal López" },
    { slug: "velazquez",   name: "Comunidad Velázquez",    address: "C/ Velázquez 12, Madrid 28001",               president: "Ramón Martínez Gil" },
    { slug: "serrano",     name: "Comunidad Serrano",      address: "C/ Serrano 84, Madrid 28006",                 president: "Isabel Fernández Mora" },
    { slug: "alcala",      name: "Comunidad Alcalá",       address: "C/ Alcalá 203, Madrid 28028",                 president: "Jorge Blanco Herrera" },
    { slug: "castellana",  name: "Comunidad Castellana",   address: "Paseo de la Castellana 142, Madrid 28046",    president: "María José Pardo Ruiz" },
    { slug: "hortaleza",   name: "Comunidad Hortaleza",    address: "C/ Bergara 12, Madrid 28033",                 president: "Francisco Molina Vega" },
    { slug: "retiro",      name: "Comunidad Retiro",       address: "C/ Ibiza 34, Madrid 28009",                   president: "Concepción Aranda Torres" },
    { slug: "chamberi",    name: "Comunidad Chamberí",     address: "C/ Fuencarral 89, Madrid 28004",              president: "Pedro Iglesias Santos" },
    { slug: "lavapies",    name: "Comunidad Lavapiés",     address: "C/ Embajadores 55, Madrid 28012",             president: "Ana Belén Cruz Díaz" },
    { slug: "salamanca",   name: "Comunidad Salamanca",    address: "C/ Príncipe de Vergara 18, Madrid 28001",     president: "Guillermo Ortega Leal" },
    { slug: "moratalaz",   name: "Comunidad Moratalaz",    address: "C/ Arroyo Fontarrón 4, Madrid 28030",         president: "Luisa Ramos Peña" },
  ] as const;

  // Upsert communities and keep a slug→id map
  const commMap: Record<string, string> = {};
  for (const c of commDefs) {
    const existing = await prisma.community.findUnique({ where: { slug: c.slug } });
    const comm = existing
      ? existing
      : await prisma.community.create({
          data: { slug: c.slug, name: c.name, address: c.address, adminId: admin.id },
        });
    commMap[c.slug] = comm.id;

    // President resident
    const hasPresident = await prisma.resident.findFirst({
      where: { communityId: comm.id, isPresident: true },
    });
    if (!hasPresident) {
      await prisma.resident.create({
        data: {
          name: c.president,
          communityId: comm.id,
          unit: "Pres.",
          isPresident: true,
        },
      });
    }
  }
  console.log(`  ✓ ${commDefs.length} comunidades upserted`);

  // ── Incidencias ────────────────────────────────────────────────────────────
  const incDefs = [
    {
      ref: "INC-2026-047", commSlug: "goya",
      title: "Ascensor parado — planta 3",
      description: "El ascensor lleva parado desde el lunes. Thyssenkrupp revisó: motor de tracción averiado, pieza en pedido. Vecina del 4ºB con movilidad reducida — situación prioritaria.",
      status: "IN_PROGRESS", priority: "URGENT",
      createdAt: parseDDMMYYYY("08/03/2026"),
    },
    {
      ref: "INC-2026-031", commSlug: "espana",
      title: "Fuga de agua en garaje — sótano 1",
      description: "Fuga detectada en sótano 1, zona de plazas 12-18. Fontanería López localizó junta de tubería principal fisurada. Presupuesto recibido: 680€. Pendiente aprobación junta.",
      status: "IN_PROGRESS", priority: "HIGH",
      createdAt: parseDDMMYYYY("05/03/2026"),
    },
    {
      ref: "INC-2026-048", commSlug: "velazquez",
      title: "Luminaria portal — fallo alumbrado",
      description: "La luminaria del portal principal lleva 2 días sin funcionar. Electricidad Martín viene a revisar. Posible fallo del sensor de movimiento o de la bombilla LED.",
      status: "IN_PROGRESS", priority: "MEDIUM",
      createdAt: parseDDMMYYYY("09/03/2026"),
    },
    {
      ref: "INC-2026-018", commSlug: "goya",
      title: "Pintura zonas comunes — presupuesto pendiente",
      description: "Zonas comunes (portal, rellanos y escalera) necesitan repintura completa. Presupuestos recibidos: Pinturas Castellana 4.200€, Reformas Madrid 3.850€. Pendiente votación en junta del 15 de marzo.",
      status: "OPEN", priority: "MEDIUM",
      createdAt: parseDDMMYYYY("25/02/2026"),
    },
    {
      ref: "INC-2026-022", commSlug: "goya",
      title: "Tejado — revisión general",
      description: "Revisión periódica del tejado. El presidente solicita inspección antes de la temporada de lluvias. Cubiertas Madrid ha confirmado visita para la semana del 18.",
      status: "OPEN", priority: "MEDIUM",
      createdAt: parseDDMMYYYY("01/03/2026"),
    },
    {
      ref: "INC-2026-039", commSlug: "serrano",
      title: "Humedad en fachada — plantas 3 y 4",
      description: "Manchas de humedad por filtración en fachada exterior, plantas 3 y 4. Rehabilitaciones Norte detecta fallo en junta de ventana. Presupuesto pendiente.",
      status: "IN_PROGRESS", priority: "HIGH",
      createdAt: parseDDMMYYYY("02/03/2026"),
    },
    {
      ref: "INC-2026-011", commSlug: "serrano",
      title: "Puerta garaje — motor averiado",
      description: "Motor de puerta garaje bloqueado. Automatismos García realizó sustitución de motor en 24h. Incidencia resuelta. Garantía 2 años.",
      status: "RESOLVED", priority: "MEDIUM",
      createdAt: parseDDMMYYYY("18/02/2026"),
    },
    {
      ref: "INC-2026-052", commSlug: "alcala",
      title: "Pintada en portal — limpieza urgente",
      description: "Pintada en puerta principal y buzones. Limpiezas García realizó limpieza especializada en 24h con producto especializado. Resultado satisfactorio.",
      status: "RESOLVED", priority: "MEDIUM",
      createdAt: parseDDMMYYYY("10/03/2026"),
    },
    {
      ref: "INC-2026-041", commSlug: "castellana",
      title: "Cuadro eléctrico — interruptores obsoletos",
      description: "Cuadro eléctrico principal con interruptores de más de 20 años. Electricidad Martín recomienda sustitución completa. Presupuesto: 3.200€. Pendiente votación en junta extraordinaria del 5 de abril.",
      status: "OPEN", priority: "HIGH",
      createdAt: parseDDMMYYYY("05/03/2026"),
    },
    {
      ref: "INC-2026-033", commSlug: "castellana",
      title: "Ascensor — revisión ITV obligatoria",
      description: "ITV del ascensor principal vence el 31 de marzo. Thyssenkrupp detecta necesidad de sustituir cables de tracción antes de la revisión oficial. Coste estimado: 890€.",
      status: "IN_PROGRESS", priority: "URGENT",
      createdAt: parseDDMMYYYY("01/03/2026"),
    },
    {
      ref: "INC-2026-049", commSlug: "castellana",
      title: "Filtración cubierta — ático 10ºA",
      description: "Vecino del 10ºA reporta manchas de humedad en techo tras las lluvias. Cubiertas Madrid detecta membrana impermeabilizante deteriorada. Reparación programada semana del 18 mar. Coste 480€.",
      status: "IN_PROGRESS", priority: "HIGH",
      createdAt: parseDDMMYYYY("08/03/2026"),
    },
    {
      ref: "INC-2026-061", commSlug: "retiro",
      title: "Cerradura portal — forzada",
      description: "Cerradura del portal principal forzada por intento de robo. Cerrajería 24h intervino de urgencia y sustituyó bombo con sistema de seguridad mejorado.",
      status: "RESOLVED", priority: "URGENT",
      createdAt: parseDDMMYYYY("14/03/2026"),
    },
    {
      ref: "INC-2026-053", commSlug: "retiro",
      title: "Piscina comunitaria — revisión apertura",
      description: "Preparación apertura piscina para temporada. AquaService revisa instalaciones, depuradora y tratamiento de agua. Presupuesto mantenimiento temporada: 1.840€. Pendiente aprobación antes del 15 de abril.",
      status: "OPEN", priority: "MEDIUM",
      createdAt: parseDDMMYYYY("10/03/2026"),
    },
    {
      ref: "INC-2026-057", commSlug: "chamberi",
      title: "Calefacción central — avería caldera",
      description: "Caldera central sin servicio desde el miércoles. 44 vecinos sin calefacción ni agua caliente. Calderas Ibérica diagnostica fallo en quemador. Pieza en pedido urgente. Llegada prevista lunes 16.",
      status: "IN_PROGRESS", priority: "URGENT",
      createdAt: parseDDMMYYYY("12/03/2026"),
    },
    {
      ref: "INC-2026-021", commSlug: "salamanca",
      title: "Revisión ITE — inspección técnica edificio",
      description: "ITE del edificio vence en junio 2026. Arquitectura & Consultoría redacta informe. Deficiencias leves en fachada y canalones, sin riesgo inmediato. Presupuesto subsanación: 4.600€. A votar en junta de abril.",
      status: "OPEN", priority: "HIGH",
      createdAt: parseDDMMYYYY("28/02/2026"),
    },
    {
      ref: "INC-2026-055", commSlug: "moratalaz",
      title: "Alumbrado garaje — 6 luminarias fundidas",
      description: "6 de 14 luminarias del garaje soterrado fundidas. Electricidad Martín realiza sustitución completa con LED de bajo consumo. Visita programada martes 17 de marzo.",
      status: "IN_PROGRESS", priority: "MEDIUM",
      createdAt: parseDDMMYYYY("11/03/2026"),
    },
    {
      ref: "INC-2026-028", commSlug: "moratalaz",
      title: "Zona ajardinada — mantenimiento anual",
      description: "Inicio de temporada primavera. Jardinería Verde Madrid debe presentar propuesta de mantenimiento anual para zona ajardinada comunitaria (poda, siembra, riego automático).",
      status: "OPEN", priority: "MEDIUM",
      createdAt: parseDDMMYYYY("01/03/2026"),
    },
  ];

  for (const inc of incDefs) {
    const exists = await prisma.incident.findFirst({
      where: { communityId: commMap[inc.commSlug], title: inc.title },
    });
    if (!exists) {
      await prisma.incident.create({
        data: {
          title: inc.title,
          description: inc.description,
          status: inc.status,
          priority: inc.priority,
          communityId: commMap[inc.commSlug],
          createdAt: inc.createdAt,
        },
      });
    }
  }
  console.log(`  ✓ ${incDefs.length} incidencias upserted`);

  // ── Documentos ─────────────────────────────────────────────────────────────
  const docDefs = [
    { commSlug: "goya",       title: "Acta junta ordinaria — feb 2026",               category: "MINUTES",  fileUrl: "/docs/d1-acta-goya-feb2026.pdf",            fecha: parseDDMMYYYY("10/03/2026") },
    { commSlug: "goya",       title: "Contrato mantenimiento ascensor — Thyssenkrupp", category: "OTHER",    fileUrl: "/docs/d2-contrato-ascensor-goya.pdf",        fecha: parseDDMMYYYY("01/01/2026") },
    { commSlug: "goya",       title: "Póliza seguro comunidad 2025-2026 — Mapfre",     category: "OTHER",    fileUrl: "/docs/d3-poliza-mapfre-goya.pdf",            fecha: parseDDMMYYYY("01/07/2025") },
    { commSlug: "goya",       title: "Presupuesto pintura zonas comunes — Reformas Madrid", category: "BUDGETS", fileUrl: "/docs/d7-presupuesto-pintura-goya.pdf",   fecha: parseDDMMYYYY("28/02/2026") },
    { commSlug: "espana",     title: "Presupuesto fontanería — fuga garaje",           category: "BUDGETS",  fileUrl: "/docs/d4-presupuesto-fontaneria-espana.pdf", fecha: parseDDMMYYYY("05/03/2026") },
    { commSlug: "espana",     title: "Acta junta extraordinaria — ene 2026",           category: "MINUTES",  fileUrl: "/docs/d5-acta-espana-ene2026.pdf",           fecha: parseDDMMYYYY("20/01/2026") },
    { commSlug: "espana",     title: "Póliza seguro comunidad 2025-2026 — Allianz",    category: "OTHER",    fileUrl: "/docs/d8-poliza-allianz-espana.pdf",         fecha: parseDDMMYYYY("01/09/2025") },
    { commSlug: "velazquez",  title: "Contrato mantenimiento eléctrico — Electricidad Martín", category: "OTHER", fileUrl: "/docs/d6-contrato-electrico-velazquez.pdf", fecha: parseDDMMYYYY("15/02/2026") },
    { commSlug: "velazquez",  title: "Contrato limpieza 2025-2026 — Limpiezas García", category: "OTHER",    fileUrl: "/docs/d9-contrato-limpieza-velazquez.pdf",   fecha: parseDDMMYYYY("01/04/2025") },
    { commSlug: "serrano",    title: "Póliza seguro — Serrano 84 (Mapfre)",            category: "OTHER",    fileUrl: "/docs/d10-poliza-mapfre-serrano.pdf",        fecha: parseDDMMYYYY("01/06/2025") },
    { commSlug: "serrano",    title: "Presupuesto fachada — humedades plantas 3 y 4",  category: "BUDGETS",  fileUrl: "/docs/d11-presupuesto-fachada-serrano.pdf",  fecha: parseDDMMYYYY("10/03/2026") },
    { commSlug: "alcala",     title: "Acta junta ordinaria — mar 2026",                category: "MINUTES",  fileUrl: "/docs/d12-acta-alcala-mar2026.pdf",          fecha: parseDDMMYYYY("20/03/2026") },
    { commSlug: "castellana", title: "Presupuesto cuadro eléctrico — Electricidad Martín", category: "BUDGETS", fileUrl: "/docs/d13-presupuesto-cuadro-castellana.pdf", fecha: parseDDMMYYYY("06/03/2026") },
    { commSlug: "castellana", title: "Contrato ascensores (×3) — Thyssenkrupp",        category: "OTHER",    fileUrl: "/docs/d14-contrato-ascensores-castellana.pdf", fecha: parseDDMMYYYY("01/01/2026") },
    { commSlug: "hortaleza",  title: "Póliza seguro — Bergara 12 (Allianz)",           category: "OTHER",    fileUrl: "/docs/d15-poliza-allianz-hortaleza.pdf",     fecha: parseDDMMYYYY("01/09/2025") },
    { commSlug: "retiro",     title: "Acta junta ordinaria — ene 2026",                category: "MINUTES",  fileUrl: "/docs/d16-acta-retiro-ene2026.pdf",          fecha: parseDDMMYYYY("15/01/2026") },
    { commSlug: "retiro",     title: "Presupuesto mantenimiento piscina — AquaService", category: "BUDGETS",  fileUrl: "/docs/d17-presupuesto-piscina-retiro.pdf",  fecha: parseDDMMYYYY("13/03/2026") },
    { commSlug: "chamberi",   title: "Contrato mantenimiento caldera — Calderas Ibérica", category: "OTHER", fileUrl: "/docs/d18-contrato-caldera-chamberi.pdf",   fecha: parseDDMMYYYY("01/10/2025") },
    { commSlug: "salamanca",  title: "Informe ITE preliminar — Arquitectura & Consultoría", category: "OTHER", fileUrl: "/docs/d19-ite-salamanca.pdf",             fecha: parseDDMMYYYY("04/03/2026") },
    { commSlug: "salamanca",  title: "Póliza seguro — Príncipe Vergara 18 (Mapfre)",   category: "OTHER",    fileUrl: "/docs/d20-poliza-mapfre-salamanca.pdf",      fecha: parseDDMMYYYY("01/07/2025") },
    { commSlug: "moratalaz",  title: "Acta junta ordinaria — oct 2025",                category: "MINUTES",  fileUrl: "/docs/d21-acta-moratalaz-oct2025.pdf",       fecha: parseDDMMYYYY("02/10/2025") },
  ];

  for (const doc of docDefs) {
    const exists = await prisma.document.findFirst({
      where: { communityId: commMap[doc.commSlug], title: doc.title },
    });
    if (!exists) {
      await prisma.document.create({
        data: {
          title: doc.title,
          category: doc.category,
          fileUrl: doc.fileUrl,
          communityId: commMap[doc.commSlug],
          createdAt: doc.fecha,
        },
      });
    }
  }
  console.log(`  ✓ ${docDefs.length} documentos upserted`);

  // ── Juntas ─────────────────────────────────────────────────────────────────
  type JuntaDef = {
    commSlug: string;
    title: string;
    type: "ORDINARY" | "EXTRAORDINARY";
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
    date: Date;
    location?: string;
  };

  const juntaDefs: JuntaDef[] = [
    // goya
    { commSlug: "goya",       title: "Junta Ordinaria — mar 2026",           type: "ORDINARY",     status: "SCHEDULED",  date: dateES(15, 3, 2026),  location: "Sala comunitaria · 19:00h" },
    { commSlug: "goya",       title: "Junta Ordinaria — feb 2026",           type: "ORDINARY",     status: "COMPLETED",  date: dateES(10, 2, 2026) },
    // espana
    { commSlug: "espana",     title: "Junta Extraordinaria — mar 2026",      type: "EXTRAORDINARY", status: "SCHEDULED", date: dateES(22, 3, 2026),  location: "Videoconferencia · 18:30h" },
    { commSlug: "espana",     title: "Junta Extraordinaria — ene 2026",      type: "EXTRAORDINARY", status: "COMPLETED", date: dateES(20, 1, 2026) },
    // velazquez
    { commSlug: "velazquez",  title: "Junta Ordinaria — mar 2026",           type: "ORDINARY",     status: "SCHEDULED",  date: dateES(29, 3, 2026),  location: "Sala comunitaria · 18:00h" },
    { commSlug: "velazquez",  title: "Junta Ordinaria — dic 2025",           type: "ORDINARY",     status: "COMPLETED",  date: dateES(10, 12, 2025) },
    // serrano
    { commSlug: "serrano",    title: "Junta Ordinaria — abr 2026",           type: "ORDINARY",     status: "SCHEDULED",  date: dateES(10, 4, 2026),  location: "Sala comunitaria · 19:30h" },
    { commSlug: "serrano",    title: "Junta Ordinaria — oct 2025",           type: "ORDINARY",     status: "COMPLETED",  date: dateES(15, 10, 2025) },
    // alcala
    { commSlug: "alcala",     title: "Junta Ordinaria — mar 2026",           type: "ORDINARY",     status: "COMPLETED",  date: dateES(20, 3, 2026),  location: "Sala comunitaria · 18:00h" },
    // castellana
    { commSlug: "castellana", title: "Junta Extraordinaria — abr 2026",      type: "EXTRAORDINARY", status: "SCHEDULED", date: dateES(5, 4, 2026),   location: "Videoconferencia · 17:00h" },
    { commSlug: "castellana", title: "Junta Ordinaria — feb 2026",           type: "ORDINARY",     status: "COMPLETED",  date: dateES(28, 2, 2026) },
    // hortaleza
    { commSlug: "hortaleza",  title: "Junta Ordinaria — may 2026",           type: "ORDINARY",     status: "SCHEDULED",  date: dateES(8, 5, 2026),   location: "Sala comunitaria · 19:00h" },
    // retiro
    { commSlug: "retiro",     title: "Junta Ordinaria — abr 2026",           type: "ORDINARY",     status: "SCHEDULED",  date: dateES(18, 4, 2026),  location: "Sala comunitaria · 19:00h" },
    // chamberi
    { commSlug: "chamberi",   title: "Junta Ordinaria — mar 2026",           type: "ORDINARY",     status: "COMPLETED",  date: dateES(28, 3, 2026) },
    // lavapies
    { commSlug: "lavapies",   title: "Junta Ordinaria — jun 2026",           type: "ORDINARY",     status: "SCHEDULED",  date: dateES(12, 6, 2026),  location: "Sala comunitaria · 19:00h" },
    // salamanca
    { commSlug: "salamanca",  title: "Junta Ordinaria — abr 2026",           type: "ORDINARY",     status: "SCHEDULED",  date: dateES(24, 4, 2026),  location: "Sala comunitaria · 19:30h" },
    { commSlug: "salamanca",  title: "Junta Ordinaria — nov 2025",           type: "ORDINARY",     status: "COMPLETED",  date: dateES(14, 11, 2025) },
    // moratalaz
    { commSlug: "moratalaz",  title: "Junta Ordinaria — abr 2026",           type: "ORDINARY",     status: "SCHEDULED",  date: dateES(3, 4, 2026),   location: "Sala comunitaria · 18:30h" },
    { commSlug: "moratalaz",  title: "Junta Ordinaria — oct 2025",           type: "ORDINARY",     status: "COMPLETED",  date: dateES(2, 10, 2025) },
  ];

  for (const j of juntaDefs) {
    const exists = await prisma.meeting.findFirst({
      where: { communityId: commMap[j.commSlug], title: j.title },
    });
    if (!exists) {
      await prisma.meeting.create({
        data: {
          title: j.title,
          type: j.type,
          status: j.status,
          date: j.date,
          location: j.location ?? null,
          communityId: commMap[j.commSlug],
        },
      });
    }
  }
  console.log(`  ✓ ${juntaDefs.length} juntas upserted`);

  // ── Resumen ────────────────────────────────────────────────────────────────
  const counts = await Promise.all([
    prisma.community.count(),
    prisma.incident.count(),
    prisma.document.count(),
    prisma.meeting.count(),
    prisma.resident.count(),
  ]);
  console.log(`\n✅ Seed completado:`);
  console.log(`   · ${counts[0]} comunidades`);
  console.log(`   · ${counts[4]} residentes / presidentes`);
  console.log(`   · ${counts[1]} incidencias`);
  console.log(`   · ${counts[2]} documentos`);
  console.log(`   · ${counts[3]} juntas`);
  console.log(`\n   Login: admin@fincora.es / password123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
