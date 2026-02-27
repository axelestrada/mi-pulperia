import { ipcMain } from 'electron'

import { CategoriesService } from '../services/categories-service'
import { InsertCategory, SelectCategory } from '../db/schema/categories'
import { CategoriesListFilters } from 'shared/types/categories'

export const registerCategoriesHandlers = () => {
  ipcMain.handle('categories:list', async (_, filters?: CategoriesListFilters) => {
    return CategoriesService.list(filters)
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
