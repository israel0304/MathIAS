const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <div class="mathias-widget">
    <!-- Botón flotante -->
    <button class="floating-btn" id="floatingBtn">🍎</button>

    <!-- Ventana de chat -->
    <div class="chat-window" id="chatWindow">
      <!-- Header -->
      <div class="chat-header">
        <div class="title">
          <span>🍎</span>
          <span>MathIAs - Tutor</span>
        </div>
        <button class="close-btn" id="closeBtn">✕</button>
      </div>

      <!-- Área de mensajes -->
      <div class="messages-container" id="messagesContainer">
        <!-- Mensaje de bienvenida -->
        <div class="welcome-message" id="welcomeMessage">
          <div class="character-welcome">
            <svg class="cap" viewBox="0 0 60 30">
              <path d="M5 25 L10 5 L50 5 L55 25 Z" fill="#1a1a2e"/>
              <rect x="8" y="3" width="44" height="8" rx="2" fill="#1a1a2e"/>
              <circle cx="30" cy="2" r="4" fill="#ffd700"/>
              <line x1="30" y1="2" x2="50" y2="15" stroke="#ffd700" stroke-width="2"/>
            </svg>
            <svg class="face" viewBox="0 0 70 50">
              <ellipse cx="22" cy="25" rx="8" ry="10" fill="white"/>
              <ellipse cx="48" cy="25" rx="8" ry="10" fill="white"/>
              <circle cx="22" cy="25" r="4" fill="#1a1a2e"/>
              <circle cx="48" cy="25" r="4" fill="#1a1a2e"/>
              <circle cx="20" cy="23" r="2" fill="white"/>
              <circle cx="46" cy="23" r="2" fill="white"/>
              <circle cx="22" cy="25" r="14" fill="none" stroke="#1a1a2e" stroke-width="2"/>
              <circle cx="48" cy="25" r="14" fill="none" stroke="#1a1a2e" stroke-width="2"/>
              <line x1="36" y1="25" x2="34" y2="25" stroke="#1a1a2e" stroke-width="2"/>
              <path d="M25 40 Q35 45 45 40" stroke="#1a1a2e" stroke-width="2" fill="none"/>
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
          <p>¡Hola! Soy MathIAs. 🍎🎓<br>¿En qué puedo ayudarte con matemáticas hoy?</p>
        </div>
      </div>

      <!-- Status -->
      <div class="status">
        <span class="status-dot" id="statusDot"></span>
        <span id="statusText">Listo para ayudarte</span>
      </div>

      <!-- Área de input -->
      <div class="input-container">
        <input type="text" id="userInput" placeholder="Escribe tu pregunta matemática..." maxlength="200" />
        <button id="sendBtn">Enviar</button>
        <button class="reset-chat-btn" id="resetChatBtn" title="Reiniciar conversación">🔄</button>
      </div>

      <!-- Handle de redimensionamiento -->
      <div class="resize-handle" id="resizeHandle"></div>
    </div>
  </div>
