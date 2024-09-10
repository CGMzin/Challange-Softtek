import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { messages } from './schema.js';

const sqlite = new Database('./database.db');
const db = drizzle(sqlite);

const insertMessage = async (content, senderId, senderType, createdAt) => {
  await db.insert(messages).values({
    content,
    senderId,
    senderType,
    createdAt,
  }).run();
};

const getAllMessages = async () => {
  return await db.select(messages).from(messages);
}

export { insertMessage, getAllMessages };