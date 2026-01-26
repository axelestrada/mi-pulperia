import { ipcMain } from 'electron'
import { PurchaseOrdersRepository } from '../repositories/purchase-orders-repository'

export function registerPurchaseOrdersIpc() {
  ipcMain.handle('purchaseOrders:list', async (_, filters) => {
    try {
      const result = await PurchaseOrdersRepository.findAll(filters)
      return result.data
    } catch (error) {
      console.error('Error listing purchase orders:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:create', async (_, orderData) => {
    try {
      return await PurchaseOrdersRepository.create(orderData)
    } catch (error) {
      console.error('Error creating purchase order:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:update', async (_, id, orderData) => {
    try {
      const result = await PurchaseOrdersRepository.update(id, orderData)
      return result[0]
    } catch (error) {
      console.error('Error updating purchase order:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:remove', async (_, id) => {
    try {
      await PurchaseOrdersRepository.delete(id)
    } catch (error) {
      console.error('Error removing purchase order:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:getById', async (_, id) => {
    try {
      return await PurchaseOrdersRepository.findById(id)
    } catch (error) {
      console.error('Error getting purchase order by id:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:getBySupplier', async (_, supplierId) => {
    try {
      const result = await PurchaseOrdersRepository.findAll({ supplierId })
      return result.data
    } catch (error) {
      console.error('Error getting purchase orders by supplier:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:updateStatus', async (_, id, status) => {
    try {
      const result = await PurchaseOrdersRepository.updateStatus(id, status)
      return result[0]
    } catch (error) {
      console.error('Error updating purchase order status:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:generateOrderNumber', async () => {
    try {
      return await PurchaseOrdersRepository.generateOrderNumber()
    } catch (error) {
      console.error('Error generating order number:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:sendToSupplier', async (_, id) => {
    try {
      const result = await PurchaseOrdersRepository.updateStatus(id, 'sent')
      return result[0]
    } catch (error) {
      console.error('Error sending order to supplier:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:markAsCompleted', async (_, id) => {
    try {
      const result = await PurchaseOrdersRepository.updateStatus(id, 'completed')
      return result[0]
    } catch (error) {
      console.error('Error marking order as completed:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:cancel', async (_, id, reason) => {
    try {
      const updateData = {
        status: 'cancelled' as const,
        internalNotes: reason ? `Cancelado: ${reason}` : 'Cancelado'
      }
      const result = await PurchaseOrdersRepository.update(id, updateData)
      return result[0]
    } catch (error) {
      console.error('Error cancelling purchase order:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:getPendingOrders', async () => {
    try {
      return await PurchaseOrdersRepository.findPendingOrders()
    } catch (error) {
      console.error('Error getting pending orders:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:getOrdersStats', async (_, dateFrom, dateTo) => {
    try {
      return await PurchaseOrdersRepository.getOrdersStats(dateFrom, dateTo)
    } catch (error) {
      console.error('Error getting orders stats:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:getOrdersForSupplier', async (_, supplierId) => {
    try {
      return await PurchaseOrdersRepository.getOrdersForSupplier(supplierId)
    } catch (error) {
      console.error('Error getting orders for supplier:', error)
      throw error
    }
  })

  ipcMain.handle('purchaseOrders:updateItemReceived', async (_, itemId, quantityReceived) => {
    try {
      return await PurchaseOrdersRepository.updateItemReceived(itemId, quantityReceived)
    } catch (error) {
      console.error('Error updating item received quantity:', error)
      throw error
    }
  })
}
