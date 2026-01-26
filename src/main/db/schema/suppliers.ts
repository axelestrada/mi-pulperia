import { sql } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const suppliersTable = sqliteTable('suppliers', {
  id: int().primaryKey({ autoIncrement: true }),

  name: text().notNull(),
  companyName: text('company_name'),
  contactPerson: text('contact_person'),

  email: text(),
  phone: text(),

  address: text(),
  city: text(),
  country: text(),

  taxId: text('tax_id'), // RUC or tax identification number

  // Payment terms
  paymentTerms: int('payment_terms').notNull().default(30), // Days for payment
  creditLimit: int('credit_limit').notNull().default(0),
  currentBalance: int('current_balance').notNull().default(0), // What we owe them

  // Banking information
  bankName: text('bank_name'),
  bankAccount: text('bank_account'),

  notes: text(),

  isActive: int('is_active', { mode: 'boolean' }).notNull().default(true),

  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  deleted: int({ mode: 'boolean' }).notNull().default(false),
})

export type SelectSupplier = typeof suppliersTable.$inferSelect
export type InsertSupplier = typeof suppliersTable.$inferInsert
