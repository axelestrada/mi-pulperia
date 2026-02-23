CREATE TABLE `configuration` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`data_type` text DEFAULT 'string' NOT NULL,
	`category` text DEFAULT 'general' NOT NULL,
	`label` text NOT NULL,
	`description` text,
	`default_value` text,
	`is_required` integer DEFAULT false NOT NULL,
	`is_editable` integer DEFAULT true NOT NULL,
	`is_visible` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`validation_rules` text,
	`input_type` text DEFAULT 'text' NOT NULL,
	`input_options` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configuration_key_unique` ON `configuration` (`key`);--> statement-breakpoint
CREATE TABLE `credit_payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`credit_id` integer NOT NULL,
	`payment_number` text NOT NULL,
	`amount` integer NOT NULL,
	`payment_method` text NOT NULL,
	`reference_number` text,
	`authorization_code` text,
	`received_amount` integer,
	`change_amount` integer,
	`notes` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`credit_id`) REFERENCES `credits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `credit_payments_payment_number_unique` ON `credit_payments` (`payment_number`);--> statement-breakpoint
CREATE INDEX `idx_credit_payments_credit` ON `credit_payments` (`credit_id`);--> statement-breakpoint
CREATE INDEX `idx_credit_payments_created_at` ON `credit_payments` (`created_at`);--> statement-breakpoint
CREATE TABLE `credits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`credit_number` text NOT NULL,
	`customer_id` integer NOT NULL,
	`sale_id` integer,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`remaining_amount` integer NOT NULL,
	`original_amount` integer NOT NULL,
	`paid_amount` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`due_date` integer,
	`interest_rate` integer DEFAULT 0 NOT NULL,
	`late_fees_amount` integer DEFAULT 0 NOT NULL,
	`description` text NOT NULL,
	`notes` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `credits_credit_number_unique` ON `credits` (`credit_number`);--> statement-breakpoint
CREATE INDEX `idx_credits_customer` ON `credits` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_credits_sale` ON `credits` (`sale_id`);--> statement-breakpoint
CREATE INDEX `idx_credits_status` ON `credits` (`status`);--> statement-breakpoint
CREATE INDEX `idx_credits_due_date` ON `credits` (`due_date`);--> statement-breakpoint
CREATE INDEX `idx_credits_created_at` ON `credits` (`created_at`);--> statement-breakpoint
CREATE TABLE `expense_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`affects_cogs` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`expense_number` text NOT NULL,
	`category_id` integer NOT NULL,
	`supplier_id` integer,
	`title` text NOT NULL,
	`description` text,
	`amount` integer NOT NULL,
	`tax_amount` integer DEFAULT 0 NOT NULL,
	`total_amount` integer NOT NULL,
	`expense_date` integer DEFAULT (unixepoch()) NOT NULL,
	`payment_method` text,
	`reference_number` text,
	`status` text DEFAULT 'paid' NOT NULL,
	`is_recurring` integer DEFAULT false NOT NULL,
	`recurring_frequency` text,
	`next_recurring_date` integer,
	`needs_approval` integer DEFAULT false NOT NULL,
	`approved_by` text,
	`approved_at` integer,
	`attachments` text,
	`notes` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `expense_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `expenses_expense_number_unique` ON `expenses` (`expense_number`);--> statement-breakpoint
CREATE INDEX `idx_expenses_category` ON `expenses` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_expenses_supplier` ON `expenses` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `idx_expenses_expense_date` ON `expenses` (`expense_date`);--> statement-breakpoint
CREATE INDEX `idx_expenses_status` ON `expenses` (`status`);--> statement-breakpoint
CREATE INDEX `idx_expenses_created_by` ON `expenses` (`created_by`);--> statement-breakpoint
CREATE INDEX `idx_expenses_created_at` ON `expenses` (`created_at`);--> statement-breakpoint
CREATE TABLE `inventory_adjustment_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`adjustment_id` integer NOT NULL,
	`batch_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity_change` integer NOT NULL,
	`unit_cost` integer NOT NULL,
	`cost_impact` integer NOT NULL,
	`item_reason` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`adjustment_id`) REFERENCES `inventory_adjustments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`batch_id`) REFERENCES `inventory_batches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_inventory_adjustment_items_adjustment` ON `inventory_adjustment_items` (`adjustment_id`);--> statement-breakpoint
