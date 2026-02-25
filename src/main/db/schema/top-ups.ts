import { sql } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const topUpsTable = sqliteTable('top_ups', {
  id: int().primaryKey({ autoIncrement: true }),

  type: text()
    .$type<'balance_load' | 'top_up'>()
    .notNull()
    .default('top_up'),

  operator: text().notNull().default('Otro'),
  phoneNumber: text('phone_number'),

  amount: int().notNull(),
  cost: int().notNull().default(0),

  notes: text(),
  createdBy: text('created_by').notNull().default('turno'),

  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  deleted: int({ mode: 'boolean' }).notNull().default(false),
})

export type SelectTopUp = typeof topUpsTable.$inferSelect
export type InsertTopUp = typeof topUpsTable.$inferInsert
