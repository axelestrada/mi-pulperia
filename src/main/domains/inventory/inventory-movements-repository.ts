import { db } from 'main/db'
import { eq } from 'drizzle-orm'

import { CreateInventoryMovementDTO, InventoryMovementFilters } from './inventory-model'

import { inventoryMovementsTable } from 'main/db/schema/inventory-movements'

import { SelectInventoryBatch } from 'main/db/schema/inventory-batches'

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

  findMovements(filters: InventoryMovementFilters) {
    // aquí va drizzle/sqlite
  },
}
