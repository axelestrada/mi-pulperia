import { sql } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { categoriesTable } from './categories'

export const productsTable = sqliteTable('products', {
  id: int().primaryKey({ autoIncrement: true }),

  name: text().notNull(),
  description: text(),
  image: text(),

  barcode: text().unique(),
  sku: text().unique(),

  categoryId: int('category_id')
    .notNull()
    .references(() => categoriesTable.id),

  baseUnit: text('base_unit')
    .$type<'unit' | 'lb' | 'liter'>()
    .notNull()
    .default('unit'),

  salePrice: int('sale_price').notNull(),

  minStock: int('min_stock').notNull().default(5),

  isActive: int('is_active', { mode: 'boolean' }).notNull().default(true),

  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  deleted: int({ mode: 'boolean' }).notNull().default(false),
})

export type SelectProduct = typeof productsTable.$inferSelect
export type InsertProduct = typeof productsTable.$inferInsert
