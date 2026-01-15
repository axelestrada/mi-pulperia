import { db } from 'main/db'

import {
  AddStockDTO,
  AdjustStockDTO,
  ConsumeProductDTO,
} from './inventory-model'
import { inventoryBatchesRepository } from './inventory-batches-repository'
import { inventoryMovementsRepository } from './inventory-movements-repository'

export const inventoryService = {
  addStock: async ({
    productId,
    supplierId,
    batchCode,
    expirationDate,
    quantity,
    cost,
    referenceType,
    referenceId,
  }: AddStockDTO) => {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor que cero.')
    }

    if (cost < 0) {
      throw new Error('El costo no puede ser negativo.')
    }

    const [batch] = await inventoryBatchesRepository.createBatch({
      productId,
      supplierId,
      batchCode,
      expirationDate,
      quantityInitial: quantity,
      cost,
    })

    await inventoryMovementsRepository.createMovement({
      productId,
      batchId: batch.id,
      type: 'IN',
      quantity,
      reason: 'stock_in',
      referenceType,
      referenceId,
    })
  },

  adjustStock: async ({
    batchId,
    productId,
    quantityDelta,
    reason,
    referenceType,
    referenceId,
  }: AdjustStockDTO) => {
    if (quantityDelta === 0) {
      throw new Error('La cantidad no puede ser cero.')
    }

    await db.transaction(async () => {
      await inventoryBatchesRepository.adjustAvailable(batchId, quantityDelta)

      await inventoryMovementsRepository.createMovement({
        productId,
        batchId,
        type: 'ADJUSTMENT',
        quantity: Math.abs(quantityDelta),
        reason,
        referenceType,
        referenceId,
      })
    })
  },

  consumeProduct: async ({
    productId,
    quantity,
    reason,
    referenceType,
    referenceId,
  }: ConsumeProductDTO) => {
    if (quantity <= 0) {
      throw new Error('La cantidad a consumir debe ser mayor que cero.')
    }

    await db.transaction(async () => {
      const batches = await inventoryBatchesRepository.findAvailableByProduct(
        productId
      )

      if (batches.length === 0) {
        throw new Error('No hay stock disponible para este producto.')
      }

      let remaining = quantity

      for (const batch of batches) {
        if (remaining <= 0) break

        const consumable = Math.min(batch.quantityAvailable, remaining)

        await inventoryBatchesRepository.decreaseAvailable(batch.id, consumable)

        await inventoryMovementsRepository.createMovement({
          productId,
          batchId: batch.id,
          type: 'OUT',
          quantity: consumable,
          reason,
          referenceType,
          referenceId,
        })

        remaining -= consumable
      }

      if (remaining > 0) {
        throw new Error('No hay suficiente stock para este producto.')
      }
    })
  },

  getAvailableStock: async (productId: number) => {
    return inventoryBatchesRepository.getTotalAvailableByProduct(productId)
  },
}
