import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

const messages = sqliteTable('messages', {
  id: integer('id').primaryKey(),
  content: text('content').notNull(),
  sessionId: integer('sessionId').notNull(),
  senderId: integer('senderId').notNull(),
  senderType: text('senderType').notNull(), // 'user' or 'system'
  createdAt: integer('createdAt').notNull(),
});

export { messages };