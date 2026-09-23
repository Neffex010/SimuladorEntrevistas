// ---------- netlify/functions/feedback.js ----------
// Función serverless de Netlify: evalúa una respuesta de entrevista con OpenAI.
// Formato v1 de Netlify Functions: exports.handler(event, context).

const SYSTEM_PROMPT = `Eres un coach de entrevistas laborales en el área de tecnología.
Evalúas las respuestas de una persona que practica para una entrevista real y le das retroalimentación constructiva, honesta y en español.
Debes responder SOLO con un JSON válido con esta forma exacta:
{
  "fortalezas": ["...", "..."],
  "mejoras": ["...", "..."],
  "tip": "...",
  "score": 1
}
Reglas:
- "fortalezas": 2 a 3 puntos concretos que la persona hizo bien.
- "mejoras": 1 a 3 puntos accionables y específicos (nunca genéricos).
- "tip": una recomendación práctica de una frase.
- "score": número entero del 1 al 5 según la calidad de la respuesta (5 = excelente, 3 = aceptable, 1 = muy débil).
- No agregues texto fuera del JSON.`;

const RESPONSE_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: RESPONSE_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: RESPONSE_HEADERS, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  let payload;
  try {
    payload = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});
  } catch {
    payload = {};
  }
  const { answer, question } = payload;

  if (!answer || !String(answer).trim()) {
    return { statusCode: 400, headers: RESPONSE_HEADERS, body: JSON.stringify({ error: 'Falta la respuesta a evaluar.' }) };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: RESPONSE_HEADERS,
      body: JSON.stringify({ error: 'La API key de OpenAI no está configurada en el servidor.' })
    };
  }

  try {
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Pregunta de la entrevista: "${question || 'General'}"\n\nRespuesta de la persona: "${answer}"`
          }
        ]
      })
    });

    if (!completion.ok) {
      const detail = await completion.text();
      console.error('OpenAI respondió con error:', completion.status, detail);
      return {
        statusCode: 502,
        headers: RESPONSE_HEADERS,
        body: JSON.stringify({ error: 'El servicio de análisis no respondió correctamente.' })
      };
    }

    const data = await completion.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || '';

    let parsed;
    try {
      parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
    } catch {
      parsed = {
        fortalezas: [],
        mejoras: [],
        tip: 'No se pudo estructurar el análisis. Vuelve a intentarlo.',
        score: 3
      };
    }

    return {
      statusCode: 200,
      headers: RESPONSE_HEADERS,
      body: JSON.stringify({
        fortalezas: Array.isArray(parsed.fortalezas) ? parsed.fortalezas : [],
        mejoras: Array.isArray(parsed.mejoras) ? parsed.mejoras : [],
        tip: typeof parsed.tip === 'string' ? parsed.tip : '',
        score: Math.min(5, Math.max(1, Math.round(Number(parsed.score) || 3)))
      })
    };
  } catch (err) {
    console.error('Error en /api/feedback:', err);
    return { statusCode: 500, headers: RESPONSE_HEADERS, body: JSON.stringify({ error: 'Error interno al analizar la respuesta.' }) };
  }
};