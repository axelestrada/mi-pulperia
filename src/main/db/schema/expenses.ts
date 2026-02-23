import { sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { suppliersTable } from './suppliers'

export const expenseCategoriesTable = sqliteTable(
  'expense_categories',
  {
    id: int().primaryKey({ autoIncrement: true }),

    name: text().notNull(),
    description: text(),

    // Whether this category affects cost of goods sold
    affectsCogs: int('affects_cogs', { mode: 'boolean' }).notNull().default(false),

    isActive: int('is_active', { mode: 'boolean' }).notNull().default(true),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    updatedAt: int('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    deleted: int({ mode: 'boolean' }).notNull().default(false),
  }
)

export const expensesTable = sqliteTable(
  'expenses',
  {
    id: int().primaryKey({ autoIncrement: true }),

    expenseNumber: text('expense_number').notNull().unique(),

    categoryId: int('category_id')
      .notNull()
      .references(() => expenseCategoriesTable.id),

    // Optional supplier reference
    supplierId: int('supplier_id').references(() => suppliersTable.id),

    title: text().notNull(),
    description: text(),

    amount: int().notNull(),

    // Tax information
    taxAmount: int('tax_amount').notNull().default(0),
    totalAmount: int('total_amount').notNull(),

    expenseDate: int('expense_date', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    // Payment information
    paymentMethod: text('payment_method')
      .$type<'cash' | 'credit' | 'debit' | 'transfer' | 'check'>(),

    referenceNumber: text('reference_number'), // Invoice number, receipt number, etc.

    // Status tracking
    status: text()
      .$type<'pending' | 'paid' | 'cancelled'>()
      .notNull()
      .default('paid'),

    // Recurring expense information
    isRecurring: int('is_recurring', { mode: 'boolean' }).notNull().default(false),
    recurringFrequency: text('recurring_frequency').$type<'weekly' | 'monthly' | 'quarterly' | 'yearly'>(),
    nextRecurringDate: int('next_recurring_date', { mode: 'timestamp' }),

    // Approval workflow
    needsApproval: int('needs_approval', { mode: 'boolean' }).notNull().default(false),
    approvedBy: text('approved_by'),
    approvedAt: int('approved_at', { mode: 'timestamp' }),

    // File attachments (stored as JSON array of file paths)
    attachments: text(), // JSON array of file paths

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
    index('idx_expenses_category').on(table.categoryId),
    index('idx_expenses_supplier').on(table.supplierId),
    index('idx_expenses_expense_date').on(table.expenseDate),
    index('idx_expenses_status').on(table.status),
    index('idx_expenses_created_by').on(table.createdBy),
    index('idx_expenses_created_at').on(table.createdAt),
  ]
)

export type SelectExpenseCategory = typeof expenseCategoriesTable.$inferSelect
export type InsertExpenseCategory = typeof expenseCategoriesTable.$inferInsert
export type SelectExpense = typeof expensesTable.$inferSelect
export type InsertExpense = typeof expensesTable.$inferInsert
