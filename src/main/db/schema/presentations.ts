import { sql } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { productsTable } from './products'

export const presentationsTable = sqliteTable('presentations', {
  id: int().primaryKey({ autoIncrement: true }),

  productId: int('product_id')
    .notNull()
    .references(() => productsTable.id),

  isBase: int('is_base', { mode: 'boolean' }).notNull().default(false),

  name: text().notNull(),
  description: text(),

  image: text(),

  barcode: text().unique(),
  sku: text().unique(),

  unit: text().$type<'unit' | 'lb' | 'liter'>().notNull(),
  unitPrecision: int('unit_precision').notNull(),

  factorType: text('factor_type').$type<'fixed' | 'variable'>().notNull(),
  factor: int(),

  salePrice: int('sale_price').notNull(),

  isActive: int('is_active', { mode: 'boolean' }).notNull().default(true),

  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  deleted: int({ mode: 'boolean' }).notNull().default(false),
})


export type SelectPresentation = typeof presentationsTable.$inferSelect
export type InsertPresentation = typeof presentationsTable.$inferInsert