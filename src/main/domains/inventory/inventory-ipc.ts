import { ipcMain } from 'electron'
import { inventoryService } from './inventory-service'
import {
  AddStockDTO,
  AdjustStockDTO,
  ConsumeProductDTO,
} from './inventory-model'

export const registerInventoryIPC = () => {
  ipcMain.handle('inventory:addStock', async (_, payload: AddStockDTO) => {
    await inventoryService.addStock({
      ...payload,
    })
  })

  ipcMain.handle('inventory:consume', async (_, payload: ConsumeProductDTO) => {
    try {
      await inventoryService.consumeProduct(payload)
    } catch (error) {
      if (error instanceof Error) {
        return {
          ok: false,
          error: 'INSUFFICIENT_STOCK',
        }
      }

      throw error
    }

    return { ok: true }
  })

  ipcMain.handle(
    'inventory:adjustStock',
    async (_, payload: AdjustStockDTO) => {
      await inventoryService.adjustStock(payload)
    }
  )

  ipcMain.handle(
    'inventory:getAvailableStock',
    async (_, productId: number) => {
      const total = await inventoryService.getAvailableStock(productId)
      return { total }
    }
  )
}
