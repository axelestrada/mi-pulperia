ALTER TABLE `categories` ADD `description` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `created_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `categories` ADD `deleted` integer DEFAULT false NOT NULL;