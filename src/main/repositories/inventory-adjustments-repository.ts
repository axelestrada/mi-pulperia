import { db } from '../db'
import { eq, and, like, or, desc, asc, count, gte, lte, sum } from 'drizzle-orm'

import {
  inventoryAdjustmentsTable,
  inventoryAdjustmentItemsTable,
  type SelectInventoryAdjustment,
  type InsertInventoryAdjustment,
  type SelectInventoryAdjustmentItem,
  type InsertInventoryAdjustmentItem,
} from '../db/schema/inventory-adjustments'
import { inventoryBatchesTable } from '../db/schema/inventory-batches'
import { productsTable } from '../db/schema/products'
import { presentationsTable } from '../db/schema/presentations'

export interface InventoryAdjustmentsFilters {
  search?: string
  type?: 'adjustment' | 'shrinkage'
  status?: 'draft' | 'approved' | 'cancelled'
  createdBy?: string
  approvedBy?: string
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'totalCostImpact' | 'adjustmentNumber' | 'approvedAt'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
  minImpact?: number
  maxImpact?: number
}

export interface CreateInventoryAdjustmentData {
  adjustment: InsertInventoryAdjustment
  items: Array<{
    batchId: number
    productId: number
    quantityChange: number
    unitCost: number
    costImpact: number
    itemReason?: string
    notes?: string
  }>
}

export interface InventoryAdjustmentWithDetails extends SelectInventoryAdjustment {
  items?: Array<{
    id: number
    batchId: number
    batchCode?: string
    productId: number
    productName: string
    presentationName?: string
    quantityChange: number
    unitCost: number
    costImpact: number
    itemReason?: string
    notes?: string
    expirationDate?: Date
  }>
}

