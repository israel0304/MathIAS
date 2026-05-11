const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      display: inline-block;
      font-family: "Nunito", "Segoe UI", sans-serif;
      font-size: 14px;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 600px;
      width: 100%;
    }

    .chat-area {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      width: 100%;
      min-width: 0;
    }

    .character {
      position: relative;
      width: 100px;
      height: 110px;
      flex-shrink: 0;
    }

    .apple {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 75px;
    }

    .cap {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 30px;
    }

    .face {
      position: absolute;
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%);
      width: 70px;
      height: 50px;
    }

    .bubble {
      flex: 1;
      min-width: 0;
      background: #ffffff;
      border-radius: 20px;
      padding: 16px 20px;
      position: relative;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      min-height: 80px;
      max-height: 400px;
      overflow-y: auto;
      overflow-x: hidden;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .bubble::before {
      content: '';
      position: absolute;
      left: -12px;
      bottom: 20px;
      width: 0;
      height: 0;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-right: 12px solid #ffffff;
    }

    .bubble-text {
      color: #333;
      font-size: 14px;
      line-height: 1.6;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }

    .bubble-text .katex-html[aria-hidden="true"] {
      display: none !important;
    }

    .bubble-text .katex-mathml {
      display: inline !important;
    }

    .bubble-text .katex {
      font-size: 1.1em;
    }

    .bubble-text .katex-display {
      margin: 12px 0;
      overflow-x: auto;
      max-width: 100%;
      padding: 8px 0;
    }

    .bubble-text p {
      margin: 8px 0;
    }

    .bubble-text strong {
      color: #4a4a4a;
    }

    .bubble-text code {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      word-break: break-all;
    }

    .bubble-text pre {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 12px 0;
      max-width: 100%;
    }

    .bubble-text ul, .bubble-text ol {
      margin: 8px 0;
      padding-left: 24px;
    }

    .input-area {
      display: flex;
      gap: 10px;
      width: 100%;
    }

    input[type="text"] {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 25px;
      font-family: inherit;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      outline: none;
      transition: box-shadow 0.3s ease;
    }

    input[type="text"]:focus {
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    button {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      border: none;
      border-radius: 25px;
      padding: 12px 24px;
      color: white;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(245, 87, 108, 0.5);
    }

    button:active:not(:disabled) {
      transform: translateY(0);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Animations */
    .character.thinking .apple {
      animation: bounce 0.6s ease-in-out infinite;
    }

    .character.idea .face {
      animation: glow 1s ease-in-out infinite;
    }

    .character.celebrate .apple {
      animation: celebrate 0.4s ease-in-out infinite;
    }

    .character.error .apple {
      animation: shake 0.5s ease;
    }

    @keyframes bounce {
      0%, 100% { transform: translateX(-50%) translateY(0); }
      50% { transform: translateX(-50%) translateY(-8px); }
    }

    @keyframes glow {
      0%, 100% { filter: drop-shadow(0 0 0px rgba(255, 215, 0, 0)); }
      50% { filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8)); }
    }

    @keyframes celebrate {
      0%, 100% { transform: translateX(-50%) rotate(0deg) scale(1); }
      25% { transform: translateX(-50%) rotate(-5deg) scale(1.05); }
      75% { transform: translateX(-50%) rotate(5deg) scale(1.05); }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(-50%) translateX(0); }
      20% { transform: translateX(-50%) translateX(-8px); }
      40% { transform: translateX(-50%) translateX(8px); }
      60% { transform: translateX(-50%) translateX(-8px); }
      80% { transform: translateX(-50%) translateX(8px); }
    }

    /* Status */
    .status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #4ade80;
    }

    .status-dot.thinking {
      background: #fbbf24;
      animation: pulse 0.8s ease-in-out infinite;
    }

    .status-dot.error {
      background: #f87171;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.2); }
    }

    /* Title */
    .title {
      color: white;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 1px;
    }
  </style>

  <div class="container">
    <div class="title">🍎 MathIAs 🎓</div>
    
    <div class="chat-area">
      <div class="character" id="character">
        <svg class="cap" viewBox="0 0 60 30">
          <!-- Birrete / Graduation Cap -->
          <path d="M5 25 L10 5 L50 5 L55 25 Z" fill="#1a1a2e"/>
          <rect x="8" y="3" width="44" height="8" rx="2" fill="#1a1a2e"/>
          <circle cx="30" cy="2" r="4" fill="#ffd700"/>
          <line x1="30" y1="2" x2="50" y2="15" stroke="#ffd700" stroke-width="2"/>
        </svg>
        
        <svg class="face" viewBox="0 0 70 50">
          <!-- Eyes -->
          <g id="eyes">
            <!-- Normal - idle -->
            <g class="eyes-idle">
              <ellipse cx="22" cy="25" rx="8" ry="10" fill="white"/>
              <ellipse cx="48" cy="25" rx="8" ry="10" fill="white"/>
              <circle cx="22" cy="25" r="4" fill="#1a1a2e"/>
              <circle cx="48" cy="25" r="4" fill="#1a1a2e"/>
              <circle cx="20" cy="23" r="2" fill="white"/>
              <circle cx="46" cy="23" r="2" fill="white"/>
            </g>
            <!-- Thinking -->
            <g class="eyes-thinking" style="display: none;">
              <ellipse cx="22" cy="28" rx="8" ry="10" fill="white"/>
              <ellipse cx="48" cy="28" rx="8" ry="10" fill="white"/>
              <circle cx="22" cy="30" r="3" fill="#1a1a2e"/>
              <circle cx="48" cy="30" r="3" fill="#1a1a2e"/>
            </g>
            <!-- Idea -->
            <g class="eyes-idea" style="display: none;">
              <ellipse cx="22" cy="22" rx="10" ry="12" fill="white"/>
              <ellipse cx="48" cy="22" rx="10" ry="12" fill="white"/>
              <circle cx="22" cy="22" r="5" fill="#ffd700"/>
              <circle cx="48" cy="22" r="5" fill="#ffd700"/>
              <circle cx="20" cy="20" r="2" fill="white"/>
              <circle cx="46" cy="20" r="2" fill="white"/>
            </g>
            <!-- Celebrate -->
            <g class="eyes-celebrate" style="display: none;">
              <path d="M14 22 Q22 28 30 22" stroke="#1a1a2e" stroke-width="2" fill="none"/>
              <path d="M40 22 Q48 28 56 22" stroke="#1a1a2e" stroke-width="2" fill="none"/>
            </g>
            <!-- Error -->
            <g class="eyes-error" style="display: none;">
              <ellipse cx="22" cy="25" rx="8" ry="10" fill="white"/>
              <ellipse cx="48" cy="25" rx="8" ry="10" fill="white"/>
              <line x1="14" y1="20" x2="26" y2="30" stroke="#1a1a2e" stroke-width="2"/>
              <line x1="26" y1="20" x2="14" y2="30" stroke="#1a1a2e" stroke-width="2"/>
              <line x1="40" y1="20" x2="52" y2="30" stroke="#1a1a2e" stroke-width="2"/>
              <line x1="52" y1="20" x2="40" y2="30" stroke="#1a1a2e" stroke-width="2"/>
            </g>
          </g>
          
          <!-- Glasses -->
          <circle cx="22" cy="25" r="14" fill="none" stroke="#1a1a2e" stroke-width="2"/>
          <circle cx="48" cy="25" r="14" fill="none" stroke="#1a1a2e" stroke-width="2"/>
          <line x1="36" y1="25" x2="34" y2="25" stroke="#1a1a2e" stroke-width="2"/>
          
          <!-- Mouth -->
          <g id="mouth">
            <path class="mouth-idle" d="M25 40 Q35 45 45 40" stroke="#1a1a2e" stroke-width="2" fill="none"/>
            <path class="mouth-thinking" style="display: none;" d="M28 42 Q35 40 42 42" stroke="#1a1a2e" stroke-width="2" fill="none"/>
            <path class="mouth-idea" style="display: none;" d="M25 40 Q35 48 45 40" stroke="#1a1a2e" stroke-width="2" fill="none"/>
            <path class="mouth-celebrate" style="display: none;" d="M22 40 Q35 50 48 40 Z" fill="#1a1a2e"/>
            <path class="mouth-error" style="display: none;" d="M28 44 Q35 40 42 44" stroke="#1a1a2e" stroke-width="2" fill="none"/>
          </g>
        </svg>
        
        <svg class="apple" viewBox="0 0 80 75">
          <defs>
            <linearGradient id="appleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#FF6B6B"/>
              <stop offset="100%" style="stop-color:#E74C3C"/>
            </linearGradient>
          </defs>
          <path d="M40 0 C20 0 10 15 10 35 C10 55 20 65 25 70 C25 65 30 55 40 55 C50 55 55 65 55 70 C55 65 60 55 70 35 C70 15 60 0 40 0" fill="url(#appleGrad)"/>
          <path d="M40 5 C40 20 45 30 55 25" stroke="#2d5a27" stroke-width="3" fill="none"/>
          <ellipse cx="30" cy="25" rx="8" ry="12" fill="rgba(255,255,255,0.2)"/>
        </svg>
      </div>
      
      <div class="bubble">
        <div class="bubble-text" id="bubbleText">
          ¡Hola! Soy MathIAs. 🍎🎓 ¿En qué puedo ayudarte con matemáticas hoy?
        </div>
      </div>
    </div>
    
    <div class="status">
      <span class="status-dot" id="statusDot"></span>
      <span id="statusText">Listo para ayudarte</span>
    </div>
    
    <div class="input-area">
      <input type="text" id="userInput" placeholder="Escribe tu pregunta matemática..." maxlength="200" />
      <button id="sendBtn">Enviar</button>
    </div>
  </div>
