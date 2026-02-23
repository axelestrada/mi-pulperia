import { PaginatedResult } from 'shared/types/pagination'
import { inventoryBatchesRepository } from './inventory-batches-repository'
import type {
  AddStockDTO,
  AdjustStockDTO,
  ConsumeProductDTO,
  InventoryBatchDTO,
  InventoryBatchFilters,
  InventoryMovementDTO,
  InventoryMovementFilters,
} from './inventory-model'
import { inventoryMovementsRepository } from './inventory-movements-repository'

export const inventoryService = {
  addStock: async ({
    productId,
    supplierId,
    batchCode,
    expirationDate,
    quantity,
    unitCost,
    referenceType,
    referenceId,
  }: AddStockDTO) => {
    if (quantity <= 0) {
      throw new Error('La cantidad debe ser mayor que cero.')
    }
    if (!Number.isInteger(quantity)) {
      throw new Error('La cantidad debe enviarse en enteros (unitPrecision).')
    }

    if (unitCost < 0) {
      throw new Error('El costo no puede ser negativo.')
    }

    const [batch] = await inventoryBatchesRepository.createBatch({
      productId,
      supplierId,
      batchCode,
      expirationDate,
      quantityInitial: quantity,
      unitCost,
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
    if (!Number.isInteger(quantityDelta)) {
      throw new Error('La cantidad debe enviarse en enteros (unitPrecision).')
    }
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
    if (!Number.isInteger(quantity)) {
      throw new Error('La cantidad debe enviarse en enteros (unitPrecision).')
    }
    const batches =
      await inventoryBatchesRepository.findAvailableByProduct(productId)

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
  },

  getAvailableStock: async (productId: number) => {
    return inventoryBatchesRepository.getTotalAvailableByProduct(productId)
  },

  async listBatches(
    filters: InventoryBatchFilters
  ): Promise<PaginatedResult<InventoryBatchDTO>> {
    const { rows, total, page, pageSize } =
      await inventoryBatchesRepository.findBatches(filters)

    const data: InventoryBatchDTO[] = rows.map(row => ({
      id: row.id,
      productId: row.productId,
      productName: row.productName ?? '',
      unitPrecision: row.unitPrecision ?? 0,
      supplierId: row.supplierId,
      batchCode: row.batchCode,
      expirationDate: row.expirationDate
        ? row.expirationDate.toISOString()
        : null,
      quantityInitial: row.quantityInitial,
      quantityAvailable: row.quantityAvailable,
      unitCost: row.unitCost,
      receivedAt: row.receivedAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    }))

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  },

  async listMovements(
    filters: InventoryMovementFilters
  ): Promise<PaginatedResult<InventoryMovementDTO>> {
    return inventoryMovementsRepository.findMovements(filters)
  },
}
