CREATE TABLE `top_ups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text DEFAULT 'top_up' NOT NULL,
	`operator` text DEFAULT 'Otro' NOT NULL,
	`phone_number` text,
	`amount` integer NOT NULL,
	`cost` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_by` text DEFAULT 'turno' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
