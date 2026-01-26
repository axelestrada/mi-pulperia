import { sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { inventoryBatchesTable } from './inventory-batches'
import { productsTable } from './products'

export const inventoryAdjustmentsTable = sqliteTable(
  'inventory_adjustments',
  {
    id: int().primaryKey({ autoIncrement: true }),

    adjustmentNumber: text('adjustment_number').notNull().unique(),

    type: text()
      .$type<'adjustment' | 'shrinkage'>() // adjustment = no impact on profit, shrinkage = impacts profit
      .notNull(),

    reason: text().notNull(),

    // Total monetary impact
    totalCostImpact: int('total_cost_impact').notNull().default(0),
    totalValueImpact: int('total_value_impact').notNull().default(0),

    notes: text(),

    createdBy: text('created_by').notNull(),
    approvedBy: text('approved_by'),

    status: text()
      .$type<'draft' | 'approved' | 'cancelled'>()
      .notNull()
      .default('draft'),

    approvedAt: int('approved_at', { mode: 'timestamp' }),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    updatedAt: int('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    deleted: int({ mode: 'boolean' }).notNull().default(false),
  },
  table => [
    index('idx_inventory_adjustments_type').on(table.type),
    index('idx_inventory_adjustments_status').on(table.status),
    index('idx_inventory_adjustments_created_at').on(table.createdAt),
  ]
)

export const inventoryAdjustmentItemsTable = sqliteTable(
  'inventory_adjustment_items',
  {
    id: int().primaryKey({ autoIncrement: true }),

    adjustmentId: int('adjustment_id')
      .notNull()
      .references(() => inventoryAdjustmentsTable.id),

    batchId: int('batch_id')
      .notNull()
      .references(() => inventoryBatchesTable.id),

    productId: int('product_id')
      .notNull()
      .references(() => productsTable.id),

    // Quantity change (can be positive or negative)
    quantityChange: int('quantity_change').notNull(),

    // Cost per unit at the time of adjustment
    unitCost: int('unit_cost').notNull(),

    // Total cost impact for this item
    costImpact: int('cost_impact').notNull(),

    // Reason specific to this item
    itemReason: text('item_reason'),

    notes: text(),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => [
    index('idx_inventory_adjustment_items_adjustment').on(table.adjustmentId),
    index('idx_inventory_adjustment_items_batch').on(table.batchId),
    index('idx_inventory_adjustment_items_product').on(table.productId),
  ]
)

export type SelectInventoryAdjustment = typeof inventoryAdjustmentsTable.$inferSelect
export type InsertInventoryAdjustment = typeof inventoryAdjustmentsTable.$inferInsert
export type SelectInventoryAdjustmentItem = typeof inventoryAdjustmentItemsTable.$inferSelect
export type InsertInventoryAdjustmentItem = typeof inventoryAdjustmentItemsTable.$inferInsert
