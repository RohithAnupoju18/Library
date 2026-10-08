document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  if (!body) return;

  const launcher = document.createElement('div');
  launcher.className = 'chatbot-launcher';
  launcher.innerHTML = `
    <button class="chatbot-button" aria-label="Open Library AI Assistant" title="Open Library AI Assistant">
      <span class="chatbot-robot" aria-hidden="true">🤖</span>
    </button>
  `;

  const chatbotWindow = document.createElement('div');
  chatbotWindow.className = 'chatbot-window';
  chatbotWindow.innerHTML = `
    <div class="chatbot-header">
      <div>
        <strong>Library AI Assistant</strong>
      </div>
      <button class="btn btn-secondary" id="clearChatBtn" style="padding: 8px 12px; font-size: 0.8rem;">Clear</button>
    </div>
    <div class="chatbot-body">
      <div class="chatbot-suggestions">
        <button class="suggestion-chip">Find books about Artificial Intelligence</button>
        <button class="suggestion-chip">Suggest B.Tech books for Data Structures</button>
        <button class="suggestion-chip">What are the library timings?</button>
        <button class="suggestion-chip">How many books can I borrow?</button>
        <button class="suggestion-chip">Show Computer Science resources</button>
        <button class="suggestion-chip">How can I renew a book?</button>
      </div>
      <div id="chatMessages"></div>
      <div class="typing-indicator" id="typingIndicator">
        <span></span><span></span><span></span>
      </div>
    </div>
    <div class="chatbot-footer">
      <input id="chatInput" type="text" placeholder="Ask me anything...">
      <button id="sendChatBtn" aria-label="Send message">➤</button>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(chatbotWindow);

  const toggleButton = launcher.querySelector('.chatbot-button');
  const windowEl = chatbotWindow;
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendChatBtn');
  const clearBtn = document.getElementById('clearChatBtn');
  const typingIndicator = document.getElementById('typingIndicator');
  const conversationHistory = [];
  let dragState = null;
  let suppressNextClick = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max));
  }

  function positionChatWindow() {
    const launcherRect = launcher.getBoundingClientRect();
    const panelWidth = Math.min(420, window.innerWidth - 24);
    windowEl.style.width = `${panelWidth}px`;
    windowEl.style.maxHeight = 'calc(100vh - 24px)';

    const left = clamp(
      launcherRect.left + (launcherRect.width - panelWidth) / 2,
      12,
      window.innerWidth - panelWidth - 12
    );
    const panelHeight = windowEl.getBoundingClientRect().height;
    const aboveTop = launcherRect.top - panelHeight - 12;
    const belowTop = launcherRect.bottom + 12;
    const top = aboveTop >= 12
      ? aboveTop
      : belowTop + panelHeight <= window.innerHeight - 12
        ? belowTop
        : clamp(launcherRect.top - panelHeight / 2, 12, window.innerHeight - panelHeight - 12);

    windowEl.style.left = `${left}px`;
    windowEl.style.right = 'auto';
    windowEl.style.top = `${top}px`;
    windowEl.style.bottom = 'auto';
  }

  function addMessage(text, sender = 'bot') {
    const row = document.createElement('div');
    row.className = `msg-row ${sender}`;
    const message = document.createElement('div');
    message.className = 'message';
    message.textContent = text;
    row.appendChild(message);
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    typingIndicator.classList.add('visible');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideTyping() {
    typingIndicator.classList.remove('visible');
  }

  async function getReply(input) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, history: conversationHistory })
    });
    const result = await response.json();
    if (!response.ok || !result.reply) {
      throw new Error(result.error || 'The local AI assistant is unavailable.');
    }

    conversationHistory.push(
      { role: 'user', content: input },
      { role: 'assistant', content: result.reply }
    );
    if (conversationHistory.length > 12) conversationHistory.splice(0, conversationHistory.length - 12);
    return result.reply;
  }

  async function sendMessage() {
    const inputValue = chatInput.value.trim();
    if (!inputValue) return;

    addMessage(inputValue, 'user');
    chatInput.value = '';
    showTyping();

    try {
      const reply = await getReply(inputValue);
      hideTyping();
      addMessage(reply, 'bot');
    } catch (error) {
      hideTyping();
      addMessage(`I couldn't reach the AI service: ${error.message}. Open this app through its Express server and make sure Ollama is running.`, 'bot');
    }
  }

  toggleButton.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rect: launcher.getBoundingClientRect(),
      moved: false
    };
    toggleButton.setPointerCapture(event.pointerId);
  });

  toggleButton.addEventListener('pointermove', (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    if (!dragState.moved && Math.hypot(deltaX, deltaY) < 6) return;

    dragState.moved = true;
    launcher.classList.add('dragging');
    launcher.style.left = `${clamp(dragState.rect.left + deltaX, 12, window.innerWidth - dragState.rect.width - 12)}px`;
    launcher.style.top = `${clamp(dragState.rect.top + deltaY, 12, window.innerHeight - dragState.rect.height - 12)}px`;
    launcher.style.right = 'auto';
    launcher.style.bottom = 'auto';
    if (windowEl.classList.contains('open')) positionChatWindow();
  });

  function endDrag(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    suppressNextClick = dragState.moved;
    dragState = null;
    launcher.classList.remove('dragging');
    if (suppressNextClick) setTimeout(() => { suppressNextClick = false; }, 0);
  }

  toggleButton.addEventListener('pointerup', endDrag);
  toggleButton.addEventListener('pointercancel', endDrag);

  toggleButton.addEventListener('click', () => {
    if (suppressNextClick) {
      suppressNextClick = false;
      return;
    }
    windowEl.classList.toggle('open');
    if (windowEl.classList.contains('open')) positionChatWindow();
  });

  window.addEventListener('resize', () => {
    if (launcher.style.left) {
      const rect = launcher.getBoundingClientRect();
      launcher.style.left = `${clamp(rect.left, 12, window.innerWidth - rect.width - 12)}px`;
      launcher.style.top = `${clamp(rect.top, 12, window.innerHeight - rect.height - 12)}px`;
    }
    if (windowEl.classList.contains('open')) positionChatWindow();
  });

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  clearBtn.addEventListener('click', () => {
    chatMessages.innerHTML = '';
    conversationHistory.length = 0;
    addMessage('Welcome to the Annamacharya University Library AI Assistant. Ask me anything, including library and B.Tech questions.', 'bot');
  });

  document.querySelectorAll('.suggestion-chip').forEach(button => {
    button.addEventListener('click', () => {
      chatInput.value = button.textContent;
      sendMessage();
    });
  });

  addMessage('Welcome to the Annamacharya University Library AI Assistant. Ask me anything, including library and B.Tech questions.', 'bot');
});
