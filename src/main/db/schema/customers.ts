import { sql } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const customersTable = sqliteTable('customers', {
  id: int().primaryKey({ autoIncrement: true }),

  name: text().notNull(),
  email: text(),
  phone: text(),
  document: text(), // ID document number
  documentType: text('document_type').$type<'cedula' | 'passport' | 'ruc'>(),

  address: text(),
  city: text(),

  creditLimit: int('credit_limit').notNull().default(0),
  currentBalance: int('current_balance').notNull().default(0),

  isActive: int('is_active', { mode: 'boolean' }).notNull().default(true),

  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  deleted: int({ mode: 'boolean' }).notNull().default(false),
})

export type SelectCustomer = typeof customersTable.$inferSelect
export type InsertCustomer = typeof customersTable.$inferInsert
