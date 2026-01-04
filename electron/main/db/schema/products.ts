import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core'

export const productsTable = sqliteTable('products', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  image: text(), // Nombre del archivo de imagen
  price: real().notNull().default(0),
  stock: int().notNull().default(0),
  barcode: text(),
  description: text(),
})

export type SelectProduct = typeof productsTable.$inferSelect
export type InsertProduct = typeof productsTable.$inferInsert
