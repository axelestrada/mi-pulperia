import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const categoriesTable = sqliteTable('categories', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
})

export type SelectCategory = typeof categoriesTable.$inferSelect
export type InsertCategory = typeof categoriesTable.$inferInsert
