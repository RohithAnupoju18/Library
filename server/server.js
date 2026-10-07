const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const projectRoot = path.join(__dirname, '..');

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

app.get('/', (req, res) => {
  res.sendFile(path.join(projectRoot, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`University Library app running at http://localhost:${PORT}`);
});
