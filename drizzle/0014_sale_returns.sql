-- Sale returns and related tables
CREATE TABLE `sale_returns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`return_number` text NOT NULL UNIQUE,
	`sale_id` integer NOT NULL REFERENCES `sales`(`id`),
	`cash_session_id` integer REFERENCES `cash_sessions`(`id`),
	`type` text NOT NULL,
	`total_returned_value` integer NOT NULL,
	`total_exchange_value` integer NOT NULL DEFAULT 0,
	`balance_cents` integer NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sale_returns_sale` ON `sale_returns` (`sale_id`);--> statement-breakpoint
CREATE INDEX `idx_sale_returns_cash_session` ON `sale_returns` (`cash_session_id`);--> statement-breakpoint
CREATE INDEX `idx_sale_returns_created_at` ON `sale_returns` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_sale_returns_type` ON `sale_returns` (`type`);--> statement-breakpoint
CREATE TABLE `return_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`return_id` integer NOT NULL REFERENCES `sale_returns`(`id`),
	`sale_item_id` integer NOT NULL REFERENCES `sale_items`(`id`),
	`quantity_returned` integer NOT NULL,
	`condition` text NOT NULL,
	`adjustment_id` integer REFERENCES `inventory_adjustments`(`id`),
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_return_items_return` ON `return_items` (`return_id`);--> statement-breakpoint
CREATE INDEX `idx_return_items_sale_item` ON `return_items` (`sale_item_id`);--> statement-breakpoint
CREATE TABLE `return_exchange_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`return_id` integer NOT NULL REFERENCES `sale_returns`(`id`),
	`presentation_id` integer NOT NULL REFERENCES `presentations`(`id`),
	`batch_id` integer NOT NULL REFERENCES `inventory_batches`(`id`),
	`quantity` integer NOT NULL,
	`unit_price` integer NOT NULL,
	`total_price` integer NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_return_exchange_items_return` ON `return_exchange_items` (`return_id`);--> statement-breakpoint
CREATE INDEX `idx_return_exchange_items_batch` ON `return_exchange_items` (`batch_id`);