CREATE INDEX `idx_inventory_adjustment_items_batch` ON `inventory_adjustment_items` (`batch_id`);--> statement-breakpoint
CREATE INDEX `idx_inventory_adjustment_items_product` ON `inventory_adjustment_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `inventory_adjustments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`adjustment_number` text NOT NULL,
	`type` text NOT NULL,
	`reason` text NOT NULL,
	`total_cost_impact` integer DEFAULT 0 NOT NULL,
	`total_value_impact` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_by` text NOT NULL,
	`approved_by` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`approved_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_adjustments_adjustment_number_unique` ON `inventory_adjustments` (`adjustment_number`);--> statement-breakpoint
CREATE INDEX `idx_inventory_adjustments_type` ON `inventory_adjustments` (`type`);--> statement-breakpoint
CREATE INDEX `idx_inventory_adjustments_status` ON `inventory_adjustments` (`status`);--> statement-breakpoint
CREATE INDEX `idx_inventory_adjustments_created_at` ON `inventory_adjustments` (`created_at`);--> statement-breakpoint
CREATE TABLE `purchase_order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`purchase_order_id` integer NOT NULL,
	`presentation_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`unit_cost` integer NOT NULL,
	`total_cost` integer NOT NULL,
	`quantity_received` integer DEFAULT 0 NOT NULL,
	`quantity_pending` integer DEFAULT 0 NOT NULL,
	`discount` integer DEFAULT 0 NOT NULL,
	`discount_type` text DEFAULT 'fixed',
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`presentation_id`) REFERENCES `presentations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_purchase_order_items_order` ON `purchase_order_items` (`purchase_order_id`);--> statement-breakpoint
CREATE INDEX `idx_purchase_order_items_presentation` ON `purchase_order_items` (`presentation_id`);--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_number` text NOT NULL,
	`supplier_id` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`order_date` integer DEFAULT (unixepoch()) NOT NULL,
	`expected_delivery_date` integer,
	`subtotal` integer DEFAULT 0 NOT NULL,
	`tax_amount` integer DEFAULT 0 NOT NULL,
	`discount_amount` integer DEFAULT 0 NOT NULL,
	`shipping_amount` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`internal_notes` text,
	`created_by` text NOT NULL,
	`sent_at` integer,
	`completed_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchase_orders_order_number_unique` ON `purchase_orders` (`order_number`);--> statement-breakpoint
CREATE INDEX `idx_purchase_orders_supplier` ON `purchase_orders` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `idx_purchase_orders_status` ON `purchase_orders` (`status`);--> statement-breakpoint
CREATE INDEX `idx_purchase_orders_order_date` ON `purchase_orders` (`order_date`);--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`company_name` text,
	`contact_person` text,
	`email` text,
	`phone` text,
	`address` text,
	`city` text,
	`country` text,
	`tax_id` text,
	`payment_terms` integer DEFAULT 30 NOT NULL,
	`credit_limit` integer DEFAULT 0 NOT NULL,
	`current_balance` integer DEFAULT 0 NOT NULL,
	`bank_name` text,
	`bank_account` text,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
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
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_inventory_batches`("id", "product_id", "supplier_id", "batch_code", "expiration_date", "quantity_initial", "quantity_available", "unit_cost", "received_at", "created_at") SELECT "id", "product_id", "supplier_id", "batch_code", "expiration_date", "quantity_initial", "quantity_available", "unit_cost", "received_at", "created_at" FROM `inventory_batches`;--> statement-breakpoint
DROP TABLE `inventory_batches`;--> statement-breakpoint
ALTER TABLE `__new_inventory_batches` RENAME TO `inventory_batches`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_batches_product_expiration` ON `inventory_batches` (`product_id`,`expiration_date`);--> statement-breakpoint
CREATE INDEX `idx_batches_product_available` ON `inventory_batches` (`product_id`,`quantity_available`);