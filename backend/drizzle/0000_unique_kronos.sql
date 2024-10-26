CREATE TABLE `chamados` (
	`id` integer PRIMARY KEY NOT NULL,
	`dataAbertura` text NOT NULL,
	`titulo` text NOT NULL,
	`descricao` text NOT NULL,
	`logs` text,
	`dataFechamento` text,
	`status` integer NOT NULL,
	`prioridade` integer NOT NULL,
	`idConversa` integer,
	FOREIGN KEY (`idConversa`) REFERENCES `conversas`(`sessionId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `conversas` (
	`sessionId` text PRIMARY KEY NOT NULL,
	`titulo` text NOT NULL,
	`dataInicio` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`senderId` text NOT NULL,
	`senderType` text NOT NULL,
	`createdAt` text NOT NULL,
	`idConversa` integer,
	FOREIGN KEY (`idConversa`) REFERENCES `conversas`(`sessionId`) ON UPDATE no action ON DELETE no action
);
