ALTER TABLE `sale_items` ADD `unit_cost` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `sale_items` ADD `subtotal` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `sale_items` ADD `cost_total` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `sale_items` ADD `profit` integer DEFAULT 0 NOT NULL;