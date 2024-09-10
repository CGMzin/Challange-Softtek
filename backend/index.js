import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// import { insertMessage, getAllMessages } from './src/db/db.js';
// import { messages } from './src/db/schema.js';
import { main } from './src/langchain/langchain.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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

app.get('/teste', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'public', 'teste.html'));
});

// Example route to interact with the database
app.get('/messages', async (req, res) => {
  try {
    // const rows = await getAllMessages();
    // const lastMessage = rows[rows.length - 1]; // Get the last message
    // res.json(lastMessage.content);
    main()

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});