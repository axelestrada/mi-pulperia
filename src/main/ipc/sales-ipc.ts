import { ipcMain } from 'electron'

import { SalesService } from '../services/sales-service'
import { InsertSale, SelectSale } from '../db/schema/sales'
import { SalesFilters, CreateSaleData } from '../repositories/sales-repository'

export const registerSalesHandlers = () => {
  ipcMain.handle('sales:list', async (_, filters: SalesFilters) => {
    return SalesService.list(filters)
  })

  ipcMain.handle('sales:getById', async (_, id: SelectSale['id']) => {
    return SalesService.getById(id)
  })

  ipcMain.handle('sales:create', async (_, data: CreateSaleData) => {
    return SalesService.create(data)
  })

  ipcMain.handle('sales:update', async (_, id: SelectSale['id'], data: Partial<SelectSale>) => {
    return SalesService.update(id, data)
  })

  ipcMain.handle('sales:cancel', async (_, id: SelectSale['id'], reason?: string) => {
    return SalesService.cancel(id, reason)
  })

  ipcMain.handle('sales:refund', async (_, id: SelectSale['id'], reason?: string) => {
    return SalesService.refund(id, reason)
  })

  ipcMain.handle('sales:delete', async (_, id: SelectSale['id']) => {
    return SalesService.delete(id)
  })

  ipcMain.handle('sales:getSalesForSession', async (_, sessionId: number) => {
    return SalesService.getSalesForSession(sessionId)
  })

  ipcMain.handle('sales:getDailySales', async (_, date: Date) => {
    return SalesService.getDailySales(date)
  })

  ipcMain.handle('sales:getTopSellingProducts', async (_, limit?: number, dateFrom?: Date, dateTo?: Date) => {
    return SalesService.getTopSellingProducts(limit, dateFrom, dateTo)
  })

  ipcMain.handle('sales:getSalesSummary', async (_, filters: { dateFrom?: Date; dateTo?: Date }) => {
    return SalesService.getSalesSummary(filters)
  })

  ipcMain.handle('sales:getRecentSales', async (_, limit?: number) => {
    return SalesService.getRecentSales(limit)
  })

  ipcMain.handle('sales:calculateSaleTotals', async (_, items: any[], taxRate?: number) => {
    return SalesService.calculateSaleTotals(items, taxRate)
  })

  ipcMain.handle('sales:calculateChange', async (_, payments: any[]) => {
    return SalesService.calculateChange(payments)
  })
}
