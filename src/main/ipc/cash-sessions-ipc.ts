import { ipcMain } from 'electron'

import { CashSessionsService } from '../services/cash-sessions-service'
import { InsertCashSession, SelectCashSession } from '../db/schema/cash-sessions'
import { CashSessionsFilters } from '../repositories/cash-sessions-repository'

export const registerCashSessionsHandlers = () => {
  ipcMain.handle('cash-sessions:list', async (_, filters: CashSessionsFilters) => {
    return CashSessionsService.list(filters)
  })

  ipcMain.handle('cash-sessions:getById', async (_, id: SelectCashSession['id']) => {
    return CashSessionsService.getById(id)
  })

  ipcMain.handle('cash-sessions:openSession', async (_, input: {
    cashRegisterId: number
    openedBy: string
    openingAmount: number
    notes?: string
  }) => {
    return CashSessionsService.openSession(input)
  })

  ipcMain.handle('cash-sessions:closeSession', async (_, id: SelectCashSession['id'], input: {
    closedBy: string
    actualAmount: number
    notes?: string
  }) => {
    return CashSessionsService.closeSession(id, input)
  })

  ipcMain.handle('cash-sessions:getCurrentOpenSession', async () => {
    return CashSessionsService.getCurrentOpenSession()
  })

  ipcMain.handle('cash-sessions:getOpenSessionForRegister', async (_, cashRegisterId: number) => {
    return CashSessionsService.getOpenSessionForRegister(cashRegisterId)
  })

  ipcMain.handle('cash-sessions:getSessionSummary', async (_, id: SelectCashSession['id']) => {
    return CashSessionsService.getSessionSummary(id)
  })

  ipcMain.handle('cash-sessions:updateSessionNotes', async (_, id: SelectCashSession['id'], notes: string) => {
    return CashSessionsService.updateSessionNotes(id, notes)
  })

  ipcMain.handle('cash-sessions:validateCanMakeSale', async () => {
    return CashSessionsService.validateCanMakeSale()
  })

  ipcMain.handle('cash-sessions:getSessionsNeedingClosure', async () => {
    return CashSessionsService.getSessionsNeedingClosure()
  })

  ipcMain.handle('cash-sessions:getSessionStats', async (_, filters: { dateFrom?: Date; dateTo?: Date }) => {
    return CashSessionsService.getSessionStats(filters)
  })
}
