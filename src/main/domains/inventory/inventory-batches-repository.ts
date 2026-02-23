import {
  and,
  asc,
  count,
  eq,
  getTableColumns,
  gt,
  like,
  lt,
  or,
  sql,
} from 'drizzle-orm'
import { db } from 'main/db'

import {
  inventoryBatchesTable,
  type SelectInventoryBatch,
} from 'main/db/schema/inventory-batches'
import { productsTable } from 'main/db/schema/products'
import type { CreateBatchDTO, InventoryBatchFilters } from './inventory-model'

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

  async findBatches(filters: InventoryBatchFilters) {
    const {
      productId,
      supplierId,
      batchId,
      batchCode,
      searchTerm,
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

    if (searchTerm?.trim()) {
      const term = `%${searchTerm.trim()}%`
      conditions.push(
        or(
          like(productsTable.name, term),
          like(inventoryBatchesTable.batchCode, term)
        )!
      )
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

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined
    const offset = (page - 1) * pageSize

    const [rows, countResult] = await Promise.all([
      db
        .select({
          ...getTableColumns(inventoryBatchesTable),
          productName: productsTable.name,
          unitPrecision: productsTable.unitPrecision,
        })
        .from(inventoryBatchesTable)
        .leftJoin(
          productsTable,
          eq(inventoryBatchesTable.productId, productsTable.id)
        )
        .where(whereClause)
        .orderBy(
          sql`${inventoryBatchesTable.expirationDate} IS NULL`,
          asc(inventoryBatchesTable.expirationDate)
        )
        .limit(pageSize)
        .offset(offset),
      db
        .select({ count: count() })
        .from(inventoryBatchesTable)
        .leftJoin(
          productsTable,
          eq(inventoryBatchesTable.productId, productsTable.id)
        )
        .where(whereClause),
    ])

    const total = countResult[0]?.count ?? 0
    return { rows, total, page, pageSize }
  },
}
