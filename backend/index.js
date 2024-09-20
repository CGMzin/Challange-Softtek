import express from "express";
import path from "path";
import { fileURLToPath } from "url";
// import { messages } from './src/db/schema.js';
import { main, geraHistorico } from "./src/langchain/langchain.js";
import { insertMessage, getMessagesById, getAllMessages } from "./src/db/db.js";
import { v7 as uuidv7 } from "uuid";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/chat_limpo", (req, res) => {
	res.setHeader("Content-Type", "text/html");
	res.cookie("sessionId", uuidv7());
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/faq", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.join(__dirname, "public", "faq.html"));
});

app.get("/historico", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.sendFile(path.join(__dirname, "public", "historico.html"));
});

app.get("/clickHist", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.cookie("sessionId", req.query.content);
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/messages", async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;		

        insertMessage(req.body.content, sessionId, 1, "user", Date.now());
        main(req.body.content, sessionId).then((response) => {
            // insertMessage(req.body.content, 1, 'user', Date.now());
            // insertMessage(response, 1, 'system', Date.now());
            res.json({ text: response });
            insertMessage(response, sessionId, 0, "system", Date.now());
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/messages", async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            res.cookie("sessionId", uuidv7());
        }
        const allMessages = await getMessagesById(sessionId);
        if(allMessages.length == 0){
            insertMessage("Olá, sou o assistente virtual da SoftTek, como posso te ajudar?", sessionId, 0, "system", Date.now());
        }
        res.json(allMessages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/geraHistorico", async (req, res) => {
    try {	
		const historico = await geraHistorico();
		res.json(historico);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
