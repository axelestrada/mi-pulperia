import { ipcMain } from 'electron'
import { InventoryAdjustmentsRepository } from '../repositories/inventory-adjustments-repository'
import { InventoryBatchesRepository } from '../repositories/inventory-batches-repository'

export function registerInventoryAdjustmentsIpc() {
  ipcMain.handle('inventoryAdjustments:list', async (_, filters) => {
    try {
      const result = await InventoryAdjustmentsRepository.findAll(filters)
      return result.data
    } catch (error) {
      console.error('Error listing inventory adjustments:', error)
      throw error
    }
  })

  ipcMain.handle('inventoryAdjustments:create', async (_, adjustmentData) => {
    try {
      return await InventoryAdjustmentsRepository.create(adjustmentData)
    } catch (error) {
      console.error('Error creating inventory adjustment:', error)
      throw error
    }
  })

  ipcMain.handle('inventoryAdjustments:update', async (_, id, adjustmentData) => {
    try {
      const result = await InventoryAdjustmentsRepository.update(id, adjustmentData)
      return result[0]
    } catch (error) {
      console.error('Error updating inventory adjustment:', error)
      throw error
    }
  })

  ipcMain.handle('inventoryAdjustments:remove', async (_, id) => {
    try {
      await InventoryAdjustmentsRepository.delete(id)
    } catch (error) {
      console.error('Error removing inventory adjustment:', error)
      throw error
    }
  })

  ipcMain.handle('inventoryAdjustments:getById', async (_, id) => {
    try {
      return await InventoryAdjustmentsRepository.findById(id)
    } catch (error) {
      console.error('Error getting inventory adjustment by id:', error)
      throw error
    }
  })

  ipcMain.handle('inventoryAdjustments:approve', async (_, id) => {
    try {
      // For now, we'll use 'system' as the approver
      // In a real implementation, you'd get this from the current user session
      return await InventoryAdjustmentsRepository.approve(id, 'system')
    } catch (error) {
      console.error('Error approving inventory adjustment:', error)
      throw error
    }
  })

  ipcMain.handle('inventoryAdjustments:cancel', async (_, id) => {
    try {
      const result = await InventoryAdjustmentsRepository.cancel(id)
      return result[0]
    } catch (error) {
      console.error('Error cancelling inventory adjustment:', error)
      throw error
    }
  })

  ipcMain.handle('inventoryAdjustments:generateAdjustmentNumber', async () => {
    try {
      // Default to 'adjustment' type for number generation
      // In a real implementation, you might want to pass the type
      return await InventoryAdjustmentsRepository.generateAdjustmentNumber('adjustment')
    } catch (error) {
      console.error('Error generating adjustment number:', error)
      throw error
    }
  })

  ipcMain.handle('inventoryAdjustments:getAvailableBatches', async (_, productId) => {
    try {
      if (productId) {
        return await InventoryAdjustmentsRepository.findBatchesForAdjustment(productId)
      } else {
        return await InventoryBatchesRepository.findAll({
          hasStock: true,
          limit: 100
        }).then(result => result.data)
      }
    } catch (error) {
      console.error('Error getting available batches:', error)
      throw error
    }
  })

  ipcMain.handle('inventoryAdjustments:getBatchInfo', async (_, batchId) => {
    try {
      return await InventoryBatchesRepository.findById(batchId)
    } catch (error) {
      console.error('Error getting batch info:', error)
      throw error
    }
  })

  ipcMain.handle('inventoryAdjustments:getPendingAdjustments', async () => {
    try {
      return await InventoryAdjustmentsRepository.findPendingAdjustments()
    } catch (error) {
      console.error('Error getting pending adjustments:', error)
      throw error
    }
  })

  ipcMain.handle('inventoryAdjustments:getAdjustmentsStats', async (_, dateFrom, dateTo) => {
    try {
      return await InventoryAdjustmentsRepository.getAdjustmentsStats(dateFrom, dateTo)
    } catch (error) {
      console.error('Error getting adjustments stats:', error)
      throw error
    }
  })

  ipcMain.handle('inventoryAdjustments:generateShrinkageNumber', async () => {
    try {
      return await InventoryAdjustmentsRepository.generateAdjustmentNumber('shrinkage')
    } catch (error) {
      console.error('Error generating shrinkage number:', error)
      throw error
    }
  })
}
