# MathIAs - Agent Instructions

## Project Structure
- `mathias.js` - Web Component (widget flotante)
- `mathias.css` - Estilos del widget
- `index.html` - Página de demostración
- `server.js` - Backend Node.js/Express
- `ESQUEMA.md` - Documentación de API

## Commands
```bash
npm start          # Iniciar servidor producción
npm run dev        # Iniciar servidor con hot reload (nodemon)
```

## Required Services
- **Ollama** - Debe estar corriendo (local o remoto)
- Config en `.env`: `OLLAMA_URL`, `OLLAMA_MODEL`, `API_KEY`

## Key Implementation Notes
- **Widget Flotante**: Posición fixed bottom-right, redimensionable y arrastrable
  - Tamaño: min 350x450px, max 700x650px, default 450x550px
  - Arrastrable: click y arrastra desde el header
  - Redimensionable: arrastrar esquina inferior derecha
- **Persistencia**: localStorage (`mathias_messages`, `mathias_width`, `mathias_height`, `mathias_left`, `mathias_top`)
- **No Shadow DOM**: CSS global en `mathias.css`
- **KaTeX**: Renderizado con `output: 'html'` (no MathML)
- **Reutilizable**: `<mathias-asistente webhook-url="..."></mathias-asistente>`

## Frontend Dependencies (CDN)
- KaTeX (CSS + JS + auto-render)
- Marked
- Google Fonts (Nunito)

## API Contract
- Endpoint: configurable via `webhook-url` attribute
- Request: `{ mensaje, timestamp, historial, sessionId }`
- Response: `{ respuesta, accion }` (accion: thinking/idea/celebrate/error)