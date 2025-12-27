import { ipcMain } from 'electron'

import { CategoriesService } from 'electron/main/services/categories-service'

export const registerCategoriesHandlers = () => {
  ipcMain.on('categories:list', async() => {
    return CategoriesService.list()
  })
}