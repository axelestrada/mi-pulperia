import { eq } from 'drizzle-orm'
import { db } from 'main/db'
import type { SelectInventoryBatch } from 'main/db/schema/inventory-batches'

import { inventoryMovementsTable } from 'main/db/schema/inventory-movements'
import type {
  CreateInventoryMovementDTO,
  InventoryMovementFilters,
} from './inventory-model'

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
    console.log(filters)
    // aquí va drizzle/sqlite
  },
}
