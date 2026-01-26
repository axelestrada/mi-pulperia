import { sql } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const cashRegistersTable = sqliteTable('cash_registers', {
  id: int().primaryKey({ autoIncrement: true }),

  name: text().notNull(),
  description: text(),
  location: text(),

  isActive: int('is_active', { mode: 'boolean' }).notNull().default(true),

  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  deleted: int({ mode: 'boolean' }).notNull().default(false),
})

export type SelectCashRegister = typeof cashRegistersTable.$inferSelect
export type InsertCashRegister = typeof cashRegistersTable.$inferInsert
