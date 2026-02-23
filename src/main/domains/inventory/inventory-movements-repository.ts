import { and, count, desc, eq, gte, lte } from 'drizzle-orm'
import { db } from 'main/db'
import type { SelectInventoryBatch } from 'main/db/schema/inventory-batches'
import { inventoryBatchesTable } from 'main/db/schema/inventory-batches'
import { inventoryMovementsTable } from 'main/db/schema/inventory-movements'
import { productsTable } from 'main/db/schema/products'
import type {
  CreateInventoryMovementDTO,
  InventoryMovementDTO,
  InventoryMovementFilters,
} from './inventory-model'
import { PaginatedResult } from 'shared/types/pagination'

export const inventoryMovementsRepository = {
  createMovement: async (data: CreateInventoryMovementDTO) => {
    await db.insert(inventoryMovementsTable).values(data)
  },

  findByBatch: async (batchId: SelectInventoryBatch['id']) => {
    return db
      .select()
      .from(inventoryMovementsTable)
      .where(eq(inventoryMovementsTable.batchId, batchId))
  },

  findByProduct: async (productId: SelectInventoryBatch['productId']) => {
    return db
      .select()
      .from(inventoryMovementsTable)
      .where(eq(inventoryMovementsTable.productId, productId))
  },

  async findMovements(
    filters: InventoryMovementFilters
  ): Promise<PaginatedResult<InventoryMovementDTO>> {
    const {
      productId,
      type: filterType,
      dateFrom,
      dateTo,
      page = 1,
      pageSize = 20,
    } = filters

    const conditions = []

    if (productId !== undefined) {
      conditions.push(eq(inventoryMovementsTable.productId, productId))
    }

    if (filterType) {
      const dbType = filterType === 'ADJUST' ? 'ADJUSTMENT' : filterType
      conditions.push(eq(inventoryMovementsTable.type, dbType))
    }

    if (dateFrom) {
      conditions.push(
        gte(inventoryMovementsTable.createdAt, new Date(dateFrom))
      )
    }

    if (dateTo) {
      conditions.push(
        lte(inventoryMovementsTable.createdAt, new Date(dateTo))
      )
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined
    const offset = (page - 1) * pageSize

    const [rows, countResult] = await Promise.all([
      db
        .select({
          id: inventoryMovementsTable.id,
          productId: inventoryMovementsTable.productId,
          batchId: inventoryMovementsTable.batchId,
          type: inventoryMovementsTable.type,
          quantity: inventoryMovementsTable.quantity,
          reason: inventoryMovementsTable.reason,
          referenceType: inventoryMovementsTable.referenceType,
          referenceId: inventoryMovementsTable.referenceId,
          createdAt: inventoryMovementsTable.createdAt,
          productName: productsTable.name,
          batchCode: inventoryBatchesTable.batchCode,
          unitCost: inventoryBatchesTable.unitCost,
        })
        .from(inventoryMovementsTable)
        .leftJoin(
          productsTable,
          eq(inventoryMovementsTable.productId, productsTable.id)
        )
        .leftJoin(
          inventoryBatchesTable,
          eq(inventoryMovementsTable.batchId, inventoryBatchesTable.id)
        )
        .where(whereClause)
        .orderBy(desc(inventoryMovementsTable.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: count() })
        .from(inventoryMovementsTable)
        .where(whereClause),
    ])

    const total = countResult[0]?.count ?? 0
    const totalPages = Math.ceil(total / pageSize)

    const data: InventoryMovementDTO[] = rows.map(row => ({
      id: row.id,
      productId: row.productId,
      productName: row.productName ?? '',
      batchCode: row.batchCode ?? null,
      type:
        row.type === 'ADJUSTMENT' ? 'ADJUST' : (row.type as 'IN' | 'OUT'),
      quantity: row.quantity,
      unitCost: row.unitCost ?? 0,
      reason: row.reason,
      referenceType: row.referenceType ?? null,
      referenceId: row.referenceId ?? null,
      createdAt: row.createdAt.toISOString(),
    }))

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    }
  },
}
