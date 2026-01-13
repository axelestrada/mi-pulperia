import { sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const inventoryBatchesTable = sqliteTable(
  'inventory_batches',
  {
    id: int().primaryKey({ autoIncrement: true }),
    productId: int('product_id').notNull(),
    supplierId: int('supplier_id'),
    batchCode: text('batch_code').notNull(),
    expirationDate: int('expiration_date', { mode: 'timestamp' }),
    quantityInitial: int('quantity_initial').notNull(),
    quantityAvailable: int('quantity_available').notNull(),
    cost: int('cost').notNull(),
    receivedAt: int('received_at', { mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull(),
    createdAt: int('created_at', { mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  table => [
    index('idx_batches_product_expiration').on(
      table.productId,
      table.expirationDate
    ),
    index('idx_batches_product_available').on(
      table.productId,
      table.quantityAvailable
    ),
  ]
)

export type SelectInventoryBatch = typeof inventoryBatchesTable.$inferSelect
export type InsertInventoryBatch = typeof inventoryBatchesTable.$inferInsert
