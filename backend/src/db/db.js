import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { messages, chamados } from "./schema.js";
import { eq, countDistinct } from "drizzle-orm";
import { conversas } from "./schema.js";
import { geraTituloConversa, geraDecricaoConversa, geraSolucaoConversa, geraPrioridadeConversa, geraStatusConversa } from "../langchain/langchain.js";
import { data } from "./data.js";

const sqlite = new Database("./database.db");
const db = drizzle(sqlite);

const insertMessage = async (content, idConversa, senderId, senderType, createdAt) => {
    const conversa = await db.select(conversas).from(conversas).where(eq(conversas.sessionId, idConversa)).get();

    await db
        .insert(messages)
        .values({
            content,
            idConversa,
            senderId,
            senderType,
            createdAt,
        })
        .run();

    if (conversa.titulo == "---" && senderType == "user") {
        const titulo = await geraTituloConversa(idConversa);
        const novoTitulo = titulo;
        await db.update(conversas).set({ titulo: novoTitulo }).where(eq(conversas.sessionId, idConversa)).run();
    }
};

const insertConversa = async (sessionId, dataInicio) => {
    await db
        .insert(conversas)
        .values({
            sessionId,
            titulo: "---",
            dataInicio,
        })
        .run();
};

const removeConversasVazias = async () => {
    const conversasVazias = await db.select(conversas).from(conversas).where(eq(conversas.titulo, "---")).all();
    for (const conversa of conversasVazias) {
        await db.delete(messages).where(eq(messages.idConversa, conversa.sessionId)).run();
        await db.delete(conversas).where(eq(conversas.sessionId, conversa.sessionId)).run();
    }
};

const getConversaById = async (sessionId) => {
    return await db.select(conversas).from(conversas).where(eq(conversas.sessionId, sessionId)).get();
};

const getAllConversas = async () => {
    return await db.select(conversas).from(conversas);
};

const getMessagesById = async (sessionId) => {
    return await db.select(messages).from(messages).where(eq(messages.idConversa, sessionId));
};

const getAllMessages = async () => {
    return await db.select(messages).from(messages);
};

const retornaQtdMensagens = async () => {
    await db.select({ value: countDistinct(messages.idConversa) }).from(messages);
};

const insertChamado = async (dataAbertura, titulo, descricao, logs = null, dataFechamento = null, status = 0, prioridade = 0, idConversa) => {
    await db
        .insert(chamados)
        .values({
            dataAbertura,
            titulo,
            descricao,
            logs,
            dataFechamento,
            status,
            prioridade,
            idConversa,
        })
        .run();
};

const salvaChamado = async (dataAbertura, titulo, descricao, logs = null, dataFechamento = null, idConversa, status, prioridade) => {
    const chamadoExistente = await getChamadoByIdConversa(idConversa);
    
    if (chamadoExistente.length > 0) {
        await db
            .update(chamados)
            .set({
                dataAbertura,
                titulo,
                descricao,
                logs,
                dataFechamento,
                status,
                prioridade,
            })
            .where(eq(chamados.idConversa, idConversa))
            .run();
    } else {
        await insertChamado(dataAbertura, titulo, descricao, logs, dataFechamento, status, prioridade, idConversa);
    }
};

const getChamadoById = async (id) => {
    return await db.select(chamados).from(chamados).where(eq(chamados.id, id));
};

const getChamadoByIdConversa = async (id) => {
    return await db.select(chamados).from(chamados).where(eq(chamados.idConversa, id));
};

const getAllChamados = async () => {
    return await db.select(chamados).from(chamados);
};

const retornaQtdChamados = async () => {
    const result = await db.select({ value: countDistinct(chamados.id) }).from(chamados);
    return result[0].value;
};

const getDados = async (sessionId) => {
    var chamado = await getChamadoByIdConversa(sessionId);
    if (chamado.length == 0) {
        const titulo = await geraTituloConversa(sessionId);
        const descricao = await geraDecricaoConversa(sessionId);
        const solucao = await geraSolucaoConversa(sessionId);
        const status = await geraStatusConversa(sessionId);
        const prioridade = await geraPrioridadeConversa(sessionId);
        const id = (await retornaQtdChamados()) + 1;
        const conversa = await getConversaById(sessionId);
        const dataInicio = conversa.dataInicio;

        return {
            titulo,
            descricao,
            solucao,
            status,
            prioridade,
            id,
            dataInicio,
            dataFechamento: null,
        };
    } else {
        const titulo = chamado[0].titulo;
        const descricao = chamado[0].descricao;
        const solucao = chamado[0].logs;
        const status = chamado[0].status ? chamado[0].status : "0";
        const dataFechamento = chamado[0].dataFechamento;
        const prioridade = chamado[0].prioridade ? chamado[0].prioridade : "2"; // Assuming a default value as it's not in the schema
        const id = chamado[0].id;
        const dataInicio = (await getConversaById(sessionId)).dataInicio;

        return {
            titulo,
            descricao,
            solucao,
            status,
            prioridade,
            id,
            dataInicio,
            dataFechamento,
        };
    }
};

export { insertMessage, getMessagesById, getAllMessages, insertChamado, retornaQtdChamados, getAllChamados, getChamadoById, 
    retornaQtdMensagens, insertConversa, removeConversasVazias, getAllConversas, getDados, getChamadoByIdConversa, salvaChamado };
