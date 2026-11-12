// ---------- js/config.js ----------
// Configuración central de la aplicación.

// Perfiles de práctica. Cada perfil declara su sector y sus preguntas técnicas.
export const ROLES = [
  // ---------- Tecnología ----------
  {
    id: 'general',
    sector: 'Tecnología',
    label: 'Tecnología general',
    desc: 'Conocimientos generales de tecnología',
    tecnicas: [
      '¿Qué tecnologías conoces y con cuáles te sientes más cómodo?',
      '¿Cómo resolverías una falla en una aplicación en producción?',
      'Explica qué es un servidor, un cliente y cómo se comunican.',
      '¿Qué proyecto te enorgullece más y qué rol cumpliste en él?',
      '¿Cómo te mantienes actualizado en tecnología?'
    ]
  },
  {
    id: 'frontend',
    sector: 'Tecnología',
    label: 'Desarrollo Frontend',
    desc: 'Interfaces, web y experiencia de usuario',
    tecnicas: [
      'Explica la diferencia entre HTML, CSS y JavaScript, y cuándo usas cada uno.',
      '¿Qué es el DOM y por qué es relevante al manipular una página?',
      '¿Cómo harías una página accesible y responsive para todo tipo de usuarios?',
      '¿Qué frameworks conoces y con qué criterio elegirías uno para un proyecto?',
      '¿Cómo optimizas el rendimiento y el tiempo de carga de una aplicación web?'
    ]
  },
  {
    id: 'backend',
    sector: 'Tecnología',
    label: 'Desarrollo Backend',
    desc: 'Servicios, APIs y bases de datos',
    tecnicas: [
      '¿Qué lenguajes y frameworks del lado del servidor dominas y por qué los usas?',
      'Explica REST y GraphQL y cuándo elegirías cada uno.',
      '¿Cómo diseñarías una API segura y escalable? Menciona autenticación.',
      '¿Cómo trabajas con bases de datos y cómo detectas una consulta lenta?',
      '¿Cómo manejas errores, logs y dependencias en un servicio en producción?'
    ]
  },
  {
    id: 'data',
    sector: 'Tecnología',
    label: 'Datos y Analítica',
    desc: 'Análisis, estadística y modelos',
    tecnicas: [
      '¿Qué herramientas y lenguajes usas para analizar datos?',
      'Explica la diferencia entre un modelo de regresión y uno de clasificación.',
      '¿Cómo limpiarías un dataset con valores nulos y datos atípicos?',
      'SQL vs NoSQL: ¿cuándo usarías cada uno y por qué?',
      '¿Cómo presentas resultados a un equipo sin conocimientos técnicos?'
    ]
  },
  {
    id: 'devops',
    sector: 'Tecnología',
    label: 'DevOps y Cloud',
    desc: 'Infraestructura, despliegue y automatización',
    tecnicas: [
      'Explica cómo armarías un pipeline de CI/CD.',
      'Contenedores vs máquinas virtuales: diferencias y cuándo usar cada uno.',
      '¿Cómo supervisas la salud de un sistema en producción?',
      'Describe los pasos para desplegar una aplicación en la nube de forma segura.',
      '¿Qué es infraestructura como código y qué herramientas usas?'
    ]
  },

  // ---------- Negocios y administración ----------
  {
    id: 'administracion',
    sector: 'Negocios y administración',
    label: 'Administración y gestión',
    desc: 'Organización, procesos y toma de decisiones',
    tecnicas: [
      '¿Cómo organizas y priorizas las tareas de un equipo o proyecto?',
      'Describe cómo medirías si un proceso interno está funcionando bien.',
      '¿Qué haces cuando dos áreas necesitan el mismo recurso al mismo tiempo?',
      '¿Cómo preparas un presupuesto o justificas una inversión?',
      '¿Qué herramientas usas para dar seguimiento a objetivos y resultados?'
    ]
  },
  {
    id: 'ventas',
    sector: 'Negocios y administración',
    label: 'Ventas y atención al cliente',
    desc: 'Relación con clientes, negociación y servicio',
    tecnicas: [
      '¿Cómo identificas las necesidades reales de un cliente?',
      'Cuéntame cómo manejarías a un cliente molesto o insatisfecho.',
      '¿Cómo das seguimiento a una oportunidad de venta sin ser insistente?',
      '¿Qué haces cuando no puedes cumplir lo que el cliente pide?',
      '¿Cómo mides el éxito de tu gestión comercial o de servicio?'
    ]
  },
  {
    id: 'marketing',
    sector: 'Negocios y administración',
    label: 'Marketing y comunicación',
    desc: 'Campañas, contenido y marca',
    tecnicas: [
      '¿Cómo definirías el público objetivo de una campaña?',
      '¿Qué métricas usarías para saber si una campaña funcionó?',
      'Cuéntame cómo planearías el lanzamiento de un producto o servicio.',
      '¿Cómo adaptas un mismo mensaje a distintos canales y audiencias?',
      '¿Qué harías si una campaña no está dando los resultados esperados?'
    ]
  },

  // ---------- Salud ----------
  {
    id: 'salud',
    sector: 'Salud y bienestar',
    label: 'Salud y atención al paciente',
    desc: 'Atención, comunicación y cuidado',
    tecnicas: [
      '¿Cómo explicas un procedimiento o diagnóstico a un paciente nervioso?',
      '¿Cómo priorizas la atención cuando tienes varios pacientes?',
      '¿Qué haces cuando un paciente o familiar no sigue las indicaciones?',
      '¿Cómo garantizas la confidencialidad y el trato digno?',
      '¿Cómo manejas un error propio en un contexto clínico?'
    ]
  },

  // ---------- Educación ----------
  {
    id: 'docencia',
    sector: 'Educación y docencia',
    label: 'Docencia y formación',
    desc: 'Enseñanza, evaluación y acompañamiento',
    tecnicas: [
      '¿Cómo planificas una clase para estudiantes con niveles distintos?',
      '¿Qué estrategias usas para mantener la atención del grupo?',
      '¿Cómo evalúas si tus estudiantes realmente aprendieron?',
      '¿Qué haces cuando un estudiante se queda atrás o pierde interés?',
      '¿Cómo adaptas tu método cuando no tienes los recursos que esperabas?'
    ]
  },

  // ---------- Derecho ----------
  {
    id: 'derecho',
    sector: 'Derecho y legal',
    label: 'Derecho y área legal',
    desc: 'Análisis, normativa y argumentación',
    tecnicas: [
      '¿Cómo analizas un caso o problema legal desde cero?',
      '¿Cómo explicas un tema legal complejo a alguien sin formación jurídica?',
      '¿Qué haces cuando la norma y la práctica de la organización no coinciden?',
      '¿Cómo priorizas varios asuntos legales con plazos ajustados?',
      '¿Cómo garantizas que tu trabajo cumpla con la normativa vigente?'
    ]
  },

  // ---------- Diseño ----------
  {
    id: 'diseno',
    sector: 'Diseño y creatividad',
    label: 'Diseño y creatividad',
    desc: 'Ideas, usuario y comunicación visual',
    tecnicas: [
      '¿Cómo entiendes las necesidades del usuario antes de diseñar?',
      'Cuéntame cómo defiendes una propuesta creativa frente a un cliente.',
      '¿Cómo equilibras estética, funcionalidad y presupuesto?',
      '¿Qué haces cuando recibes feedback que no compartes?',
      '¿Cómo validas que tu diseño funciona antes de entregarlo?'
    ]
  },

  // ---------- Ingeniería y operaciones ----------
  {
    id: 'ingenieria',
    sector: 'Ingeniería y operaciones',
    label: 'Ingeniería y operaciones',
    desc: 'Procesos, seguridad y mejora continua',
    tecnicas: [
      '¿Cómo identificas y priorizas una mejora en un proceso?',
      '¿Qué haces cuando un proyecto se retrasa por un imprevisto?',
      '¿Cómo garantizas la seguridad y la calidad en tu trabajo?',
      '¿Cómo coordinas a personas de distintas áreas para ejecutar un plan?',
      '¿Qué indicadores usarías para saber si una operación es eficiente?'
    ]
  },

  // ---------- Personas ----------
  {
    id: 'rrhh',
    sector: 'Personas y gestión',
    label: 'Recursos Humanos',
    desc: 'Selección, clima y desarrollo de personas',
    tecnicas: [
      '¿Cómo evaluarías si una persona encaja en un puesto y en el equipo?',
      '¿Qué haces cuando detectas un conflicto entre dos personas?',
      '¿Cómo mides el clima laboral y qué harías con los resultados?',
      '¿Cómo manejas una conversación difícil sobre desempeño?',
      '¿Qué acciones propondrías para retener talento?'
    ]
  },

  // ---------- Otra área ----------
  {
    id: 'otra',
    sector: 'Otra área',
    label: 'Otra área / perfil general',
    desc: 'Preguntas transversales para cualquier profesión',
    tecnicas: [
      '¿Qué te gustaría que supiera el entrevistador sobre tu experiencia?',
      '¿Cómo explicas el valor de tu trabajo a alguien de otra área?',
      '¿Cómo resuelves un problema cuando no tienes toda la información?',
      '¿Qué herramienta o método te facilita hacer tu trabajo y por qué?',
      '¿Cómo te mantienes actualizado en tu profesión?'
    ]
  }
];

