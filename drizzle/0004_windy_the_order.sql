ALTER TABLE `products` ADD `description` text;--> statement-breakpoint
ALTER TABLE `products` ADD `image` text;--> statement-breakpoint
ALTER TABLE `products` ADD `barcode` text;--> statement-breakpoint
ALTER TABLE `products` ADD `sku` text;--> statement-breakpoint
ALTER TABLE `products` ADD `category_id` integer NOT NULL REFERENCES categories(id);--> statement-breakpoint
ALTER TABLE `products` ADD `base_unit` text DEFAULT 'unit' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `sale_price` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `min_stock` integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `created_at` text DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `updated_at` text DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `deleted` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `products_barcode_unique` ON `products` (`barcode`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);