`;

class MathIAs extends HTMLElement {
  static get observedAttributes() {
    return ['webhook-url', 'api-key'];
  }

  constructor() {
    super();
    this.appendChild(TEMPLATE.content.cloneNode(true));

    this._state = 'idle';
    this._webhookUrl = 'http://localhost:3001/api/chat';
    this._apiKey = '';
    this._lastInteraction = null;
    this._sessionId = 'mathias-session';

    // Nuevas propiedades para el widget flotante
    this._isOpen = false;
    this._messages = [];
    this._isResizing = false;
    this._startX = 0;
    this._startY = 0;
    this._startWidth = 0;
    this._startHeight = 0;
  }

  connectedCallback() {
    // Elementos del DOM
    this._floatingBtn = this.querySelector('#floatingBtn');
    this._chatWindow = this.querySelector('#chatWindow');
    this._closeBtn = this.querySelector('#closeBtn');
    this._messagesContainer = this.querySelector('#messagesContainer');
    this._welcomeMessage = this.querySelector('#welcomeMessage');
    this._userInput = this.querySelector('#userInput');
    this._sendBtn = this.querySelector('#sendBtn');
    this._resetChatBtn = this.querySelector('#resetChatBtn');
    this._statusDot = this.querySelector('#statusDot');
    this._statusText = this.querySelector('#statusText');
    this._resizeHandle = this.querySelector('#resizeHandle');

    // Cargar datos guardados
    this._loadSavedMessages();
    this._loadSavedSize();

    // Inicializar posición en esquina inferior derecha si no hay datos guardados
    if (!localStorage.getItem('mathias_left')) {
      const defaultWidth = 450;
      const rightMargin = 20;
      this._chatWindow.style.left = (window.innerWidth - rightMargin - defaultWidth) + 'px';
    }

    // Event listeners
    this._floatingBtn.addEventListener('click', () => this._toggleChat());
    this._closeBtn.addEventListener('click', () => this._toggleChat());
    this._sendBtn.addEventListener('click', () => this._handleSend());
    this._resetChatBtn.addEventListener('click', () => this._handleInternalReset());
    this._userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this._handleSend();
    });

    // Click fuera para cerrar
    document.addEventListener('click', (e) => this._handleClickOutside(e));

    // Resize observer para guardar tamaño
    this._setupResizeObserver();

    // Event listeners para redimensionar desde esquina inferior izquierda
    this._boundDoResize = (e) => this._doResize(e);
    this._boundStopResize = () => this._stopResize();
    this._resizeHandle.addEventListener('mousedown', (e) => this._startResize(e));
    document.addEventListener('mousemove', this._boundDoResize);
    document.addEventListener('mouseup', this._boundStopResize);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._handleClickOutside);
    if (this._boundDoResize) document.removeEventListener('mousemove', this._boundDoResize);
    if (this._boundStopResize) document.removeEventListener('mouseup', this._boundStopResize);
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }
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

  // ========== NUEVOS MÉTODOS DEL WIDGET ==========

  _toggleChat() {
    this._isOpen = !this._isOpen;
    if (this._isOpen) {
      this._chatWindow.classList.add('open');
      this._floatingBtn.classList.add('open');
      this._userInput.focus();
    } else {
      this._chatWindow.classList.remove('open');
      this._floatingBtn.classList.remove('open');
    }
  }

  _handleClickOutside(e) {
    if (this._isOpen &&
      !this._chatWindow.contains(e.target) &&
      !this._floatingBtn.contains(e.target)) {
      this._toggleChat();
    }
  }

  _setupResizeObserver() {
    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.round(entry.contentRect.width);
        const height = Math.round(entry.contentRect.height);
        this._saveSize(width, height);
      }
    });
    this._resizeObserver.observe(this._chatWindow);
  }

  _saveSize(width, height) {
    localStorage.setItem('mathias_width', width);
    localStorage.setItem('mathias_height', height);
    localStorage.setItem('mathias_left', this._chatWindow.style.left);
  }

  _loadSavedSize() {
    const savedWidth = localStorage.getItem('mathias_width');
    const savedHeight = localStorage.getItem('mathias_height');
    const savedLeft = localStorage.getItem('mathias_left');
    if (savedWidth && savedHeight) {
      this._chatWindow.style.width = savedWidth + 'px';
      this._chatWindow.style.height = savedHeight + 'px';
      if (savedLeft) {
        this._chatWindow.style.left = savedLeft;
      }
    }
  }

  _startResize(e) {
    e.preventDefault();
    this._isResizing = true;
    this._startX = e.clientX;
    this._startY = e.clientY;
    this._startWidth = this._chatWindow.offsetWidth;
    this._startHeight = this._chatWindow.offsetHeight;
    document.body.style.cursor = 'se-resize';
    document.body.style.userSelect = 'none';
  }

  _doResize(e) {
    if (!this._isResizing) return;

    const delta = this._startX - e.clientX;
    const newWidth = this._startWidth + delta;
    const newHeight = this._startHeight + (e.clientY - this._startY);

    const minWidth = 350;
    const minHeight = 450;
    const maxWidth = 700;
    const maxHeight = 650;
    const rightMargin = 20;

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      this._chatWindow.style.width = newWidth + 'px';
      this._chatWindow.style.left = (window.innerWidth - rightMargin - newWidth) + 'px';
    }
    if (newHeight >= minHeight && newHeight <= maxHeight) {
      this._chatWindow.style.height = newHeight + 'px';
    }
  }

  _stopResize() {
    if (!this._isResizing) return;
    this._isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    const width = this._chatWindow.offsetWidth;
    const height = this._chatWindow.offsetHeight;
    this._saveSize(width, height);
  }

  _saveMessages() {
    localStorage.setItem('mathias_messages', JSON.stringify(this._messages));
  }

  _loadSavedMessages() {
    const saved = localStorage.getItem('mathias_messages');
    if (saved) {
      try {
        this._messages = JSON.parse(saved);
        if (this._messages.length > 0) {
          this._welcomeMessage.style.display = 'none';
          this._renderMessages();
        }
      } catch (e) {
        this._messages = [];
      }
    }
  }

  _addMessage(type, text) {
    if (!text) return;

    this._messages.push({ type, text, timestamp: new Date().toISOString() });
    this._saveMessages();

    if (this._messages.length > 0 && this._welcomeMessage) {
      this._welcomeMessage.style.display = 'none';
    }

    const messageEl = this._createMessageElement(type, text);
    this._messagesContainer.appendChild(messageEl);

    if (type !== 'user') {
      const bubbleText = messageEl.querySelector('.bubble-text');
      if (bubbleText) {
        this._renderMathInElement(bubbleText);
      }
    }

    this._messagesContainer.scrollTop = this._messagesContainer.scrollHeight;
  }

  _renderMessages() {
    this._messages.forEach(msg => {
      const messageEl = this._createMessageElement(msg.type, msg.text);
      this._messagesContainer.appendChild(messageEl);

      if (msg.type !== 'user') {
        const bubbleText = messageEl.querySelector('.bubble-text');
        if (bubbleText) {
          this._renderMathInElement(bubbleText);
        }
      }
    });

    this._messagesContainer.scrollTop = this._messagesContainer.scrollHeight;
  }

  _createMessageElement(type, text) {
    const div = document.createElement('div');
    div.className = `message ${type}`;

    if (type === 'user') {
      div.innerHTML = `
        <div class="bubble">
          <div class="bubble-text">${this._escapeHtml(text)}</div>
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="character-mini">
          <svg class="cap-mini" viewBox="0 0 60 30">
            <path d="M5 25 L10 5 L50 5 L55 25 Z" fill="#1a1a2e"/>
            <rect x="8" y="3" width="44" height="8" rx="2" fill="#1a1a2e"/>
            <circle cx="30" cy="2" r="4" fill="#ffd700"/>
          </svg>
          <svg class="face-mini" viewBox="0 0 70 50">
            <ellipse cx="22" cy="25" rx="8" ry="10" fill="white"/>
            <ellipse cx="48" cy="25" rx="8" ry="10" fill="white"/>
            <circle cx="22" cy="25" r="4" fill="#1a1a2e"/>
            <circle cx="48" cy="25" r="4" fill="#1a1a2e"/>
            <circle cx="22" cy="25" r="14" fill="none" stroke="#1a1a2e" stroke-width="2"/>
            <circle cx="48" cy="25" r="14" fill="none" stroke="#1a1a2e" stroke-width="2"/>
            <path d="M25 40 Q35 45 45 40" stroke="#1a1a2e" stroke-width="2" fill="none"/>
          </svg>
          <svg class="apple-mini" viewBox="0 0 80 75">
            <path d="M40 0 C20 0 10 15 10 35 C10 55 20 65 25 70 C25 65 30 55 40 55 C50 55 55 65 55 70 C55 65 60 55 70 35 C70 15 60 0 40 0" fill="#FF6B6B"/>
          </svg>
        </div>
        <div class="bubble">
          <div class="bubble-text"></div>
        </div>
      `;

      const bubbleText = div.querySelector('.bubble-text');
      if (text.startsWith('...')) {
        bubbleText.innerHTML = '<span class="thinking-dots"><span></span><span></span><span></span><span></span><span></span></span>';
      } else {
        bubbleText.innerHTML = text
          .replace(/\\\\/g, '\\')
          .replace(/\n/g, '<br>')
          .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
      }
    }

    return div;
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  _renderTextInElement(text, container) {
    if (!container) return;

    const processedText = text
      .replace(/\\\\/g, '\\')
      .replace(/\n/g, '<br>')
      .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

    container.innerHTML = processedText;

    this._renderMathInElement(container);
  }

  _renderMathInElement(container) {
    if (typeof katex === 'undefined') {
      console.warn('[MathIAs] KaTeX no está cargado');
      return;
    }

    let html = container.innerHTML;

    html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
          output: 'html'
        });
      } catch (e) {
        console.warn('[MathIAs] Error renderizando fórmula display:', e);
        return match;
      }
    });

    html = html.replace(/\$([^\$\n]+?)\$/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
          output: 'html'
        });
      } catch (e) {
        console.warn('[MathIAs] Error renderizando fórmula inline:', e);
        return match;
      }
    });

    container.innerHTML = html;
  }

  _handleInternalReset() {
    // Limpiar mensajes
    this._messages = [];
    localStorage.removeItem('mathias_messages');

    // Mostrar mensaje de bienvenida
    if (this._welcomeMessage) {
      this._welcomeMessage.style.display = 'block';
    }

    // Limpiar mensajes del DOM
    const existingMessages = this._messagesContainer.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Llamar al reset original
    this.reset();
  }

  // ========== MÉTODOS ORIGINALES PRESERVADOS ==========

  _setState(newState) {
    this._state = newState;

    const character = this.querySelector('.character-welcome');
    this._statusDot.className = 'status-dot';
    this._statusText.textContent = 'Listo para ayudarte';

    if (!character) {
      const messages = this._messagesContainer.querySelectorAll('.message');
      messages.forEach(msg => {
        const charEl = msg.querySelector('.character');
        if (charEl) {
          charEl.className = 'character';
        }
      });
    }

    switch (newState) {
      case 'thinking':
        this._statusDot.classList.add('thinking');
        this._statusText.textContent = 'Pensando...';
        break;
      case 'idea':
        this._statusText.textContent = '¡Tengo una idea!';
        break;
      case 'celebrate':
        this._statusText.textContent = '¡Excelente! 🎉';
        break;
      case 'error':
        this._statusDot.classList.add('error');
        this._statusText.textContent = '¡Ups! Algo salió mal';
        break;
    }
  }

  _handleSend() {
    const message = this._userInput.value.trim();
    if (!message) return;

    // Agregar mensaje del usuario
    this._addMessage('user', message);
    this._userInput.value = '';

    this._userInput.disabled = true;
    this._sendBtn.disabled = true;
    this._setState('thinking');

    // Mostrar mensaje de "pensando"
    const thinkingMsg = this._createMessageElement('mathias', '......');
    this._messagesContainer.appendChild(thinkingMsg);
    this._messagesContainer.scrollTop = this._messagesContainer.scrollHeight;

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

    // Determinar estado basado en la respuesta
    if (respuesta.includes('¡Correcto!') || respuesta.includes('¡Bien!') || respuesta.includes('excelente')) {
      accion = 'celebrate';
    } else if (respuesta.includes('idea') || respuesta.includes('momento')) {
      accion = 'idea';
    }

    this._setState(accion || 'idle');

    // Eliminar mensaje de "pensando" y agregar respuesta real
    const messages = this._messagesContainer.querySelectorAll('.message');
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.querySelector('.thinking-dots')) {
      lastMsg.remove();
    }

    this._addMessage('mathias', respuesta);
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

    const errorMsg = '¡Ups! No pude conectar con el servidor. ¿Podrías intentar de nuevo?';

    // Eliminar mensaje de "pensando" y mostrar error
    const messages = this._messagesContainer.querySelectorAll('.message');
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.querySelector('.thinking-dots')) {
        lastMsg.remove();
      }
    }

    this._addMessage('mathias', errorMsg);
  }

  setMessage(message) {
    this._addMessage('mathias', message);
  }

  reset() {
    this._userInput.value = '';
    this._lastInteraction = null;
    this._sessionId = 'mathias-session';
    this._setState('idle');
  }
}

customElements.define('mathias-asistente', MathIAs);