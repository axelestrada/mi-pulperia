import { sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { cashRegistersTable } from './cash-registers'

export const cashSessionsTable = sqliteTable(
  'cash_sessions',
  {
    id: int().primaryKey({ autoIncrement: true }),

    cashRegisterId: int('cash_register_id')
      .notNull()
      .references(() => cashRegistersTable.id),

    openedBy: text('opened_by').notNull(), // User who opened the session
    closedBy: text('closed_by'), // User who closed the session

    openingAmount: int('opening_amount').notNull().default(0),
    closingAmount: int('closing_amount'),

    expectedAmount: int('expected_amount'), // Expected amount based on transactions
    actualAmount: int('actual_amount'), // Actual counted amount during closing

    difference: int(), // Difference between expected and actual

    status: text()
      .$type<'open' | 'closed'>()
      .notNull()
      .default('open'),

    notes: text(),

    openedAt: int('opened_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    closedAt: int('closed_at', { mode: 'timestamp' }),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    updatedAt: int('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => [
    index('idx_cash_sessions_register').on(table.cashRegisterId),
    index('idx_cash_sessions_status').on(table.status),
    index('idx_cash_sessions_opened_at').on(table.openedAt),
  ]
)

export type SelectCashSession = typeof cashSessionsTable.$inferSelect
export type InsertCashSession = typeof cashSessionsTable.$inferInsert
