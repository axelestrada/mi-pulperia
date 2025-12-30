import { sql } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const categoriesTable = sqliteTable('categories', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  isActive: int('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: int('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  deleted: int({ mode: 'boolean' }).default(false).notNull(),
})

export type SelectCategory = typeof categoriesTable.$inferSelect
export type InsertCategory = typeof categoriesTable.$inferInsert