// Etapa inicial: preguntas de presentación y motivación (para todos los roles).
export const INTRO_QUESTIONS = [
  'Cuéntame sobre ti: tu formación, experiencia y qué te motiva a trabajar en esta área.',
  '¿Por qué buscas este puesto y qué aportarías que otro candidato no?'
];

// Etapa final: habilidades blandas y comportamiento (para todos los roles).
export const SOFT_QUESTIONS = [
  'Cuéntame sobre un conflicto en equipo y cómo lo resolviste.',
  'Describe una ocasión en la que fallaste en un proyecto y qué aprendiste.',
  '¿Cómo priorizas tus tareas cuando tienes varias entregas con fechas cercanas?',
  '¿Cómo recibes y aplicas la retroalimentación de tus compañeros?',
  'Cuéntame de una vez en la que tuviste que aprender algo nuevo rápidamente.'
];

// Etiquetas de las etapas de la entrevista.
export const STAGE_LABELS = {
  intro: 'Presentación',
  tecnicas: 'Área',
  blandas: 'Blandas'
};

// Modos de práctica: cuántas preguntas se toman de cada etapa.
export const PRACTICE_MODES = {
  rapida: { label: 'Práctica rápida', intro: 1, tecnicas: 3, blandas: 2 },
  completa: { label: 'Entrevista completa', intro: 2, tecnicas: 5, blandas: 5 }
};

