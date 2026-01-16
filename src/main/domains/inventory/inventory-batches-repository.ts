import { db } from 'main/db'
import { and, asc, eq, getTableColumns, gt, lt, sql } from 'drizzle-orm'

import {
  inventoryBatchesTable,
  SelectInventoryBatch,
} from 'main/db/schema/inventory-batches'

import { CreateBatchDTO, InventoryBatchFilters } from './inventory-model'
import { productsTable } from 'main/db/schema/products'

export const inventoryBatchesRepository = {
  createBatch: async (data: CreateBatchDTO) => {
    return await db
      .insert(inventoryBatchesTable)
      .values({
        ...data,
        quantityAvailable: data.quantityInitial,
      })
      .returning()
  },

  adjustAvailable: async (batchId: number, delta: number) => {
    await db
      .update(inventoryBatchesTable)
      .set({
        quantityAvailable: sql`${inventoryBatchesTable.quantityAvailable} + ${delta}`,
      })
      .where(eq(inventoryBatchesTable.id, batchId))
  },

  findAvailableByProduct: async (
    productId: SelectInventoryBatch['productId']
  ) => {
    return db
      .select()
      .from(inventoryBatchesTable)
      .where(
        and(
          eq(inventoryBatchesTable.productId, productId),
          gt(inventoryBatchesTable.quantityAvailable, 0)
        )
      )
      .orderBy(
        sql`${inventoryBatchesTable.expirationDate} IS NULL`,
        asc(inventoryBatchesTable.expirationDate)
      )
  },

  decreaseAvailable: async (
    batchId: SelectInventoryBatch['id'],
    quantity: number
  ) => {
    await db
      .update(inventoryBatchesTable)
      .set({
        quantityAvailable: sql`${inventoryBatchesTable.quantityAvailable} - ${quantity}`,
      })
      .where(eq(inventoryBatchesTable.id, batchId))
  },

  getTotalAvailableByProduct: async (productId: number) => {
    const [{ total }] = await db
      .select({
        total: sql<number>`sum(${inventoryBatchesTable.quantityAvailable})`,
      })
      .from(inventoryBatchesTable)
      .where(eq(inventoryBatchesTable.productId, productId))

    return total ?? 0
  },

  findBatches(filters: InventoryBatchFilters) {
    const {
      productId,
      supplierId,
      batchId,
      batchCode,
      hasStock,
      expired,
      expiresBefore,
      expiresAfter,
      page = 1,
      pageSize = 20,
    } = filters

    const conditions = []

    if (productId) {
      conditions.push(eq(inventoryBatchesTable.productId, productId))
    }

    if (supplierId) {
      conditions.push(eq(inventoryBatchesTable.supplierId, supplierId))
    }

    if (batchId) {
      conditions.push(eq(inventoryBatchesTable.id, batchId))
    }

    if (batchCode) {
      conditions.push(eq(inventoryBatchesTable.batchCode, batchCode))
    }

    if (hasStock === true) {
      conditions.push(gt(inventoryBatchesTable.quantityAvailable, 0))
    }

    if (hasStock === false) {
      conditions.push(eq(inventoryBatchesTable.quantityAvailable, 0))
    }

    if (expired === true) {
      conditions.push(
        lt(inventoryBatchesTable.expirationDate, sql`unixepoch()`)
      )
    }

    if (expired === false) {
      conditions.push(
        gt(inventoryBatchesTable.expirationDate, sql`unixepoch()`)
      )
    }

    if (expiresBefore) {
      conditions.push(lt(inventoryBatchesTable.expirationDate, expiresBefore))
    }

    if (expiresAfter) {
      conditions.push(gt(inventoryBatchesTable.expirationDate, expiresAfter))
    }

    const offset = (page - 1) * pageSize

    const query = db
      .select({
        ...getTableColumns(inventoryBatchesTable),
        productName: productsTable.name,
      })
      .from(inventoryBatchesTable)
      .leftJoin(
        productsTable,
        eq(inventoryBatchesTable.productId, productsTable.id)
      )
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(
        sql`${inventoryBatchesTable.expirationDate} IS NULL`,
        asc(inventoryBatchesTable.expirationDate)
      )
      .limit(pageSize)
      .offset(offset)

    return query
  },
}
