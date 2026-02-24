import { sql } from 'drizzle-orm'
import { index, int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { salesTable } from './sales'
import { cashSessionsTable } from './cash-sessions'
import { saleItemsTable } from './sale-items'
import { inventoryAdjustmentsTable } from './inventory-adjustments'
import { presentationsTable } from './presentations'
import { inventoryBatchesTable } from './inventory-batches'

export const saleReturnsTable = sqliteTable(
  'sale_returns',
  {
    id: int().primaryKey({ autoIncrement: true }),

    returnNumber: text('return_number').notNull().unique(),

    saleId: int('sale_id')
      .notNull()
      .references(() => salesTable.id),

    cashSessionId: int('cash_session_id').references(
      () => cashSessionsTable.id
    ),

    type: text()
      .$type<'refund' | 'exchange'>()
      .notNull(),

    // Valor total de productos devueltos (precio venta)
    totalReturnedValue: int('total_returned_value').notNull(),

    // Valor total de productos dados a cambio (solo en exchange)
    totalExchangeValue: int('total_exchange_value').notNull().default(0),

    // balanceCents > 0: tienda devuelve dinero al cliente
    // balanceCents < 0: cliente paga diferencia
    balanceCents: int('balance_cents').notNull(),

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
    index('idx_sale_returns_sale').on(table.saleId),
    index('idx_sale_returns_cash_session').on(table.cashSessionId),
    index('idx_sale_returns_created_at').on(table.createdAt),
    index('idx_sale_returns_type').on(table.type),
  ]
)

export type SelectSaleReturn = typeof saleReturnsTable.$inferSelect
export type InsertSaleReturn = typeof saleReturnsTable.$inferInsert

/** Items devueltos de la venta original */
export const returnItemsTable = sqliteTable(
  'return_items',
  {
    id: int().primaryKey({ autoIncrement: true }),

    returnId: int('return_id')
      .notNull()
      .references(() => saleReturnsTable.id),

    saleItemId: int('sale_item_id')
      .notNull()
      .references(() => saleItemsTable.id),

    quantityReturned: int('quantity_returned').notNull(),

    condition: text()
      .$type<'good' | 'damaged'>()
      .notNull(),

    // Si condition = damaged, se crea merma y se guarda aquí
    adjustmentId: int('adjustment_id').references(
      () => inventoryAdjustmentsTable.id
    ),

    notes: text(),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => [
    index('idx_return_items_return').on(table.returnId),
    index('idx_return_items_sale_item').on(table.saleItemId),
  ]
)

export type SelectReturnItem = typeof returnItemsTable.$inferSelect
export type InsertReturnItem = typeof returnItemsTable.$inferInsert

/** Productos dados a cambio (solo cuando type = exchange) */
export const returnExchangeItemsTable = sqliteTable(
  'return_exchange_items',
  {
    id: int().primaryKey({ autoIncrement: true }),

    returnId: int('return_id')
      .notNull()
      .references(() => saleReturnsTable.id),

    presentationId: int('presentation_id')
      .notNull()
      .references(() => presentationsTable.id),

    batchId: int('batch_id')
      .notNull()
      .references(() => inventoryBatchesTable.id),

    quantity: int().notNull(),
    unitPrice: int('unit_price').notNull(),
    totalPrice: int('total_price').notNull(),

    notes: text(),

    createdAt: int('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  table => [
    index('idx_return_exchange_items_return').on(table.returnId),
    index('idx_return_exchange_items_batch').on(table.batchId),
  ]
)

export type SelectReturnExchangeItem = typeof returnExchangeItemsTable.$inferSelect
export type InsertReturnExchangeItem = typeof returnExchangeItemsTable.$inferInsert