`;

class MathIAs extends HTMLElement {
  static get observedAttributes() {
    return ['webhook-url', 'api-key'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(TEMPLATE.content.cloneNode(true));

    this._state = 'idle';
    this._webhookUrl = 'http://localhost:3001/api/chat';
    this._apiKey = '';
    this._lastInteraction = null;
    this._sessionId = 'mathias-session';
  }

  connectedCallback() {
    this._character = this.shadowRoot.getElementById('character');
    this._bubbleText = this.shadowRoot.getElementById('bubbleText');
    this._userInput = this.shadowRoot.getElementById('userInput');
    this._sendBtn = this.shadowRoot.getElementById('sendBtn');
    this._statusDot = this.shadowRoot.getElementById('statusDot');
    this._statusText = this.shadowRoot.getElementById('statusText');

    this._sendBtn.addEventListener('click', () => this._handleSend());
    this._userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this._handleSend();
    });
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'webhook-url') {
      this._webhookUrl = newVal;
    } else if (name === 'api-key') {
      this._apiKey = newVal;
    }
  }

  get webhookUrl() {
    return this._webhookUrl;
  }

  set webhookUrl(value) {
    this.setAttribute('webhook-url', value);
  }

  get apiKey() {
    return this._apiKey;
  }

  set apiKey(value) {
    this.setAttribute('api-key', value);
  }

  _setState(newState) {
    this._state = newState;
    this._character.className = 'character';
    this._statusDot.className = 'status-dot';
    this._statusText.textContent = 'Listo para ayudarte';

    const eyesGroups = this._character.querySelectorAll('#eyes > g');
    eyesGroups.forEach(g => g.style.display = 'none');

    const mouths = this._character.querySelectorAll('#mouth > path');
    mouths.forEach(m => m.style.display = 'none');

    switch (newState) {
      case 'thinking':
        this._character.classList.add('thinking');
        this._statusDot.classList.add('thinking');
        this._statusText.textContent = 'Pensando...';
        this._character.querySelector('.eyes-thinking').style.display = 'block';
        this._character.querySelector('.mouth-thinking').style.display = 'block';
        break;
      case 'idea':
        this._character.classList.add('idea');
        this._statusText.textContent = '¡Tengo una idea!';
        this._character.querySelector('.eyes-idea').style.display = 'block';
        this._character.querySelector('.mouth-idea').style.display = 'block';
        break;
      case 'celebrate':
        this._character.classList.add('celebrate');
        this._statusText.textContent = '¡Excelente! 🎉';
        this._character.querySelector('.eyes-celebrate').style.display = 'block';
        this._character.querySelector('.mouth-celebrate').style.display = 'block';
        break;
      case 'error':
        this._character.classList.add('error');
        this._statusDot.classList.add('error');
        this._statusText.textContent = '¡Ups! Algo salió mal';
        this._character.querySelector('.eyes-error').style.display = 'block';
        this._character.querySelector('.mouth-error').style.display = 'block';
        break;
      default:
        this._character.querySelector('.eyes-idle').style.display = 'block';
        this._character.querySelector('.mouth-idle').style.display = 'block';
    }
  }

  _handleSend() {
    const message = this._userInput.value.trim();
    if (!message) return;

    this._userInput.disabled = true;
    this._sendBtn.disabled = true;
    this._setState('thinking');
    this._renderBubble('Hmm, déjame pensar en eso...');

    this._sendToBackend(message)
      .then(response => this._handleResponse(response))
      .catch(error => this._handleError(error));
  }

  async _sendToBackend(message) {
    console.log('[MathIAs] Enviando mensaje:', message);
    console.log('[MathIAs] URL del webhook:', this._webhookUrl);

    const headers = {
      'Content-Type': 'application/json',
    };

    if (this._apiKey) {
      headers['Authorization'] = `Bearer ${this._apiKey}`;
    }

    const payload = {
      mensaje: message,
      timestamp: new Date().toISOString(),
      historial: this._lastInteraction || null,
      sessionId: this._sessionId
    };
    console.log('[MathIAs] Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(this._webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      console.log('[MathIAs] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MathIAs] Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('[MathIAs] Fetch error:', error.message);
      throw error;
    }
  }

  _handleResponse(response) {
    this._userInput.disabled = false;
    this._sendBtn.disabled = false;

    console.log('[MathIAs] Response:', JSON.stringify(response, null, 2));

    let respuesta = '';
    let accion = 'idle';

    if (typeof response === 'string') {
      respuesta = response;
    } else if (response.output) {
      respuesta = response.output;
      accion = response.action || 'idle';
    } else if (response.text) {
      respuesta = response.text;
    } else if (response.message) {
      respuesta = response.message;
    } else if (response.respuesta) {
      respuesta = response.respuesta;
      accion = response.accion || 'idle';
    } else {
      respuesta = JSON.stringify(response);
    }

    this._lastInteraction = respuesta;

    if (accion) {
      this._setState(accion);
    } else {
      this._setState('idle');
    }

    this._renderBubble(respuesta);
  }

  _renderBubble(text) {
      const container = this._bubbleText;
      
      text = text
        .replace(/\\\\/g, '\\')
        .replace(/\n/g, '<br>')
        .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
      
      container.innerHTML = text;
      
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(container, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
          ],
          throwOnError: false,
          trust: false,
          strict: false
        });
        
        container.querySelectorAll('.katex-html').forEach(el => el.remove());
      }
    }

  _handleError(error) {
    console.error('=================== MathIAs Error ===================');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('====================================================');

    this._userInput.disabled = false;
    this._sendBtn.disabled = false;
    this._setState('error');
    this._renderBubble('¡Ups! No pude conectar con el servidor. ¿Podrías intentar de nuevo?');
  }

  setMessage(message) {
    this._renderBubble(message);
  }

  reset() {
    this._userInput.value = '';
    this._renderBubble('¡Hola! Soy MathIAs. 🍎🎓 ¿En qué puedo ayudarte con matemáticas hoy?');
    this._lastInteraction = null;
    this._sessionId = 'mathias-session';
    this._setState('idle');
  }
}

customElements.define('mathias-asistente', MathIAs);