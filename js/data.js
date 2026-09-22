export const EVENT = {
  name: "EXPO 12H",
  appName: "EXPO 12H · CONTROL CENTER",
  series: "12 HORAS ECUADOR · 2026",
  date: "2026-09-24",
  dateLabel: "24 SEP · PARQUE CÉNTRICA · IBARRA",
  location: "Parque Céntrica · Ibarra",
  expectedUrl: "https://appiba.github.io/check_list/",
  logoPrimary: "./assets/expo12h-logo-primary.png",
  logoAlt: "./assets/expo12h-logo-alt.png",
  vehicleCount: 58,
  activationCount: 26
};

export const STATUS = {
  checklist: [
    { value: "pendiente", label: "PENDIENTE" },
    { value: "en-proceso", label: "EN PROCESO" },
    { value: "completado", label: "COMPLETADO" },
    { value: "urgente", label: "URGENTE" },
    { value: "bloqueado", label: "BLOQUEADO" }
  ],
  timeline: [
    { value: "proximo", label: "PRÓXIMO" },
    { value: "en-curso", label: "EN CURSO" },
    { value: "finalizado", label: "FINALIZADO" },
    { value: "retrasado", label: "RETRASADO" }
  ],
  broadcast: [
    { value: "listo", label: "LISTO" },
    { value: "online", label: "ONLINE" },
    { value: "offline", label: "OFFLINE" },
    { value: "problema", label: "PROBLEMA" }
  ],
  incidentPriority: ["BAJA", "MEDIA", "ALTA", "CRÍTICA"],
  incidentState: ["ABIERTA", "ATENDIENDO", "RESUELTA"]
};

