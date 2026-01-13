import { db } from 'main/db'
import { and, asc, eq, gt, sql } from 'drizzle-orm'

import {
  inventoryBatchesTable,
  SelectInventoryBatch,
} from 'main/db/schema/inventory-batches'

import { CreateBatchDTO } from './inventory-model'

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
}
