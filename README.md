# EntrevistaLab — Simulador de entrevistas laborales para cualquier área

Practica entrevistas reales de tu profesión, recibe retroalimentación inmediata
por respuesta y revisa un informe con tu desempeño. Sin registro, sin bases de
datos: tus datos viven solo en tu navegador.

## Sitio en vivo

- Frontend (GitHub Pages): <https://neffex010.github.io/SimuladorEntrevistas/>
- Frontend + backend (Netlify): <https://simuladorentre.netlify.app>

## Características

- **15 perfiles de práctica en 9 sectores**: tecnología, negocios y administración, salud, educación, derecho, diseño, ingeniería, recursos humanos y un perfil general para cualquier otra área.
- **Dos modos de práctica**: rápida (6 preguntas) o completa (12 preguntas).
- **3 etapas por sesión**: presentación/trayectoria, habilidades del área y habilidades blandas.
- **Tiempo por pregunta configurable** (30 s a 120 s) con cronómetro en pantalla, dentro de "Ajustes de la sesión".
- **Respuestas por escritura o dictado por voz** (Web Speech API).
- **Atajos de teclado**: `Ctrl/Cmd + Enter` envía la respuesta; `Enter` crea una línea nueva.
- **Retroalimentación de IA (OpenAI)**: fortalezas, áreas de mejora, consejo y puntuación 1–5 por respuesta.
- **Resumen final** con la puntuación por etapa y las fortalezas que más se repiten.
- **Informe en pantalla** (modal) con datos del participante, promedio general y detalle colapsable por pregunta.
- **Diseño responsive** para escritorio, tablet y celular.
- **Tema claro/oscuro** persistente.

## Tecnologías

- HTML, CSS y JavaScript vanilla (ES modules) — sin frameworks.
- Backend serverless en Netlify Functions.
- OpenAI API (`gpt-4o-mini`) para el análisis de respuestas.

## Estructura del proyecto

```
├── index.html                 # Landing con datos de la sesión
├── simulador.html             # Configuración, entrevista, feedback y resultado
├── css/
│   └── styles.css             # Diseño "panel de instrumentos" (tokens en :root)
├── js/
│   ├── index.js               # Arranque del simulador
│   ├── landing.js             # Landing: roles, validación y guardado en localStorage
│   ├── config.js              # Roles, preguntas, modos, settings y URLs
│   ├── dataManager.js         # Lectura/escritura de datos locales
│   ├── interviewSimulator.js  # Orquestador principal del flujo
│   ├── timer.js               # Cronómetro por pregunta
│   ├── speechController.js    # Reconocimiento de voz (dictado)
│   ├── previewModal.js        # Informe en modal (seguro ante XSS)
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

1. Ingresa tu nombre, apellidos y el área a la que aplicas.
2. Elige el perfil y el modo de práctica (rápida o completa). Si lo necesitas, abre
   "Ajustes de la sesión" para cambiar el tiempo por pregunta o activar el dictado.
3. Responde cada pregunta por teclado o dictando. Cuando termine el tiempo, la
   respuesta se envía sola.
4. Revisa el feedback de cada respuesta y pulsa "Continuar".
5. Al terminar verás tu puntuación por etapa, las fortalezas que más se repiten y
   el informe completo en pantalla.

> El reconocimiento de voz requiere un navegador compatible (Chrome/Edge) y
> funciona sobre HTTPS o `localhost` (no desde `file://`).

## Desarrollo local

El frontend es 100% estático. Sirve la carpeta con cualquier servidor local
(los ES modules no funcionan abriendo el archivo directamente):

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
3. Ajusta `ALLOWED_ORIGINS` con los dominios desde los que se usará la app.
   Si no se define, se permiten el sitio de Netlify y `localhost:8080`.
4. Si el nombre del sitio difiere de `simuladorentre`, actualiza
   `APP_SETTINGS.apiPrimary` en `js/config.js`.

### Variables de entorno

Todas son opcionales salvo `OPENAI_API_KEY`. Puedes partir de
`.env.example` para desarrollo local con `netlify dev`.

| Variable | Uso | Valor por defecto |
| --- | --- | --- |
| `OPENAI_API_KEY` | Clave para el análisis de respuestas. | — (obligatoria) |
| `ALLOWED_ORIGINS` | Orígenes permitidos por CORS, separados por coma. | `https://simuladorentre.netlify.app`, `http://localhost:8080`, `http://127.0.0.1:8080` |
| `RATE_LIMIT_MAX` | Solicitudes permitidas por IP en cada ventana. | `10` |
| `RATE_LIMIT_WINDOW_SECONDS` | Duración de la ventana del límite, en segundos. | `60` |
| `UPSTASH_REDIS_REST_URL` | URL de Upstash para compartir el límite entre instancias. | — (respaldo en memoria) |
| `UPSTASH_REDIS_REST_TOKEN` | Token de Upstash. | — |

> Sin Upstash, el límite se guarda en memoria y solo protege dentro de una
> instancia cálida. Con Upstash se comparte entre todas las instancias.

El endpoint ya no usa CORS abierto: solo responde a los orígenes de
`ALLOWED_ORIGINS`. Si publicas el frontend en GitHub Pages, agrega ese dominio
a la variable.

## API

`POST /api/feedback`

```json
{
  "answer": "Tu respuesta a la pregunta",
  "question": "Pregunta de la entrevista"
}
```

Límites: `answer` hasta 2000 caracteres y `question` hasta 300. El análisis
tiene un timeout de 9 segundos y la respuesta se normaliza antes de devolverla.

Respuesta:

```json
{
  "fortalezas": ["...", "..."],
  "mejoras": ["...", "..."],
  "tip": "...",
  "score": 4
}
```

Códigos de error:

| HTTP | `code` | Significado |
| --- | --- | --- |
| `400` | `missing_answer` | La respuesta está vacía. |
| `400` | `answer_too_long` | Supera los 2000 caracteres. |
| `403` | — | Origen no incluido en `ALLOWED_ORIGINS`. |
| `405` | — | Método distinto de `POST`. |
| `429` | `rate_limited` | Se superó el límite por IP; incluye `Retry-After`. |
| `500` | `missing_api_key` | Falta `OPENAI_API_KEY`. |
| `502` | `upstream_error` | OpenAI respondió con error. |
| `504` | `timeout` | El análisis superó los 9 segundos. |
| `500` | `internal_error` | Fallo inesperado del handler. |

## Notas

- No hay registro central: los datos se guardan en `localStorage` del
  navegador y nunca se envían fuera (la única llamada externa es el análisis
  de la respuesta).
- Diseño brutalista propio: 6 tokens de color, escala tipográfica compacta,
  una sola sombra dura, sin gradientes ni animaciones de entrada.