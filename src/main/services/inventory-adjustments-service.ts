import { InsertInventoryAdjustment, SelectInventoryAdjustment } from '../db/schema/inventory-adjustments'
import { InventoryAdjustmentsRepository, InventoryAdjustmentsFilters, CreateInventoryAdjustmentData } from '../repositories/inventory-adjustments-repository'
import { InventoryBatchesRepository } from '../repositories/inventory-batches-repository'
import { InventoryMovementsRepository } from '../repositories/inventory-movements-repository'
import { InsertInventoryMovement } from '../db/schema/inventory-movements'

export const InventoryAdjustmentsService = {
  async list(filters: InventoryAdjustmentsFilters = {}) {
    return InventoryAdjustmentsRepository.findAll(filters)
  },

  async getById(id: SelectInventoryAdjustment['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid adjustment id')
    }

    const adjustment = await InventoryAdjustmentsRepository.findById(id)
    if (!adjustment) {
      throw new Error('Adjustment not found')
    }

    return adjustment
  },

  async create(data: CreateInventoryAdjustmentData) {
    // Validate adjustment data
    if (!data.adjustment.type) {
      throw new Error('Adjustment type is required')
    }

    if (!data.adjustment.reason?.trim()) {
      throw new Error('Adjustment reason is required')
    }

    if (!data.adjustment.createdBy?.trim()) {
      throw new Error('Created by is required')
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Adjustment must have at least one item')
    }

    // Validate items
    let totalCostImpact = 0
    let totalValueImpact = 0

    for (const item of data.items) {
      if (!Number.isInteger(item.batchId)) {
        throw new Error('Invalid batch id')
      }

      if (!Number.isInteger(item.productId)) {
        throw new Error('Invalid product id')
      }

      if (item.quantityChange === 0) {
        throw new Error('Quantity change cannot be zero')
      }

      if (item.unitCost < 0) {
        throw new Error('Unit cost cannot be negative')
      }

      // Validate that batch exists and belongs to product
      const batch = await InventoryBatchesRepository.findById(item.batchId)
      if (!batch) {
        throw new Error(`Batch with id ${item.batchId} not found`)
      }

      if (batch.productId !== item.productId) {
        throw new Error(`Batch ${item.batchId} does not belong to product ${item.productId}`)
      }

      // Check if we have enough quantity for negative adjustments
      if (item.quantityChange < 0 && Math.abs(item.quantityChange) > batch.quantityAvailable) {
        throw new Error(
          `Cannot adjust ${Math.abs(item.quantityChange)} units from batch ${batch.batchCode || item.batchId}. Available: ${batch.quantityAvailable}`
        )
      }

      // Calculate cost impact
      const costImpact = item.quantityChange * item.unitCost
      totalCostImpact += costImpact

      // For shrinkage, calculate value impact (lost profit potential)
      if (data.adjustment.type === 'shrinkage' && item.quantityChange < 0) {
        // TODO: Get sale price from presentation to calculate lost value
        // For now, use cost as approximation
        totalValueImpact += Math.abs(costImpact)
      }
    }

    // Generate adjustment number
    data.adjustment.adjustmentNumber = await InventoryAdjustmentsRepository.generateAdjustmentNumber(data.adjustment.type)
    data.adjustment.totalCostImpact = Math.round(totalCostImpact * 100) / 100
    data.adjustment.totalValueImpact = Math.round(totalValueImpact * 100) / 100

    // Create the adjustment
    const adjustment = await InventoryAdjustmentsRepository.create(data)

    return {
      adjustment,
      adjustmentDetails: await InventoryAdjustmentsRepository.findById(adjustment.id),
    }
  },

  async update(id: SelectInventoryAdjustment['id'], data: Partial<SelectInventoryAdjustment>) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid adjustment id')
    }

    const existingAdjustment = await InventoryAdjustmentsRepository.findById(id)
    if (!existingAdjustment) {
      throw new Error('Adjustment not found')
    }

    // Only allow updates if adjustment is in draft status
    if (existingAdjustment.status !== 'draft') {
      throw new Error('Can only update draft adjustments')
    }

    // Only allow certain fields to be updated
    const allowedFields = ['reason', 'notes']
    const updateData: Partial<SelectInventoryAdjustment> = {}

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update')
    }

    return InventoryAdjustmentsRepository.update(id, updateData)
  },

  async approve(id: SelectInventoryAdjustment['id'], approvedBy: string) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid adjustment id')
    }

    if (!approvedBy?.trim()) {
      throw new Error('Approved by is required')
    }

    const adjustment = await InventoryAdjustmentsRepository.findById(id)
    if (!adjustment) {
      throw new Error('Adjustment not found')
    }

    if (adjustment.status !== 'draft') {
      throw new Error('Only draft adjustments can be approved')
    }

    if (!adjustment.items || adjustment.items.length === 0) {
      throw new Error('Adjustment has no items')
    }

    // Approve and apply inventory changes
    const result = await InventoryAdjustmentsRepository.approve(id, approvedBy.trim())

    // Create inventory movements for each item
    for (const item of adjustment.items) {
      const movementData: InsertInventoryMovement = {
        productId: item.productId,
        batchId: item.batchId,
        type: item.quantityChange > 0 ? 'IN' : 'OUT',
        quantity: item.quantityChange,
        reason: `${adjustment.type === 'adjustment' ? 'Adjustment' : 'Shrinkage'}: ${adjustment.reason}`,
        referenceType: 'adjustment',
        referenceId: id,
      }

      await InventoryMovementsRepository.create(movementData)
    }

    return result
  },

  async cancel(id: SelectInventoryAdjustment['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid adjustment id')
    }

    const adjustment = await InventoryAdjustmentsRepository.findById(id)
    if (!adjustment) {
      throw new Error('Adjustment not found')
    }

    if (adjustment.status === 'approved') {
      throw new Error('Cannot cancel approved adjustments')
    }

    return InventoryAdjustmentsRepository.cancel(id)
  },

  async delete(id: SelectInventoryAdjustment['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid adjustment id')
    }

    const adjustment = await InventoryAdjustmentsRepository.findById(id)
    if (!adjustment) {
      throw new Error('Adjustment not found')
    }

    if (adjustment.status === 'approved') {
      throw new Error('Cannot delete approved adjustments')
    }

    return InventoryAdjustmentsRepository.delete(id)
  },

  async getAdjustmentsStats(dateFrom?: Date, dateTo?: Date) {
    if (dateFrom && !(dateFrom instanceof Date)) {
      throw new Error('Invalid date from')
    }

    if (dateTo && !(dateTo instanceof Date)) {
      throw new Error('Invalid date to')
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
      throw new Error('Date from cannot be after date to')
    }

    return InventoryAdjustmentsRepository.getAdjustmentsStats(dateFrom, dateTo)
  },

  async getPendingAdjustments() {
    return InventoryAdjustmentsRepository.findPendingAdjustments()
  },

  async getBatchesForAdjustment(productId: number) {
    if (!Number.isInteger(productId)) {
      throw new Error('Invalid product id')
    }

    return InventoryAdjustmentsRepository.findBatchesForAdjustment(productId)
  },

  // Helper method to validate adjustment items
  async validateAdjustmentItems(
    items: Array<{
      batchId: number
      productId: number
      quantityChange: number
      unitCost: number
      itemReason?: string
      notes?: string
    }>
  ) {
    const validationResults = []

    for (const item of items) {
      // Get batch information
      const batch = await InventoryBatchesRepository.findById(item.batchId)
      if (!batch) {
        throw new Error(`Batch with id ${item.batchId} not found`)
      }

      if (batch.productId !== item.productId) {
        throw new Error(`Batch ${item.batchId} does not belong to product ${item.productId}`)
      }

      // Check availability for negative adjustments
      const maxAdjustment = item.quantityChange < 0 ? batch.quantityAvailable : null
      const isValid = item.quantityChange > 0 || Math.abs(item.quantityChange) <= batch.quantityAvailable

      validationResults.push({
        item,
        batch: {
          id: batch.id,
          batchCode: batch.batchCode,
          expirationDate: batch.expirationDate,
          quantityAvailable: batch.quantityAvailable,
          unitCost: batch.unitCost,
        },
        maxAdjustment,
        isValid,
        error: !isValid
          ? `Cannot adjust ${Math.abs(item.quantityChange)} units. Available: ${batch.quantityAvailable}`
          : null,
      })
    }

    return validationResults
  },

  // Create adjustment for expired products
  async createExpirationAdjustment(
    expiredBatches: Array<{
      batchId: number
      productId: number
      quantityToAdjust: number
      reason?: string
    }>,
    createdBy: string
  ) {
    if (!createdBy?.trim()) {
      throw new Error('Created by is required')
    }

    if (!expiredBatches || expiredBatches.length === 0) {
      throw new Error('No expired batches provided')
    }

    const items = []
    for (const expiredBatch of expiredBatches) {
      const batch = await InventoryBatchesRepository.findById(expiredBatch.batchId)
      if (!batch) {
        throw new Error(`Batch with id ${expiredBatch.batchId} not found`)
      }

      items.push({
        batchId: expiredBatch.batchId,
        productId: expiredBatch.productId,
        quantityChange: -Math.abs(expiredBatch.quantityToAdjust),
        unitCost: batch.unitCost,
        costImpact: -Math.abs(expiredBatch.quantityToAdjust) * batch.unitCost,
        itemReason: expiredBatch.reason || 'Expired product',
      })
    }

    const adjustmentData: CreateInventoryAdjustmentData = {
      adjustment: {
        type: 'shrinkage',
        reason: 'Expired products removal',
        createdBy: createdBy.trim(),
        totalCostImpact: 0, // Will be calculated in create method
        totalValueImpact: 0, // Will be calculated in create method
      },
      items,
    }

    return this.create(adjustmentData)
  },

  // Create adjustment for damaged products
  async createDamageAdjustment(
    damagedItems: Array<{
      batchId: number
      productId: number
      quantityDamaged: number
      damageReason: string
      notes?: string
    }>,
    createdBy: string
  ) {
    if (!createdBy?.trim()) {
      throw new Error('Created by is required')
    }

    if (!damagedItems || damagedItems.length === 0) {
      throw new Error('No damaged items provided')
    }

    const items = []
    for (const damagedItem of damagedItems) {
      const batch = await InventoryBatchesRepository.findById(damagedItem.batchId)
      if (!batch) {
        throw new Error(`Batch with id ${damagedItem.batchId} not found`)
      }

      items.push({
        batchId: damagedItem.batchId,
        productId: damagedItem.productId,
        quantityChange: -Math.abs(damagedItem.quantityDamaged),
        unitCost: batch.unitCost,
        costImpact: -Math.abs(damagedItem.quantityDamaged) * batch.unitCost,
        itemReason: `Damaged: ${damagedItem.damageReason}`,
        notes: damagedItem.notes,
      })
    }

    const adjustmentData: CreateInventoryAdjustmentData = {
      adjustment: {
        type: 'shrinkage',
        reason: 'Damaged products',
        createdBy: createdBy.trim(),
        totalCostImpact: 0, // Will be calculated in create method
        totalValueImpact: 0, // Will be calculated in create method
      },
      items,
    }

    return this.create(adjustmentData)
  },

  // Bulk approve multiple adjustments
  async bulkApprove(adjustmentIds: number[], approvedBy: string) {
    if (!Array.isArray(adjustmentIds) || adjustmentIds.length === 0) {
      throw new Error('Must provide adjustment IDs to approve')
    }

    if (!approvedBy?.trim()) {
      throw new Error('Approved by is required')
    }

    const results = []
    const errors = []

    for (const id of adjustmentIds) {
      try {
        const result = await this.approve(id, approvedBy)
        results.push(result)
      } catch (error) {
        errors.push({ id, error: (error as Error).message })
      }
    }

    return {
      approved: results,
      errors,
      totalProcessed: adjustmentIds.length,
      successCount: results.length,
      errorCount: errors.length,
    }
  },
}
