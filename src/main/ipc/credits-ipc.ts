import { ipcMain } from 'electron'
import { CreditsRepository } from '../repositories/credits-repository'

export function registerCreditsIpc() {
  ipcMain.handle('credits:list', async (_, filters) => {
    try {
      const result = await CreditsRepository.findAll(filters)
      return result.data
    } catch (error) {
      console.error('Error listing credits:', error)
      throw error
    }
  })

  ipcMain.handle('credits:create', async (_, creditData) => {
    try {
      return await CreditsRepository.create(creditData)
    } catch (error) {
      console.error('Error creating credit:', error)
      throw error
    }
  })

  ipcMain.handle('credits:update', async (_, id, creditData) => {
    try {
      const result = await CreditsRepository.update(id, creditData)
      return result[0]
    } catch (error) {
      console.error('Error updating credit:', error)
      throw error
    }
  })

  ipcMain.handle('credits:remove', async (_, id) => {
    try {
      await CreditsRepository.delete(id)
    } catch (error) {
      console.error('Error removing credit:', error)
      throw error
    }
  })

  ipcMain.handle('credits:getById', async (_, id) => {
    try {
      return await CreditsRepository.findById(id)
    } catch (error) {
      console.error('Error getting credit by id:', error)
      throw error
    }
  })

  ipcMain.handle('credits:addPayment', async (_, creditId, paymentData) => {
    try {
      return await CreditsRepository.addPayment(creditId, paymentData)
    } catch (error) {
      console.error('Error adding payment to credit:', error)
      throw error
    }
  })

  ipcMain.handle('credits:cancel', async (_, id) => {
    try {
      const result = await CreditsRepository.cancel(id)
      return result[0]
    } catch (error) {
      console.error('Error cancelling credit:', error)
      throw error
    }
  })

  ipcMain.handle('credits:generateCreditNumber', async () => {
    try {
      return await CreditsRepository.generateCreditNumber()
    } catch (error) {
      console.error('Error generating credit number:', error)
      throw error
    }
  })

  ipcMain.handle('credits:generatePaymentNumber', async () => {
    try {
      return await CreditsRepository.generatePaymentNumber()
    } catch (error) {
      console.error('Error generating payment number:', error)
      throw error
    }
  })

  ipcMain.handle('credits:getOverdueCredits', async () => {
    try {
      return await CreditsRepository.findOverdueCredits()
    } catch (error) {
      console.error('Error getting overdue credits:', error)
      throw error
    }
  })

  ipcMain.handle('credits:getByCustomer', async (_, customerId) => {
    try {
      return await CreditsRepository.findByCustomer(customerId)
    } catch (error) {
      console.error('Error getting credits by customer:', error)
      throw error
    }
  })

  ipcMain.handle('credits:getCreditsStats', async (_, dateFrom, dateTo) => {
    try {
      return await CreditsRepository.getCreditsStats(dateFrom, dateTo)
    } catch (error) {
      console.error('Error getting credits stats:', error)
      throw error
    }
  })

  ipcMain.handle('credits:calculateLateFees', async (_, creditId) => {
    try {
      return await CreditsRepository.calculateLateFees(creditId)
    } catch (error) {
      console.error('Error calculating late fees:', error)
      throw error
    }
  })

  ipcMain.handle('credits:getActiveCredits', async () => {
    try {
      const result = await CreditsRepository.findAll({
        status: 'active',
        limit: 1000
      })
      return result.data
    } catch (error) {
      console.error('Error getting active credits:', error)
      throw error
    }
  })

  ipcMain.handle('credits:getPartialCredits', async () => {
    try {
      const result = await CreditsRepository.findAll({
        status: 'partial',
        limit: 1000
      })
      return result.data
    } catch (error) {
      console.error('Error getting partial credits:', error)
      throw error
    }
  })
}
