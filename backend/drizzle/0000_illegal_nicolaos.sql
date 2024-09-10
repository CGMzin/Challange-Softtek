CREATE TABLE `messages` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`sessionId` integer NOT NULL,
	`senderId` integer NOT NULL,
	`senderType` text NOT NULL,
	`createdAt` integer NOT NULL
);
