import { sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const inventoryMovementsTable = sqliteTable(
  'inventory_movements',
  {
    id: int().primaryKey({ autoIncrement: true }),
    productId: int('product_id').notNull(),
    batchId: int('batch_id').notNull(),
    type: text().$type<'IN' | 'OUT' | 'ADJUSTMENT'>().notNull(),
    quantity: int().notNull(),
    reason: text().notNull(),
    referenceType: text('reference_type'),
    referenceId: int('reference_id'),
    createdAt: int('created_at', { mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  table => [
    index('idx_movements_batch').on(table.batchId),
    index('idx_movements_product').on(table.productId),
    index('idx_movements_created_at').on(table.createdAt),
  ]
)

export type SelectInventoryMovement =
  typeof inventoryMovementsTable.$inferSelect
export type InsertInventoryMovement =
  typeof inventoryMovementsTable.$inferInsert
