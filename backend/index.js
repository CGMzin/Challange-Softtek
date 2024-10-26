import express from "express";
import path from "path";
import { fileURLToPath } from "url";
// import { messages } from './src/db/schema.js';
import { main, geraHistorico } from "./src/langchain/langchain.js";
import { insertMessage, getMessagesById, retornaQtdChamados, insertConversa, removeConversasVazias, getDados,
    getChamadoByIdConversa, salvaChamado } from "./src/db/db.js";
import { v7 as uuidv7 } from "uuid";
import cookieParser from "cookie-parser";
import { data } from "./src/db/data.js";
import { insertChamado } from "./src/db/db.js";

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
	res.cookie("sessionId", uuidv7(), { maxAge: 2 * 60 * 60 * 1000 });
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

app.get("/pdf", async (req, res) => {
    try{
        const sessionId = req.cookies.sessionId;	
        removeConversasVazias();
        const messages = await getMessagesById(sessionId);
        res.setHeader("Content-Type", "application/json");
        if (messages.length === 0) {
            res.json({ redirect: "index.html", r: "000" });
        } else {
            res.json({ redirect: "visualizacao.html" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
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
        res.cookie("sessionId", sessionId, { maxAge: 2 * 60 * 60 * 1000 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/messages", async (req, res) => {
    try {
        var sessionId = req.cookies.sessionId;
        if (!sessionId) {
            sessionId = uuidv7();
            res.cookie("sessionId", sessionId, { maxAge: 2 * 60 * 60 * 1000 });
        }
        const allMessages = await getMessagesById(sessionId);
        if(allMessages.length == 0){
            removeConversasVazias();
            sessionId = uuidv7();
            res.cookie("sessionId", sessionId, { maxAge: 2 * 60 * 60 * 1000 });
            insertConversa(sessionId, Date.now().toString());
            insertMessage("Olá, sou o assistente virtual da SoftTek, como posso te ajudar?", sessionId, 0, "system", Date.now());
        }
        res.json(allMessages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/verificaChamado", async (req, res) => {
    try {
        var sessionId = req.cookies.sessionId;
        if (!sessionId) {
            sessionId = uuidv7();
        }
        const chamado = await getChamadoByIdConversa(sessionId);
        res.json(chamado);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/salvaChamado", async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        const { dataAbertura, titulo, descricao, solucao, dataFechamento, status, prioridade } = req.body;
        await salvaChamado(dataAbertura, titulo, descricao, solucao, dataFechamento, sessionId, status, prioridade);
        res.status(200).json({ message: "Chamado salvo com sucesso." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/dados", async (req, res) => {
    try {
        var sessionId = req.cookies.sessionId;
        const dados = await getDados(sessionId);
        res.json(dados);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/geraHistorico", async (req, res) => {
    try {
        await removeConversasVazias();
        const historico = await geraHistorico();
        res.json(historico);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/initialize-chamados", async (req, res) => {
    try {
        const chamadosCount = await retornaQtdChamados();
        if (chamadosCount === 0) {
            for (const chamado of data) {
                await insertChamado(Date.now(), chamado.titulo, chamado.descricao, chamado.conclusao);
            }
            res.json({ message: "Chamados initialized successfully." });
        } else {
            res.json({ message: "Chamados already initialized." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
