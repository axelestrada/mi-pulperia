import { sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { customersTable } from './customers'
import { salesTable } from './sales'

export const creditsTable = sqliteTable(
  'credits',
  {
    id: int().primaryKey({ autoIncrement: true }),

    creditNumber: text('credit_number').notNull().unique(),

    customerId: int('customer_id')
      .notNull()
      .references(() => customersTable.id),

    // Reference to original sale if this credit is from a sale
    saleId: int('sale_id').references(() => salesTable.id),

    type: text()
      .$type<'sale_credit' | 'manual_credit' | 'payment' | 'adjustment'>()
      .notNull(),

    amount: int().notNull(),
    remainingAmount: int('remaining_amount').notNull(),

    // For payment tracking
    originalAmount: int('original_amount').notNull(),
    paidAmount: int('paid_amount').notNull().default(0),

    status: text()
      .$type<'active' | 'paid' | 'partial' | 'cancelled'>()
      .notNull()
      .default('active'),

    dueDate: int('due_date', { mode: 'timestamp' }),

    // Interest and fees
    interestRate: int('interest_rate').notNull().default(0), // percentage * 100
    lateFeesAmount: int('late_fees_amount').notNull().default(0),

    description: text().notNull(),
    notes: text(),

    createdBy: text('created_by').notNull(),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    updatedAt: int('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    deleted: int({ mode: 'boolean' }).notNull().default(false),
  },
  table => [
    index('idx_credits_customer').on(table.customerId),
    index('idx_credits_sale').on(table.saleId),
    index('idx_credits_status').on(table.status),
    index('idx_credits_due_date').on(table.dueDate),
    index('idx_credits_created_at').on(table.createdAt),
  ]
)

export const creditPaymentsTable = sqliteTable(
  'credit_payments',
  {
    id: int().primaryKey({ autoIncrement: true }),

    creditId: int('credit_id')
      .notNull()
      .references(() => creditsTable.id),

    paymentNumber: text('payment_number').notNull().unique(),

    amount: int().notNull(),

    paymentMethod: text('payment_method')
      .$type<'cash' | 'credit' | 'debit' | 'transfer' | 'check'>()
      .notNull(),

    // Payment details
    referenceNumber: text('reference_number'),
    authorizationCode: text('authorization_code'),

    // Cash payment details
    receivedAmount: int('received_amount'),
    changeAmount: int('change_amount'),

    notes: text(),

    createdBy: text('created_by').notNull(),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => [
    index('idx_credit_payments_credit').on(table.creditId),
    index('idx_credit_payments_created_at').on(table.createdAt),
  ]
)

export type SelectCredit = typeof creditsTable.$inferSelect
export type InsertCredit = typeof creditsTable.$inferInsert
export type SelectCreditPayment = typeof creditPaymentsTable.$inferSelect
export type InsertCreditPayment = typeof creditPaymentsTable.$inferInsert
