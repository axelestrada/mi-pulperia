ALTER TABLE `categories` ADD `image` text;--> statement-breakpoint
ALTER TABLE `products` ADD `image` text;--> statement-breakpoint
ALTER TABLE `products` ADD `price` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `stock` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `barcode` text;--> statement-breakpoint
ALTER TABLE `products` ADD `description` text;