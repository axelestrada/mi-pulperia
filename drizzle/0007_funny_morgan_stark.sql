CREATE TABLE `inventory_batches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`supplier_id` integer,
	`batch_code` text NOT NULL,
	`expiration_date` integer,
	`quantity_initial` integer NOT NULL,
	`quantity_available` integer NOT NULL,
	`cost` integer NOT NULL,
	`received_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_batches_product_expiration` ON `inventory_batches` (`product_id`,`expiration_date`);--> statement-breakpoint
CREATE INDEX `idx_batches_product_available` ON `inventory_batches` (`product_id`,`quantity_available`);--> statement-breakpoint
CREATE TABLE `inventory_movements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`batch_id` integer NOT NULL,
	`type` text NOT NULL,
	`quantity` integer NOT NULL,
	`reason` text NOT NULL,
	`reference_type` text,
	`reference_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_movements_batch` ON `inventory_movements` (`batch_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_product` ON `inventory_movements` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_movements_created_at` ON `inventory_movements` (`created_at`);