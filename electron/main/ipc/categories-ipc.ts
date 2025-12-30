import { ipcMain } from 'electron'

import { CategoriesService } from '../services/categories-service'
import { InsertCategory, SelectCategory } from '../db/schema/categories'

export const registerCategoriesHandlers = () => {
  ipcMain.handle('categories:list', async () => {
    return CategoriesService.list()
  })

  ipcMain.handle('categories:create', async (_, category: InsertCategory) => {
    return CategoriesService.create(category)
  })

  ipcMain.handle('categories:update', async (_, id: SelectCategory['id'], category: Partial<SelectCategory>) => {
    return CategoriesService.update(id, category)
  })

  ipcMain.handle('categories:remove', async (_, id: SelectCategory['id']) => {
    return CategoriesService.remove(id)
  })
}
