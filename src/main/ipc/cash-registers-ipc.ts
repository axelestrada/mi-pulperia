import { ipcMain } from 'electron'

import { CashRegistersService } from '../services/cash-registers-service'
import {
  InsertCashRegister,
  SelectCashRegister,
} from '../db/schema/cash-registers'
import { CashRegistersFilters } from '../repositories/cash-registers-repository'

export const registerCashRegistersHandlers = () => {
  ipcMain.handle(
    'cash-registers:list',
    async (_, filters: CashRegistersFilters) => {
      return CashRegistersService.list(filters)
    }
  )

  ipcMain.handle('cash-registers:ensureDefault', async () => {
    return CashRegistersService.ensureDefaultCashRegisterExists()
  })

  ipcMain.handle(
    'cash-registers:getById',
    async (_, id: SelectCashRegister['id']) => {
      return CashRegistersService.getById(id)
    }
  )

  ipcMain.handle(
    'cash-registers:create',
    async (_, cashRegister: InsertCashRegister) => {
      return CashRegistersService.create(cashRegister)
    }
  )

  ipcMain.handle(
    'cash-registers:update',
    async (
      _,
      id: SelectCashRegister['id'],
      cashRegister: Partial<SelectCashRegister>
    ) => {
      return CashRegistersService.update(id, cashRegister)
    }
  )

  ipcMain.handle(
    'cash-registers:remove',
    async (_, id: SelectCashRegister['id']) => {
      return CashRegistersService.remove(id)
    }
  )

  ipcMain.handle(
    'cash-registers:activate',
    async (_, id: SelectCashRegister['id']) => {
      return CashRegistersService.activate(id)
    }
  )

  ipcMain.handle(
    'cash-registers:deactivate',
    async (_, id: SelectCashRegister['id']) => {
      return CashRegistersService.deactivate(id)
    }
  )

  ipcMain.handle('cash-registers:getActiveForSelection', async () => {
    return CashRegistersService.getActiveForSelection()
  })
}
