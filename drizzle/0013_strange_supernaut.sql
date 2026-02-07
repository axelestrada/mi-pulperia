PRAGMA foreign_keys=OFF;--> statement-breakpoint
ALTER TABLE presentations ADD COLUMN status TEXT NOT NULL DEFAULT 'active'; --> statement-breakpoint
UPDATE presentations SET status = CASE WHEN is_active = 1 THEN 'active' ELSE 'inactive' END; --> statement-breakpoint
ALTER TABLE presentations DROP COLUMN is_active; --> statement-breakpoint
PRAGMA foreign_keys=ON;