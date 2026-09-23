// ---------- js/config.js ----------
// Configuración central de la aplicación.

// Roles disponibles. Cada rol define sus propias preguntas técnicas.
export const ROLES = [
  {
    id: 'general',
    label: 'Perfil TIC general',
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
    label: 'DevOps y Cloud',
    desc: 'Infraestructura, despliegue y automatización',
    tecnicas: [
      'Explica cómo armarías un pipeline de CI/CD.',
      'Contenedores vs máquinas virtuales: diferencias y cuándo usar cada uno.',
      '¿Cómo supervisas la salud de un sistema en producción?',
      'Describe los pasos para desplegar una aplicación en la nube de forma segura.',
      '¿Qué es infraestructura como código y qué herramientas usas?'
    ]
  }
];

// Etapa inicial: preguntas de presentación y motivación (para todos los roles).
export const INTRO_QUESTIONS = [
  'Cuéntame sobre ti: tu formación, experiencia y qué te motiva a trabajar en tecnología.',
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
  intro: 'Presentación y trayectoria',
  tecnicas: 'Habilidades técnicas',
  blandas: 'Habilidades blandas'
};

export const APP_SETTINGS = {
  storageKey: 'datosAspirante',
  timeOptions: [30, 45, 60, 90, 120],
  defaultTime: 60,
  // URL del backend en Vercel. Cámbiala por la tuya tras desplegar.
  apiPrimary: 'https://simulador-entrevistas.vercel.app/api/feedback',
  // Fallback relativo: útil en desarrollo local (si el backend se sirve en el mismo origen).
  apiFallback: '/api/feedback',
  useQuestionSpeech: true,
  useVoiceRecognition: true
};

export const PDF_CONFIG = {
  colores: {
    header: [36, 39, 31],
    acento: [218, 162, 60],
    texto: [36, 39, 31]
  },
  fuentes: {
    titulo: 16,
    seccion: 12,
    cuerpo: 10,
    etiqueta: 9
  },
  marca: 'EntrevistaLab'
};