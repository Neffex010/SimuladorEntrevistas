# EntrevistaLab — Simulador de entrevistas laborales en tecnología

Practica entrevistas técnicas reales, recibe retroalimentación inmediata por
respuesta y descarga un informe PDF con tu desempeño. Sin registro, sin bases
de datos: tus datos viven solo en tu navegador.

## Sitio en vivo

- Frontend (GitHub Pages): <https://neffex010.github.io/SimuladorEntrevistas/>
- Frontend + backend (Netlify): <https://simuladorentre.netlify.app>

## Características

- **5 perfiles de práctica**: Perfil TIC general, Frontend, Backend, Datos y Analítica, DevOps y Cloud.
- **3 etapas por sesión**: presentación/trayectoria, habilidades técnicas y habilidades blandas.
- **Tiempo por pregunta configurable** (30 s a 120 s) con cronómetro en pantalla.
- **Respuestas por escritura o dictado por voz** (Web Speech API) y lectura de preguntas en voz alta.
- **Retroalimentación de IA (OpenAI)**: fortalezas, áreas de mejora, consejo y puntuación 1–5 por respuesta.
- **Informe PDF descargable** con datos del participante, promedio general y detalle por pregunta.
- **Vista previa del informe** en un modal antes de descargar.
- **Tema claro/oscuro** persistente.

## Tecnologías

- HTML, CSS y JavaScript vanilla (ES modules) — sin frameworks.
- Backend serverless en Netlify Functions.
- OpenAI API (`gpt-4o-mini`) para el análisis de respuestas.
- jsPDF vía CDN para generar el informe.

## Estructura del proyecto

```
├── index.html                 # Landing con formulario de registro
├── simulador.html             # Configuración, entrevista, feedback y resultado
├── css/
│   └── styles.css             # Diseño "panel de instrumentos" (tokens en :root)
├── js/
│   ├── index.js               # Arranque del simulador
│   ├── landing.js             # Landing: roles, validación y guardado en localStorage
│   ├── config.js              # Roles, preguntas, settings, URLs y colores del PDF
│   ├── dataManager.js         # Lectura/escritura de datos locales
│   ├── interviewSimulator.js  # Orquestador principal del flujo
│   ├── timer.js               # Cronómetro por pregunta
│   ├── speechController.js    # Síntesis (leer) y reconocimiento (dictar)
│   ├── previewModal.js        # Vista previa del informe (segura ante XSS)
│   ├── pdfReportGenerator.js  # Generación del PDF
│   └── theme.js               # Tema claro/oscuro
├── netlify/
│   └── functions/
│       └── feedback.js        # Función serverless: análisis con OpenAI
├── image/
│   └── favicon.png
├── netlify.toml               # Configuración de despliegue en Netlify
└── .gitignore
```

## Cómo usarlo

1. Ingresa tu nombre, apellidos, correo y el área a la que aplicas.
2. Elige perfil, tiempo por pregunta y las opciones de voz en el simulador.
3. Responde cada pregunta por teclado o dictando. Cuando termine el tiempo, la
   respuesta se envía sola.
4. Revisa el feedback de cada respuesta y continúa (auto-avanza tras 12 s con
   botón "Continuar").
5. Al terminar verás tu puntuación por etapa; previsualiza el informe y
   descárgalo en PDF.

> El reconocimiento de voz requiere un navegador compatible (Chrome/Edge) y
> funciona sobre HTTPS o `localhost` (no desde `file://`).

## Desarrollo local

El frontend es 100% estático; abre `index.html` directamente o sirve la carpeta:

```bash
# Cualquier servidor estático
python -m http.server 8080
```

Para las pruebas del backend local con Netlify:

```bash
npm install -g netlify-cli
netlify dev
```

## Despliegue del backend en Netlify

1. Crea un sitio en Netlify conectado a este repositorio (`netlify.toml`
   configura `publish = "."` y el directorio de funciones).
2. Agrega la variable de entorno `OPENAI_API_KEY` con tu clave de OpenAI en
   *Site settings → Environment variables*.
3. Si el nombre del sitio difiere de `simuladorentre`, actualiza
   `APP_SETTINGS.apiPrimary` en `js/config.js`.

El endpoint usa CORS abierto (`*`), por lo que funciona desde GitHub Pages.

## API

`POST /api/feedback`

```json
{
  "answer": "Tu respuesta a la pregunta",
  "question": "Pregunta de la entrevista"
}
```

Respuesta:

```json
{
  "fortalezas": ["...", "..."],
  "mejoras": ["...", "..."],
  "tip": "...",
  "score": 4
}
```

## Notas

- No hay registro central: los datos se guardan en `localStorage` del
  navegador y nunca se envían fuera (la única llamada externa es el análisis
  de la respuesta).
- Diseño propio bajo restricciones estrictas: 6 tokens de color, 3 tamaños de
  fuente, una sola sombra, sin gradientes ni animaciones de entrada.