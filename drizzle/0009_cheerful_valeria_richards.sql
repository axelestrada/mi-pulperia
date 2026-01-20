CREATE TABLE `presentations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`is_base` integer DEFAULT false NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image` text,
	`barcode` text,
	`sku` text,
	`unit` text NOT NULL,
	`unit_precision` integer NOT NULL,
	`factor_type` text NOT NULL,
	`factor` integer,
	`sale_price` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `presentations_barcode_unique` ON `presentations` (`barcode`);--> statement-breakpoint
CREATE UNIQUE INDEX `presentations_sku_unique` ON `presentations` (`sku`);--> statement-breakpoint
DROP INDEX `products_barcode_unique`;--> statement-breakpoint
DROP INDEX `products_sku_unique`;--> statement-breakpoint
ALTER TABLE `products` ADD `unit_precision` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `image`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `barcode`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `sku`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `sale_price`;