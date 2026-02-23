import { ipcMain } from 'electron'

import { CustomersService } from '../services/customers-service'
import { InsertCustomer, SelectCustomer } from '../db/schema/customers'
import { CustomersFilters } from '../repositories/customers-repository'

export const registerCustomersHandlers = () => {
  ipcMain.handle('customers:list', async (_, filters: CustomersFilters) => {
    return CustomersService.list(filters)
  })

  ipcMain.handle('customers:getById', async (_, id: SelectCustomer['id']) => {
    return CustomersService.getById(id)
  })

  ipcMain.handle('customers:getByDocument', async (_, document: string) => {
    return CustomersService.getByDocument(document)
  })

  ipcMain.handle('customers:create', async (_, customer: InsertCustomer) => {
    return CustomersService.create(customer)
  })

  ipcMain.handle('customers:update', async (_, id: SelectCustomer['id'], customer: Partial<SelectCustomer>) => {
    return CustomersService.update(id, customer)
  })

  ipcMain.handle('customers:remove', async (_, id: SelectCustomer['id']) => {
    return CustomersService.remove(id)
  })

  ipcMain.handle('customers:updateBalance', async (_, id: SelectCustomer['id'], newBalance: number) => {
    return CustomersService.updateBalance(id, newBalance)
  })

  ipcMain.handle('customers:addToBalance', async (_, id: SelectCustomer['id'], amount: number) => {
    return CustomersService.addToBalance(id, amount)
  })

  ipcMain.handle('customers:subtractFromBalance', async (_, id: SelectCustomer['id'], amount: number) => {
    return CustomersService.subtractFromBalance(id, amount)
  })

  ipcMain.handle('customers:getActiveForSelection', async () => {
    return CustomersService.getActiveForSelection()
  })

  ipcMain.handle('customers:getWithOutstandingBalance', async () => {
    return CustomersService.getWithOutstandingBalance()
  })

  ipcMain.handle('customers:canExtendCredit', async (_, id: SelectCustomer['id'], amount: number) => {
    return CustomersService.canExtendCredit(id, amount)
  })
}
