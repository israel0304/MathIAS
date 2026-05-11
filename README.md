# MathIAs - Asistente de Matemáticas con IA

MathIAs es un tutor matemático inteligente que usa el método socrático para enseñar matemáticas sin dar la solución directa.

## Arquitectura

```
┌─────────────┐     HTTP      ┌─────────────┐     API      ┌─────────┐
│   Frontend  │ ───────────▶  │  Node.js    │ ──────────▶ │ Ollama  │
│  (Web Comp) │               │  Express    │             │   IA    │
│             │ ◀──────────── │             │ ◀────────── │         │
└─────────────┘   JSON        └─────────────┘   JSON      └─────────┘
```

## Requisitos

- [Node.js](https://nodejs.org/) (v18+)
- [Ollama](https://ollama.ai/) instalado y corriendo

## Instalación

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   # Editar .env según sea necesario
   PORT=3001
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   ```

4. **Iniciar Ollama** (en otra terminal):
   ```bash
   ollama serve
   ```

5. **Iniciar el servidor:**
   ```bash
   npm start
   ```

6. **Abrir el frontend:**
   - Usa VS Code con extensión "Live Server"
   - O abre `index.html` directamente (el servidor Express maneja CORS)

## Uso

1. Abre `index.html` en el navegador
2. Escribe tu pregunta matemática en el campo de texto
3. Presiona "Enviar" o Enter
4. MathIAs te guiará con preguntas socráticas

## Comandos útiles

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo (con hot reload)
npm run dev

# Probar el servidor con curl
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"mensaje":"Hola, cómo resuelvo una ecuación?","timestamp":"2024-01-01T00:00:00Z","historial":null,"sessionId":"test"}'

# Verificar salud del servidor
curl http://localhost:3001/health
```

## Archivos del proyecto

```
MathIAS/
├── index.html      # Página principal con el componente MathIAs
├── mathias.js      # Web Component (frontend)
├── server.js       # Servidor Node.js/Express (backend)
├── package.json    # Dependencias de Node.js
├── .env            # Variables de entorno
├── ESQUEMA.md      # Documentación de la API
└── README.md       # Este archivo
```

## Configuración avanzada

### Cambiar el modelo de Ollama

En `.env`:
```
OLLAMA_MODEL=mistral
```

### Cambiar el puerto

En `.env`:
```
PORT=8080
```

### Desplegar en producción

Para producción, puedes usar PM2:
```bash
npm install -g pm2
pm2 start server.js --name mathias
```

## Solución de problemas

### "Ollama no está corriendo"
```bash
ollama serve
```

### "Cannot connect to Ollama"
Verifica que Ollama esté en la URL correcta en `.env`:
```
OLLAMA_URL=http://localhost:11434
```

### Probar si Ollama funciona
```bash
curl http://localhost:11434/api/tags
```

## Método Socrático

MathIAs nunca da la solución directa. En su lugar:

1. **Pregunta** - "¿Qué crees que deberías hacer primero?"
2. **Guía** - "¿Qué pasaría si...?"
3. **Celebra** - "¡Correcto! Lo entendiste muy bien."

El tutor usa la Teoría de Situaciones Didácticas de Brousseau para guiar el aprendizaje.