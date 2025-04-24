export const QUESTIONS = {
  tecnicas: [
    "¿Qué lenguajes de programación dominas y en qué proyectos los aplicaste?"
  ],
  blandas: [
    "¿Cuéntame sobre un conflicto en equipo y cómo lo resolviste?"
  ]
};

export const PDF_CONFIG = {
  colores: {
    header: [13, 59, 102],
    piePagina: [13, 59, 102],
    titulo: [230, 57, 70],
    texto: [51, 51, 51]
  },
  fuentes: {
    titulo: 16,
    seccion: 12,
    cuerpo: 10,
    pequeño: 8
  },
  logos: {
    izquierdo: '/image/Tecnologico_Nacional_de_Mexico.svg.png',
    derecho: './image/LITP.png'
  }
};

export const APP_SETTINGS = {
  tiempoPregunta: 60,
  openAIKey: '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',        // Reemplazar con llamado a backend
  openAIEndpoint: 'https://api.openai.com/v1/chat/completions'
};