// Toma una muestra de preguntas sin repetir. Si se piden todas, conserva el orden.
function sampleQuestions(list, count) {
  if (count >= list.length) return list.slice();

  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

// Construye la cola de una sesión según el perfil y el modo elegido.
export function buildQueue(rol, modo = 'completa') {
  const plan = PRACTICE_MODES[modo] || PRACTICE_MODES.completa;

  return [
    ...sampleQuestions(INTRO_QUESTIONS, plan.intro).map((q) => ({ modo: 'intro', pregunta: q })),
    ...sampleQuestions(rol.tecnicas, plan.tecnicas).map((q) => ({ modo: 'tecnicas', pregunta: q })),
    ...sampleQuestions(SOFT_QUESTIONS, plan.blandas).map((q) => ({ modo: 'blandas', pregunta: q }))
  ];
}

export const APP_SETTINGS = {
  storageKey: 'datosAspirante',
  timeOptions: [30, 45, 60, 90, 120],
  defaultTime: 60,
  // URL del backend en Netlify (función serverless).
  apiPrimary: 'https://simuladorentre.netlify.app/api/feedback',
  // Fallback relativo: funciona cuando el sitio y la función viven en el mismo origen (Netlify).
  apiFallback: '/api/feedback',
  useVoiceRecognition: true
};

// Devuelve el perfil solicitado o el perfil general como respaldo.
export function getRole(roleId) {
  return ROLES.find((rol) => rol.id === roleId) || ROLES[0];
}

// Agrupa los perfiles por sector conservando el orden de ROLES.
export function groupRolesBySector(roles = ROLES) {
  const groups = new Map();
  roles.forEach((rol) => {
    if (!groups.has(rol.sector)) groups.set(rol.sector, []);
    groups.get(rol.sector).push(rol);
  });
  return groups;
}

// Total de preguntas de una sesión para el perfil y modo indicados.
export function questionsForRole(rol, modo = 'completa') {
  const plan = PRACTICE_MODES[modo] || PRACTICE_MODES.completa;
  return (
    Math.min(plan.intro, INTRO_QUESTIONS.length) +
    Math.min(plan.tecnicas, rol.tecnicas.length) +
    Math.min(plan.blandas, SOFT_QUESTIONS.length)
  );
}
