import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  like,
  lte,
  or,
  sum,
  like,
  getTableColumns,
} from 'drizzle-orm'
import { db } from '../db'

import {
  type InsertInventoryBatch,
  inventoryBatchesTable,
  type SelectInventoryBatch,
} from '../db/schema/inventory-batches'
import { productsTable } from '../db/schema/products'

export interface InventoryBatchesFilters {
  search?: string
  productId?: number
  supplierId?: number
  hasStock?: boolean
  expiringBefore?: Date
  expiringAfter?: Date
  page?: number
  limit?: number
  sortBy?: 'receivedAt' | 'expirationDate' | 'quantityAvailable'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
}

export const InventoryBatchesRepository = {
  findAll: async (filters: InventoryBatchesFilters = {}) => {
    const {
      search,
      productId,
      supplierId,
      hasStock,
      expiringBefore,
      expiringAfter,
      page = 1,
      limit = 50,
      sortBy = 'receivedAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = []

    if (search) {
      const searchConditions = or(
        like(inventoryBatchesTable.batchCode, search),
        like(productsTable.name, search)
      )

      if (searchConditions) {
        whereConditions.push(searchConditions)
      }
    }

    if (productId) {
      whereConditions.push(eq(inventoryBatchesTable.productId, productId))
    }

    if (supplierId) {
      whereConditions.push(eq(inventoryBatchesTable.supplierId, supplierId))
    }

    if (hasStock) {
      whereConditions.push(gt(inventoryBatchesTable.quantityAvailable, 0))
    }

    if (expiringBefore) {
      whereConditions.push(
        lte(inventoryBatchesTable.expirationDate, expiringBefore)
      )
    }

    if (expiringAfter) {
      whereConditions.push(
        gte(inventoryBatchesTable.expirationDate, expiringAfter)
      )
    }

    if (dateFrom) {
      whereConditions.push(gte(inventoryBatchesTable.receivedAt, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(inventoryBatchesTable.receivedAt, dateTo))
    }

    // Build order by
    const orderBy =
      sortOrder === 'desc'
        ? desc(inventoryBatchesTable[sortBy])
        : asc(inventoryBatchesTable[sortBy])

    const [batches, totalResult] = await Promise.all([
      db
        .select({
          ...getTableColumns(inventoryBatchesTable),
          productName: productsTable.name,
        })
        .from(inventoryBatchesTable)
        .leftJoin(
          productsTable,
          eq(inventoryBatchesTable.productId, productsTable.id)
        )
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(inventoryBatchesTable)
        .leftJoin(
          productsTable,
          eq(inventoryBatchesTable.productId, productsTable.id)
        )
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        ),
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: batches,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  },

  findById: async (id: SelectInventoryBatch['id']) =>
    db
      .select({
        ...inventoryBatchesTable,
        productName: productsTable.name,
      })
      .from(inventoryBatchesTable)
      .leftJoin(
        productsTable,
        eq(inventoryBatchesTable.productId, productsTable.id)
      )
      .where(eq(inventoryBatchesTable.id, id))
      .get(),

  create: async (data: InsertInventoryBatch) => {
    const result = await db
      .insert(inventoryBatchesTable)
      .values({
        ...data,
        quantityAvailable: data.quantityInitial, // Initially available = initial
      })
      .returning()

    return result[0]
  },

  update: async (
    id: SelectInventoryBatch['id'],
    data: Partial<SelectInventoryBatch>
  ) =>
    db
      .update(inventoryBatchesTable)
      .set(data)
      .where(eq(inventoryBatchesTable.id, id))
      .returning(),

  // Update batch quantity (used when inventory moves)
  updateQuantity: async (
    id: SelectInventoryBatch['id'],
    quantityChange: number
  ) => {
    // Get current batch
    const batch = await db
      .select()
      .from(inventoryBatchesTable)
      .where(eq(inventoryBatchesTable.id, id))
      .get()

    if (!batch) {
      throw new Error('Batch not found')
    }

    const newQuantity = batch.quantityAvailable + quantityChange

    if (newQuantity < 0) {
      throw new Error('Cannot reduce quantity below zero')
    }

    return db
      .update(inventoryBatchesTable)
      .set({ quantityAvailable: newQuantity })
      .where(eq(inventoryBatchesTable.id, id))
      .returning()
  },

  // Find batches by product with available stock
  findByProductWithStock: async (productId: number) =>
    db
      .select()
      .from(inventoryBatchesTable)
      .where(
        and(
          eq(inventoryBatchesTable.productId, productId),
          gt(inventoryBatchesTable.quantityAvailable, 0)
        )
      )
      .orderBy(
        // FEFO ordering
        asc(inventoryBatchesTable.expirationDate),
        asc(inventoryBatchesTable.receivedAt)
      ),

  // Get expiring batches
  findExpiringBatches: async (daysFromNow: number = 30) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() + daysFromNow)

    return db
      .select({
        ...inventoryBatchesTable,
        productName: productsTable.name,
      })
      .from(inventoryBatchesTable)
      .leftJoin(
        productsTable,
        eq(inventoryBatchesTable.productId, productsTable.id)
      )
      .where(
        and(
          lte(inventoryBatchesTable.expirationDate, cutoffDate),
          gt(inventoryBatchesTable.quantityAvailable, 0)
        )
      )
      .orderBy(asc(inventoryBatchesTable.expirationDate))
  },

  // Get expired batches
  findExpiredBatches: async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return db
      .select({
        ...inventoryBatchesTable,
        productName: productsTable.name,
      })
      .from(inventoryBatchesTable)
      .leftJoin(
        productsTable,
        eq(inventoryBatchesTable.productId, productsTable.id)
      )
      .where(
        and(
          lte(inventoryBatchesTable.expirationDate, today),
          gt(inventoryBatchesTable.quantityAvailable, 0)
        )
      )
      .orderBy(asc(inventoryBatchesTable.expirationDate))
  },

  // Get low stock batches
  findLowStockBatches: async (threshold: number = 10) =>
    db
      .select({
        ...inventoryBatchesTable,
        productName: productsTable.name,
      })
      .from(inventoryBatchesTable)
      .leftJoin(
        productsTable,
        eq(inventoryBatchesTable.productId, productsTable.id)
      )
      .where(
        and(
          lte(inventoryBatchesTable.quantityAvailable, threshold),
          gt(inventoryBatchesTable.quantityAvailable, 0)
        )
      )
      .orderBy(asc(inventoryBatchesTable.quantityAvailable)),

  // Get batch summary by product
  getBatchSummaryByProduct: async (productId: number) => {
    const summary = await db
      .select({
        totalBatches: count(inventoryBatchesTable.id),
        totalQuantityInitial: sum(inventoryBatchesTable.quantityInitial),
        totalQuantityAvailable: sum(inventoryBatchesTable.quantityAvailable),
        batchesWithStock: count(inventoryBatchesTable.id),
      })
      .from(inventoryBatchesTable)
      .where(eq(inventoryBatchesTable.productId, productId))
      .get()

    const batchesWithStock = await db
      .select({
        count: count(inventoryBatchesTable.id),
      })
      .from(inventoryBatchesTable)
      .where(
        and(
          eq(inventoryBatchesTable.productId, productId),
          gt(inventoryBatchesTable.quantityAvailable, 0)
        )
      )
      .get()

    return {
      ...summary,
      batchesWithStock: batchesWithStock?.count || 0,
      totalSold:
        (summary?.totalQuantityInitial || 0) -
        (summary?.totalQuantityAvailable || 0),
    }
  },

  // Get inventory valuation
  getInventoryValuation: async () => {
    const valuation = await db
      .select({
        totalBatches: count(inventoryBatchesTable.id),
        totalQuantityAvailable: sum(inventoryBatchesTable.quantityAvailable),
        totalValue: sum(
          inventoryBatchesTable.quantityAvailable *
            inventoryBatchesTable.unitCost
        ),
      })
      .from(inventoryBatchesTable)
      .where(gt(inventoryBatchesTable.quantityAvailable, 0))
      .get()

    return valuation
  },

  // Delete batch (rarely used, mostly for data cleanup)
  delete: async (id: SelectInventoryBatch['id']) => {
    // Check if batch has available quantity
    const batch = await db
      .select()
      .from(inventoryBatchesTable)
      .where(eq(inventoryBatchesTable.id, id))
      .get()

    if (!batch) {
      throw new Error('Batch not found')
    }

    if (batch.quantityAvailable > 0) {
      throw new Error('Cannot delete batch with available stock')
    }

    return db
      .delete(inventoryBatchesTable)
      .where(eq(inventoryBatchesTable.id, id))
  },

  // Get batches for FEFO allocation
  getBatchesForFEFO: async (productId: number, requestedQuantity: number) =>
    db_requestedQuantity
      .select()
      .from(inventoryBatchesTable)
      .where(
        and(
          eq(inventoryBatchesTable.productId, productId),
          gt(inventoryBatchesTable.quantityAvailable, 0)
        )
      )
      .orderBy(
        // FEFO: First Expired, First Out
        // Null expiration dates go last
        asc(inventoryBatchesTable.expirationDate),
        asc(inventoryBatchesTable.receivedAt)
      ),

  // Get recent batches for dashboard
  getRecentBatches: async (limit: number = 10) =>
    db
      .select({
        ...inventoryBatchesTable,
        productName: productsTable.name,
      })
      .from(inventoryBatchesTable)
      .leftJoin(
        productsTable,
        eq(inventoryBatchesTable.productId, productsTable.id)
      )
      .orderBy(desc(inventoryBatchesTable.receivedAt))
      .limit(limit),
}
