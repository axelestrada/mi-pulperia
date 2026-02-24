import { ipcMain } from 'electron'
import { SaleReturnsService } from '../services/sale-returns-service'
import type { SaleReturnFilters } from '../repositories/sale-returns-repository'
import type { ProcessReturnData } from '../services/sale-returns-service'

export function registerSaleReturnsHandlers() {
  ipcMain.handle(
    'saleReturns:processReturn',
    async (_, data: ProcessReturnData) => {
      return SaleReturnsService.processReturn(data)
    }
  )

  ipcMain.handle(
    'saleReturns:list',
    async (_, filters: SaleReturnFilters) => {
      return SaleReturnsService.list(filters)
    }
  )

  ipcMain.handle('saleReturns:getById', async (_, id: number) => {
    return SaleReturnsService.getById(id)
  })

  ipcMain.handle('saleReturns:getBySaleId', async (_, saleId: number) => {
    return SaleReturnsService.getBySaleId(saleId)
  })

  ipcMain.handle(
    'saleReturns:getTotalRefunded',
    async (_, dateFrom?: Date, dateTo?: Date) => {
      return SaleReturnsService.getTotalRefunded(dateFrom, dateTo)
    }
  )
}
