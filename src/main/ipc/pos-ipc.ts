import { ipcMain } from 'electron'

import { POSService, CreatePOSSaleInput } from '../services/pos-service'
import { POSFilters } from '../repositories/pos-repository'

export const registerPOSHandlers = () => {
  ipcMain.handle('pos:getAvailablePresentations', async (_, filters: POSFilters) => {
    return POSService.getAvailablePresentations(filters)
  })

  ipcMain.handle('pos:getPresentationWithBatches', async (_, presentationId: number) => {
    return POSService.getPresentationWithBatches(presentationId)
  })

  ipcMain.handle('pos:searchByCode', async (_, code: string) => {
    return POSService.searchByCode(code)
  })

  ipcMain.handle('pos:getCategories', async () => {
    return POSService.getCategories()
  })

  ipcMain.handle('pos:createSale', async (_, input: CreatePOSSaleInput) => {
    return POSService.createSale(input)
  })

  ipcMain.handle('pos:calculateTotals', async (_, items: any[], taxRate?: number) => {
    return POSService.calculateTotals(items, taxRate)
  })

  ipcMain.handle('pos:calculateChange', async (_, payments: any[]) => {
    return POSService.calculateChange(payments)
  })

  ipcMain.handle('pos:getRecentSales', async (_, limit?: number) => {
    return POSService.getRecentSales(limit)
  })

  ipcMain.handle('pos:getLowStockPresentations', async (_, threshold?: number) => {
    return POSService.getLowStockPresentations(threshold)
  })

  ipcMain.handle('pos:getExpiringPresentations', async (_, daysFromNow?: number) => {
    return POSService.getExpiringPresentations(daysFromNow)
  })

  ipcMain.handle('pos:validateBarcode', async (_, barcode: string) => {
    return POSService.validateBarcode(barcode)
  })

  ipcMain.handle('pos:quickSearch', async (_, query: string, limit?: number) => {
    return POSService.quickSearch(query, limit)
  })
}
