import { sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { salesTable } from './sales'
import { presentationsTable } from './presentations'
import { inventoryBatchesTable } from './inventory-batches'

export const saleItemsTable = sqliteTable(
  'sale_items',
  {
    id: int().primaryKey({ autoIncrement: true }),

    saleId: int('sale_id')
      .notNull()
      .references(() => salesTable.id),

    presentationId: int('presentation_id')
      .notNull()
      .references(() => presentationsTable.id),

    batchId: int('batch_id')
      .notNull()
      .references(() => inventoryBatchesTable.id),

    quantity: int().notNull(),
    unitPrice: int('unit_price').notNull(),
    totalPrice: int('total_price').notNull(),

    discount: int().notNull().default(0),
    discountType: text('discount_type')
      .$type<'fixed' | 'percentage'>()
      .default('fixed'),

    notes: text(),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => [
    index('idx_sale_items_sale').on(table.saleId),
    index('idx_sale_items_presentation').on(table.presentationId),
    index('idx_sale_items_batch').on(table.batchId),
  ]
)

export type SelectSaleItem = typeof saleItemsTable.$inferSelect
export type InsertSaleItem = typeof saleItemsTable.$inferInsert
