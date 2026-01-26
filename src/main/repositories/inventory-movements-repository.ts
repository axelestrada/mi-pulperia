import { db } from '../db'
import {
  eq,
  and,
  like,
  or,
  desc,
  asc,
  count,
  gte,
  lte,
  sum,
} from 'drizzle-orm'

import {
  inventoryMovementsTable,
  type SelectInventoryMovement,
  type InsertInventoryMovement,
} from '../db/schema/inventory-movements'
import { inventoryBatchesTable } from '../db/schema/inventory-batches'
import { productsTable } from '../db/schema/products'
import { presentationsTable } from '../db/schema/presentations'

export interface InventoryMovementsFilters {
  search?: string
  productId?: number
  batchId?: number
  type?: 'IN' | 'OUT' | 'ADJUSTMENT'
  referenceType?: string
  referenceId?: number
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'quantity' | 'reason'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
}

export const InventoryMovementsRepository = {
  findAll: async (filters: InventoryMovementsFilters = {}) => {
    const {
      search,
      productId,
      batchId,
      type,
      referenceType,
      referenceId,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = []

    if (search) {
      whereConditions.push(
        or(
          like(inventoryMovementsTable.reason, `%${search}%`),
          like(productsTable.name, `%${search}%`),
          like(inventoryBatchesTable.batchCode, `%${search}%`)
        )!
      )
    }

    if (productId) {
      whereConditions.push(eq(inventoryMovementsTable.productId, productId))
    }

    if (batchId) {
      whereConditions.push(eq(inventoryMovementsTable.batchId, batchId))
    }

    if (type) {
      whereConditions.push(eq(inventoryMovementsTable.type, type))
    }

    if (referenceType) {
      whereConditions.push(eq(inventoryMovementsTable.referenceType, referenceType))
    }

    if (referenceId) {
      whereConditions.push(eq(inventoryMovementsTable.referenceId, referenceId))
    }

    if (dateFrom) {
      whereConditions.push(gte(inventoryMovementsTable.createdAt, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(inventoryMovementsTable.createdAt, dateTo))
    }

    // Build order by
    const orderBy =
      sortOrder === 'desc'
        ? desc(inventoryMovementsTable[sortBy])
        : asc(inventoryMovementsTable[sortBy])

    const [movements, totalResult] = await Promise.all([
      db
        .select({
          ...inventoryMovementsTable,
          productName: productsTable.name,
          batchCode: inventoryBatchesTable.batchCode,
          batchExpirationDate: inventoryBatchesTable.expirationDate,
        })
        .from(inventoryMovementsTable)
        .leftJoin(productsTable, eq(inventoryMovementsTable.productId, productsTable.id))
        .leftJoin(inventoryBatchesTable, eq(inventoryMovementsTable.batchId, inventoryBatchesTable.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(inventoryMovementsTable)
        .leftJoin(productsTable, eq(inventoryMovementsTable.productId, productsTable.id))
        .leftJoin(inventoryBatchesTable, eq(inventoryMovementsTable.batchId, inventoryBatchesTable.id))
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: movements,
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

  findById: async (id: SelectInventoryMovement['id']) =>
    db
      .select({
        ...inventoryMovementsTable,
        productName: productsTable.name,
        batchCode: inventoryBatchesTable.batchCode,
        batchExpirationDate: inventoryBatchesTable.expirationDate,
      })
      .from(inventoryMovementsTable)
      .leftJoin(productsTable, eq(inventoryMovementsTable.productId, productsTable.id))
      .leftJoin(inventoryBatchesTable, eq(inventoryMovementsTable.batchId, inventoryBatchesTable.id))
      .where(eq(inventoryMovementsTable.id, id))
      .get(),

  create: async (data: InsertInventoryMovement) => {
    const result = await db
      .insert(inventoryMovementsTable)
      .values(data)
      .returning()

    return result[0]
  },

  // Get movements for a specific batch
  findByBatch: async (batchId: number) =>
    db
      .select()
      .from(inventoryMovementsTable)
      .where(eq(inventoryMovementsTable.batchId, batchId))
      .orderBy(desc(inventoryMovementsTable.createdAt)),

  // Get movements for a specific product
  findByProduct: async (productId: number, limit: number = 50) =>
    db
      .select({
        ...inventoryMovementsTable,
        batchCode: inventoryBatchesTable.batchCode,
      })
      .from(inventoryMovementsTable)
      .leftJoin(inventoryBatchesTable, eq(inventoryMovementsTable.batchId, inventoryBatchesTable.id))
      .where(eq(inventoryMovementsTable.productId, productId))
      .orderBy(desc(inventoryMovementsTable.createdAt))
      .limit(limit),

  // Get movements by reference
  findByReference: async (referenceType: string, referenceId: number) =>
    db
      .select({
        ...inventoryMovementsTable,
        productName: productsTable.name,
        batchCode: inventoryBatchesTable.batchCode,
      })
      .from(inventoryMovementsTable)
      .leftJoin(productsTable, eq(inventoryMovementsTable.productId, productsTable.id))
      .leftJoin(inventoryBatchesTable, eq(inventoryMovementsTable.batchId, inventoryBatchesTable.id))
      .where(
        and(
          eq(inventoryMovementsTable.referenceType, referenceType),
          eq(inventoryMovementsTable.referenceId, referenceId)
        )
      )
      .orderBy(desc(inventoryMovementsTable.createdAt)),

  // Get movement summary for a date range
  getMovementSummary: async (dateFrom: Date, dateTo: Date) => {
    const summary = await db
      .select({
        type: inventoryMovementsTable.type,
        totalQuantity: sum(inventoryMovementsTable.quantity),
        movementCount: count(inventoryMovementsTable.id),
      })
      .from(inventoryMovementsTable)
      .where(
        and(
          gte(inventoryMovementsTable.createdAt, dateFrom),
          lte(inventoryMovementsTable.createdAt, dateTo)
        )
      )
      .groupBy(inventoryMovementsTable.type)

    return summary
  },

  // Get daily movement stats
  getDailyStats: async (date: Date) => {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return db
      .select({
        type: inventoryMovementsTable.type,
        totalQuantity: sum(inventoryMovementsTable.quantity),
        movementCount: count(inventoryMovementsTable.id),
      })
      .from(inventoryMovementsTable)
      .where(
        and(
          gte(inventoryMovementsTable.createdAt, startOfDay),
          lte(inventoryMovementsTable.createdAt, endOfDay)
        )
      )
      .groupBy(inventoryMovementsTable.type)
  },

  // Get recent movements for dashboard
  getRecentMovements: async (limit: number = 10) =>
    db
      .select({
        ...inventoryMovementsTable,
        productName: productsTable.name,
        batchCode: inventoryBatchesTable.batchCode,
      })
      .from(inventoryMovementsTable)
      .leftJoin(productsTable, eq(inventoryMovementsTable.productId, productsTable.id))
      .leftJoin(inventoryBatchesTable, eq(inventoryMovementsTable.batchId, inventoryBatchesTable.id))
      .orderBy(desc(inventoryMovementsTable.createdAt))
      .limit(limit),

  // Get movements for audit trail
  getAuditTrail: async (filters: {
    productId?: number
    dateFrom?: Date
    dateTo?: Date
    limit?: number
  } = {}) => {
    const { productId, dateFrom, dateTo, limit = 100 } = filters

    const whereConditions = []

    if (productId) {
      whereConditions.push(eq(inventoryMovementsTable.productId, productId))
    }

    if (dateFrom) {
      whereConditions.push(gte(inventoryMovementsTable.createdAt, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(inventoryMovementsTable.createdAt, dateTo))
    }

    return db
      .select({
        ...inventoryMovementsTable,
        productName: productsTable.name,
        batchCode: inventoryBatchesTable.batchCode,
        batchExpirationDate: inventoryBatchesTable.expirationDate,
      })
      .from(inventoryMovementsTable)
      .leftJoin(productsTable, eq(inventoryMovementsTable.productId, productsTable.id))
      .leftJoin(inventoryBatchesTable, eq(inventoryMovementsTable.batchId, inventoryBatchesTable.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(inventoryMovementsTable.createdAt))
      .limit(limit)
  },
}
