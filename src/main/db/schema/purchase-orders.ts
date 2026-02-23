import { sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { suppliersTable } from './suppliers'

export const purchaseOrdersTable = sqliteTable(
  'purchase_orders',
  {
    id: int().primaryKey({ autoIncrement: true }),

    orderNumber: text('order_number').notNull().unique(),

    supplierId: int('supplier_id')
      .notNull()
      .references(() => suppliersTable.id),

    status: text()
      .$type<'draft' | 'sent' | 'partial' | 'completed' | 'cancelled'>()
      .notNull()
      .default('draft'),

    orderDate: int('order_date', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    expectedDeliveryDate: int('expected_delivery_date', { mode: 'timestamp' }),

    subtotal: int().notNull().default(0),
    taxAmount: int('tax_amount').notNull().default(0),
    discountAmount: int('discount_amount').notNull().default(0),
    shippingAmount: int('shipping_amount').notNull().default(0),
    total: int().notNull().default(0),

    notes: text(),
    internalNotes: text('internal_notes'),

    createdBy: text('created_by').notNull(),
    sentAt: int('sent_at', { mode: 'timestamp' }),
    completedAt: int('completed_at', { mode: 'timestamp' }),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    updatedAt: int('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    deleted: int({ mode: 'boolean' }).notNull().default(false),
  },
  table => [
    index('idx_purchase_orders_supplier').on(table.supplierId),
    index('idx_purchase_orders_status').on(table.status),
    index('idx_purchase_orders_order_date').on(table.orderDate),
  ]
)

export type SelectPurchaseOrder = typeof purchaseOrdersTable.$inferSelect
export type InsertPurchaseOrder = typeof purchaseOrdersTable.$inferInsert
