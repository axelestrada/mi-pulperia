import { ipcMain } from 'electron'

import { CategoriesService } from '../services/categories-service'

export const registerCategoriesHandlers = () => {
  ipcMain.on('categories:list', async() => {
    return CategoriesService.list()
  })
}