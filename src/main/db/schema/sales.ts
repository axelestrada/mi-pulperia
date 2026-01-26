import { sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { customersTable } from './customers'
import { cashSessionsTable } from './cash-sessions'

export const salesTable = sqliteTable(
  'sales',
  {
    id: int().primaryKey({ autoIncrement: true }),

    saleNumber: text('sale_number').notNull().unique(), // Sequential sale number

    customerId: int('customer_id').references(() => customersTable.id),
    cashSessionId: int('cash_session_id')
      .notNull()
      .references(() => cashSessionsTable.id),

    subtotal: int().notNull(), // Total before tax
    taxAmount: int('tax_amount').notNull().default(0),
    discountAmount: int('discount_amount').notNull().default(0),
    total: int().notNull(), // Final total amount

    status: text()
      .$type<'completed' | 'cancelled' | 'refunded'>()
      .notNull()
      .default('completed'),

    notes: text(),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    updatedAt: int('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    deleted: int({ mode: 'boolean' }).notNull().default(false),
  },
  table => [
    index('idx_sales_customer').on(table.customerId),
    index('idx_sales_cash_session').on(table.cashSessionId),
    index('idx_sales_created_at').on(table.createdAt),
    index('idx_sales_status').on(table.status),
  ]
)

export type SelectSale = typeof salesTable.$inferSelect
export type InsertSale = typeof salesTable.$inferInsert
