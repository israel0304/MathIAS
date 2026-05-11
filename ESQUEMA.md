# MathIAs - Esquema JSON de Comunicación

## Request (Frontend → n8n)

El Web Component envía un POST con el siguiente formato:

```json
{
  "mensaje": "string - Pregunta del usuario",
  "timestamp": "ISO 8601 - Fecha y hora",
  "historial": "string|null - Interacción anterior"
}
```

## Response (n8n → Frontend)

El webhook debe responder con JSON válido:

```json
{
  "respuesta": "string - Mensaje pedagógico de MathIAs",
  "accion": "string - Estado de animación"
}
```

## Valores de `accion`

| Valor | Animación | Significado Pedagógico |
|-------|-----------|----------------------|
| `thinking` | 💭 | El estudiante está en fase de **Acción** - manipulando sin reflexión |
| `idea` | 💡 | El estudiante está en **Formulación** - formulando conjeturas |
| `celebrate` | 🎉 | El estudiante está en **Validación** - ha verificado su respuesta |
| `error` | ❌ | Hay un error que requiere revisión |

## Ejemplo de Flujo n8n

### Nodos del Workflow

1. **Webhook** (`POST /webhook/mathias`)
   - Receptor de la petición del componente

2. **Function (Preparar Contexto)**
   - Agrega el system prompt socrático
   - Historial de la conversación

3. **Ollama**
   - Modelo: `llama3.2` o similar
   - System Prompt personalizado

4. **Function (Formatear Respuesta)**
   - Construye JSON válido con `{ respuesta, accion }`

5. **Respond to Webhook**
   - Devuelve la respuesta al componente

### System Prompt para Ollama

```
Eres MathIAs, un asistente tutoring matemático.
Utiliza la Teoría de Situaciones Didácticas de Brousseau.

FASES DEL APRENDIZAJE:
- Acción: El estudiante opera sin justificación
- Formulación: El estudiante formula conjeturas
- Validación: El estudiante verifica soluciones

REGLAS:
1. NUNCA des la solución directa
2. Si el estudiante da una respuesta:
   - Incorrecta → accion: "thinking" + pista contextual
   - Correcta → accion: "celebrate" + felicitación breve
3. Usa preguntas socráticas: "¿Qué pasaría si...?", "¿Por qué crees que...?"
4. Mantén un tono amigable y Encouraging

Responde ÚNICAMENTE en JSON:
{"respuesta": "...", "accion": "..."}
```

## Estados Visuales del Componente

| Estado CSS | Efecto Visual |
|------------|---------------|
| `idle` | 🍏👓🎓 (normal) |
| `thinking` | bounce animation |
| `idea` | 💡 + texto animado |
| `celebrate` | dance rotation |
| `error` | shake + rojo |

## Integración con Lottie (Futuro)

Para animaciones Lottie, modificar `_setState()`:

```javascript
_setState(newState) {
  const lottiePaths = {
    thinking: '/animations/thinking.json',
    celebrate: '/animations/celebrate.json',
    // etc.
  };
  
  if (lottiePaths[newState]) {
    this._loadLottie(lottiePaths[newState]);
  }
}
```

## Notas de Implementación

- El componente usa Shadow DOM para aislamiento de estilos
- Los colores siguen la paleta de Windows 98 (#c0c0c0, #000080)
- El webhook debe estar en el mismo dominio o tener CORS configurado
- Para producción, usar HTTPS y API Key en headers