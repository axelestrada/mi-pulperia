PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__categories_new` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` TEXT NOT NULL,
  `description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
  `updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO `__categories_new`("id", "name", "description", "is_active", "created_at", "updated_at", "deleted") SELECT "id", "name", "description", "is_active", "created_at", "created_at", "deleted" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__categories_new` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;