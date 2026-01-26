import { ipcMain } from 'electron'
import { SuppliersRepository } from '../repositories/suppliers-repository'

export function registerSuppliersIpc() {
  ipcMain.handle('suppliers:list', async (_, filters) => {
    try {
      const result = await SuppliersRepository.findAll(filters)
      return result.data
    } catch (error) {
      console.error('Error listing suppliers:', error)
      throw error
    }
  })

  ipcMain.handle('suppliers:create', async (_, supplierData) => {
    try {
      return await SuppliersRepository.create(supplierData)
    } catch (error) {
      console.error('Error creating supplier:', error)
      throw error
    }
  })

  ipcMain.handle('suppliers:update', async (_, id, supplierData) => {
    try {
      const result = await SuppliersRepository.update(id, supplierData)
      return result[0]
    } catch (error) {
      console.error('Error updating supplier:', error)
      throw error
    }
  })

  ipcMain.handle('suppliers:remove', async (_, id) => {
    try {
      await SuppliersRepository.delete(id)
    } catch (error) {
      console.error('Error removing supplier:', error)
      throw error
    }
  })

  ipcMain.handle('suppliers:getById', async (_, id) => {
    try {
      return await SuppliersRepository.findById(id)
    } catch (error) {
      console.error('Error getting supplier by id:', error)
      throw error
    }
  })

  ipcMain.handle('suppliers:getActiveSuppliers', async () => {
    try {
      return await SuppliersRepository.findActiveForSelection()
    } catch (error) {
      console.error('Error getting active suppliers:', error)
      throw error
    }
  })

  ipcMain.handle('suppliers:updateBalance', async (_, id, newBalance) => {
    try {
      await SuppliersRepository.updateBalance(id, newBalance)
    } catch (error) {
      console.error('Error updating supplier balance:', error)
      throw error
    }
  })

  ipcMain.handle('suppliers:addToBalance', async (_, id, amount) => {
    try {
      await SuppliersRepository.addToBalance(id, amount)
    } catch (error) {
      console.error('Error adding to supplier balance:', error)
      throw error
    }
  })

  ipcMain.handle('suppliers:subtractFromBalance', async (_, id, amount) => {
    try {
      await SuppliersRepository.subtractFromBalance(id, amount)
    } catch (error) {
      console.error('Error subtracting from supplier balance:', error)
      throw error
    }
  })

  ipcMain.handle('suppliers:getWithOutstandingBalance', async () => {
    try {
      return await SuppliersRepository.findWithOutstandingBalance()
    } catch (error) {
      console.error('Error getting suppliers with outstanding balance:', error)
      throw error
    }
  })

  ipcMain.handle('suppliers:canExtendCredit', async (_, id, amount) => {
    try {
      return await SuppliersRepository.canExtendCredit(id, amount)
    } catch (error) {
      console.error('Error checking if can extend credit:', error)
      throw error
    }
  })
}
