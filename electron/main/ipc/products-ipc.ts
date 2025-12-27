import { ipcMain } from 'electron'

export const registerProductsHandlers = () => {
  ipcMain.handle('products:list', async () => 'Hola hi')
}
