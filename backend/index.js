const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/chat_limpo', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'public', 'chat_limpo.html'));
});

app.get('/faq', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'public', 'faq.html'));
});

app.get('/historico', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'public', 'historico.html'));
});




// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});