CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`intro` text NOT NULL,
	`body` text NOT NULL,
	`cover` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
