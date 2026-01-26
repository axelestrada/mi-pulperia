import { ipcMain } from 'electron'
import { ExpensesRepository } from '../repositories/expenses-repository'

export function registerExpensesIpc() {
  // === EXPENSES ===
  ipcMain.handle('expenses:list', async (_, filters) => {
    try {
      const result = await ExpensesRepository.findAll(filters)
      return result.data
    } catch (error) {
      console.error('Error listing expenses:', error)
      throw error
    }
  })

  ipcMain.handle('expenses:create', async (_, expenseData) => {
    try {
      return await ExpensesRepository.create(expenseData)
    } catch (error) {
      console.error('Error creating expense:', error)
      throw error
    }
  })

  ipcMain.handle('expenses:update', async (_, id, expenseData) => {
    try {
      const result = await ExpensesRepository.update(id, expenseData)
      return result[0]
    } catch (error) {
      console.error('Error updating expense:', error)
      throw error
    }
  })

  ipcMain.handle('expenses:remove', async (_, id) => {
    try {
      await ExpensesRepository.delete(id)
    } catch (error) {
      console.error('Error removing expense:', error)
      throw error
    }
  })

  ipcMain.handle('expenses:getById', async (_, id) => {
    try {
      return await ExpensesRepository.findById(id)
    } catch (error) {
      console.error('Error getting expense by id:', error)
      throw error
    }
  })

  ipcMain.handle('expenses:approve', async (_, id, approvedBy) => {
    try {
      const result = await ExpensesRepository.approve(id, approvedBy || 'system')
      return result[0]
    } catch (error) {
      console.error('Error approving expense:', error)
      throw error
    }
  })

  ipcMain.handle('expenses:generateExpenseNumber', async () => {
    try {
      return await ExpensesRepository.generateExpenseNumber()
    } catch (error) {
      console.error('Error generating expense number:', error)
      throw error
    }
  })

  ipcMain.handle('expenses:getExpensesStats', async (_, dateFrom, dateTo) => {
    try {
      return await ExpensesRepository.getExpensesStats(dateFrom, dateTo)
    } catch (error) {
      console.error('Error getting expenses stats:', error)
      throw error
    }
  })

  ipcMain.handle('expenses:getNeedingApproval', async () => {
    try {
      return await ExpensesRepository.findNeedingApproval()
    } catch (error) {
      console.error('Error getting expenses needing approval:', error)
      throw error
    }
  })

  ipcMain.handle('expenses:getRecurringDue', async () => {
    try {
      return await ExpensesRepository.findRecurringDue()
    } catch (error) {
      console.error('Error getting recurring expenses due:', error)
      throw error
    }
  })

  ipcMain.handle('expenses:getPendingExpenses', async () => {
    try {
      const result = await ExpensesRepository.findAll({
        status: 'pending',
        limit: 1000
      })
      return result.data
    } catch (error) {
      console.error('Error getting pending expenses:', error)
      throw error
    }
  })

  ipcMain.handle('expenses:getPaidExpenses', async () => {
    try {
      const result = await ExpensesRepository.findAll({
        status: 'paid',
        limit: 1000
      })
      return result.data
    } catch (error) {
      console.error('Error getting paid expenses:', error)
      throw error
    }
  })

  // === EXPENSE CATEGORIES ===
  ipcMain.handle('expenseCategories:list', async (_, filters) => {
    try {
      const result = await ExpensesRepository.findAllCategories(filters)
      return result.data
    } catch (error) {
      console.error('Error listing expense categories:', error)
      throw error
    }
  })

  ipcMain.handle('expenseCategories:create', async (_, categoryData) => {
    try {
      return await ExpensesRepository.createCategory(categoryData)
    } catch (error) {
      console.error('Error creating expense category:', error)
      throw error
    }
  })

  ipcMain.handle('expenseCategories:update', async (_, id, categoryData) => {
    try {
      const result = await ExpensesRepository.updateCategory(id, categoryData)
      return result[0]
    } catch (error) {
      console.error('Error updating expense category:', error)
      throw error
    }
  })

  ipcMain.handle('expenseCategories:remove', async (_, id) => {
    try {
      await ExpensesRepository.deleteCategory(id)
    } catch (error) {
      console.error('Error removing expense category:', error)
      throw error
    }
  })

  ipcMain.handle('expenseCategories:getById', async (_, id) => {
    try {
      return await ExpensesRepository.findCategoryById(id)
    } catch (error) {
      console.error('Error getting expense category by id:', error)
      throw error
    }
  })

  ipcMain.handle('expenseCategories:getActiveForSelection', async () => {
    try {
      return await ExpensesRepository.findActiveCategoriesForSelection()
    } catch (error) {
      console.error('Error getting active categories for selection:', error)
      throw error
    }
  })

  ipcMain.handle('expenseCategories:getCogsCategories', async () => {
    try {
      const result = await ExpensesRepository.findAllCategories({
        affectsCogs: true,
        isActive: true,
        limit: 1000
      })
      return result.data
    } catch (error) {
      console.error('Error getting COGS categories:', error)
      throw error
    }
  })

  ipcMain.handle('expenseCategories:getNonCogsCategories', async () => {
    try {
      const result = await ExpensesRepository.findAllCategories({
        affectsCogs: false,
        isActive: true,
        limit: 1000
      })
      return result.data
    } catch (error) {
      console.error('Error getting non-COGS categories:', error)
      throw error
    }
  })
}
