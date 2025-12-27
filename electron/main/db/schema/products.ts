import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const productsTable = sqliteTable('products', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
})

export type SelectProduct = typeof productsTable.$inferSelect
export type InsertProduct = typeof productsTable.$inferInsert
