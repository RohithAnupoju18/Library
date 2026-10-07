# University Library Portal

A responsive university digital library website built with HTML, CSS, JavaScript, and Express.js. It includes a home page, search filters, book details, dashboard, library services, rules, announcements, login/signup flow, and a floating AI assistant prototype.

## Project structure

- index.html
- books.html
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

## Features

- Search by book title, author, ISBN, subject, or keyword
- Category, author, year, and availability filters
- Book details page with reserve and wishlist actions
- Student/faculty dashboard
- Digital resource and service pages
- AI assistant with sample library responses
- Responsive mobile-friendly layout

## AI Integration later

The chatbot interface is built to be easy to upgrade for a real AI API. The current logic is in `js/chatbot.js`, where the `getReply` function can be replaced with a fetch call to an external model API.

Example placeholder:

```javascript
const response = await fetch('/api/ai-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: inputValue })
});
```

You can add a server route later to connect OpenAI, Azure OpenAI, or a local LLM endpoint without redesigning the UI.
