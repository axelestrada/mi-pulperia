PRAGMA foreign_keys=OFF;--> statement-breakpoint
ALTER TABLE products ADD COLUMN status TEXT NOT NULL DEFAULT 'active'; --> statement-breakpoint
UPDATE products SET status = CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END; --> statement-breakpoint
ALTER TABLE products DROP COLUMN is_active; --> statement-breakpoint
PRAGMA foreign_keys=ON;