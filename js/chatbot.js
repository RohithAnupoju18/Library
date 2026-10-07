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
      <input id="chatInput" type="text" placeholder="Ask about books, services, or rules...">
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
    const text = input.toLowerCase();

    const topicKeywords = {
      'data structures': ['Data Structures and Algorithms in C++', 'Fundamentals of Data Structures in C'],
      'object oriented programming': ['Object Oriented Programming with C++'],
      'oop': ['Object Oriented Programming with C++'],
      'operating system': ['Operating System Concepts'],
      'dbms': ['Database System Concepts'],
      'database management system': ['Database System Concepts'],
      'database systems': ['Database System Concepts'],
      'database': ['Database System Concepts'],
      'computer networks': ['Computer Networks'],
      'artificial intelligence': ['Artificial Intelligence: A Modern Approach', 'Machine Learning for Everyone'],
      'machine learning': ['Machine Learning for Everyone', 'Data Science for Engineers'],
      'web technologies': ['Web Technologies: Theory and Practice'],
      'web development': ['Web Technologies: Theory and Practice'],
      'compiler design': ['Compiler Design in C'],
      'compiler': ['Compiler Design in C'],
      'computer graphics': ['Computer Graphics with OpenGL'],
      'digital logic': ['Digital Logic and Design'],
      'electronics': ['Introduction to Electronics', 'Digital Logic and Design'],
      'mathematics': ['Applied Mathematics for Computer Science'],
      'physics': ['Fundamentals of Physics']
    };

    const matchingTopic = Object.keys(topicKeywords).find(topic => text.includes(topic));

    if (matchingTopic) {
      const suggestions = topicKeywords[matchingTopic].join(', ');
      const topicName = matchingTopic.charAt(0).toUpperCase() + matchingTopic.slice(1);
      return `For ${topicName}, I recommend: ${suggestions}. These are strong B.Tech references for theory and practice. For deeper study, focus on: arrays, recursion, complexity analysis, problem-solving patterns, and lab assignments related to the topic.`;
    }

    if (text.includes('b.tech') || text.includes('btech') || text.includes('engineering') || text.includes('required book')) {
      return 'For B.Tech students, the best starting references are: Data Structures and Algorithms in C++, Object Oriented Programming with C++, Operating System Concepts, Database System Concepts, Computer Networks, and Web Technologies: Theory and Practice. I can suggest books by specific subject if you tell me your topic.';
    }

    if (text.includes('artificial intelligence') || text.includes('ai')) {
      return 'I can suggest resources like Artificial Intelligence: A Modern Approach, Machine Learning for Everyone, and other AI-related books available in the Computer Science section.';
    }

    if (text.includes('timing') || text.includes('hours') || text.includes('open')) {
      return 'The library is open Monday to Friday from 8:00 AM to 8:00 PM, Saturday from 9:00 AM to 4:00 PM, and closed on Sundays and public holidays.';
    }

    if (text.includes('borrow') || text.includes('book can i borrow') || text.includes('books can')) {
      return 'Students can borrow up to 5 books for 14 days at a time. Faculty members may borrow up to 10 books depending on their category.';
    }

    if (text.includes('renew') || text.includes('renewal')) {
      return 'Books can be renewed online through the dashboard or at the circulation desk before the due date, provided no other user has reserved them.';
    }

    if (text.includes('reserve') || text.includes('reservation')) {
      return 'To reserve a book, open the book details page and click “Reserve Book.” Reserved books are held for 48 hours for pickup.';
    }

    if (text.includes('computer science') || text.includes('resources')) {
      return 'The library has Computer Science resources including database systems, operating systems, software engineering, networking, AI, and data science collections in the digital resources section.';
    }

    if (text.includes('service') || text.includes('support')) {
      return 'Library services include borrowing, renewal, reservation, reference assistance, research support, thesis repository access, printing, scanning, and digital library resources.';
    }

    if (text.includes('contact') || text.includes('email') || text.includes('phone')) {
      return 'You can contact the library desk at +91 98765 43210 or library@annamacharyauniversity.edu.in for assistance and support.';
    }

    if (text.includes('hello') || text.includes('hi')) {
      return 'Hello! I can help you locate B.Tech books, suggest references by subject, answer borrowing rules, and explain library services. What would you like to know?';
    }

    if (text.includes('faq') || text.includes('fine') || text.includes('late')) {
      return 'Late returns may incur a nominal fine based on the default delay policy. Please check the dashboard for pending dues and the rules page for the complete fine structure.';
    }

    return 'I can help with B.Tech book recommendations, subject-specific references, library timings, borrowing rules, renewals, reservations, and basic contact information. Try asking for Data Structures, OOP, DBMS, Computer Networks, or AI.';
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
      addMessage('I could not find a suitable recommendation right now. Please try a topic like Data Structures, OOP, DBMS, or AI.', 'bot');
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
    addMessage('Welcome to the Annamacharya University Library AI Assistant. Ask me about B.Tech books, timings, borrowing rules, or resources.', 'bot');
  });

  document.querySelectorAll('.suggestion-chip').forEach(button => {
    button.addEventListener('click', () => {
      chatInput.value = button.textContent;
      sendMessage();
    });
  });

  addMessage('Welcome to the Annamacharya University Library AI Assistant. Ask me about B.Tech books, timings, borrowing rules, or resources.', 'bot');
});
