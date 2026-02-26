ALTER TABLE `sales` ADD `type` text DEFAULT 'SALE' NOT NULL;--> statement-breakpoint
ALTER TABLE `sales` ADD `original_sale_id` integer REFERENCES sales(id);--> statement-breakpoint
CREATE INDEX `idx_sales_type` ON `sales` (`type`);--> statement-breakpoint
CREATE INDEX `idx_sales_original_sale` ON `sales` (`original_sale_id`);