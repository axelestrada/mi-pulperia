import { sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { salesTable } from './sales'

export const paymentMethodsTable = sqliteTable(
  'payment_methods',
  {
    id: int().primaryKey({ autoIncrement: true }),

    saleId: int('sale_id')
      .notNull()
      .references(() => salesTable.id),

    method: text()
      .$type<'cash' | 'credit' | 'debit' | 'transfer' | 'check'>()
      .notNull(),

    amount: int().notNull(),

    // For cash payments
    receivedAmount: int('received_amount'), // Amount received from customer
    changeAmount: int('change_amount'), // Change given to customer

    // For card/transfer payments
    referenceNumber: text('reference_number'), // Transaction reference
    authorizationCode: text('authorization_code'),

    // Additional details
    details: text(), // JSON string for additional payment details
    notes: text(),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => [
    index('idx_payment_methods_sale').on(table.saleId),
    index('idx_payment_methods_method').on(table.method),
    index('idx_payment_methods_created_at').on(table.createdAt),
  ]
)

export type SelectPaymentMethod = typeof paymentMethodsTable.$inferSelect
export type InsertPaymentMethod = typeof paymentMethodsTable.$inferInsert
