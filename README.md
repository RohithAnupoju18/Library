# University Library Portal

A responsive university digital library website built with HTML, CSS, JavaScript, and Express.js. It includes a home page, search filters, a B.Tech catalog, book details, dashboard, library services, rules, announcements, login/signup flow, and an Ollama-powered library assistant.

## Project structure

- index.html
- books.html
- btech.html
- book-details.html
- resources.html
- dashboard.html
- services.html
- rules.html
- announcements.html
- contact.html
- login.html
- signup.html
- css/style.css
- js/main.js
- js/books.js
- js/chatbot.js
- js/auth.js
- data/books.json
- server/server.js

## Installation

```bash
npm install
```

## Run the project

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## Local AI assistant

Install and start [Ollama](https://ollama.com), then download the default model:

```bash
ollama pull qwen:latest
```

The Express server connects to `http://127.0.0.1:11434` and uses `qwen:latest` by default. Start the server after Ollama is running:

```bash
npm start
```

To use another installed model, set `OLLAMA_MODEL` when starting the server, for example `OLLAMA_MODEL=llama3.2:latest npm start`. The assistant uses the local book catalog as context and falls back to built-in topic suggestions if Ollama is unavailable.

## Features

- Search by book title, author, ISBN, subject, or keyword
- Category, author, year, and availability filters
- Book details page with reserve and wishlist actions
- Student/faculty dashboard
- Digital resource and service pages
- Ollama-powered assistant with catalog-grounded book recommendations
- Responsive mobile-friendly layout
