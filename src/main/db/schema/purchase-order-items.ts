import { sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { purchaseOrdersTable } from './purchase-orders'
import { presentationsTable } from './presentations'

export const purchaseOrderItemsTable = sqliteTable(
  'purchase_order_items',
  {
    id: int().primaryKey({ autoIncrement: true }),

    purchaseOrderId: int('purchase_order_id')
      .notNull()
      .references(() => purchaseOrdersTable.id),

    presentationId: int('presentation_id')
      .notNull()
      .references(() => presentationsTable.id),

    quantity: int().notNull(),
    unitCost: int('unit_cost').notNull(),
    totalCost: int('total_cost').notNull(),

    quantityReceived: int('quantity_received').notNull().default(0),
    quantityPending: int('quantity_pending').notNull().default(0),

    discount: int().notNull().default(0),
    discountType: text('discount_type')
      .$type<'fixed' | 'percentage'>()
      .default('fixed'),

    notes: text(),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    updatedAt: int('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => [
    index('idx_purchase_order_items_order').on(table.purchaseOrderId),
    index('idx_purchase_order_items_presentation').on(table.presentationId),
  ]
)

export type SelectPurchaseOrderItem = typeof purchaseOrderItemsTable.$inferSelect
export type InsertPurchaseOrderItem = typeof purchaseOrderItemsTable.$inferInsert
