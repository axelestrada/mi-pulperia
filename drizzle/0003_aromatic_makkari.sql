PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "description", "is_active", "created_at", "deleted") SELECT "id", "name", "description", "is_active", "created_at", "deleted" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `deleted`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `status`;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `createdAt`;