export const PARKING_SPOTS = {
  A: Array.from({ length: 29 }, (_, index) => `A${String(index + 1).padStart(2, "0")}`),
  B: Array.from({ length: 29 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`)
};

export const CHECKLIST_AREAS = [
  "Dirección",
  "Operación",
  "Producción Técnica",
  "Zona Fest",
  "Seguridad",
  "Montaje",
  "Vehículos",
  "Comunicación",
  "Show",
  "Foto / Video",
  "Cierre"
];

export const CHECKLIST = [
  {
    id: "direccion-briefing-responsables",
    area: "Dirección",
    title: "Briefing general de responsables",
    responsable: "Carlos Salazar",
    time: "12:00",
    priority: "alta"
  },
  {
    id: "direccion-autorizar-apertura-show",
    area: "Dirección",
    title: "Autorizar apertura e inicio del show",
    responsable: "Carlos Salazar",
    time: "17:00",
    priority: "crítica"
  },
  {
    id: "operacion-staff-puestos",
    area: "Operación",
    title: "Staff completo en puestos",
    responsable: "Franchesco Guzman",
    time: "12:40",
    priority: "alta"
  },
  {
    id: "operacion-inspeccion-montaje",
    area: "Operación",
    title: "Inspección de montaje y correcciones",
    responsable: "Franchesco Guzman",
    time: "12:00",
    priority: "alta"
  },
  {
    id: "operacion-revision-final",
    area: "Operación",
    title: "Revisión final de todas las áreas",
    responsable: "Franchesco Guzman",
    time: "16:30",
    priority: "crítica"
  },
  {
    id: "produccion-montaje-tecnico",
    area: "Producción Técnica",
    title: "Montaje técnico de audio, pantalla, video, luces y tarima",
    responsable: "Oskar Baez / DJ Fire",
    time: "11:30",
    priority: "alta"
  },
  {
    id: "produccion-prueba-audio-video-luces",
    area: "Producción Técnica",
    title: "Prueba de audio, pantalla, video y luces",
    responsable: "Oskar Baez",
    time: "16:25",
    priority: "crítica"
  },
  {
    id: "produccion-primeras-fichas",
    area: "Producción Técnica",
    title: "Primeras 3 fichas cargadas",
    responsable: "Oskar Baez",
    time: "16:40",
    priority: "alta"
  },
  {
    id: "zona-fest-derecha",
    area: "Zona Fest",
    title: "Montaje Zona Fest derecha",
    responsable: "Martin Gomezjurado",
    time: "15:30",
    priority: "media"
  },
  {
    id: "zona-fest-izquierda",
    area: "Zona Fest",
    title: "Montaje Zona Fest izquierda",
    responsable: "Martin Gomezjurado",
    time: "15:30",
    priority: "media"
  },
  {
    id: "zona-fest-mobiliario-barras",
    area: "Zona Fest",
    title: "Mobiliario, barras y servicio listos",
    responsable: "Martin Gomezjurado",
    time: "15:30",
    priority: "alta"
  },
  {
    id: "zona-fest-accesos-kits",
    area: "Zona Fest",
    title: "Accesos, kits e invitados listos",
    responsable: "Martin Gomezjurado",
    time: "16:30",
    priority: "alta"
  },
  {
    id: "seguridad-a-sector-seguro",
    area: "Seguridad",
    title: "Sector A seguro",
    responsable: "Josue",
    time: "12:40",
    priority: "crítica",
    detail: "Sector A · 3 guardias"
  },
  {
    id: "seguridad-a-vallas",
    area: "Seguridad",
    title: "Vallas verificadas en Sector A",
    responsable: "Josue",
    time: "12:40",
    priority: "alta",
    detail: "Sector A · 3 guardias"
  },
  {
    id: "seguridad-a-guardias",
    area: "Seguridad",
    title: "Guardias ubicados en Sector A",
    responsable: "Josue",
    time: "12:40",
    priority: "alta",
    detail: "Sector A · 3 guardias"
  },
  {
    id: "seguridad-a-cruces",
    area: "Seguridad",
    title: "Cruces controlados en Sector A",
    responsable: "Josue",
    time: "12:40",
    priority: "alta",
    detail: "Sector A · 3 guardias"
  },
  {
    id: "seguridad-b-sector-seguro",
    area: "Seguridad",
    title: "Sector B seguro",
    responsable: "Bryan Urbina",
    time: "12:40",
    priority: "crítica",
    detail: "Sector B · 3 guardias"
  },
  {
    id: "seguridad-b-vallas",
    area: "Seguridad",
    title: "Vallas verificadas en Sector B",
    responsable: "Bryan Urbina",
    time: "12:40",
    priority: "alta",
    detail: "Sector B · 3 guardias"
  },
  {
    id: "seguridad-b-guardias",
    area: "Seguridad",
    title: "Guardias ubicados en Sector B",
    responsable: "Bryan Urbina",
    time: "12:40",
    priority: "alta",
    detail: "Sector B · 3 guardias"
  },
  {
    id: "seguridad-b-cruces",
    area: "Seguridad",
    title: "Cruces controlados en Sector B",
    responsable: "Bryan Urbina",
    time: "12:40",
    priority: "alta",
    detail: "Sector B · 3 guardias"
  },
  {
    id: "montaje-10-carpas",
    area: "Montaje",
    title: "10 carpas instaladas",
    responsable: "Franchesco Guzman",
    time: "11:30",
    priority: "alta"
  },
  {
    id: "montaje-120-vallas",
    area: "Montaje",
    title: "120 metros de vallas instaladas",
    responsable: "Franchesco Guzman",
    time: "11:30",
    priority: "alta"
  },
  {
    id: "montaje-vallas-fijadas",
    area: "Montaje",
    title: "Vallas fijadas",
    responsable: "Franchesco Guzman",
    time: "12:00",
    priority: "alta"
  },
  {
    id: "montaje-ruta-vehicular",
    area: "Montaje",
    title: "Ruta vehicular libre",
    responsable: "Franchesco Guzman",
    time: "12:00",
    priority: "crítica"
  },
  {
    id: "montaje-ruta-peatonal",
    area: "Montaje",
    title: "Ruta peatonal libre",
    responsable: "Franchesco Guzman",
    time: "12:00",
    priority: "alta"
  },
  {
    id: "montaje-carril-vip",
    area: "Montaje",
    title: "Carril VIP libre",
    responsable: "Franchesco Guzman",
    time: "12:00",
    priority: "alta"
  },
  {
    id: "vehiculos-registro-preparado",
    area: "Vehículos",
    title: "Registro preparado",
    responsable: "Coordinador vehicular",
    time: "12:40",
    priority: "alta"
  },
  {
    id: "vehiculos-inicio-revision",
    area: "Vehículos",
    title: "Inicio revisión vehicular",
    responsable: "Coordinador vehicular",
    time: "13:00",
    priority: "alta"
  },
  {
    id: "vehiculos-lista-definitiva",
    area: "Vehículos",
    title: "Lista definitiva cerrada",
    responsable: "Coordinador vehicular",
    time: "15:30",
    priority: "crítica"
  },
  {
    id: "vehiculos-briefing-pilotos",
    area: "Vehículos",
    title: "Briefing pilotos",
    responsable: "Coordinador vehicular",
    time: "15:50",
    priority: "alta"
  },
  {
    id: "vehiculos-prueba-circulacion",
    area: "Vehículos",
    title: "Prueba circulación",
    responsable: "Coordinador vehicular",
    time: "16:10",
    priority: "crítica"
  },
  {
    id: "vehiculos-primeros-pre-grid",
    area: "Vehículos",
    title: "Primeros 3 vehículos en pre-grid",
    responsable: "Coordinador vehicular",
    time: "16:40",
    priority: "crítica"
  },
  {
    id: "comunicacion-invitados",
    area: "Comunicación",
    title: "Invitados acreditados",
    responsable: "Community manager / activaciones",
    time: "16:30",
    priority: "media"
  },
  {
    id: "comunicacion-sponsors",
    area: "Comunicación",
    title: "Sponsors acreditados",
    responsable: "Community manager / activaciones",
    time: "16:30",
    priority: "media"
  },
  {
    id: "comunicacion-kits",
    area: "Comunicación",
    title: "Kits preparados",
    responsable: "Community manager / activaciones",
    time: "16:30",
    priority: "media"
  },
  {
    id: "comunicacion-contenido-previo",
    area: "Comunicación",
    title: "Contenido previo publicado",
    responsable: "Community manager / activaciones",
    time: "14:00",
    priority: "media"
  },
  {
    id: "comunicacion-26-activaciones",
    area: "Comunicación",
    title: "26 personas de activación ubicadas",
    responsable: "Community manager / activaciones",
    time: "16:30",
    priority: "alta"
  },
  {
    id: "show-fichas-presentador",
    area: "Show",
    title: "Fichas del presentador listas",
    responsable: "Presentador",
    time: "16:40",
    priority: "alta"
  },
  {
    id: "show-orden-definitivo",
    area: "Show",
    title: "Orden definitivo",
    responsable: "Presentador",
    time: "16:40",
    priority: "crítica"
  },
  {
    id: "show-prueba-microfono",
    area: "Show",
    title: "Prueba de micrófono",
    responsable: "Oskar Baez",
    time: "16:25",
    priority: "alta"
  },
  {
    id: "show-ensayo-tiempos",
    area: "Show",
    title: "Ensayo de tiempos",
    responsable: "Presentador",
    time: "16:40",
    priority: "alta"
  },
  {
    id: "foto-video-plan-tomas",
    area: "Foto / Video",
    title: "Plan de tomas",
    responsable: "Fotografía / video",
    time: "14:00",
    priority: "media"
  },
  {
    id: "foto-video-posiciones",
    area: "Foto / Video",
    title: "Posiciones seguras",
    responsable: "Fotografía / video",
    time: "14:00",
    priority: "alta"
  },
  {
    id: "foto-video-camara-principal",
    area: "Foto / Video",
    title: "Cámara principal lista",
    responsable: "Fotografía / video",
    time: "14:00",
    priority: "alta"
  },
  {
    id: "foto-video-grabacion-vertical",
    area: "Foto / Video",
    title: "Grabación vertical lista",
    responsable: "Fotografía / video",
    time: "14:00",
    priority: "media"
  },
  {
    id: "foto-video-sponsors",
    area: "Foto / Video",
    title: "Registro sponsors",
    responsable: "Fotografía / video",
    time: "14:00",
    priority: "media"
  },
  {
    id: "foto-video-after-movie",
    area: "Foto / Video",
    title: "After Movie",
    responsable: "Fotografía / video",
    time: "19:25",
    priority: "media"
  },
  {
    id: "cierre-formacion-caravana",
    area: "Cierre",
    title: "Formación para caravana",
    responsable: "Franchesco Guzman",
    time: "19:25",
    priority: "alta"
  },
  {
    id: "cierre-inventario",
    area: "Cierre",
    title: "Inventario",
    responsable: "Martin Gomezjurado",
    time: "20:00",
    priority: "media"
  },
  {
    id: "cierre-desmontaje",
    area: "Cierre",
    title: "Desmontaje",
    responsable: "Martin Gomezjurado",
    time: "20:15",
    priority: "media"
  },
  {
    id: "cierre-liberacion-recinto",
    area: "Cierre",
    title: "Liberación del recinto",
    responsable: "Carlos Salazar",
    time: "21:00",
    priority: "alta"
  }
];

export const TIMELINE = [
  {
    id: "montaje-general",
    start: "09:00",
    end: "11:30",
    title: "MONTAJE GENERAL",
    detail: "Carpas, vallas, Zona Fest y producción técnica"
  },
  {
    id: "inspeccion-correcciones",
    start: "11:30",
    end: "12:00",
    title: "INSPECCIÓN Y CORRECCIONES",
    detail: "Revisión del montaje antes de abrir operación técnica"
  },
  {
    id: "briefing-responsables",
    start: "12:00",
    end: "12:20",
    title: "BRIEFING RESPONSABLES",
    detail: "Cadena de mando, puestos críticos y contingencias"
  },
  {
    id: "briefing-staff-seguridad",
    start: "12:20",
    end: "12:40",
    title: "BRIEFING STAFF Y SEGURIDAD",
    detail: "Asignación final de puestos, radios y recorridos"
  },
  {
    id: "apertura-tecnica-equipos",
    start: "12:40",
    end: "13:00",
    title: "APERTURA TÉCNICA PARA EQUIPOS",
    detail: "Ingreso operativo para equipos y verificación de rutas"
  },
  {
    id: "revision-vehicular",
    start: "13:00",
    end: "15:30",
    title: "REVISIÓN VEHICULAR",
    detail: "Control técnico y registro de llegada"
  },
  {
    id: "ubicacion-parqueaderos",
    start: "13:00",
    end: "15:30",
    title: "UBICACIÓN PARQUEADEROS A Y B",
    detail: "Asignación de puestos A01-A29 y B01-B29"
  },
  {
    id: "contenido-fotografia",
    start: "14:00",
    end: "15:30",
    title: "CONTENIDO Y FOTOGRAFÍA",
    detail: "Registro de sponsors, autos, pilotos y ambiente"
  },
  {
    id: "cierre-revision-lista",
    start: "15:30",
    end: "15:50",
    title: "CIERRE DE REVISIÓN Y LISTA DEFINITIVA",
    detail: "Cierre de novedades y lista oficial del show"
  },
  {
    id: "briefing-pilotos",
    start: "15:50",
    end: "16:10",
    title: "BRIEFING PILOTOS Y REPRESENTANTES",
    detail: "Orden de salida, seguridad y tiempos por vehículo"
  },
  {
    id: "prueba-audio-video-luces",
    start: "16:00",
    end: "16:25",
    title: "PRUEBA AUDIO / PANTALLA / VIDEO / LUCES",
    detail: "Chequeo integral de producción técnica"
  },
  {
    id: "prueba-circulacion",
    start: "16:10",
    end: "16:30",
    title: "PRUEBA DE CIRCULACIÓN CON 1 VEHÍCULO",
    detail: "Validación de ruta, pre-grid, tarima y salida"
  },
  {
    id: "revision-final-seguridad",
    start: "16:30",
    end: "16:40",
    title: "REVISIÓN FINAL DE SEGURIDAD",
    detail: "Puntos A/B, vallas, cruces y público"
  },
  {
    id: "pre-show",
    start: "16:40",
    end: "17:00",
    title: "PRE-SHOW",
    detail: "Primeros 3 vehículos preparados"
  },
  {
    id: "presentacion-vehiculos",
    start: "17:00",
    end: "19:25",
    title: "INICIO PRESENTACIÓN VEHÍCULOS",
    detail: "58 vehículos x 2:30 máximo = cierre teórico 19:25"
  },
  {
    id: "buffer-contingencias",
    start: "19:25",
    end: "19:45",
    title: "BUFFER / PENDIENTES / CONTINGENCIAS",
    detail: "Margen operativo para retrasos o novedades"
  },
  {
    id: "cierre-oficial",
    start: "19:45",
    end: "20:00",
    title: "CIERRE OFICIAL",
    detail: "Cierre de presentación y anuncios finales"
  },
  {
    id: "formacion-caravana",
    start: "20:00",
    end: "20:20",
    title: "FORMACIÓN Y SALIDA CARAVANA",
    detail: "Ordenamiento, salida y control de flujo"
  },
  {
    id: "desmontaje",
    start: "20:20",
    end: "21:00",
    title: "DESMONTAJE",
    detail: "Inventario, retiro de mobiliario y liberación del recinto"
  }
];

const vehicle = (numeroAuto, categoria, auto, pilotoPrincipal, ciudad = "POR CONFIRMAR") => {
  const [marca, ...modelParts] = auto.split(" ");
  return {
    id: `auto-${numeroAuto}`,
    numeroAuto: String(numeroAuto),
    categoria,
    marca,
    modelo: modelParts.join(" "),
    pilotoPrincipal,
    ciudad,
    alternante1: "",
    alternante2: "",
    alternante3: "",
    alternante4: ""
  };
};

export const VEHICLES = [
  vehicle(3, "PROTO P1", "RADICAL SR3", "Mauricio Moncayo Munive"),
  vehicle(21, "PROTO P1", "TOMISTER RP1", "Luis Videla"),
  vehicle(69, "PROTO P1", "JEC VAN DIEMEN", "Andres Serrano Velasco"),
  vehicle(90, "PROTO P1", "LIGER LMP3", "Mateo Villagomez"),
  vehicle(96, "PROTO P1", "RADICAL SR3", "Abigail Ron Portilla"),
  vehicle(99, "PROTO P1", "RADICAL PR6", "Xavier Villagomez Vera"),
  vehicle(104, "GRAN TURISMO", "VW GTI", "Leonardo Armas Guaranga"),
  vehicle(113, "GRAN TURISMO", "BMW 330i", "Juan Pablo Carrera Manciati"),
  vehicle(171, "GRAN TURISMO", "RENAULT CLIO", "Juan Botteri Perez"),
  vehicle(185, "GRAN TURISMO", "RENAULT CLIO", "Marcelo Lopez"),
  vehicle(193, "GRAN TURISMO", "BMW 525i", "Jorge Murillo Segura"),
  vehicle(199, "GRAN TURISMO", "AUDI TT", "Carlos Salazar Quelal", "IBARRA"),
  vehicle(214, "TC 2000", "HONDA CIVIC", "Jose Morejon Albuja"),
  vehicle(220, "TC 2000", "OPEL CORSA", "Matias Salvador Burneo"),
  vehicle(223, "TC 2000", "HONDA CIVIC", "Diego Moran"),
  vehicle(226, "TC 2000", "KIA CERATO KOUP", "Juan David García Manrique"),
  vehicle(237, "TC 2000", "SCION FRS", "Diego Redin"),
  vehicle(244, "TC 2000", "OPEL CORSA", "Mateo Monroy"),
  vehicle(247, "TC 2000", "OPEL CORSA", "Fernando Sandoval"),
  vehicle(252, "TC 2000", "HONDA CIVIC", "Dario Navarro"),
  vehicle(267, "TC 2000", "OPEL CORSA", "Martin Suarez Gross"),
  vehicle(274, "TC 2000", "HONDA CIVIC", "Luis Saurith"),
  vehicle(282, "TC 2000", "HONDA INTEGRA", "Omar Sarango Lopez"),
  vehicle(299, "TC 2000", "HONDA CIVIC", "Fernando Iza Felix"),
  vehicle(310, "TC 1600 PRO", "NISSAN SENTRA B13", "Joffre Armas Guaranga"),
  vehicle(315, "TC 1600 PRO", "TOYOTA YARIS", "Patricio Zevallos Lopez"),
  vehicle(332, "TC 1600 PRO", "HONDA CIVIC", "Christian Estevez Jimenez"),
  vehicle(335, "TC 1600 PRO", "NISSAN MARCH", "Luis Cordero Goyes"),
  vehicle(363, "TC 1600 PRO", "NISSAN MARCH", "Ruben Carrera Fuertes"),
  vehicle(377, "TC 1600 PRO", "DATSUN 1200", "Jose Peñafiel"),
  vehicle(393, "TC 1600 PRO", "SUZUKI FORSA", "Eduardo Montalvo Zambrano"),
  vehicle(395, "TC 1600 PRO", "HONDA CIVIC", "Mateo Novoa Perez"),
  vehicle(422, "TC LIGHT", "HYUNDAI GRAND I10", "Santiago Inclan Luna"),
  vehicle(440, "TC LIGHT", "SUZUKI FORSA", "Andres Redin Escobar"),
  vehicle(444, "TC LIGHT", "HYUNDAI GRAND I10", "Daniel Gonzalez Alvarez"),
  vehicle(454, "TC LIGHT", "HYUNDAI I10", "Edison Pozo Villafuerte"),
  vehicle(486, "TC LIGHT", "KIA PICANTO", "Martin Salazar Rivera"),
  vehicle(616, "OPEN", "SUBARU WRX", "Jose Valarezo Sanchez"),
  vehicle(618, "OPEN", "BMW E36", "Christian Ortiz Van Hecke"),
  vehicle(624, "OPEN", "PORSCHE 911", "Patricio Avellan Acosta"),
  vehicle(629, "OPEN", "BMW E90 335i", "Reinaldo Puma Venegas"),
  vehicle(661, "OPEN", "RENAULT CLIO", "Mateo Ayala"),
  vehicle(663, "OPEN", "FIAT ABARTH", "Patricio Larrea Angelescu"),
  vehicle(677, "OPEN", "TOYOTA GT 86", "Pedro Hernandez Hernandez"),
  vehicle(688, "OPEN", "BMW 360i", "Paulo Coronel Rojas"),
  vehicle(701, "TC ELITE", "RENAULT LOGAN", "Juan Felipe Pedraza"),
  vehicle(711, "TC ELITE", "NISSAN MARCH", "Fernando Fuertes Calva"),
  vehicle(717, "TC ELITE", "NISSAN MARCH", "Felipe Lopez Trujillo"),
  vehicle(727, "TC ELITE", "NISSAN MARCH", "Leonidas Drouet"),
  vehicle(729, "TC ELITE", "VW POLO", "Camila Espinosa Coronado"),
  vehicle(748, "TC ELITE", "NISSAN MARCH", "Juan Pablo Montenegro"),
  vehicle(752, "TC ELITE", "KIA RIO", "Juan Esteban Cornejo"),
  vehicle(755, "TC ELITE", "NISSAN MARCH", "Jose Roberto Murillo Venegas"),
  vehicle(764, "TC ELITE", "KIA RIO", "Juan Carlos Navas"),
  vehicle(777, "TC ELITE", "NISSAN MARCH", "Domenika Arellano Soria"),
  vehicle(789, "TC ELITE", "NISSAN MARCH", "Paolo Zani"),
  vehicle(797, "TC ELITE", "NISSAN MARCH", "Jose Woodcock Ortiz"),
  vehicle(825, "MASTER +60", "AUDI 80", "Juan Jorge Villota Trasversari")
];

export const VEHICLE_CATEGORIES = [
  "PROTO P1",
  "GRAN TURISMO",
  "TC 2000",
  "TC 1600 PRO",
  "TC LIGHT",
  "OPEN",
  "TC ELITE",
  "MASTER +60"
];

export const ACTIVATION_CONTROLS = [
  { key: "llego", label: "Llegó" },
  { key: "acreditacion", label: "Acreditación" },
  { key: "kitEntregado", label: "Kit entregado" },
  { key: "zonaAsignada", label: "Zona asignada" },
  { key: "publicacionRealizada", label: "Publicación realizada" },
  { key: "storyRealizada", label: "Story realizada" },
  { key: "contenidoExpo", label: "Contenido Expo" },
  { key: "contenidoCaravana", label: "Contenido Caravana" }
];

export const ACTIVATIONS = [
  ["Daya Ortega", ""],
  ["Campanita", "@campanita16t"],
  ["Naty Vallejos", "@nathy853"],
  ["Mel Cevallos", "@athrit_cs11"],
  ["Ale López", ""],
  ["Nicole Rivera", "@nicolerivera97"],
  ["Sara Cabrera", ""],
  ["Emi Monge", "@emi_monge99"],
  ["Dayane Cardenas", "@dayannecardenas"],
  ["Carolina Proaño", "@carolinaproa"],
  ["Nicole Castro", "@nico_castro_04"],
  ["Paula Rivadeneira", ""],
  ["Caro Gudiño", ""],
  ["Dalal Agha", "@dalal_agha14"],
  ["Paulina Encalada", "@pauli_encalada"],
  ["Cristina Limongi", "@crislimongia"],
  ["Cristi Morejon", ""],
  ["Emily Cardenas", ""],
  ["Solange Cevallos", ""],
  ["Dome Almeida", "@domenika_almeida"],
  ["Genesis Realpe", ""],
  ["Stefanny Angeles", "@stefannycr97"],
  ["Alison Escaleras", "@ali.escaleras"],
  ["Jennifer Realpe", ""],
  ["Kerly Estrella", "@kerlyestrella5"],
  ["Majo Montenegro", ""]
].map(([name, instagram], index) => ({
  id: `promo-${String(index + 1).padStart(2, "0")}`,
  number: index + 1,
  name,
  instagram
}));

export const TEAM = [
  {
    id: "carlos-salazar",
    name: "Carlos Salazar",
    role: "Director Operativo",
    status: "CONFIRMADO",
    functions: [
      "Máxima responsabilidad del evento.",
      "Autoriza apertura, cambios operativos, inicio del show, contingencias y cierre.",
      "Enlace con autoridades."
    ]
  },
  {
    id: "franchesco-guzman",
    name: "Franchesco Guzman",
    role: "Subdirector Operativo",
    status: "CONFIRMADO",
    functions: [
      "Segundo al mando.",
      "Ejecuta cronograma.",
      "Verifica puestos.",
      "Redistribuye staff.",
      "Controla cumplimiento horario."
    ]
  },
  {
    id: "oskar-baez-dj-fire",
    name: "Oskar Baez / DJ Fire",
    role: "Producción Técnica",
    status: "CONFIRMADO",
    functions: ["Audio", "Pantalla", "Video", "Luces", "Tarima", "Pruebas técnicas", "Cues del show"]
  },
  {
    id: "martin-gomezjurado",
    name: "Martin Gomezjurado",
    role: "Zona Fest",
    status: "CONFIRMADO",
    functions: ["Zona Fest derecha e izquierda", "Montaje", "Desmontaje", "Mobiliario", "Barras", "Servicio", "Kits", "Invitados"]
  },
  {
    id: "josue",
    name: "Josue",
    role: "Jefe de Seguridad A",
    status: "CONFIRMADO",
    functions: ["Equipo: 3 guardias", "Sector A", "Vallas", "Cruces", "Control de público"]
  },
  {
    id: "bryan-urbina",
    name: "Bryan Urbina",
    role: "Jefe de Seguridad B",
    status: "CONFIRMADO",
    functions: ["Equipo: 3 guardias", "Sector B", "Vallas", "Cruces", "Control de público"]
  },
  {
    id: "coordinador-vehicular",
    name: "POR DESIGNAR",
    role: "Coordinador Vehicular",
    status: "POR DESIGNAR",
    functions: ["Registro", "Revisión vehicular", "Parqueaderos", "Pre-grid", "Caravana"]
  },
  {
    id: "community-manager-activaciones",
    name: "POR DESIGNAR",
    role: "Community Manager / Activaciones",
    status: "POR DESIGNAR",
    functions: ["Promotores", "Acreditaciones", "Kits", "Contenido Expo", "Contenido caravana"]
  },
  {
    id: "presentador",
    name: "POR DESIGNAR",
    role: "Presentador",
    status: "POR DESIGNAR",
    functions: ["Fichas", "Orden de vehículos", "Micrófono", "Tiempos en tarima"]
  },
  {
    id: "fotografia-video",
    name: "POR DESIGNAR",
    role: "Fotografía / Video",
    status: "POR DESIGNAR",
    functions: ["Plan de tomas", "Sponsors", "Grabación vertical", "After Movie"]
  }
];

export const STAFF = [
  ["S01", "Registro / acreditación", "Check-in de equipos · Listado maestro · Runner tarima"],
  ["S02", "Parqueadero A", "Ubicación y salida"],
  ["S03", "Parqueadero B", "Ubicación y salida"],
  ["S04", "Revisión / fila técnica", "Pre-grid 1"],
  ["S05", "Apoyo pilotos", "Pre-grid 2"],
  ["S06", "Público derecho", "Vallas y circulación"],
  ["S07", "Público izquierdo", "Vallas y circulación"],
  ["S08", "Zona Fest derecha", "Operación de zona"],
  ["S09", "Zona Fest izquierda", "Operación de zona"],
  ["S10", "Runner general / contingencia", "Apoyo transversal"]
].map(([code, role, detail]) => ({
  id: code.toLowerCase(),
  code,
  role,
  detail
}));

export const BROADCAST = [
  "Pantalla LED",
  "Cámara 1",
  "Cámara 2",
  "Cámara 3",
  "Señal principal",
  "Audio",
  "Streaming",
  "Grabación",
  "Video para pantalla",
  "Circuito cerrado"
].map((name) => ({
  id: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  name
}));

export const MAP_ZONES = [
  ["parqueadero-a", "PARQUEADERO A", "Coordinador vehicular"],
  ["parqueadero-b", "PARQUEADERO B", "Coordinador vehicular"],
  ["tarima", "TARIMA", "Oskar Baez / DJ Fire"],
  ["zona-fest-derecha", "ZONA FEST DERECHA", "Martin Gomezjurado"],
  ["zona-fest-izquierda", "ZONA FEST IZQUIERDA", "Martin Gomezjurado"],
  ["carril-vip", "CARRIL VIP", "Franchesco Guzman"],
  ["carpas-publico", "CARPAS PÚBLICO", "Franchesco Guzman"],
  ["pre-grid", "PRE-GRID", "Coordinador vehicular"],
  ["ingreso-vehiculos", "INGRESO VEHÍCULOS", "Coordinador vehicular"],
  ["salida-vehiculos", "SALIDA VEHÍCULOS", "Coordinador vehicular"],
  ["punto-policia", "PUNTO POLICÍA", "Carlos Salazar"],
  ["seguridad-a", "SEGURIDAD A", "Josue"],
  ["seguridad-b", "SEGURIDAD B", "Bryan Urbina"]
].map(([id, name, responsable]) => ({ id, name, responsable }));

export const MAP_GRID = {
  columns: 12,
  rows: 12,
  itemSpan: 1,
  positions: {
    "parqueadero-a": "r1-c9",
    "parqueadero-b": "r3-c9",
    tarima: "r5-c5",
    "punto-policia": "r3-c11",
    "zona-fest-derecha": "r7-c7",
    "zona-fest-izquierda": "r7-c9",
    "carril-vip": "r9-c9",
    "carpas-publico": "r7-c3",
    "pre-grid": "r9-c5",
    "ingreso-vehiculos": "r11-c1",
    "salida-vehiculos": "r11-c3",
    "seguridad-a": "r3-c3",
    "seguridad-b": "r5-c7"
  }
};
