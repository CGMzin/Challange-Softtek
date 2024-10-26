import { int } from "drizzle-orm/mysql-core";
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const conversas = sqliteTable("conversas", {
    sessionId: text("sessionId").primaryKey(),
    titulo: text("titulo").notNull(),
    dataInicio: text("dataInicio").notNull(),
});

export const messages = sqliteTable("messages", {
    id: integer("id").primaryKey(),
    content: text("content").notNull(),
    senderId: text("senderId").notNull(),
    senderType: text("senderType").notNull(),
    createdAt: text("createdAt").notNull(),
    idConversa: integer("idConversa").references(() => conversas.sessionId),
});

export const chamados = sqliteTable("chamados", {
    id: integer("id").primaryKey(),
    dataAbertura: text("dataAbertura").notNull(),
    titulo: text("titulo").notNull(),
    descricao: text("descricao").notNull(),
    logs: text("logs"), //SOLUÇÃO
    dataFechamento: text("dataFechamento"),
    status: integer("status").notNull(),
    prioridade: integer("prioridade").notNull(),
    idConversa: integer("idConversa").references(() => conversas.sessionId),
});