export const InventoryAdjustmentsRepository = {
  findAll: async (filters: InventoryAdjustmentsFilters = {}) => {
    const {
      search,
      type,
      status,
      createdBy,
      approvedBy,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
      minImpact,
      maxImpact,
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = [eq(inventoryAdjustmentsTable.deleted, false)]

    if (search) {
      whereConditions.push(
        or(
          like(inventoryAdjustmentsTable.adjustmentNumber, `%${search}%`),
          like(inventoryAdjustmentsTable.reason, `%${search}%`),
          like(inventoryAdjustmentsTable.notes, `%${search}%`),
          like(inventoryAdjustmentsTable.createdBy, `%${search}%`)
        )!
      )
    }

    if (type) {
      whereConditions.push(eq(inventoryAdjustmentsTable.type, type))
    }

    if (status) {
      whereConditions.push(eq(inventoryAdjustmentsTable.status, status))
    }

    if (createdBy) {
      whereConditions.push(eq(inventoryAdjustmentsTable.createdBy, createdBy))
    }

    if (approvedBy) {
      whereConditions.push(eq(inventoryAdjustmentsTable.approvedBy, approvedBy))
    }

    if (dateFrom) {
      whereConditions.push(gte(inventoryAdjustmentsTable.createdAt, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(inventoryAdjustmentsTable.createdAt, dateTo))
    }

    if (minImpact !== undefined) {
      whereConditions.push(gte(inventoryAdjustmentsTable.totalCostImpact, minImpact))
    }

    if (maxImpact !== undefined) {
      whereConditions.push(lte(inventoryAdjustmentsTable.totalCostImpact, maxImpact))
    }

    // Build order by
    const orderBy =
      sortOrder === 'desc'
        ? desc(inventoryAdjustmentsTable[sortBy])
        : asc(inventoryAdjustmentsTable[sortBy])

    const [adjustments, totalResult] = await Promise.all([
      db
        .select()
        .from(inventoryAdjustmentsTable)
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(inventoryAdjustmentsTable)
        .where(and(...whereConditions)),
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: adjustments,
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

  findById: async (id: SelectInventoryAdjustment['id']): Promise<InventoryAdjustmentWithDetails | undefined> => {
    const adjustment = await db
      .select()
      .from(inventoryAdjustmentsTable)
      .where(and(
        eq(inventoryAdjustmentsTable.id, id),
        eq(inventoryAdjustmentsTable.deleted, false)
      ))
      .get()

    if (!adjustment) return undefined

    // Get adjustment items
    const items = await db
      .select({
        id: inventoryAdjustmentItemsTable.id,
        batchId: inventoryAdjustmentItemsTable.batchId,
        batchCode: inventoryBatchesTable.batchCode,
        productId: inventoryAdjustmentItemsTable.productId,
        productName: productsTable.name,
        presentationName: presentationsTable.name,
        quantityChange: inventoryAdjustmentItemsTable.quantityChange,
        unitCost: inventoryAdjustmentItemsTable.unitCost,
        costImpact: inventoryAdjustmentItemsTable.costImpact,
        itemReason: inventoryAdjustmentItemsTable.itemReason,
        notes: inventoryAdjustmentItemsTable.notes,
        expirationDate: inventoryBatchesTable.expirationDate,
      })
      .from(inventoryAdjustmentItemsTable)
      .leftJoin(inventoryBatchesTable, eq(inventoryAdjustmentItemsTable.batchId, inventoryBatchesTable.id))
      .leftJoin(productsTable, eq(inventoryAdjustmentItemsTable.productId, productsTable.id))
      .leftJoin(presentationsTable, eq(presentationsTable.productId, productsTable.id))
      .where(eq(inventoryAdjustmentItemsTable.adjustmentId, id))

    return {
      ...adjustment,
      items: items.map(item => ({
        ...item,
        expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
      })),
    }
  },

  create: async (data: CreateInventoryAdjustmentData) => {
      // Create adjustment
      const adjustmentResult = await db
        .insert(inventoryAdjustmentsTable)
        .values(data.adjustment)
        .returning()

      const adjustment = adjustmentResult[0]

      // Create adjustment items
      const adjustmentItems = data.items.map(item => ({
        ...item,
        adjustmentId: adjustment.id,
      }))

      await db.insert(inventoryAdjustmentItemsTable).values(adjustmentItems)

      return adjustment
  },

  update: async (id: SelectInventoryAdjustment['id'], data: Partial<SelectInventoryAdjustment>) =>
    db
      .update(inventoryAdjustmentsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(inventoryAdjustmentsTable.id, id))
      .returning(),

  approve: async (id: SelectInventoryAdjustment['id'], approvedBy: string) => {
      // Update adjustment status
      const adjustmentResult = await db
        .update(inventoryAdjustmentsTable)
        .set({
          status: 'approved',
          approvedBy,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(inventoryAdjustmentsTable.id, id))
        .returning()

      const adjustment = adjustmentResult[0]

      // Get adjustment items to apply to batches
      const items = await db
        .select()
        .from(inventoryAdjustmentItemsTable)
        .where(eq(inventoryAdjustmentItemsTable.adjustmentId, id))

      // Apply quantity changes to batches
      for (const item of items) {
        const batch = await db
          .select()
          .from(inventoryBatchesTable)
          .where(eq(inventoryBatchesTable.id, item.batchId))
          .get()

        if (batch) {
          const newQuantity = Math.max(0, batch.quantityAvailable + item.quantityChange)

          await db
            .update(inventoryBatchesTable)
            .set({ quantityAvailable: newQuantity })
            .where(eq(inventoryBatchesTable.id, item.batchId))
        }
      }

      return adjustment
  },

  cancel: async (id: SelectInventoryAdjustment['id']) =>
    db
      .update(inventoryAdjustmentsTable)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(inventoryAdjustmentsTable.id, id))
      .returning(),

  delete: async (id: SelectInventoryAdjustment['id']) =>
    db
      .update(inventoryAdjustmentsTable)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(inventoryAdjustmentsTable.id, id)),

  // Generate next adjustment number
  generateAdjustmentNumber: async (type: 'adjustment' | 'shrinkage') => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const prefix = type === 'adjustment' ? `ADJ${year}${month}` : `SHR${year}${month}`

    const lastAdjustment = await db
      .select({ adjustmentNumber: inventoryAdjustmentsTable.adjustmentNumber })
      .from(inventoryAdjustmentsTable)
      .where(like(inventoryAdjustmentsTable.adjustmentNumber, `${prefix}%`))
      .orderBy(desc(inventoryAdjustmentsTable.adjustmentNumber))
      .limit(1)
      .get()

    if (!lastAdjustment) {
      return `${prefix}001`
    }

    const lastNumber = parseInt(lastAdjustment.adjustmentNumber.slice(-3))
    const nextNumber = String(lastNumber + 1).padStart(3, '0')
    return `${prefix}${nextNumber}`
  },

  // Get adjustments statistics
  getAdjustmentsStats: async (dateFrom?: Date, dateTo?: Date) => {
    const whereConditions = [
      eq(inventoryAdjustmentsTable.deleted, false),
      eq(inventoryAdjustmentsTable.status, 'approved')
    ]

    if (dateFrom) {
      whereConditions.push(gte(inventoryAdjustmentsTable.createdAt, dateFrom))
    }

    if (dateTo) {
      whereConditions.push(lte(inventoryAdjustmentsTable.createdAt, dateTo))
    }

    const stats = await db
      .select({
        type: inventoryAdjustmentsTable.type,
        totalAdjustments: count(inventoryAdjustmentsTable.id),
        totalCostImpact: sum(inventoryAdjustmentsTable.totalCostImpact),
        totalValueImpact: sum(inventoryAdjustmentsTable.totalValueImpact),
      })
      .from(inventoryAdjustmentsTable)
      .where(and(...whereConditions))
      .groupBy(inventoryAdjustmentsTable.type)

    return stats
  },

  // Get pending adjustments
  findPendingAdjustments: async () =>
    db
      .select()
      .from(inventoryAdjustmentsTable)
      .where(and(
        eq(inventoryAdjustmentsTable.deleted, false),
        eq(inventoryAdjustmentsTable.status, 'draft')
      ))
      .orderBy(asc(inventoryAdjustmentsTable.createdAt)),

  // Get batches available for adjustment by product
  findBatchesForAdjustment: async (productId: number) =>
    db
      .select({
        id: inventoryBatchesTable.id,
        batchCode: inventoryBatchesTable.batchCode,
        expirationDate: inventoryBatchesTable.expirationDate,
        quantityAvailable: inventoryBatchesTable.quantityAvailable,
        unitCost: inventoryBatchesTable.unitCost,
      })
      .from(inventoryBatchesTable)
      .where(and(
        eq(inventoryBatchesTable.productId, productId),
        gte(inventoryBatchesTable.quantityAvailable, 1)
      ))
      .orderBy(asc(inventoryBatchesTable.expirationDate), asc(inventoryBatchesTable.receivedAt)),
}
