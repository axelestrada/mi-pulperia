import { ipcMain } from 'electron'

import { CategoriesService } from '../services/categories-service'
import { InsertCategory } from '../db/schema/categories'

export const registerCategoriesHandlers = () => {
  ipcMain.handle('categories:list', async () => {
    return CategoriesService.list()
  })

  ipcMain.handle('categories:create', async (_, category: InsertCategory) => {
    return CategoriesService.create(category)
  })
}
