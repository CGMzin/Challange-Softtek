import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { messages } from "./schema.js";
import { eq, countDistinct } from "drizzle-orm";

const sqlite = new Database("./database.db");
const db = drizzle(sqlite);

const insertMessage = async (content, sessionId, senderId, senderType, createdAt) => {
    await db
        .insert(messages)
        .values({
            content,
            sessionId,
            senderId,
            senderType,
            createdAt,
        })
        .run();
};

const getMessagesById = async (sessionId) => {
    return await db.select(messages).from(messages).where(eq(messages.sessionId, sessionId));
};

const getAllMessages = async () => {
    return await db.select(messages).from(messages);
};

const retornaQtdMensagens = async () => {
    await db.select({ value: countDistinct(messages.sessionId) }).from(messages);
};

export { insertMessage, getMessagesById, getAllMessages };
