CREATE TABLE `return_exchange_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`return_id` integer NOT NULL,
	`presentation_id` integer NOT NULL,
	`batch_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` integer NOT NULL,
	`total_price` integer NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`return_id`) REFERENCES `sale_returns`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`presentation_id`) REFERENCES `presentations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`batch_id`) REFERENCES `inventory_batches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_return_exchange_items_return` ON `return_exchange_items` (`return_id`);--> statement-breakpoint
CREATE INDEX `idx_return_exchange_items_batch` ON `return_exchange_items` (`batch_id`);--> statement-breakpoint
CREATE TABLE `return_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`return_id` integer NOT NULL,
	`sale_item_id` integer NOT NULL,
	`quantity_returned` integer NOT NULL,
	`condition` text NOT NULL,
	`adjustment_id` integer,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`return_id`) REFERENCES `sale_returns`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sale_item_id`) REFERENCES `sale_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`adjustment_id`) REFERENCES `inventory_adjustments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_return_items_return` ON `return_items` (`return_id`);--> statement-breakpoint
CREATE INDEX `idx_return_items_sale_item` ON `return_items` (`sale_item_id`);--> statement-breakpoint
CREATE TABLE `sale_returns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`return_number` text NOT NULL,
	`sale_id` integer NOT NULL,
	`cash_session_id` integer,
	`type` text NOT NULL,
	`total_returned_value` integer NOT NULL,
	`total_exchange_value` integer DEFAULT 0 NOT NULL,
	`balance_cents` integer NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sale_returns_return_number_unique` ON `sale_returns` (`return_number`);--> statement-breakpoint
CREATE INDEX `idx_sale_returns_sale` ON `sale_returns` (`sale_id`);--> statement-breakpoint
CREATE INDEX `idx_sale_returns_cash_session` ON `sale_returns` (`cash_session_id`);--> statement-breakpoint
CREATE INDEX `idx_sale_returns_created_at` ON `sale_returns` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_sale_returns_type` ON `sale_returns` (`type`);