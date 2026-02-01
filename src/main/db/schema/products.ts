import { sql } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { categoriesTable } from './categories'

export const productsTable = sqliteTable('products', {
  id: int().primaryKey({ autoIncrement: true }),

  name: text().notNull(),
  description: text(),

  categoryId: int('category_id')
    .notNull()
    .references(() => categoriesTable.id),

  baseUnit: text('base_unit')
    .$type<'unit' | 'lb' | 'liter'>()
    .notNull()
    .default('unit'),

  unitPrecision: int('unit_precision').notNull().default(1),

  minStock: int('min_stock').notNull().default(5),

  status: text().$type<'active' | 'inactive'>().notNull().default('active'),

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
