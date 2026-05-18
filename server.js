require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_URL = process.env.OLLAMA_URL || 'https://chat.edumath.click/v1';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';
const API_KEY = process.env.API_KEY;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `Eres MathIAs, tutor matematico. NUNCA uses asteriscos (*, **) en tus respuestas. Para matematicas usa SOLO LaTeX: $formula$ para inline y $$formula$$ para bloques.

Reglas estrictas:
- NO uses **texto** nunca
- NO uses *texto* nunca
- NO uses # Titulos nunca
- Para matematicas SIEMPRE: $x^2$ o $$\\frac{a}{b}$$
- Si necesitas escribir una formula matematica, envolvila en $...$ o $$...$$
- Ejemplo correcto: La formula es $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$
- Ejemplo INCORRECTO: La formula es **x = (-b ± √(...)) / 2a**

Respuesta correcta para ecuaciones de segundo grado:
$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$

Donde:
- $a$ = coeficiente de $x^2$
- $b$ = coeficiente de $x$  
- $c$ = termino independiente

Historial: {historial}

Responde UNICAMENTE en JSON:
{"respuesta": "tu respuesta (SIN asteriscos, usa $formula$ para matematicas)", "accion": "thinking|idea|celebrate|idle"}`;

app.post('/api/chat', async (req, res) => {
  try {
    const { mensaje, timestamp, historial, sessionId } = req.body;

    if (!mensaje || mensaje.trim() === '') {
      return res.json({
        respuesta: 'Por favor, escribe tu pregunta matematica.',
        accion: 'idle'
      });
    }

    const contextPrompt = SYSTEM_PROMPT.replace('{historial}', historial || 'Sin historial previo');

    const messages = [
      { role: 'system', content: contextPrompt },
      { role: 'user', content: mensaje }
    ];

    console.log('[MathIAs] Enviando a:', OLLAMA_URL);
    console.log('[MathIAs] Modelo:', OLLAMA_MODEL);

    const ollamaResponse = await axios.post(
      `${OLLAMA_URL}/chat/completions`,
      {
        model: OLLAMA_MODEL,
        messages: messages,
        temperature: 0.8,
        max_tokens: 1500
      },
      {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    let respuestaTexto = ollamaResponse.data.choices?.[0]?.message?.content || '';

    respuestaTexto = respuestaTexto
      .replace(/\\\\/g, '\\')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/^#+\s*/gm, '');

    let accion = 'idle';
    if (respuestaTexto.includes('¡') || respuestaTexto.includes('Excelente') || respuestaTexto.includes('correcto') || respuestaTexto.includes('perfecto')) {
      accion = 'celebrate';
    } else if (respuestaTexto.includes('idea') || respuestaTexto.includes('conjetura') || respuestaTexto.includes('crees que')) {
      accion = 'idea';
    }

    res.json({
      respuesta: respuestaTexto,
      accion: accion
    });

  } catch (error) {
    console.error('[MathIAs] Error:', error.response?.data || error.message);

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.json({
        respuesta: 'No se puede conectar al servidor Ollama. Verifica que este corriendo.',
        accion: 'error'
      });
    }

    if (error.response?.status === 401) {
      return res.json({
        respuesta: 'API Key incorrecta. Verifica tu configuracion.',
        accion: 'error'
      });
    }

    if (error.response?.status === 404) {
      return res.json({
        respuesta: `El modelo ${OLLAMA_MODEL} no esta disponible. Revisa los modelos instalados.`,
        accion: 'error'
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.json({
        respuesta: 'La respuesta tardo demasiado. Intenta de nuevo.',
        accion: 'error'
      });
    }

    res.json({
      respuesta: 'Hubo un error al procesar tu mensaje. Intenta de nuevo.',
      accion: 'error'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║         MathIAs Backend Server             ║
╠════════════════════════════════════════════╣
║  Puerto:      ${PORT}                          
║  API:         ${OLLAMA_URL}          
║  Modelo:      ${OLLAMA_MODEL}                     
╚════════════════════════════════════════════╝
  `);
});