const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const projectRoot = path.join(__dirname, '..');
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen:latest';

app.use(express.static(projectRoot));
app.use(express.json());

app.get('/api/books', (req, res) => {
  const booksPath = path.join(projectRoot, 'data', 'books.json');
  const raw = fs.readFileSync(booksPath, 'utf8');
  res.setHeader('Content-Type', 'application/json');
  res.send(raw);
});

app.get('/api/books/:id', (req, res) => {
  const booksPath = path.join(projectRoot, 'data', 'books.json');
  const raw = fs.readFileSync(booksPath, 'utf8');
  const books = JSON.parse(raw);
  const book = books.find(item => String(item.id) === String(req.params.id));

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  res.json(book);
});

app.post('/api/chat', async (req, res) => {
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  if (!message) {
    return res.status(400).json({ error: 'A message is required.' });
  }
  if (message.length > 1500) {
    return res.status(413).json({ error: 'Messages must be 1500 characters or fewer.' });
  }

  try {
    const booksPath = path.join(projectRoot, 'data', 'books.json');
    const books = JSON.parse(fs.readFileSync(booksPath, 'utf8'));
    const normalizedQuery = ` ${message.toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim()} `;
    const rankedBooks = books.map(book => {
      const searchTerms = [book.title, book.subject, ...(book.keywords || []), ...(book.topics || [])];
      const score = searchTerms.reduce((total, term) => {
        const normalizedTerm = ` ${term.toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').trim()} `;
        return total + (normalizedTerm.length > 2 && normalizedQuery.includes(normalizedTerm) ? 1 : 0);
      }, 0);
      return { book, score };
    }).sort((first, second) => second.score - first.score);
    const matchedBooks = rankedBooks.filter(item => item.score > 0).slice(0, 8).map(item => item.book);
    const candidateBooks = matchedBooks;
    const catalog = candidateBooks.map(({ title, author, subject, availability, location, description, keywords, topics }) => ({
      title, author, subject, availability, location, description,
      keywords: keywords || [],
      topics: topics || []
    }));
    const history = Array.isArray(req.body.history)
      ? req.body.history
        .filter(item => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
        .slice(-10)
        .map(item => ({ role: item.role, content: item.content.slice(0, 1500) }))
      : [];
    const ollamaResponse = await fetch(`${OLLAMA_URL.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        options: { temperature: 0.4, num_predict: 400 },
        messages: [
          {
            role: 'system',
            content: `You are a helpful, accurate conversational assistant for Annamacharya University Library. Answer questions on any topic, whether related or unrelated to the library, directly and clearly. For general knowledge, answer using your knowledge and state uncertainty when appropriate. For library questions, use the catalog below as the only source of book information. Do not name or recommend books; the application will add verified catalog matches. Do not invent availability, locations, library rules, contact details, or opening hours; if a library detail is not provided, say so. Keep replies concise and conversational.\n\nCatalog JSON:\n${JSON.stringify(catalog)}`
          },
          ...history,
          { role: 'user', content: message }
        ]
      }),
      signal: AbortSignal.timeout(60000)
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama returned HTTP ${ollamaResponse.status}`);
    }

    const result = await ollamaResponse.json();
    const answer = result.message?.content?.trim() || '';
    const replyParts = [answer];
    if (matchedBooks.length) {
      const book = matchedBooks[0];
      if (!answer.toLowerCase().includes(book.title.toLowerCase())) {
        replyParts.push(`A matching catalog reference is ${book.title} by ${book.author} (${book.availability}; location ${book.location}). ${book.description}`);
      }
    }
    const reply = replyParts.filter(Boolean).join('\n\n');
    if (!reply) {
      throw new Error('Ollama returned an empty response');
    }
    res.json({ reply, model: OLLAMA_MODEL });
  } catch (error) {
    console.error('Ollama chat request failed:', error.message);
    res.status(503).json({ error: 'The local Ollama model is unavailable. Start Ollama and try again.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`University Library app running at http://localhost:${PORT}`);
});
