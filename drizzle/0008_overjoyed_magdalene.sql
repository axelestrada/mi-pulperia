PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_inventory_batches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`supplier_id` integer,
	`batch_code` text,
	`expiration_date` integer,
	`quantity_initial` integer NOT NULL,
	`quantity_available` integer NOT NULL,
	`unit_cost` integer NOT NULL,
	`received_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_inventory_batches`("id", "product_id", "supplier_id", "batch_code", "expiration_date", "quantity_initial", "quantity_available", "unit_cost", "received_at", "created_at") SELECT "id", "product_id", "supplier_id", "batch_code", "expiration_date", "quantity_initial", "quantity_available", "cost", "received_at", "created_at" FROM `inventory_batches`;--> statement-breakpoint
DROP TABLE `inventory_batches`;--> statement-breakpoint
ALTER TABLE `__new_inventory_batches` RENAME TO `inventory_batches`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_batches_product_expiration` ON `inventory_batches` (`product_id`,`expiration_date`);--> statement-breakpoint
CREATE INDEX `idx_batches_product_available` ON `inventory_batches` (`product_id`,`quantity_available`);